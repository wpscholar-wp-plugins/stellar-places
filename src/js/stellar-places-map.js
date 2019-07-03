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

                                google.maps.event.addListener(
                                    map, 'resize', function () {
                                        width = $el.width();
                                        marker.infoWindow.close();
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
