(function (global) {
    var TodayLessonsViewModel,
        app = global.app = global.app || {};

    TodayLessonsViewModel = kendo.data.ObservableObject.extend({
        dataSourceMorning: [],
        dataSourceAfternoon: [],
        isEmpty: true,

        clear: function() {
            
            this.set("dataSourceMorning", []);
            this.set("dataSourceAfternoon", []);
            this.set("isEmpty", true);
        },
        
        update: function(data) {
            var that = this;
            var dataSourceMorning = [];
            var dataSourceAfternoon = [];
            
            $.each( data, function(i, dataEl) {
                
                var lesson = {
                    name: dataEl.Name,
                    img: (dataEl.Kind == 6 ? 'indipendent' : 'recurrent' )+'.png',
                    time: moment(dataEl.From)
                };
                var today = moment().startOf('day');
                var isToday = today.isSame(lesson.time, 'day');
                
                if( isToday ) {          
                    var midDay = today.hour(12).second(1);
                    if( lesson.time.isBefore(midDay) ) {
                        dataSourceMorning.push(lesson);
                    } else {
                        dataSourceAfternoon.push(lesson);
                    }                            
                }                        
            });
            that.set("dataSourceMorning", dataSourceMorning);
            that.set("dataSourceAfternoon", dataSourceAfternoon);
            
            var isEmpty = dataSourceMorning.length+dataSourceAfternoon.length == 0;
            that.set("isEmpty", isEmpty);
        },
        
        init: function () {
            var that = this;
            kendo.data.ObservableObject.fn.init.apply(that, []);
        }
    });

    app.todayLessonsViewModel = new TodayLessonsViewModel();
    
})(window);