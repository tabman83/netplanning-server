(function (global) {
    var AllLessonsViewModel,
        app = global.app = global.app || {};

    AllLessonsViewModel = kendo.data.ObservableObject.extend({
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
                    time: moment(dataEl.From),
                    sortableTime: moment(dataEl.From).unix(),
                    day: moment(dataEl.From).startOf('day').valueOf()
                };
                dataSource.push(lesson);
            });
            
            var groupedData = new kendo.data.DataSource({
                data: dataSource,
                group: { field: "day" },
                sort: { field: "sortableTime", dir: "asc" },
            });            
            
            that.set("dataSource", groupedData);
            
            var isEmpty = false;
            that.set("isEmpty", isEmpty);
        },
        
        init: function () {
            var that = this;
            kendo.data.ObservableObject.fn.init.apply(that, []);
        }
    });

    app.allLessonsViewModel = new AllLessonsViewModel();
    
})(window);