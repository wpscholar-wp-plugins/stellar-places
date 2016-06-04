/**
 * jQuery Geocoding and Places Autocomplete Plugin - V 1.5.0
 *
 * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
 * @author Ubilabs http://ubilabs.net, 2012
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

// # $.geocomplete()
// ## jQuery Geocoding and Places Autocomplete Plugin - V 1.5.0
//
// * https://github.com/ubilabs/geocomplete/
// * by Martin Kleppe <kleppe@ubilabs.net>

(function($, window, document, undefined){

  // ## Options
  // The default options for this plugin.
  //
  // * `map` - Might be a selector, an jQuery object or a DOM element. Default is `false` which shows no map.
  // * `details` - The container that should be populated with data. Defaults to `false` which ignores the setting.
  // * `location` - Location to initialize the map on. Might be an address `string` or an `array` with [latitude, longitude] or a `google.maps.LatLng`object. Default is `false` which shows a blank map.
  // * `bounds` - Whether to snap geocode search to map bounds. Default: `true` if false search globally. Alternatively pass a custom `LatLngBounds object.
  // * `autoselect` - Automatically selects the highlighted item or the first item from the suggestions list on Enter.
  // * `detailsAttribute` - The attribute's name to use as an indicator. Default: `"name"`
  // * `mapOptions` - Options to pass to the `google.maps.Map` constructor. See the full list [here](http://code.google.com/apis/maps/documentation/javascript/reference.html#MapOptions).
  // * `mapOptions.zoom` - The inital zoom level. Default: `14`
  // * `mapOptions.scrollwheel` - Whether to enable the scrollwheel to zoom the map. Default: `false`
  // * `mapOptions.mapTypeId` - The map type. Default: `"roadmap"`
  // * `markerOptions` - The options to pass to the `google.maps.Marker` constructor. See the full list [here](http://code.google.com/apis/maps/documentation/javascript/reference.html#MarkerOptions).
  // * `markerOptions.draggable` - If the marker is draggable. Default: `false`. Set to true to enable dragging.
  // * `markerOptions.disabled` - Do not show marker. Default: `false`. Set to true to disable marker.
  // * `maxZoom` - The maximum zoom level too zoom in after a geocoding response. Default: `16`
  // * `types` - An array containing one or more of the supported types for the places request. Default: `['geocode']` See the full list [here](http://code.google.com/apis/maps/documentation/javascript/places.html#place_search_requests).

  var defaults = {
    bounds: true,
    country: null,
    map: false,
    details: false,
    detailsAttribute: "name",
    autoselect: true,
    location: false,

    mapOptions: {
      zoom: 14,
      scrollwheel: false,
      mapTypeId: "roadmap"
    },

    markerOptions: {
      draggable: false
    },

    maxZoom: 16,
    types: ['geocode'],
    blur: false
  };

  // See: [Geocoding Types](https://developers.google.com/maps/documentation/geocoding/#Types)
  // on Google Developers.
  var componentTypes = ("street_address route intersection political " +
    "country administrative_area_level_1 administrative_area_level_2 " +
    "administrative_area_level_3 colloquial_area locality sublocality " +
    "neighborhood premise subpremise postal_code natural_feature airport " +
    "park point_of_interest post_box street_number floor room " +
    "lat lng viewport location " +
    "formatted_address location_type bounds").split(" ");

  // See: [Places Details Responses](https://developers.google.com/maps/documentation/javascript/places#place_details_responses)
  // on Google Developers.
  var placesDetails = ("id url website vicinity reference name rating " +
    "international_phone_number icon formatted_phone_number").split(" ");

  // The actual plugin constructor.
  function GeoComplete(input, options) {

    this.options = $.extend(true, {}, defaults, options);

    this.input = input;
    this.$input = $(input);

    this._defaults = defaults;
    this._name = 'geocomplete';

    this.init();
  }

  // Initialize all parts of the plugin.
  $.extend(GeoComplete.prototype, {
    init: function(){
      this.initMap();
      this.initMarker();
      this.initGeocoder();
      this.initDetails();
      this.initLocation();
    },

    // Initialize the map but only if the option `map` was set.
    // This will create a `map` within the given container
    // using the provided `mapOptions` or link to the existing map instance.
    initMap: function(){
      if (!this.options.map){ return; }

      if (typeof this.options.map.setCenter == "function"){
        this.map = this.options.map;
        return;
      }

      this.map = new google.maps.Map(
        $(this.options.map)[0],
        this.options.mapOptions
      );

      // add click event listener on the map
      google.maps.event.addListener(
        this.map,
        'click',
        $.proxy(this.mapClicked, this)
      );

      google.maps.event.addListener(
        this.map,
        'zoom_changed',
        $.proxy(this.mapZoomed, this)
      );
    },

    // Add a marker with the provided `markerOptions` but only
    // if the option was set. Additionally it listens for the `dragend` event
    // to notify the plugin about changes.
    initMarker: function(){
      if (!this.map){ return; }
      var options = $.extend(this.options.markerOptions, { map: this.map });

      if (options.disabled){ return; }

      this.marker = new google.maps.Marker(options);

      google.maps.event.addListener(
        this.marker,
        'dragend',
        $.proxy(this.markerDragged, this)
      );
    },

    // Associate the input with the autocompleter and create a geocoder
    // to fall back when the autocompleter does not return a value.
    initGeocoder: function(){

      var options = {
        types: this.options.types,
        bounds: this.options.bounds === true ? null : this.options.bounds,
        componentRestrictions: this.options.componentRestrictions
      };

      if (this.options.country){
        options.componentRestrictions = {country: this.options.country};
      }

      this.autocomplete = new google.maps.places.Autocomplete(
        this.input, options
      );

      this.geocoder = new google.maps.Geocoder();

      // Bind autocomplete to map bounds but only if there is a map
      // and `options.bindToMap` is set to true.
      if (this.map && this.options.bounds === true){
        this.autocomplete.bindTo('bounds', this.map);
      }

      // Watch `place_changed` events on the autocomplete input field.
      google.maps.event.addListener(
        this.autocomplete,
        'place_changed',
        $.proxy(this.placeChanged, this)
      );

      // Prevent parent form from being submitted if user hit enter.
      this.$input.keypress(function(event){
        if (event.keyCode === 13){ return false; }
      });

      // Listen for "geocode" events and trigger find action.
      this.$input.bind("geocode", $.proxy(function(){
        this.find();
      }, this));

      // Trigger find action when input element is blured out.
      // (Usefull for typing partial location and tabing to the next field
      // or clicking somewhere else.)
      if (this.options.blur === true){
        this.$input.blur($.proxy(function(){
          this.find();
        }, this));
      }
    },

    // Prepare a given DOM structure to be populated when we got some data.
    // This will cycle through the list of component types and map the
    // corresponding elements.
    initDetails: function(){
      if (!this.options.details){ return; }

      var $details = $(this.options.details),
        attribute = this.options.detailsAttribute,
        details = {};

      function setDetail(value){
        details[value] = $details.find("[" +  attribute + "=" + value + "]");
      }

      $.each(componentTypes, function(index, key){
        setDetail(key);
        setDetail(key + "_short");
      });

      $.each(placesDetails, function(index, key){
        setDetail(key);
      });

      this.$details = $details;
      this.details = details;
    },

    // Set the initial location of the plugin if the `location` options was set.
    // This method will care about converting the value into the right format.
    initLocation: function() {

      var location = this.options.location, latLng;

      if (!location) { return; }

      if (typeof location == 'string') {
        this.find(location);
        return;
      }

      if (location instanceof Array) {
        latLng = new google.maps.LatLng(location[0], location[1]);
      }

      if (location instanceof google.maps.LatLng){
        latLng = location;
      }

      if (latLng){
        if (this.map){ this.map.setCenter(latLng); }
        if (this.marker){ this.marker.setPosition(latLng); }
      }
    },

    // Look up a given address. If no `address` was specified it uses
    // the current value of the input.
    find: function(address){
      this.geocode({
        address: address || this.$input.val()
      });
    },

    // Requests details about a given location.
    // Additionally it will bias the requests to the provided bounds.
    geocode: function(request){
      if (this.options.bounds && !request.bounds){
        if (this.options.bounds === true){
          request.bounds = this.map && this.map.getBounds();
        } else {
          request.bounds = this.options.bounds;
        }
      }

      if (this.options.country){
        request.region = this.options.country;
      }

      this.geocoder.geocode(request, $.proxy(this.handleGeocode, this));
    },

    // Get the selected result. If no result is selected on the list, then get
    // the first result from the list.
    selectFirstResult: function() {
      //$(".pac-container").hide();

      var selected = '';
      // Check if any result is selected.
      if ($(".pac-item-selected")['0']) {
        selected = '-selected';
      }

      // Get the first suggestion's text.
      var $span1 = $(".pac-container .pac-item" + selected + ":first span:nth-child(2)").text();
      var $span2 = $(".pac-container .pac-item" + selected + ":first span:nth-child(3)").text();

      // Adds the additional information, if available.
      var firstResult = $span1;
      if ($span2) {
        firstResult += " - " + $span2;
      }

      this.$input.val(firstResult);

      return firstResult;
    },

    // Handles the geocode response. If more than one results was found
    // it triggers the "geocode:multiple" events. If there was an error
    // the "geocode:error" event is fired.
    handleGeocode: function(results, status){
      if (status === google.maps.GeocoderStatus.OK) {
        var result = results[0];
        this.$input.val(result.formatted_address);
        this.update(result);

        if (results.length > 1){
          this.trigger("geocode:multiple", results);
        }

      } else {
        this.trigger("geocode:error", status);
      }
    },

    // Triggers a given `event` with optional `arguments` on the input.
    trigger: function(event, argument){
      this.$input.trigger(event, [argument]);
    },

    // Set the map to a new center by passing a `geometry`.
    // If the geometry has a viewport, the map zooms out to fit the bounds.
    // Additionally it updates the marker position.
    center: function(geometry){

      if (geometry.viewport){
        this.map.fitBounds(geometry.viewport);
        if (this.map.getZoom() > this.options.maxZoom){
          this.map.setZoom(this.options.maxZoom);
        }
      } else {
        this.map.setZoom(this.options.maxZoom);
        this.map.setCenter(geometry.location);
      }

      if (this.marker){
        this.marker.setPosition(geometry.location);
        this.marker.setAnimation(this.options.markerOptions.animation);
      }
    },

    // Update the elements based on a single places or geoocoding response
    // and trigger the "geocode:result" event on the input.
    update: function(result){

      if (this.map){
        this.center(result.geometry);
      }

      if (this.$details){
        this.fillDetails(result);
      }

      this.trigger("geocode:result", result);
    },

    // Populate the provided elements with new `result` data.
    // This will lookup all elements that has an attribute with the given
    // component type.
    fillDetails: function(result){

      var data = {},
        geometry = result.geometry,
        viewport = geometry.viewport,
        bounds = geometry.bounds;

      // Create a simplified version of the address components.
      $.each(result.address_components, function(index, object){
        var name = object.types[0];
        data[name] = object.long_name;
        data[name + "_short"] = object.short_name;
      });

      // Add properties of the places details.
      $.each(placesDetails, function(index, key){
        data[key] = result[key];
      });

      // Add infos about the address and geometry.
      $.extend(data, {
        formatted_address: result.formatted_address,
	      street_address: [data.street_number, data.route]
		      .filter(function ( val ) {return 'string' === typeof val;}).join(' '),
        location_type: geometry.location_type || "PLACES",
        viewport: viewport,
        bounds: bounds,
        location: geometry.location,
        lat: geometry.location.lat(),
        lng: geometry.location.lng()
      });

      // Set the values for all details.
      $.each(this.details, $.proxy(function(key, $detail){
        var value = data[key];
        this.setDetail($detail, value);
      }, this));

      this.data = data;
    },

    // Assign a given `value` to a single `$element`.
    // If the element is an input, the value is set, otherwise it updates
    // the text content.
    setDetail: function($element, value){

      if (value === undefined){
        value = "";
      } else if (typeof value.toUrlValue == "function"){
        value = value.toUrlValue();
      }

      if ($element.is(":input")){
        $element.val(value);
      } else {
        $element.text(value);
      }
    },

    // Fire the "geocode:dragged" event and pass the new position.
    markerDragged: function(event){
      this.trigger("geocode:dragged", event.latLng);
    },

    mapClicked: function(event) {
        this.trigger("geocode:click", event.latLng);
    },

    mapZoomed: function(event) {
      this.trigger("geocode:zoom", this.map.getZoom());
    },

    // Restore the old position of the marker to the last now location.
    resetMarker: function(){
      this.marker.setPosition(this.data.location);
      this.setDetail(this.details.lat, this.data.location.lat());
      this.setDetail(this.details.lng, this.data.location.lng());
    },

    // Update the plugin after the user has selected an autocomplete entry.
    // If the place has no geometry it passes it to the geocoder.
    placeChanged: function(){
      var place = this.autocomplete.getPlace();

      if (!place || !place.geometry){
        if (this.options.autoselect) {
          // Automatically selects the highlighted item or the first item from the
          // suggestions list.
          var autoSelection = this.selectFirstResult();
          this.find(autoSelection);
        }
      } else {
        // Use the input text if it already gives geometry.
        this.update(place);
      }
    }
  });

  // A plugin wrapper around the constructor.
  // Pass `options` with all settings that are different from the default.
  // The attribute is used to prevent multiple instantiations of the plugin.
  $.fn.geocomplete = function(options) {

    var attribute = 'plugin_geocomplete';

    // If you call `.geocomplete()` with a string as the first parameter
    // it returns the corresponding property or calls the method with the
    // following arguments.
    if (typeof options == "string"){

      var instance = $(this).data(attribute) || $(this).geocomplete().data(attribute),
        prop = instance[options];

      if (typeof prop == "function"){
        prop.apply(instance, Array.prototype.slice.call(arguments, 1));
        return $(this);
      } else {
        if (arguments.length == 2){
          prop = arguments[1];
        }
        return prop;
      }
    } else {
      return this.each(function() {
        // Prevent against multiple instantiations.
        var instance = $.data(this, attribute);
        if (!instance) {
          instance = new GeoComplete( this, options );
          $.data(this, attribute, instance);
        }
      });
    }
  };

})( jQuery, window, document );

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkuZ2VvY29tcGxldGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBqUXVlcnkgR2VvY29kaW5nIGFuZCBQbGFjZXMgQXV0b2NvbXBsZXRlIFBsdWdpbiAtIFYgMS41LjBcbiAqXG4gKiBAYXV0aG9yIE1hcnRpbiBLbGVwcGUgPGtsZXBwZUB1YmlsYWJzLm5ldD4sIDIwMTJcbiAqIEBhdXRob3IgVWJpbGFicyBodHRwOi8vdWJpbGFicy5uZXQsIDIwMTJcbiAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIDxodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocD5cbiAqL1xuXG4vLyAjICQuZ2VvY29tcGxldGUoKVxuLy8gIyMgalF1ZXJ5IEdlb2NvZGluZyBhbmQgUGxhY2VzIEF1dG9jb21wbGV0ZSBQbHVnaW4gLSBWIDEuNS4wXG4vL1xuLy8gKiBodHRwczovL2dpdGh1Yi5jb20vdWJpbGFicy9nZW9jb21wbGV0ZS9cbi8vICogYnkgTWFydGluIEtsZXBwZSA8a2xlcHBlQHViaWxhYnMubmV0PlxuXG4oZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKXtcblxuICAvLyAjIyBPcHRpb25zXG4gIC8vIFRoZSBkZWZhdWx0IG9wdGlvbnMgZm9yIHRoaXMgcGx1Z2luLlxuICAvL1xuICAvLyAqIGBtYXBgIC0gTWlnaHQgYmUgYSBzZWxlY3RvciwgYW4galF1ZXJ5IG9iamVjdCBvciBhIERPTSBlbGVtZW50LiBEZWZhdWx0IGlzIGBmYWxzZWAgd2hpY2ggc2hvd3Mgbm8gbWFwLlxuICAvLyAqIGBkZXRhaWxzYCAtIFRoZSBjb250YWluZXIgdGhhdCBzaG91bGQgYmUgcG9wdWxhdGVkIHdpdGggZGF0YS4gRGVmYXVsdHMgdG8gYGZhbHNlYCB3aGljaCBpZ25vcmVzIHRoZSBzZXR0aW5nLlxuICAvLyAqIGBsb2NhdGlvbmAgLSBMb2NhdGlvbiB0byBpbml0aWFsaXplIHRoZSBtYXAgb24uIE1pZ2h0IGJlIGFuIGFkZHJlc3MgYHN0cmluZ2Agb3IgYW4gYGFycmF5YCB3aXRoIFtsYXRpdHVkZSwgbG9uZ2l0dWRlXSBvciBhIGBnb29nbGUubWFwcy5MYXRMbmdgb2JqZWN0LiBEZWZhdWx0IGlzIGBmYWxzZWAgd2hpY2ggc2hvd3MgYSBibGFuayBtYXAuXG4gIC8vICogYGJvdW5kc2AgLSBXaGV0aGVyIHRvIHNuYXAgZ2VvY29kZSBzZWFyY2ggdG8gbWFwIGJvdW5kcy4gRGVmYXVsdDogYHRydWVgIGlmIGZhbHNlIHNlYXJjaCBnbG9iYWxseS4gQWx0ZXJuYXRpdmVseSBwYXNzIGEgY3VzdG9tIGBMYXRMbmdCb3VuZHMgb2JqZWN0LlxuICAvLyAqIGBhdXRvc2VsZWN0YCAtIEF1dG9tYXRpY2FsbHkgc2VsZWN0cyB0aGUgaGlnaGxpZ2h0ZWQgaXRlbSBvciB0aGUgZmlyc3QgaXRlbSBmcm9tIHRoZSBzdWdnZXN0aW9ucyBsaXN0IG9uIEVudGVyLlxuICAvLyAqIGBkZXRhaWxzQXR0cmlidXRlYCAtIFRoZSBhdHRyaWJ1dGUncyBuYW1lIHRvIHVzZSBhcyBhbiBpbmRpY2F0b3IuIERlZmF1bHQ6IGBcIm5hbWVcImBcbiAgLy8gKiBgbWFwT3B0aW9uc2AgLSBPcHRpb25zIHRvIHBhc3MgdG8gdGhlIGBnb29nbGUubWFwcy5NYXBgIGNvbnN0cnVjdG9yLiBTZWUgdGhlIGZ1bGwgbGlzdCBbaGVyZV0oaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9hcGlzL21hcHMvZG9jdW1lbnRhdGlvbi9qYXZhc2NyaXB0L3JlZmVyZW5jZS5odG1sI01hcE9wdGlvbnMpLlxuICAvLyAqIGBtYXBPcHRpb25zLnpvb21gIC0gVGhlIGluaXRhbCB6b29tIGxldmVsLiBEZWZhdWx0OiBgMTRgXG4gIC8vICogYG1hcE9wdGlvbnMuc2Nyb2xsd2hlZWxgIC0gV2hldGhlciB0byBlbmFibGUgdGhlIHNjcm9sbHdoZWVsIHRvIHpvb20gdGhlIG1hcC4gRGVmYXVsdDogYGZhbHNlYFxuICAvLyAqIGBtYXBPcHRpb25zLm1hcFR5cGVJZGAgLSBUaGUgbWFwIHR5cGUuIERlZmF1bHQ6IGBcInJvYWRtYXBcImBcbiAgLy8gKiBgbWFya2VyT3B0aW9uc2AgLSBUaGUgb3B0aW9ucyB0byBwYXNzIHRvIHRoZSBgZ29vZ2xlLm1hcHMuTWFya2VyYCBjb25zdHJ1Y3Rvci4gU2VlIHRoZSBmdWxsIGxpc3QgW2hlcmVdKGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vYXBpcy9tYXBzL2RvY3VtZW50YXRpb24vamF2YXNjcmlwdC9yZWZlcmVuY2UuaHRtbCNNYXJrZXJPcHRpb25zKS5cbiAgLy8gKiBgbWFya2VyT3B0aW9ucy5kcmFnZ2FibGVgIC0gSWYgdGhlIG1hcmtlciBpcyBkcmFnZ2FibGUuIERlZmF1bHQ6IGBmYWxzZWAuIFNldCB0byB0cnVlIHRvIGVuYWJsZSBkcmFnZ2luZy5cbiAgLy8gKiBgbWFya2VyT3B0aW9ucy5kaXNhYmxlZGAgLSBEbyBub3Qgc2hvdyBtYXJrZXIuIERlZmF1bHQ6IGBmYWxzZWAuIFNldCB0byB0cnVlIHRvIGRpc2FibGUgbWFya2VyLlxuICAvLyAqIGBtYXhab29tYCAtIFRoZSBtYXhpbXVtIHpvb20gbGV2ZWwgdG9vIHpvb20gaW4gYWZ0ZXIgYSBnZW9jb2RpbmcgcmVzcG9uc2UuIERlZmF1bHQ6IGAxNmBcbiAgLy8gKiBgdHlwZXNgIC0gQW4gYXJyYXkgY29udGFpbmluZyBvbmUgb3IgbW9yZSBvZiB0aGUgc3VwcG9ydGVkIHR5cGVzIGZvciB0aGUgcGxhY2VzIHJlcXVlc3QuIERlZmF1bHQ6IGBbJ2dlb2NvZGUnXWAgU2VlIHRoZSBmdWxsIGxpc3QgW2hlcmVdKGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vYXBpcy9tYXBzL2RvY3VtZW50YXRpb24vamF2YXNjcmlwdC9wbGFjZXMuaHRtbCNwbGFjZV9zZWFyY2hfcmVxdWVzdHMpLlxuXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBib3VuZHM6IHRydWUsXG4gICAgY291bnRyeTogbnVsbCxcbiAgICBtYXA6IGZhbHNlLFxuICAgIGRldGFpbHM6IGZhbHNlLFxuICAgIGRldGFpbHNBdHRyaWJ1dGU6IFwibmFtZVwiLFxuICAgIGF1dG9zZWxlY3Q6IHRydWUsXG4gICAgbG9jYXRpb246IGZhbHNlLFxuXG4gICAgbWFwT3B0aW9uczoge1xuICAgICAgem9vbTogMTQsXG4gICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXG4gICAgICBtYXBUeXBlSWQ6IFwicm9hZG1hcFwiXG4gICAgfSxcblxuICAgIG1hcmtlck9wdGlvbnM6IHtcbiAgICAgIGRyYWdnYWJsZTogZmFsc2VcbiAgICB9LFxuXG4gICAgbWF4Wm9vbTogMTYsXG4gICAgdHlwZXM6IFsnZ2VvY29kZSddLFxuICAgIGJsdXI6IGZhbHNlXG4gIH07XG5cbiAgLy8gU2VlOiBbR2VvY29kaW5nIFR5cGVzXShodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL2RvY3VtZW50YXRpb24vZ2VvY29kaW5nLyNUeXBlcylcbiAgLy8gb24gR29vZ2xlIERldmVsb3BlcnMuXG4gIHZhciBjb21wb25lbnRUeXBlcyA9IChcInN0cmVldF9hZGRyZXNzIHJvdXRlIGludGVyc2VjdGlvbiBwb2xpdGljYWwgXCIgK1xuICAgIFwiY291bnRyeSBhZG1pbmlzdHJhdGl2ZV9hcmVhX2xldmVsXzEgYWRtaW5pc3RyYXRpdmVfYXJlYV9sZXZlbF8yIFwiICtcbiAgICBcImFkbWluaXN0cmF0aXZlX2FyZWFfbGV2ZWxfMyBjb2xsb3F1aWFsX2FyZWEgbG9jYWxpdHkgc3VibG9jYWxpdHkgXCIgK1xuICAgIFwibmVpZ2hib3Job29kIHByZW1pc2Ugc3VicHJlbWlzZSBwb3N0YWxfY29kZSBuYXR1cmFsX2ZlYXR1cmUgYWlycG9ydCBcIiArXG4gICAgXCJwYXJrIHBvaW50X29mX2ludGVyZXN0IHBvc3RfYm94IHN0cmVldF9udW1iZXIgZmxvb3Igcm9vbSBcIiArXG4gICAgXCJsYXQgbG5nIHZpZXdwb3J0IGxvY2F0aW9uIFwiICtcbiAgICBcImZvcm1hdHRlZF9hZGRyZXNzIGxvY2F0aW9uX3R5cGUgYm91bmRzXCIpLnNwbGl0KFwiIFwiKTtcblxuICAvLyBTZWU6IFtQbGFjZXMgRGV0YWlscyBSZXNwb25zZXNdKGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL21hcHMvZG9jdW1lbnRhdGlvbi9qYXZhc2NyaXB0L3BsYWNlcyNwbGFjZV9kZXRhaWxzX3Jlc3BvbnNlcylcbiAgLy8gb24gR29vZ2xlIERldmVsb3BlcnMuXG4gIHZhciBwbGFjZXNEZXRhaWxzID0gKFwiaWQgdXJsIHdlYnNpdGUgdmljaW5pdHkgcmVmZXJlbmNlIG5hbWUgcmF0aW5nIFwiICtcbiAgICBcImludGVybmF0aW9uYWxfcGhvbmVfbnVtYmVyIGljb24gZm9ybWF0dGVkX3Bob25lX251bWJlclwiKS5zcGxpdChcIiBcIik7XG5cbiAgLy8gVGhlIGFjdHVhbCBwbHVnaW4gY29uc3RydWN0b3IuXG4gIGZ1bmN0aW9uIEdlb0NvbXBsZXRlKGlucHV0LCBvcHRpb25zKSB7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5pbnB1dCA9IGlucHV0O1xuICAgIHRoaXMuJGlucHV0ID0gJChpbnB1dCk7XG5cbiAgICB0aGlzLl9kZWZhdWx0cyA9IGRlZmF1bHRzO1xuICAgIHRoaXMuX25hbWUgPSAnZ2VvY29tcGxldGUnO1xuXG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICAvLyBJbml0aWFsaXplIGFsbCBwYXJ0cyBvZiB0aGUgcGx1Z2luLlxuICAkLmV4dGVuZChHZW9Db21wbGV0ZS5wcm90b3R5cGUsIHtcbiAgICBpbml0OiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5pbml0TWFwKCk7XG4gICAgICB0aGlzLmluaXRNYXJrZXIoKTtcbiAgICAgIHRoaXMuaW5pdEdlb2NvZGVyKCk7XG4gICAgICB0aGlzLmluaXREZXRhaWxzKCk7XG4gICAgICB0aGlzLmluaXRMb2NhdGlvbigpO1xuICAgIH0sXG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSBtYXAgYnV0IG9ubHkgaWYgdGhlIG9wdGlvbiBgbWFwYCB3YXMgc2V0LlxuICAgIC8vIFRoaXMgd2lsbCBjcmVhdGUgYSBgbWFwYCB3aXRoaW4gdGhlIGdpdmVuIGNvbnRhaW5lclxuICAgIC8vIHVzaW5nIHRoZSBwcm92aWRlZCBgbWFwT3B0aW9uc2Agb3IgbGluayB0byB0aGUgZXhpc3RpbmcgbWFwIGluc3RhbmNlLlxuICAgIGluaXRNYXA6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5tYXApeyByZXR1cm47IH1cblxuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMubWFwLnNldENlbnRlciA9PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICB0aGlzLm1hcCA9IHRoaXMub3B0aW9ucy5tYXA7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKFxuICAgICAgICAkKHRoaXMub3B0aW9ucy5tYXApWzBdLFxuICAgICAgICB0aGlzLm9wdGlvbnMubWFwT3B0aW9uc1xuICAgICAgKTtcblxuICAgICAgLy8gYWRkIGNsaWNrIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSBtYXBcbiAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKFxuICAgICAgICB0aGlzLm1hcCxcbiAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgJC5wcm94eSh0aGlzLm1hcENsaWNrZWQsIHRoaXMpXG4gICAgICApO1xuXG4gICAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihcbiAgICAgICAgdGhpcy5tYXAsXG4gICAgICAgICd6b29tX2NoYW5nZWQnLFxuICAgICAgICAkLnByb3h5KHRoaXMubWFwWm9vbWVkLCB0aGlzKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgLy8gQWRkIGEgbWFya2VyIHdpdGggdGhlIHByb3ZpZGVkIGBtYXJrZXJPcHRpb25zYCBidXQgb25seVxuICAgIC8vIGlmIHRoZSBvcHRpb24gd2FzIHNldC4gQWRkaXRpb25hbGx5IGl0IGxpc3RlbnMgZm9yIHRoZSBgZHJhZ2VuZGAgZXZlbnRcbiAgICAvLyB0byBub3RpZnkgdGhlIHBsdWdpbiBhYm91dCBjaGFuZ2VzLlxuICAgIGluaXRNYXJrZXI6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoIXRoaXMubWFwKXsgcmV0dXJuOyB9XG4gICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHRoaXMub3B0aW9ucy5tYXJrZXJPcHRpb25zLCB7IG1hcDogdGhpcy5tYXAgfSk7XG5cbiAgICAgIGlmIChvcHRpb25zLmRpc2FibGVkKXsgcmV0dXJuOyB9XG5cbiAgICAgIHRoaXMubWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcihvcHRpb25zKTtcblxuICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIoXG4gICAgICAgIHRoaXMubWFya2VyLFxuICAgICAgICAnZHJhZ2VuZCcsXG4gICAgICAgICQucHJveHkodGhpcy5tYXJrZXJEcmFnZ2VkLCB0aGlzKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgLy8gQXNzb2NpYXRlIHRoZSBpbnB1dCB3aXRoIHRoZSBhdXRvY29tcGxldGVyIGFuZCBjcmVhdGUgYSBnZW9jb2RlclxuICAgIC8vIHRvIGZhbGwgYmFjayB3aGVuIHRoZSBhdXRvY29tcGxldGVyIGRvZXMgbm90IHJldHVybiBhIHZhbHVlLlxuICAgIGluaXRHZW9jb2RlcjogZnVuY3Rpb24oKXtcblxuICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgIHR5cGVzOiB0aGlzLm9wdGlvbnMudHlwZXMsXG4gICAgICAgIGJvdW5kczogdGhpcy5vcHRpb25zLmJvdW5kcyA9PT0gdHJ1ZSA/IG51bGwgOiB0aGlzLm9wdGlvbnMuYm91bmRzLFxuICAgICAgICBjb21wb25lbnRSZXN0cmljdGlvbnM6IHRoaXMub3B0aW9ucy5jb21wb25lbnRSZXN0cmljdGlvbnNcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuY291bnRyeSl7XG4gICAgICAgIG9wdGlvbnMuY29tcG9uZW50UmVzdHJpY3Rpb25zID0ge2NvdW50cnk6IHRoaXMub3B0aW9ucy5jb3VudHJ5fTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hdXRvY29tcGxldGUgPSBuZXcgZ29vZ2xlLm1hcHMucGxhY2VzLkF1dG9jb21wbGV0ZShcbiAgICAgICAgdGhpcy5pbnB1dCwgb3B0aW9uc1xuICAgICAgKTtcblxuICAgICAgdGhpcy5nZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgICAvLyBCaW5kIGF1dG9jb21wbGV0ZSB0byBtYXAgYm91bmRzIGJ1dCBvbmx5IGlmIHRoZXJlIGlzIGEgbWFwXG4gICAgICAvLyBhbmQgYG9wdGlvbnMuYmluZFRvTWFwYCBpcyBzZXQgdG8gdHJ1ZS5cbiAgICAgIGlmICh0aGlzLm1hcCAmJiB0aGlzLm9wdGlvbnMuYm91bmRzID09PSB0cnVlKXtcbiAgICAgICAgdGhpcy5hdXRvY29tcGxldGUuYmluZFRvKCdib3VuZHMnLCB0aGlzLm1hcCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFdhdGNoIGBwbGFjZV9jaGFuZ2VkYCBldmVudHMgb24gdGhlIGF1dG9jb21wbGV0ZSBpbnB1dCBmaWVsZC5cbiAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKFxuICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZSxcbiAgICAgICAgJ3BsYWNlX2NoYW5nZWQnLFxuICAgICAgICAkLnByb3h5KHRoaXMucGxhY2VDaGFuZ2VkLCB0aGlzKVxuICAgICAgKTtcblxuICAgICAgLy8gUHJldmVudCBwYXJlbnQgZm9ybSBmcm9tIGJlaW5nIHN1Ym1pdHRlZCBpZiB1c2VyIGhpdCBlbnRlci5cbiAgICAgIHRoaXMuJGlucHV0LmtleXByZXNzKGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKXsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICB9KTtcblxuICAgICAgLy8gTGlzdGVuIGZvciBcImdlb2NvZGVcIiBldmVudHMgYW5kIHRyaWdnZXIgZmluZCBhY3Rpb24uXG4gICAgICB0aGlzLiRpbnB1dC5iaW5kKFwiZ2VvY29kZVwiLCAkLnByb3h5KGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuZmluZCgpO1xuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAvLyBUcmlnZ2VyIGZpbmQgYWN0aW9uIHdoZW4gaW5wdXQgZWxlbWVudCBpcyBibHVyZWQgb3V0LlxuICAgICAgLy8gKFVzZWZ1bGwgZm9yIHR5cGluZyBwYXJ0aWFsIGxvY2F0aW9uIGFuZCB0YWJpbmcgdG8gdGhlIG5leHQgZmllbGRcbiAgICAgIC8vIG9yIGNsaWNraW5nIHNvbWV3aGVyZSBlbHNlLilcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmx1ciA9PT0gdHJ1ZSl7XG4gICAgICAgIHRoaXMuJGlucHV0LmJsdXIoJC5wcm94eShmdW5jdGlvbigpe1xuICAgICAgICAgIHRoaXMuZmluZCgpO1xuICAgICAgICB9LCB0aGlzKSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFByZXBhcmUgYSBnaXZlbiBET00gc3RydWN0dXJlIHRvIGJlIHBvcHVsYXRlZCB3aGVuIHdlIGdvdCBzb21lIGRhdGEuXG4gICAgLy8gVGhpcyB3aWxsIGN5Y2xlIHRocm91Z2ggdGhlIGxpc3Qgb2YgY29tcG9uZW50IHR5cGVzIGFuZCBtYXAgdGhlXG4gICAgLy8gY29ycmVzcG9uZGluZyBlbGVtZW50cy5cbiAgICBpbml0RGV0YWlsczogZnVuY3Rpb24oKXtcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmRldGFpbHMpeyByZXR1cm47IH1cblxuICAgICAgdmFyICRkZXRhaWxzID0gJCh0aGlzLm9wdGlvbnMuZGV0YWlscyksXG4gICAgICAgIGF0dHJpYnV0ZSA9IHRoaXMub3B0aW9ucy5kZXRhaWxzQXR0cmlidXRlLFxuICAgICAgICBkZXRhaWxzID0ge307XG5cbiAgICAgIGZ1bmN0aW9uIHNldERldGFpbCh2YWx1ZSl7XG4gICAgICAgIGRldGFpbHNbdmFsdWVdID0gJGRldGFpbHMuZmluZChcIltcIiArICBhdHRyaWJ1dGUgKyBcIj1cIiArIHZhbHVlICsgXCJdXCIpO1xuICAgICAgfVxuXG4gICAgICAkLmVhY2goY29tcG9uZW50VHlwZXMsIGZ1bmN0aW9uKGluZGV4LCBrZXkpe1xuICAgICAgICBzZXREZXRhaWwoa2V5KTtcbiAgICAgICAgc2V0RGV0YWlsKGtleSArIFwiX3Nob3J0XCIpO1xuICAgICAgfSk7XG5cbiAgICAgICQuZWFjaChwbGFjZXNEZXRhaWxzLCBmdW5jdGlvbihpbmRleCwga2V5KXtcbiAgICAgICAgc2V0RGV0YWlsKGtleSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy4kZGV0YWlscyA9ICRkZXRhaWxzO1xuICAgICAgdGhpcy5kZXRhaWxzID0gZGV0YWlscztcbiAgICB9LFxuXG4gICAgLy8gU2V0IHRoZSBpbml0aWFsIGxvY2F0aW9uIG9mIHRoZSBwbHVnaW4gaWYgdGhlIGBsb2NhdGlvbmAgb3B0aW9ucyB3YXMgc2V0LlxuICAgIC8vIFRoaXMgbWV0aG9kIHdpbGwgY2FyZSBhYm91dCBjb252ZXJ0aW5nIHRoZSB2YWx1ZSBpbnRvIHRoZSByaWdodCBmb3JtYXQuXG4gICAgaW5pdExvY2F0aW9uOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIGxvY2F0aW9uID0gdGhpcy5vcHRpb25zLmxvY2F0aW9uLCBsYXRMbmc7XG5cbiAgICAgIGlmICghbG9jYXRpb24pIHsgcmV0dXJuOyB9XG5cbiAgICAgIGlmICh0eXBlb2YgbG9jYXRpb24gPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5maW5kKGxvY2F0aW9uKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAobG9jYXRpb24gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBsYXRMbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxvY2F0aW9uWzBdLCBsb2NhdGlvblsxXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChsb2NhdGlvbiBpbnN0YW5jZW9mIGdvb2dsZS5tYXBzLkxhdExuZyl7XG4gICAgICAgIGxhdExuZyA9IGxvY2F0aW9uO1xuICAgICAgfVxuXG4gICAgICBpZiAobGF0TG5nKXtcbiAgICAgICAgaWYgKHRoaXMubWFwKXsgdGhpcy5tYXAuc2V0Q2VudGVyKGxhdExuZyk7IH1cbiAgICAgICAgaWYgKHRoaXMubWFya2VyKXsgdGhpcy5tYXJrZXIuc2V0UG9zaXRpb24obGF0TG5nKTsgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBMb29rIHVwIGEgZ2l2ZW4gYWRkcmVzcy4gSWYgbm8gYGFkZHJlc3NgIHdhcyBzcGVjaWZpZWQgaXQgdXNlc1xuICAgIC8vIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBpbnB1dC5cbiAgICBmaW5kOiBmdW5jdGlvbihhZGRyZXNzKXtcbiAgICAgIHRoaXMuZ2VvY29kZSh7XG4gICAgICAgIGFkZHJlc3M6IGFkZHJlc3MgfHwgdGhpcy4kaW5wdXQudmFsKClcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBSZXF1ZXN0cyBkZXRhaWxzIGFib3V0IGEgZ2l2ZW4gbG9jYXRpb24uXG4gICAgLy8gQWRkaXRpb25hbGx5IGl0IHdpbGwgYmlhcyB0aGUgcmVxdWVzdHMgdG8gdGhlIHByb3ZpZGVkIGJvdW5kcy5cbiAgICBnZW9jb2RlOiBmdW5jdGlvbihyZXF1ZXN0KXtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYm91bmRzICYmICFyZXF1ZXN0LmJvdW5kcyl7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYm91bmRzID09PSB0cnVlKXtcbiAgICAgICAgICByZXF1ZXN0LmJvdW5kcyA9IHRoaXMubWFwICYmIHRoaXMubWFwLmdldEJvdW5kcygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcXVlc3QuYm91bmRzID0gdGhpcy5vcHRpb25zLmJvdW5kcztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmNvdW50cnkpe1xuICAgICAgICByZXF1ZXN0LnJlZ2lvbiA9IHRoaXMub3B0aW9ucy5jb3VudHJ5O1xuICAgICAgfVxuXG4gICAgICB0aGlzLmdlb2NvZGVyLmdlb2NvZGUocmVxdWVzdCwgJC5wcm94eSh0aGlzLmhhbmRsZUdlb2NvZGUsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBzZWxlY3RlZCByZXN1bHQuIElmIG5vIHJlc3VsdCBpcyBzZWxlY3RlZCBvbiB0aGUgbGlzdCwgdGhlbiBnZXRcbiAgICAvLyB0aGUgZmlyc3QgcmVzdWx0IGZyb20gdGhlIGxpc3QuXG4gICAgc2VsZWN0Rmlyc3RSZXN1bHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8kKFwiLnBhYy1jb250YWluZXJcIikuaGlkZSgpO1xuXG4gICAgICB2YXIgc2VsZWN0ZWQgPSAnJztcbiAgICAgIC8vIENoZWNrIGlmIGFueSByZXN1bHQgaXMgc2VsZWN0ZWQuXG4gICAgICBpZiAoJChcIi5wYWMtaXRlbS1zZWxlY3RlZFwiKVsnMCddKSB7XG4gICAgICAgIHNlbGVjdGVkID0gJy1zZWxlY3RlZCc7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCB0aGUgZmlyc3Qgc3VnZ2VzdGlvbidzIHRleHQuXG4gICAgICB2YXIgJHNwYW4xID0gJChcIi5wYWMtY29udGFpbmVyIC5wYWMtaXRlbVwiICsgc2VsZWN0ZWQgKyBcIjpmaXJzdCBzcGFuOm50aC1jaGlsZCgyKVwiKS50ZXh0KCk7XG4gICAgICB2YXIgJHNwYW4yID0gJChcIi5wYWMtY29udGFpbmVyIC5wYWMtaXRlbVwiICsgc2VsZWN0ZWQgKyBcIjpmaXJzdCBzcGFuOm50aC1jaGlsZCgzKVwiKS50ZXh0KCk7XG5cbiAgICAgIC8vIEFkZHMgdGhlIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24sIGlmIGF2YWlsYWJsZS5cbiAgICAgIHZhciBmaXJzdFJlc3VsdCA9ICRzcGFuMTtcbiAgICAgIGlmICgkc3BhbjIpIHtcbiAgICAgICAgZmlyc3RSZXN1bHQgKz0gXCIgLSBcIiArICRzcGFuMjtcbiAgICAgIH1cblxuICAgICAgdGhpcy4kaW5wdXQudmFsKGZpcnN0UmVzdWx0KTtcblxuICAgICAgcmV0dXJuIGZpcnN0UmVzdWx0O1xuICAgIH0sXG5cbiAgICAvLyBIYW5kbGVzIHRoZSBnZW9jb2RlIHJlc3BvbnNlLiBJZiBtb3JlIHRoYW4gb25lIHJlc3VsdHMgd2FzIGZvdW5kXG4gICAgLy8gaXQgdHJpZ2dlcnMgdGhlIFwiZ2VvY29kZTptdWx0aXBsZVwiIGV2ZW50cy4gSWYgdGhlcmUgd2FzIGFuIGVycm9yXG4gICAgLy8gdGhlIFwiZ2VvY29kZTplcnJvclwiIGV2ZW50IGlzIGZpcmVkLlxuICAgIGhhbmRsZUdlb2NvZGU6IGZ1bmN0aW9uKHJlc3VsdHMsIHN0YXR1cyl7XG4gICAgICBpZiAoc3RhdHVzID09PSBnb29nbGUubWFwcy5HZW9jb2RlclN0YXR1cy5PSykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gcmVzdWx0c1swXTtcbiAgICAgICAgdGhpcy4kaW5wdXQudmFsKHJlc3VsdC5mb3JtYXR0ZWRfYWRkcmVzcyk7XG4gICAgICAgIHRoaXMudXBkYXRlKHJlc3VsdCk7XG5cbiAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID4gMSl7XG4gICAgICAgICAgdGhpcy50cmlnZ2VyKFwiZ2VvY29kZTptdWx0aXBsZVwiLCByZXN1bHRzKTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRyaWdnZXIoXCJnZW9jb2RlOmVycm9yXCIsIHN0YXR1cyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFRyaWdnZXJzIGEgZ2l2ZW4gYGV2ZW50YCB3aXRoIG9wdGlvbmFsIGBhcmd1bWVudHNgIG9uIHRoZSBpbnB1dC5cbiAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgYXJndW1lbnQpe1xuICAgICAgdGhpcy4kaW5wdXQudHJpZ2dlcihldmVudCwgW2FyZ3VtZW50XSk7XG4gICAgfSxcblxuICAgIC8vIFNldCB0aGUgbWFwIHRvIGEgbmV3IGNlbnRlciBieSBwYXNzaW5nIGEgYGdlb21ldHJ5YC5cbiAgICAvLyBJZiB0aGUgZ2VvbWV0cnkgaGFzIGEgdmlld3BvcnQsIHRoZSBtYXAgem9vbXMgb3V0IHRvIGZpdCB0aGUgYm91bmRzLlxuICAgIC8vIEFkZGl0aW9uYWxseSBpdCB1cGRhdGVzIHRoZSBtYXJrZXIgcG9zaXRpb24uXG4gICAgY2VudGVyOiBmdW5jdGlvbihnZW9tZXRyeSl7XG5cbiAgICAgIGlmIChnZW9tZXRyeS52aWV3cG9ydCl7XG4gICAgICAgIHRoaXMubWFwLmZpdEJvdW5kcyhnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgIGlmICh0aGlzLm1hcC5nZXRab29tKCkgPiB0aGlzLm9wdGlvbnMubWF4Wm9vbSl7XG4gICAgICAgICAgdGhpcy5tYXAuc2V0Wm9vbSh0aGlzLm9wdGlvbnMubWF4Wm9vbSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubWFwLnNldFpvb20odGhpcy5vcHRpb25zLm1heFpvb20pO1xuICAgICAgICB0aGlzLm1hcC5zZXRDZW50ZXIoZ2VvbWV0cnkubG9jYXRpb24pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5tYXJrZXIpe1xuICAgICAgICB0aGlzLm1hcmtlci5zZXRQb3NpdGlvbihnZW9tZXRyeS5sb2NhdGlvbik7XG4gICAgICAgIHRoaXMubWFya2VyLnNldEFuaW1hdGlvbih0aGlzLm9wdGlvbnMubWFya2VyT3B0aW9ucy5hbmltYXRpb24pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBVcGRhdGUgdGhlIGVsZW1lbnRzIGJhc2VkIG9uIGEgc2luZ2xlIHBsYWNlcyBvciBnZW9vY29kaW5nIHJlc3BvbnNlXG4gICAgLy8gYW5kIHRyaWdnZXIgdGhlIFwiZ2VvY29kZTpyZXN1bHRcIiBldmVudCBvbiB0aGUgaW5wdXQuXG4gICAgdXBkYXRlOiBmdW5jdGlvbihyZXN1bHQpe1xuXG4gICAgICBpZiAodGhpcy5tYXApe1xuICAgICAgICB0aGlzLmNlbnRlcihyZXN1bHQuZ2VvbWV0cnkpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy4kZGV0YWlscyl7XG4gICAgICAgIHRoaXMuZmlsbERldGFpbHMocmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50cmlnZ2VyKFwiZ2VvY29kZTpyZXN1bHRcIiwgcmVzdWx0KTtcbiAgICB9LFxuXG4gICAgLy8gUG9wdWxhdGUgdGhlIHByb3ZpZGVkIGVsZW1lbnRzIHdpdGggbmV3IGByZXN1bHRgIGRhdGEuXG4gICAgLy8gVGhpcyB3aWxsIGxvb2t1cCBhbGwgZWxlbWVudHMgdGhhdCBoYXMgYW4gYXR0cmlidXRlIHdpdGggdGhlIGdpdmVuXG4gICAgLy8gY29tcG9uZW50IHR5cGUuXG4gICAgZmlsbERldGFpbHM6IGZ1bmN0aW9uKHJlc3VsdCl7XG5cbiAgICAgIHZhciBkYXRhID0ge30sXG4gICAgICAgIGdlb21ldHJ5ID0gcmVzdWx0Lmdlb21ldHJ5LFxuICAgICAgICB2aWV3cG9ydCA9IGdlb21ldHJ5LnZpZXdwb3J0LFxuICAgICAgICBib3VuZHMgPSBnZW9tZXRyeS5ib3VuZHM7XG5cbiAgICAgIC8vIENyZWF0ZSBhIHNpbXBsaWZpZWQgdmVyc2lvbiBvZiB0aGUgYWRkcmVzcyBjb21wb25lbnRzLlxuICAgICAgJC5lYWNoKHJlc3VsdC5hZGRyZXNzX2NvbXBvbmVudHMsIGZ1bmN0aW9uKGluZGV4LCBvYmplY3Qpe1xuICAgICAgICB2YXIgbmFtZSA9IG9iamVjdC50eXBlc1swXTtcbiAgICAgICAgZGF0YVtuYW1lXSA9IG9iamVjdC5sb25nX25hbWU7XG4gICAgICAgIGRhdGFbbmFtZSArIFwiX3Nob3J0XCJdID0gb2JqZWN0LnNob3J0X25hbWU7XG4gICAgICB9KTtcblxuICAgICAgLy8gQWRkIHByb3BlcnRpZXMgb2YgdGhlIHBsYWNlcyBkZXRhaWxzLlxuICAgICAgJC5lYWNoKHBsYWNlc0RldGFpbHMsIGZ1bmN0aW9uKGluZGV4LCBrZXkpe1xuICAgICAgICBkYXRhW2tleV0gPSByZXN1bHRba2V5XTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBBZGQgaW5mb3MgYWJvdXQgdGhlIGFkZHJlc3MgYW5kIGdlb21ldHJ5LlxuICAgICAgJC5leHRlbmQoZGF0YSwge1xuICAgICAgICBmb3JtYXR0ZWRfYWRkcmVzczogcmVzdWx0LmZvcm1hdHRlZF9hZGRyZXNzLFxuXHQgICAgICBzdHJlZXRfYWRkcmVzczogW2RhdGEuc3RyZWV0X251bWJlciwgZGF0YS5yb3V0ZV1cblx0XHQgICAgICAuZmlsdGVyKGZ1bmN0aW9uICggdmFsICkge3JldHVybiAnc3RyaW5nJyA9PT0gdHlwZW9mIHZhbDt9KS5qb2luKCcgJyksXG4gICAgICAgIGxvY2F0aW9uX3R5cGU6IGdlb21ldHJ5LmxvY2F0aW9uX3R5cGUgfHwgXCJQTEFDRVNcIixcbiAgICAgICAgdmlld3BvcnQ6IHZpZXdwb3J0LFxuICAgICAgICBib3VuZHM6IGJvdW5kcyxcbiAgICAgICAgbG9jYXRpb246IGdlb21ldHJ5LmxvY2F0aW9uLFxuICAgICAgICBsYXQ6IGdlb21ldHJ5LmxvY2F0aW9uLmxhdCgpLFxuICAgICAgICBsbmc6IGdlb21ldHJ5LmxvY2F0aW9uLmxuZygpXG4gICAgICB9KTtcblxuICAgICAgLy8gU2V0IHRoZSB2YWx1ZXMgZm9yIGFsbCBkZXRhaWxzLlxuICAgICAgJC5lYWNoKHRoaXMuZGV0YWlscywgJC5wcm94eShmdW5jdGlvbihrZXksICRkZXRhaWwpe1xuICAgICAgICB2YXIgdmFsdWUgPSBkYXRhW2tleV07XG4gICAgICAgIHRoaXMuc2V0RGV0YWlsKCRkZXRhaWwsIHZhbHVlKTtcbiAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB9LFxuXG4gICAgLy8gQXNzaWduIGEgZ2l2ZW4gYHZhbHVlYCB0byBhIHNpbmdsZSBgJGVsZW1lbnRgLlxuICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIGFuIGlucHV0LCB0aGUgdmFsdWUgaXMgc2V0LCBvdGhlcndpc2UgaXQgdXBkYXRlc1xuICAgIC8vIHRoZSB0ZXh0IGNvbnRlbnQuXG4gICAgc2V0RGV0YWlsOiBmdW5jdGlvbigkZWxlbWVudCwgdmFsdWUpe1xuXG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHZhbHVlID0gXCJcIjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlLnRvVXJsVmFsdWUgPT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1VybFZhbHVlKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICgkZWxlbWVudC5pcyhcIjppbnB1dFwiKSl7XG4gICAgICAgICRlbGVtZW50LnZhbCh2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkZWxlbWVudC50ZXh0KHZhbHVlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gRmlyZSB0aGUgXCJnZW9jb2RlOmRyYWdnZWRcIiBldmVudCBhbmQgcGFzcyB0aGUgbmV3IHBvc2l0aW9uLlxuICAgIG1hcmtlckRyYWdnZWQ6IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIHRoaXMudHJpZ2dlcihcImdlb2NvZGU6ZHJhZ2dlZFwiLCBldmVudC5sYXRMbmcpO1xuICAgIH0sXG5cbiAgICBtYXBDbGlja2VkOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB0aGlzLnRyaWdnZXIoXCJnZW9jb2RlOmNsaWNrXCIsIGV2ZW50LmxhdExuZyk7XG4gICAgfSxcblxuICAgIG1hcFpvb21lZDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHRoaXMudHJpZ2dlcihcImdlb2NvZGU6em9vbVwiLCB0aGlzLm1hcC5nZXRab29tKCkpO1xuICAgIH0sXG5cbiAgICAvLyBSZXN0b3JlIHRoZSBvbGQgcG9zaXRpb24gb2YgdGhlIG1hcmtlciB0byB0aGUgbGFzdCBub3cgbG9jYXRpb24uXG4gICAgcmVzZXRNYXJrZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLm1hcmtlci5zZXRQb3NpdGlvbih0aGlzLmRhdGEubG9jYXRpb24pO1xuICAgICAgdGhpcy5zZXREZXRhaWwodGhpcy5kZXRhaWxzLmxhdCwgdGhpcy5kYXRhLmxvY2F0aW9uLmxhdCgpKTtcbiAgICAgIHRoaXMuc2V0RGV0YWlsKHRoaXMuZGV0YWlscy5sbmcsIHRoaXMuZGF0YS5sb2NhdGlvbi5sbmcoKSk7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZSB0aGUgcGx1Z2luIGFmdGVyIHRoZSB1c2VyIGhhcyBzZWxlY3RlZCBhbiBhdXRvY29tcGxldGUgZW50cnkuXG4gICAgLy8gSWYgdGhlIHBsYWNlIGhhcyBubyBnZW9tZXRyeSBpdCBwYXNzZXMgaXQgdG8gdGhlIGdlb2NvZGVyLlxuICAgIHBsYWNlQ2hhbmdlZDogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwbGFjZSA9IHRoaXMuYXV0b2NvbXBsZXRlLmdldFBsYWNlKCk7XG5cbiAgICAgIGlmICghcGxhY2UgfHwgIXBsYWNlLmdlb21ldHJ5KXtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvc2VsZWN0KSB7XG4gICAgICAgICAgLy8gQXV0b21hdGljYWxseSBzZWxlY3RzIHRoZSBoaWdobGlnaHRlZCBpdGVtIG9yIHRoZSBmaXJzdCBpdGVtIGZyb20gdGhlXG4gICAgICAgICAgLy8gc3VnZ2VzdGlvbnMgbGlzdC5cbiAgICAgICAgICB2YXIgYXV0b1NlbGVjdGlvbiA9IHRoaXMuc2VsZWN0Rmlyc3RSZXN1bHQoKTtcbiAgICAgICAgICB0aGlzLmZpbmQoYXV0b1NlbGVjdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFVzZSB0aGUgaW5wdXQgdGV4dCBpZiBpdCBhbHJlYWR5IGdpdmVzIGdlb21ldHJ5LlxuICAgICAgICB0aGlzLnVwZGF0ZShwbGFjZSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvLyBBIHBsdWdpbiB3cmFwcGVyIGFyb3VuZCB0aGUgY29uc3RydWN0b3IuXG4gIC8vIFBhc3MgYG9wdGlvbnNgIHdpdGggYWxsIHNldHRpbmdzIHRoYXQgYXJlIGRpZmZlcmVudCBmcm9tIHRoZSBkZWZhdWx0LlxuICAvLyBUaGUgYXR0cmlidXRlIGlzIHVzZWQgdG8gcHJldmVudCBtdWx0aXBsZSBpbnN0YW50aWF0aW9ucyBvZiB0aGUgcGx1Z2luLlxuICAkLmZuLmdlb2NvbXBsZXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgdmFyIGF0dHJpYnV0ZSA9ICdwbHVnaW5fZ2VvY29tcGxldGUnO1xuXG4gICAgLy8gSWYgeW91IGNhbGwgYC5nZW9jb21wbGV0ZSgpYCB3aXRoIGEgc3RyaW5nIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcbiAgICAvLyBpdCByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnR5IG9yIGNhbGxzIHRoZSBtZXRob2Qgd2l0aCB0aGVcbiAgICAvLyBmb2xsb3dpbmcgYXJndW1lbnRzLlxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSBcInN0cmluZ1wiKXtcblxuICAgICAgdmFyIGluc3RhbmNlID0gJCh0aGlzKS5kYXRhKGF0dHJpYnV0ZSkgfHwgJCh0aGlzKS5nZW9jb21wbGV0ZSgpLmRhdGEoYXR0cmlidXRlKSxcbiAgICAgICAgcHJvcCA9IGluc3RhbmNlW29wdGlvbnNdO1xuXG4gICAgICBpZiAodHlwZW9mIHByb3AgPT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgcHJvcC5hcHBseShpbnN0YW5jZSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgICAgIHJldHVybiAkKHRoaXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMil7XG4gICAgICAgICAgcHJvcCA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvcDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gUHJldmVudCBhZ2FpbnN0IG11bHRpcGxlIGluc3RhbnRpYXRpb25zLlxuICAgICAgICB2YXIgaW5zdGFuY2UgPSAkLmRhdGEodGhpcywgYXR0cmlidXRlKTtcbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgIGluc3RhbmNlID0gbmV3IEdlb0NvbXBsZXRlKCB0aGlzLCBvcHRpb25zICk7XG4gICAgICAgICAgJC5kYXRhKHRoaXMsIGF0dHJpYnV0ZSwgaW5zdGFuY2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbn0pKCBqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQgKTtcbiJdLCJmaWxlIjoianF1ZXJ5Lmdlb2NvbXBsZXRlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
