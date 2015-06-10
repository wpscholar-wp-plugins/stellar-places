'use strict';

(function ($, win, doc, undefined) {

    var app = win.stellarPlaces || {};

    app.getCoordinates = function (lat, lng) {
        return new google.maps.LatLng(Number(lat), Number(lng));
    };

    app.models = {
        Place: Backbone.Model.extend({})
    };

    app.collections = {
        Places: Backbone.Collection.extend(
            {
                model: app.models.Place
            }
        )
    };

    app.views = {
        Map: Backbone.View.extend(
            {
                render: function () {

                    var $el = this.$el;
                    var width = $el.width();
                    var mapOptions = $.parseJSON($el.attr('data-stellar-places-map-options'));

                    mapOptions.center = app.getCoordinates(
                        $el.attr('data-stellar-places-map-lat'),
                        $el.attr('data-stellar-places-map-lng')
                    );

                    if (mapOptions.mapTypeId) {
                        mapOptions.mapTypeId = google.maps.MapTypeId[mapOptions.mapTypeId];
                    }

                    var map = new google.maps.Map(this.el, mapOptions);
                    var mapBounds = new google.maps.LatLngBounds();

                    $el.data('map', map);
                    $el.data('mapBounds', mapBounds);

                    var locations = $.parseJSON($el.attr('data-stellar-places-map-locations'));
                    this.collection = new app.collections.Places(locations);

                    var autoZoom = 'true' === $el.attr('data-stellar-places-map-auto-zoom');
                    var displayInfoWindows = 'true' === $el.attr('data-stellar-places-map-info-windows');

                    this.collection.each(
                        function (model) {

                            var position = app.getCoordinates(model.get('latitude'), model.get('longitude'));
                            mapBounds.extend(position);

                            var markerOptions = {
                                map: map,
                                title: model.get('name'),
                                position: position,
                                icon: model.get('icon')
                            };

                            if (!displayInfoWindows) {
                                markerOptions.cursor = 'default';
                            }

                            var marker = new google.maps.Marker(markerOptions);

                            model.set('marker', marker);

                            if (displayInfoWindows) {
                                var content = _.template($('#stellar-places-info-window-template').html(), model.toJSON());

                                marker.infoWindow = new google.maps.InfoWindow();

                                google.maps.event.addListener(
                                    marker, 'click', function () {
                                        marker.infoWindow.close();
                                        marker.infoWindow.setOptions(
                                            {
                                                content: content,
                                                maxWidth: width - 140
                                            }
                                        );
                                        marker.infoWindow.open(map, marker);
                                    }
                                );
                            }

                        }
                    );

                    $el.data('stellarPlacesMapLocations', this.collection.map(function (model) {
                        return model.toJSON();
                    }));

                    if (this.collection.length) {
                        if (autoZoom) {
                            map.fitBounds(mapBounds);
                        }
                        map.setCenter(mapBounds.getCenter());
                        google.maps.event.addListener(
                            map, 'resize', function () {
                                map.setCenter(mapBounds.getCenter());
                            }
                        );
                    }

                    google.maps.event.addDomListener(
                        win, 'resize', function () {
                            var center = map.getCenter();
                            google.maps.event.trigger(map, 'resize');
                            map.setCenter(center);
                        }
                    );

                    google.maps.event.addListener(
                        map, 'resize', function () {
                            width = $el.width();
                            $.each($el.data('stellarPlacesMapLocations'), function(i, location){
                                location.marker.infoWindow.close();
                            });
                        }
                    );

                    return this;
                }
            }
        )
    };

    app.initialize = function () {
        $.each(
            $('.stellar-places-map-canvas'), function () {
                new app.views.Map({el: $(this)}).render();
            }
        );
    };

    $(doc).ready(
        function () {
            app.initialize();
        }
    );

})(jQuery, window, document);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzdGVsbGFyLXBsYWNlcy1tYXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4oZnVuY3Rpb24gKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICAgIHZhciBhcHAgPSB3aW4uc3RlbGxhclBsYWNlcyB8fCB7fTtcblxuICAgIGFwcC5nZXRDb29yZGluYXRlcyA9IGZ1bmN0aW9uIChsYXQsIGxuZykge1xuICAgICAgICByZXR1cm4gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhOdW1iZXIobGF0KSwgTnVtYmVyKGxuZykpO1xuICAgIH07XG5cbiAgICBhcHAubW9kZWxzID0ge1xuICAgICAgICBQbGFjZTogQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHt9KVxuICAgIH07XG5cbiAgICBhcHAuY29sbGVjdGlvbnMgPSB7XG4gICAgICAgIFBsYWNlczogQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbW9kZWw6IGFwcC5tb2RlbHMuUGxhY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH07XG5cbiAgICBhcHAudmlld3MgPSB7XG4gICAgICAgIE1hcDogQmFja2JvbmUuVmlldy5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyICRlbCA9IHRoaXMuJGVsO1xuICAgICAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSAkZWwud2lkdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcE9wdGlvbnMgPSAkLnBhcnNlSlNPTigkZWwuYXR0cignZGF0YS1zdGVsbGFyLXBsYWNlcy1tYXAtb3B0aW9ucycpKTtcblxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zLmNlbnRlciA9IGFwcC5nZXRDb29yZGluYXRlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbC5hdHRyKCdkYXRhLXN0ZWxsYXItcGxhY2VzLW1hcC1sYXQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbC5hdHRyKCdkYXRhLXN0ZWxsYXItcGxhY2VzLW1hcC1sbmcnKVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXBPcHRpb25zLm1hcFR5cGVJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwT3B0aW9ucy5tYXBUeXBlSWQgPSBnb29nbGUubWFwcy5NYXBUeXBlSWRbbWFwT3B0aW9ucy5tYXBUeXBlSWRdO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5lbCwgbWFwT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXBCb3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgJGVsLmRhdGEoJ21hcCcsIG1hcCk7XG4gICAgICAgICAgICAgICAgICAgICRlbC5kYXRhKCdtYXBCb3VuZHMnLCBtYXBCb3VuZHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbnMgPSAkLnBhcnNlSlNPTigkZWwuYXR0cignZGF0YS1zdGVsbGFyLXBsYWNlcy1tYXAtbG9jYXRpb25zJykpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24gPSBuZXcgYXBwLmNvbGxlY3Rpb25zLlBsYWNlcyhsb2NhdGlvbnMpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBhdXRvWm9vbSA9ICd0cnVlJyA9PT0gJGVsLmF0dHIoJ2RhdGEtc3RlbGxhci1wbGFjZXMtbWFwLWF1dG8tem9vbScpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGlzcGxheUluZm9XaW5kb3dzID0gJ3RydWUnID09PSAkZWwuYXR0cignZGF0YS1zdGVsbGFyLXBsYWNlcy1tYXAtaW5mby13aW5kb3dzJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAobW9kZWwpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IGFwcC5nZXRDb29yZGluYXRlcyhtb2RlbC5nZXQoJ2xhdGl0dWRlJyksIG1vZGVsLmdldCgnbG9uZ2l0dWRlJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcEJvdW5kcy5leHRlbmQocG9zaXRpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbW9kZWwuZ2V0KCduYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogbW9kZWwuZ2V0KCdpY29uJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkaXNwbGF5SW5mb1dpbmRvd3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyT3B0aW9ucy5jdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIobWFya2VyT3B0aW9ucyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXQoJ21hcmtlcicsIG1hcmtlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlzcGxheUluZm9XaW5kb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb250ZW50ID0gXy50ZW1wbGF0ZSgkKCcjc3RlbGxhci1wbGFjZXMtaW5mby13aW5kb3ctdGVtcGxhdGUnKS5odG1sKCksIG1vZGVsLnRvSlNPTigpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuaW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIsICdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuaW5mb1dpbmRvdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlci5pbmZvV2luZG93LnNldE9wdGlvbnMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhXaWR0aDogd2lkdGggLSAxNDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyLmluZm9XaW5kb3cub3BlbihtYXAsIG1hcmtlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgJGVsLmRhdGEoJ3N0ZWxsYXJQbGFjZXNNYXBMb2NhdGlvbnMnLCB0aGlzLmNvbGxlY3Rpb24ubWFwKGZ1bmN0aW9uIChtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsLnRvSlNPTigpO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29sbGVjdGlvbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdXRvWm9vbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5maXRCb3VuZHMobWFwQm91bmRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIobWFwQm91bmRzLmdldENlbnRlcigpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcCwgJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcihtYXBCb3VuZHMuZ2V0Q2VudGVyKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbiwgJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2VudGVyID0gbWFwLmdldENlbnRlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LnRyaWdnZXIobWFwLCAncmVzaXplJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcihjZW50ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLCAncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoID0gJGVsLndpZHRoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb1dpbmRvdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH07XG5cbiAgICBhcHAuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJC5lYWNoKFxuICAgICAgICAgICAgJCgnLnN0ZWxsYXItcGxhY2VzLW1hcC1jYW52YXMnKSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG5ldyBhcHAudmlld3MuTWFwKHtlbDogJCh0aGlzKX0pLnJlbmRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH07XG5cbiAgICAkKGRvYykucmVhZHkoXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGFwcC5pbml0aWFsaXplKCk7XG4gICAgICAgIH1cbiAgICApO1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpOyJdLCJmaWxlIjoic3RlbGxhci1wbGFjZXMtbWFwLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=