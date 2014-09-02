(function (global) {
    var SettingsViewModel,
        app = global.app = global.app || {};

    SettingsViewModel = kendo.data.ObservableObject.extend({
        isLoggedIn: false,
        username: "",
        password: "",

        onShow: function() {
            $('.refreshButton').hide();
        },
        
        onHide: function() {
            $('.refreshButton').show();
        },
        
        registerPhoneChannel: function() {
        
        	var methodName = "RegisterPhoneChannel";
            var data = { 
                deviceId: device.uuid,
                channelUrl: app.channelToken,
                cultureName: 'it-IT'
            };
                                                           
            return $.ajax({
                method: "POST",
                url: app.serviceUrl+methodName,
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(data),
                dataType: "json"
            });                                                           
        
    	},
        
        checkCrendentials: function(username, password) {
            var methodName = "CheckCredentials";
            var data = { 
                deviceId: device.uuid,
                username: username,
                password: password
            };
            return $.ajax({
                method: "POST",
                url: app.serviceUrl+methodName,
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(data),
                dataType: "json"
            })
        },
        
        login: function () {
            var that = this,
                username = that.get("username").trim(),
                password = that.get("password").trim();

            if (username === "" || password === "") {
                navigator.notification.alert("Both fields are required!",
                    function () { }, "Login failed", 'OK');

                return;
            }
			
            that.registerPhoneChannel()
            	.fail( function(jqXHR, textStatus) {
                    that.set("isLoggedIn", false);
                    console.log(textStatus);
                	navigator.notification.alert("Error during channel registration.", function () { }, "Login failed", 'OK');                    
            	})
            	.done( function() {
                
                    that.checkCrendentials(username, password)
                        .done(function(result) {
                            var loginStatus = result.CheckCredentialsResult;
                            
                            if( loginStatus === true ) {                    
                                that.set("isLoggedIn", true);
                                window.localStorage.setItem("isLoggedIn", true);
                                window.localStorage.setItem("username", username);
                                window.localStorage.setItem("password", password);
                                var tag = username+':'+password;
                                app.updateRegistration(app.hubRegistrationId, tag);
                                app.refreshData();
                            } else {
                                that.set("isLoggedIn", false);
                                navigator.notification.alert("Invalid username or password.", function () { }, "Login failed", 'OK');
                            }
                        }).fail( function(jqXHR, textStatus) {
                        	that.set("isLoggedIn", false);
                        	console.log(textStatus);
                            navigator.notification.alert("Error while checking credentials.", function () { }, "Login failed", 'OK');
                        });
            	});
            
			
        },
        
        init: function() {
            var that = this;
            kendo.data.ObservableObject.fn.init.apply(that, []);
            
            document.addEventListener('deviceready', function () {  
                var isLoggedIn = window.localStorage.getItem("isLoggedIn") || false;
				that.set("isLoggedIn", isLoggedIn);
                if( isLoggedIn ) {
        			var username = window.localStorage.getItem("username");
        			var password = window.localStorage.getItem("password");
                    that.set("username", username);
                    that.set("password", password);   
                }
            });
        },

        logout: function () {
            var that = this;

            that.clearForm();
            that.set("isLoggedIn", false);
            window.localStorage.setItem("isLoggedIn",false);
            app.todayLessonsViewModel.clear();
            app.tomorrowLessonsViewModel.clear();    
            app.upcomingLessonsViewModel.clear();
        },

        clearForm: function () {
            var that = this;

            that.set("username", "");
            that.set("password", "");
        },

        checkEnter: function (e) {
            var that = this;

            if (e.keyCode == 13) {
                $(e.target).blur();
                that.onLogin();
            }
        }
    });

    app.settingsViewModel = new SettingsViewModel();
    
})(window);