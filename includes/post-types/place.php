<?php

/**
 * Class Stellar_Places_Place
 */
class Stellar_Places_Place {

	const POST_TYPE = 'stlr_place';

	/**
	 * Register post type
	 */
	public static function register_post_type() {
		$args = array(
			'labels'      => array(
				'name'               => __( 'Places', 'stellar-places' ),
				'singular_name'      => __( 'Place', 'stellar-places' ),
				'add_new_item'       => __( 'Add New Place', 'stellar-places' ),
				'edit_item'          => __( 'Edit Place', 'stellar-places' ),
				'new_item'           => __( 'New Place', 'stellar-places' ),
				'view_item'          => __( 'View Place', 'stellar-places' ),
				'search_items'       => __( 'Search Places', 'stellar-places' ),
				'not_found'          => __( 'No places found', 'stellar-places' ),
				'not_found_in_trash' => __( 'No places found in trash', 'stellar-places' ),
			),
			'has_archive' => true,
			'public'      => true,
			'supports'    => array(
				'title',
				'editor',
				'excerpt',
				'thumbnail',
				'stellar-places-location',
			),
			'rewrite'     => array(
				'slug' => 'locations',
				'with_front' => false,
			),
			'taxonomies'  => array( Stellar_Places_Location_Category::TAXONOMY ),
			'menu_icon'   => 'dashicons-location-alt',
		);
		$args = apply_filters( self::POST_TYPE . '-post_type_args', $args );
		register_post_type( self::POST_TYPE, $args );
	}

}