<?php

/**
 * Class Stellar_Places_Map_Shortcode
 */
class Stellar_Places_Map_Shortcode {

	/**
	 * Shortcode callback
	 *
	 * @param array $atts
	 *
	 * @return string
	 */
	public static function shortcode( $atts ) {

		$atts = shortcode_atts(
			array(
				// HTML Attributes
				'id'          => '',
				'class'       => '',
				'width'       => '100%',
				'height'      => '400px',
				// WordPress Specific
				'post_id'     => '',
				'post_type'   => '',
				'taxonomy'    => Stellar_Places_Location_Category::TAXONOMY,
				'term'        => '',
				'category'    => '', // Alias for term
				// Map Center Coordinates
				'lat'         => '0',
				'lng'         => '0',
				// Google Maps
				'mapTypeId'   => 'ROADMAP',
				'scrollwheel' => 'false',
				'zoom'        => null,
				'maxzoom'     => null,
				'minzoom'     => null,
				// Other
				'infowindows' => 'true',
			),
			$atts
		);

		$width = $atts['width'];
		if ( is_numeric( $width ) ) {
			$width = "{$width}px";
		}

		$height = $atts['height'];
		if ( is_numeric( $height ) ) {
			$height = "{$height}px";
		}

		$query_args = array();

		// Post ID
		if ( ! empty( $atts['post_id'] ) ) {
			$query_args['p'] = $atts['post_id'];
		}

		// Post Type
		if ( ! empty( $atts['post_type'] ) ) {
			$query_args['post_type'] = $atts['post_type'];
		}

		// Category (alias for term)
		if ( ! empty( $atts['category'] ) && empty( $atts['term'] ) ) {
			$atts['term'] = $atts['category'];
		}

		// Taxonomy
		if ( ! empty( $atts['taxonomy'] ) && ! empty( $atts['term'] ) ) {
			$query_args['tax_query'] = array(
				array(
					'taxonomy' => $atts['taxonomy'],
					'field'    => 'slug',
					'terms'    => $atts['term'],
				),
			);
		}

		$query = new Stellar_Places_Query( $query_args );

		$map = new Stellar_Places_Google_Map( $query );

		$map->autoZoom = true;
		$map->infoWindows = filter_var( $atts['infowindows'], FILTER_VALIDATE_BOOLEAN );

		// Set HTML attributes
		$map->id = $atts['id'];
		$map->class = $atts['class'];
		$map->width = $width;
		$map->height = $height;

		// Set map center coordinates
		$map->latitude = $atts['lat'];
		$map->longitude = $atts['lng'];

		// Set Google map options
		$map->mapOptions['mapTypeId'] = $atts['mapTypeId'];
		$map->mapOptions['scrollwheel'] = filter_var( $atts['scrollwheel'], FILTER_VALIDATE_BOOLEAN );
		$map->mapOptions['zoom'] = is_null( $atts['zoom'] ) ? null : absint( $atts['zoom'] );

		// If zoom is set, disable auto zoom functionality
		if ( ! is_null( $atts['zoom'] ) ) {
			$map->autoZoom = false;
		}

		if ( ! is_null( $atts['maxzoom'] ) ) {
			$map->mapOptions['maxZoom'] = absint( $atts['maxzoom'] );
		}

		if ( ! is_null( $atts['minzoom'] ) ) {
			$map->mapOptions['minZoom'] = absint( $atts['minzoom'] );
		}

		return $map->get_html();
	}

}