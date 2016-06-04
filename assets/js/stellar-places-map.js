'use strict';

(function ($, win, doc, undefined) {

    var app = win.stellarPlaces || {};

    var EventDispatcher = _.extend({}, Backbone.Events);

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
                                var content = _.template($('#stellar-places-info-window-template').html())(model.toJSON());

                                marker.infoWindow = new google.maps.InfoWindow({
                                    content: content,
                                    maxWidth: width - 140
                                });

                                google.maps.event.addListener(
                                    marker, 'click', function (e) {
                                        EventDispatcher.trigger('closeAllInfoWindows');
                                        marker.infoWindow.open(map, marker);
                                    }
                                );

                                EventDispatcher.on('closeAllInfoWindows', function () {
                                    marker.infoWindow.close();
                                });

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
                            infoWindow.close();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzdGVsbGFyLXBsYWNlcy1tYXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4oZnVuY3Rpb24gKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICAgIHZhciBhcHAgPSB3aW4uc3RlbGxhclBsYWNlcyB8fCB7fTtcblxuICAgIHZhciBFdmVudERpc3BhdGNoZXIgPSBfLmV4dGVuZCh7fSwgQmFja2JvbmUuRXZlbnRzKTtcblxuICAgIGFwcC5nZXRDb29yZGluYXRlcyA9IGZ1bmN0aW9uIChsYXQsIGxuZykge1xuICAgICAgICByZXR1cm4gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhOdW1iZXIobGF0KSwgTnVtYmVyKGxuZykpO1xuICAgIH07XG5cbiAgICBhcHAubW9kZWxzID0ge1xuICAgICAgICBQbGFjZTogQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHt9KVxuICAgIH07XG5cbiAgICBhcHAuY29sbGVjdGlvbnMgPSB7XG4gICAgICAgIFBsYWNlczogQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbW9kZWw6IGFwcC5tb2RlbHMuUGxhY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH07XG5cbiAgICBhcHAudmlld3MgPSB7XG4gICAgICAgIE1hcDogQmFja2JvbmUuVmlldy5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyICRlbCA9IHRoaXMuJGVsO1xuICAgICAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSAkZWwud2lkdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcE9wdGlvbnMgPSAkLnBhcnNlSlNPTigkZWwuYXR0cignZGF0YS1zdGVsbGFyLXBsYWNlcy1tYXAtb3B0aW9ucycpKTtcblxuICAgICAgICAgICAgICAgICAgICBtYXBPcHRpb25zLmNlbnRlciA9IGFwcC5nZXRDb29yZGluYXRlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbC5hdHRyKCdkYXRhLXN0ZWxsYXItcGxhY2VzLW1hcC1sYXQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbC5hdHRyKCdkYXRhLXN0ZWxsYXItcGxhY2VzLW1hcC1sbmcnKVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXBPcHRpb25zLm1hcFR5cGVJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwT3B0aW9ucy5tYXBUeXBlSWQgPSBnb29nbGUubWFwcy5NYXBUeXBlSWRbbWFwT3B0aW9ucy5tYXBUeXBlSWRdO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5lbCwgbWFwT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXBCb3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgJGVsLmRhdGEoJ21hcCcsIG1hcCk7XG4gICAgICAgICAgICAgICAgICAgICRlbC5kYXRhKCdtYXBCb3VuZHMnLCBtYXBCb3VuZHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbnMgPSAkLnBhcnNlSlNPTigkZWwuYXR0cignZGF0YS1zdGVsbGFyLXBsYWNlcy1tYXAtbG9jYXRpb25zJykpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24gPSBuZXcgYXBwLmNvbGxlY3Rpb25zLlBsYWNlcyhsb2NhdGlvbnMpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBhdXRvWm9vbSA9ICd0cnVlJyA9PT0gJGVsLmF0dHIoJ2RhdGEtc3RlbGxhci1wbGFjZXMtbWFwLWF1dG8tem9vbScpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGlzcGxheUluZm9XaW5kb3dzID0gJ3RydWUnID09PSAkZWwuYXR0cignZGF0YS1zdGVsbGFyLXBsYWNlcy1tYXAtaW5mby13aW5kb3dzJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAobW9kZWwpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IGFwcC5nZXRDb29yZGluYXRlcyhtb2RlbC5nZXQoJ2xhdGl0dWRlJyksIG1vZGVsLmdldCgnbG9uZ2l0dWRlJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcEJvdW5kcy5leHRlbmQocG9zaXRpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbW9kZWwuZ2V0KCduYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogbW9kZWwuZ2V0KCdpY29uJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkaXNwbGF5SW5mb1dpbmRvd3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyT3B0aW9ucy5jdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIobWFya2VyT3B0aW9ucyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXQoJ21hcmtlcicsIG1hcmtlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlzcGxheUluZm9XaW5kb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb250ZW50ID0gXy50ZW1wbGF0ZSgkKCcjc3RlbGxhci1wbGFjZXMtaW5mby13aW5kb3ctdGVtcGxhdGUnKS5odG1sKCkpKG1vZGVsLnRvSlNPTigpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuaW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhXaWR0aDogd2lkdGggLSAxNDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIsICdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXZlbnREaXNwYXRjaGVyLnRyaWdnZXIoJ2Nsb3NlQWxsSW5mb1dpbmRvd3MnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuaW5mb1dpbmRvdy5vcGVuKG1hcCwgbWFya2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFdmVudERpc3BhdGNoZXIub24oJ2Nsb3NlQWxsSW5mb1dpbmRvd3MnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuaW5mb1dpbmRvdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgICRlbC5kYXRhKCdzdGVsbGFyUGxhY2VzTWFwTG9jYXRpb25zJywgdGhpcy5jb2xsZWN0aW9uLm1hcChmdW5jdGlvbiAobW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbC50b0pTT04oKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbGxlY3Rpb24ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXV0b1pvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuZml0Qm91bmRzKG1hcEJvdW5kcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKG1hcEJvdW5kcy5nZXRDZW50ZXIoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAsICdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIobWFwQm91bmRzLmdldENlbnRlcigpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkRG9tTGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW4sICdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNlbnRlciA9IG1hcC5nZXRDZW50ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKG1hcCwgJ3Jlc2l6ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIoY2VudGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcCwgJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCA9ICRlbC53aWR0aCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9XaW5kb3cuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICB9O1xuXG4gICAgYXBwLmluaXRpYWxpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQuZWFjaChcbiAgICAgICAgICAgICQoJy5zdGVsbGFyLXBsYWNlcy1tYXAtY2FudmFzJyksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBuZXcgYXBwLnZpZXdzLk1hcCh7ZWw6ICQodGhpcyl9KS5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgJChkb2MpLnJlYWR5KFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhcHAuaW5pdGlhbGl6ZSgpO1xuICAgICAgICB9XG4gICAgKTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTsiXSwiZmlsZSI6InN0ZWxsYXItcGxhY2VzLW1hcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
