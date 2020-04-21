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
		register_post_type(
			self::POST_TYPE,
			array(
				'labels'       => array(
					'name'               => esc_html_x( 'Places', 'post type general name', 'stellar-places' ),
					'singular_name'      => esc_html_x( 'Place', 'post type singular name', 'stellar-places' ),
					'add_new'            => esc_html_x( 'Add New', 'place', 'stellar-places' ),
					'add_new_item'       => esc_html__( 'Add New Place', 'stellar-places' ),
					'edit_item'          => esc_html__( 'Edit Place', 'stellar-places' ),
					'new_item'           => esc_html__( 'New Place', 'stellar-places' ),
					'view_item'          => esc_html__( 'View Place', 'stellar-places' ),
					'search_items'       => esc_html__( 'Search Places', 'stellar-places' ),
					'not_found'          => esc_html__( 'No places found', 'stellar-places' ),
					'not_found_in_trash' => esc_html__( 'No places found in trash', 'stellar-places' ),
				),
				'public'       => true,
				'has_archive'  => true,
				'menu_icon'    => 'dashicons-location-alt',
				'show_in_rest' => true,
				'rest_base'    => 'locations',
				'rewrite'      => array(
					'slug'       => 'locations',
					'with_front' => false,
				),
				'supports'     => array(
					'title',
					'editor',
					'excerpt',
					'thumbnail',
					'stellar-places-location',
				),
				'taxonomies'   => array( Stellar_Places_Location_Category::TAXONOMY ),
			)
		);
	}

}
