<?php

/**
 * Class Stellar_Places_Query
 */
class Stellar_Places_Query extends WP_Query {

	function __construct( $query = '' ) {
		$query_args = wp_parse_args( $query,
			array(
				'post_type'      => Stellar_Places::get_post_types(),
				'posts_per_page' => - 1,
			)
		);
		$query_args['meta_query'][] = array( 'key' => '_stlr_places_latitude' );
		$query_args['meta_query'][] = array( 'key' => '_stlr_places_longitude' );
		$query_args = apply_filters( 'stellar_places_query', $query_args );
		parent::__construct( $query_args );
	}

}