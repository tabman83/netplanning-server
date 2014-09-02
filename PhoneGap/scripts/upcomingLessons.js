(function (global) {
    var UpcomingLessonsViewModel,
        app = global.app = global.app || {};

    UpcomingLessonsViewModel = kendo.data.ObservableObject.extend({
        dataSource: [],
        isEmpty: true,

        clear: function() {
            this.set("dataSource", []);
            this.set("isEmpty", true);
        },
        
        update: function(data) {
            var that = this;
            var dataSource = [];
            $.each( data, function(i, dataEl) {
                var lesson = {
                    name: dataEl.Name,
                    img: (dataEl.Kind == 6 ? 'indipendent' : 'recurrent' )+'.png',
                    time: moment(dataEl.From)
                };
                dataSource.push(lesson);
                if(i==4) {
                    return false;
                }
            });
            that.set("dataSource", dataSource);
            
            var isEmpty = dataSource.length == 0;
            that.set("isEmpty", isEmpty);
        },        
        
        init: function () {
            var that = this;
            kendo.data.ObservableObject.fn.init.apply(that, []);
        }
    });

    app.upcomingLessonsViewModel = new UpcomingLessonsViewModel();
    
})(window);