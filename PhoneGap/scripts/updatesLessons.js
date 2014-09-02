(function (global) {
    var UpdatesLessonsViewModel,
        app = global.app = global.app || {};

    UpdatesLessonsViewModel = kendo.data.ObservableObject.extend({
        dataSourceNew: [],
        dataSourceCancelled: [],
        isEmpty: true,

        clear: function() {
            
            this.set("dataSourceNew", []);
            this.set("dataSourceCancelled", []);
            this.set("isEmpty", true);
        },
        
        onShow: function() {
            $('.refreshButton').hide();
            setTimeout(function() {
	            app.tabstrip.data("kendoMobileTabStrip").badge('a[href="#tabstrip-updates"]', false);                
            }, 200 );
        },
        
        onHide: function() {
            $('.refreshButton').show();
        },
        
        loadData: function() {
            var that = this;
            var dataSourceNew = [];
            var dataSourceCancelled = [];
            
            this.clear();
            
            var methodName = "GetUpdates";
            var data = { deviceId: device.uuid };
            return $.ajax({
                method: "POST",
                url: app.serviceUrl+methodName,
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(data),
                dataType: "json"
            }).done(function(result) {
                var updateLessons = result.GetUpdatesResult;
                var cancelledLessons = updateLessons.PlanUpdateCancelled;
                var newLessons = updateLessons.PlanUpdateNew;
                
                $.each( newLessons, function(i, dataEl) {
                    var lesson = {
                    	name: dataEl.Name,
                    	img: (dataEl.Kind == 6 ? 'indipendent' : 'recurrent' )+'.png',
                    	time: moment(dataEl.From)
                	};
                    dataSourceNew.push(lesson);
                });
                
                $.each( cancelledLessons, function(i, dataEl) {
                    var lesson = {
                    	name: dataEl.Name,
                    	img: (dataEl.Kind == 6 ? 'indipendent' : 'recurrent' )+'.png',
                    	time: moment(dataEl.From)
                	};
                    dataSourceCancelled.push(lesson);
                });
                
                that.set("dataSourceNew", dataSourceNew);
            	that.set("dataSourceCancelled", dataSourceCancelled);
            
            	var isEmpty = dataSourceNew.length+dataSourceCancelled.length == 0;
            	that.set("isEmpty", isEmpty);
            });
        },
        
        init: function () {
            var that = this;
            kendo.data.ObservableObject.fn.init.apply(that, []);
        }
    });

    app.updatesLessonsViewModel = new UpdatesLessonsViewModel();
    
})(window);