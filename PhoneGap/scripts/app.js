(function (global) {
    
    var app = global.app = global.app || {};

    app.serviceUrl = "http://netplanning.azurewebsites.net/PhoneService.svc/json/";
    app.channelToken = "NoChannel";
    app.notificationHubConnectionString = "Endpoint=sb://netplanning.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=OqD9IpmW6iWJ/lSCAib1lnGRG5CH6OBSCSI/RcuVJNg=";
	app.appleNativeCreate = '<?xml version="1.0" encoding="utf-8"?><entry xmlns="http://www.w3.org/2005/Atom"><content type="application/xml"><AppleRegistrationDescription xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/netservices/2010/10/servicebus/connect">{0}<DeviceToken>{1}</DeviceToken></AppleRegistrationDescription></content></entry>';
	app.appleTemplateCreate = '<?xml version="1.0" encoding="utf-8"?><entry xmlns="http://www.w3.org/2005/Atom"><content type="application/xml"><AppleRegistrationDescription xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/netservices/2010/10/servicebus/connect">{0}<DeviceToken>{1}</DeviceToken><BodyTemplate><![CDATA[{2}]]></BodyTemplate><Expiry>{3}</Expiry></AppleRegistrationDescription></content></entry>';
    
    /////////
    var parts = app.notificationHubConnectionString.split(';');
    if (parts.length != 3) {
        throw "Error parsing connection string";
    }        
    console.log(parts);
    parts.forEach( function(part) {
        console.log(part);
        if (part.indexOf('Endpoint') == 0) {
            app.endpoint = 'https' + part.substring(11);
        } else if (part.indexOf('SharedAccessKeyName') == 0) {
            app.sasKeyName = part.substring(20);
        } else if (part.indexOf('SharedAccessKey') == 0) {
            app.sasKeyValue = part.substring(16);
        }
    });
    app.hubPath = "netplanning";
    /////////
    
    
    document.addEventListener('deviceready', function () {
        navigator.splashscreen.hide();
        StatusBar.overlaysWebView(false);
        StatusBar.backgroundColorByHexString('#0094DC');
        
        $(document.body).height(window.innerHeight);
        app.tabstrip = $('[data-role="tabstrip"]');

        app.registerDevice();
        
        app.refreshData()
        	.fail( function() {
                app.settingsViewModel.logout();
            	app.application.navigate("#tabstrip-settings");
        	});
        
        $('.refreshButton').click( app.refreshData );
        
        app.hubRegistrationId = window.localStorage.getItem("hubRegistrationId");
        if( app.notificationHubId == null ) {
            app.createRegistrationId().done( function(data) {
                app.hubRegistrationId = data;
                window.localStorage.setItem("hubRegistrationId", data);
        		console.log('hubRegistrationId: '+app.hubRegistrationId);
            });
        }
        
    }, false);

    app.application = new kendo.mobile.Application(document.body, { 
        layout: "tabstrip-layout",
        loading: "<h1>Please wait...</h1>"
    });
    
    app.registerDevice = function() {
      
        if ( device.platform == 'iOS' ) {
            var pushNotification = window.plugins.pushNotification;
            
            pushNotification.register(
        		app.tokenHandler,
        		app.errorHandler, {
            		"badge":"true",
            		"sound":"true",
            		"alert":"true",
            		"ecb":"app.onNotificationAPN"
                });
        }
    };
    
    app.onNotificationAPN = function (event) {
    	if ( event.alert )
    	{
            //navigator.notification.alert(event.alert+' '+event.badge);  
            var a = event.alert;
            app.updatesLessonsViewModel.loadData();
			app.tabstrip.data("kendoMobileTabStrip").badge('a[href="#tabstrip-updates"]', event.badge);
    	}

    	if ( event.sound )
    	{
        	var snd = new Media(event.sound);
        	snd.play();
    	}

    	if ( event.badge )
    	{
            var pushNotification = window.plugins.pushNotification;
        	pushNotification.setApplicationIconBadgeNumber(app.successHandler, app.errorHandler, event.badge);
    	}
	}
    
    app.successHandler = function() {
	}

    app.tokenHandler = function(result) {
    	app.channelToken = result;
	}
    
    app.errorHandler = function(error) {
    	console.log('error = ' + error);
	}

    app.refreshData = function() {
        app.application.showLoading();
        app.todayLessonsViewModel.clear();
        app.tomorrowLessonsViewModel.clear();       
        app.upcomingLessonsViewModel.clear();
        
        var methodName = "GetPlanHourCollection";
        var data = { deviceId: device.uuid };
        return $.ajax({
            method: "POST",
            url: app.serviceUrl+methodName,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json"
        }).done(function(result) {
            var plan = result.GetPlanHourCollectionResult;
            app.todayLessonsViewModel.update(plan);
            app.tomorrowLessonsViewModel.update(plan);            
            app.upcomingLessonsViewModel.update(plan);
            app.allLessonsViewModel.update(plan);
        }).always(function() {
        	//app.application.hideLoading();
        });
    }
    
    
    app.getSelfSignedToken = function(targetUri, sharedKey, ruleId, expiresInMins) {
        targetUri = encodeURIComponent(targetUri.toLowerCase()).toLowerCase();
        
        // Set expiration in seconds
        var expireOnDate = new Date();
        expireOnDate.setMinutes(expireOnDate.getMinutes() + expiresInMins);
        var expires = Date.UTC(expireOnDate.getUTCFullYear(), expireOnDate
        .getUTCMonth(), expireOnDate.getUTCDate(), expireOnDate
        .getUTCHours(), expireOnDate.getUTCMinutes(), expireOnDate
        .getUTCSeconds()) / 1000;
        var tosign = targetUri + '\n' + expires;
        
        // using CryptoJS
        var signature = CryptoJS.HmacSHA256(tosign, sharedKey);
        var base64signature = signature.toString(CryptoJS.enc.Base64);
        var base64UriEncoded = encodeURIComponent(base64signature);
        
        // construct autorization string
        var token = "SharedAccessSignature sr=" + targetUri + "&sig="
        + base64UriEncoded + "&se=" + expires + "&skn=" + ruleId;
        // console.log("signature:" + token);
        return token;
    };
    
    app.createRegistrationId = function() {
        var registrationPath = app.hubPath + "/Registrations";
        var serverUrl = app.endpoint + registrationPath + "?api-version=2013-04";
    	console.log(serverUrl);
        var token = app.getSelfSignedToken(serverUrl,app.sasKeyValue,app.sasKeyName, 60);
    
        var deferred = $.Deferred();
        $.ajax({
            type : "POST",
            url : serverUrl,
            headers : {
                "Authorization" : token
            },
        }).done(function(data, status, response) {
            var location = response.getResponseHeader("Content-Location");
            deferred.resolve(location);
        }).fail(function(response, status, error) {
            console.log("Error: " + error);
            deferred.reject("Error: " + error);
        });
        return deferred.promise();
    };
    
    app.updateRegistration = function(location, tag) {
        var registrationPayload = app.buildCreatePayload(tag);
        var serverUrl = location;
    
        var token = app.getSelfSignedToken(serverUrl, app.sasKeyValue, app.sasKeyName, 60);
    
        var deferred = $.Deferred();
        return $.ajax({
            type : "PUT",
            url : serverUrl,
            headers : {
                "Content-Type" : "application/atom+xml",
                "Authorization" : token,
            },
            data : registrationPayload
        }).done(function(data, status, response) {
            var location = response.getResponseHeader("Content-Location");
            deferred.resolve(location);
        }).fail(function(response, status, error) {
            console.log("Error: " + error);
            deferred.reject("Error: " + error);
        });
        return deferred.promise();
    };
    
	app.buildCreatePayload = function (tag) {
        var registrationPayload = app.appleNativeCreate.replace('{1}', app.channelToken);
        var tagstring = '<Tags>' + tag + '</Tags>';
        registrationPayload = registrationPayload.replace('{0}', tagstring);
        return registrationPayload;
    };    
    
})(window);