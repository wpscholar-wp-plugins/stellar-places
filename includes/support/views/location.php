<script>
	(function ( doc, $ ) {
		$(doc).ready(
			function () {

				var lat = '<?php echo esc_js( get_post_meta( get_the_ID(), '_stlr_places_latitude', true ) ); ?>';
				var lng = '<?php echo esc_js( get_post_meta( get_the_ID(), '_stlr_places_longitude', true ) ); ?>';

				var options = {
					map: '.stellar-places-map-canvas',
					details: '.stellar-places-geocode',
					detailsAttribute: 'data-geo',
					markerOptions: {
						draggable: true
					}
				};

				if ( lat && lng ) {
					var latLng = new google.maps.LatLng(lat, lng);
					options.mapOptions = {center: latLng};
					options.markerOptions.position = latLng;
				}

				var $el = $('#stellar-places-geocode-input');

				$el.geocomplete(options)
					.bind(
					"geocode:dragged", function ( event, latLng ) {
						$('input[data-geo=lat]').val(latLng.lat());
						$('input[data-geo=lng]').val(latLng.lng());
					}
				);

				$('.stellar-places-trigger-geocode').click(
					function () {
						$el.trigger('geocode');
					}
				);

			}
		);
	})(document, jQuery);
</script>

<style>
	.stellar-places-geocode {
		margin-top: 1em;
	}

	.stellar-places-geocode input {
		width: 85%;
	}

	.stellar-places-map-canvas {
		width: 100%;
		height: 300px;
		margin-top: 1em;
	}

	.stellar-places-geocode fieldset {
		margin: 1em 0;
	}

	.stellar-places-field label {
		display: block;
		margin-top: .25em;
	}

	.stellar-places-field input {
		width: 100%;
	}

	.stellar-places-latitude-field {
		display: inline-block;
		width: 49%;
	}

	.stellar-places-longitude-field {
		float: right;
		width: 49%;
	}

	.stellar-places-locality-field {
		display: inline-block;
		width: 42%;
	}

	.stellar-places-region-field {
		display: inline-block;
		width: 32%;
		margin-left: 2%;
	}

	.stellar-places-postal-code-field {
		float: right;
		width: 20%;
	}

</style>

<div class="stellar-places-geocode">

	<input id="stellar-places-geocode-input"
	       type="text"
	       name="_stlr_places_formatted_address"
	       placeholder="<?php _e( 'Enter a location', 'stellar-places' ); ?>"
	       value="<?php echo esc_attr( get_post_meta( get_the_ID(), '_stlr_places_formatted_address', true ) ); ?>" />
	<button type="button" class="stellar-places-trigger-geocode button-secondary"><?php
		_e( 'Find', 'stellar-places' );
		?></button>

	<div class="stellar-places-map-canvas"></div>
	<p class="description"><?php _e( 'Drag marker to reposition.', 'stellar-places' ); ?></p>

	<fieldset class="stellar-places-address">

		<div class="stellar-places-field stellar-places-street-address-field">
			<label><?php _e( 'Street Address', 'stellar-places' ); ?></label>
			<input type="text"
			       data-geo="street_address"
			       name="_stlr_places_street_address"
			       placeholder="<?php _e( 'Street Address', 'stellar-places' ); ?>"
			       value="<?php echo esc_attr( get_post_meta( get_the_ID(), '_stlr_places_street_address', true ) ); ?>" />
		</div>

		<div class="stellar-places-field stellar-places-locality-field">
			<label><?php _e( 'City', 'stellar-places' ); ?></label>
			<input type="text"
			       data-geo="locality"
			       name="_stlr_places_locality"
			       placeholder="<?php _e( 'City', 'stellar-places' ); ?>"
			       value="<?php echo esc_attr( get_post_meta( get_the_ID(), '_stlr_places_locality', true ) ); ?>" />
		</div>

		<div class="stellar-places-field stellar-places-region-field">
			<label><?php _e( 'State', 'stellar-places' ); ?></label>
			<input type="text"
			       data-geo="administrative_area_level_1"
			       name="_stlr_places_region"
			       placeholder="<?php _e( 'State', 'stellar-places' ); ?>"
			       value="<?php echo esc_attr( get_post_meta( get_the_ID(), '_stlr_places_region', true ) ); ?>" />
		</div>

		<div class="stellar-places-field stellar-places-postal-code-field">
			<label><?php _e( 'Postal Code', 'stellar-places' ); ?></label>
			<input type="text"
			       data-geo="postal_code"
			       name="_stlr_places_postal_code"
			       placeholder="<?php _e( 'Postal Code', 'stellar-places' ); ?>"
			       value="<?php echo esc_attr( get_post_meta( get_the_ID(), '_stlr_places_postal_code', true ) ); ?>" />
		</div>

		<div class="stellar-places-field stellar-places-country-field">
			<label><?php _e( 'Country', 'stellar-places' ); ?></label>
			<input type="text"
			       data-geo="country"
			       name="_stlr_places_country"
			       placeholder="<?php _e( 'Country', 'stellar-places' ); ?>"
			       value="<?php echo esc_attr( get_post_meta( get_the_ID(), '_stlr_places_country', true ) ); ?>" />
		</div>
	</fieldset>

	<fieldset class="stellar-places-coordinates">
		<div class="stellar-places-field stellar-places-latitude-field">
			<label><?php _e( 'Latitude', 'stellar-places' ); ?></label>
			<input type="text"
			       data-geo="lat"
			       name="_stlr_places_latitude"
			       placeholder="<?php _e( 'Latitude', 'stellar-places' ); ?>"
			       value="<?php echo esc_attr( get_post_meta( get_the_ID(), '_stlr_places_latitude', true ) ); ?>" />
		</div>

		<div class="stellar-places-field stellar-places-longitude-field">
			<label><?php _e( 'Longitude', 'stellar-places' ); ?></label>
			<input type="text"
			       data-geo="lng"
			       name="_stlr_places_longitude"
			       placeholder="<?php _e( 'Longitude', 'stellar-places' ); ?>"
			       value="<?php echo esc_attr( get_post_meta( get_the_ID(), '_stlr_places_longitude', true ) ); ?>" />
		</div>
	</fieldset>

</div>