<?php

/**
 * Class Stellar_Places_Location_Category
 */
class Stellar_Places_Location_Category {

	const TAXONOMY = 'stlr_location_categories';

	/**
	 * Register taxonomy
	 */
	public static function register_taxonomy() {
		$args = array(
			'labels'            => array(
				'name'              => _x( 'Location Categories', self::TAXONOMY, 'stellar-places' ),
				'singular_name'     => _x( 'Location Category', self::TAXONOMY, 'stellar-places' ),
				'edit_item'         => __( 'Edit Location Category', 'stellar-places' ),
				'view_item'         => __( 'View Location Category', 'stellar-places' ),
				'update_item'       => __( 'Update Location Category', 'stellar-places' ),
				'add_new_item'      => __( 'Add New Location Category', 'stellar-places' ),
				'new_item_name'     => __( 'New Location Category Name', 'stellar-places' ),
				'parent_item'       => __( 'Parent Location Category', 'stellar-places' ),
				'parent_item_colon' => __( 'Parent Location Category:', 'stellar-places' ),
				'search_items'      => __( 'Search Location Categories', 'stellar-places' ),
			),
			'public'            => true,
			'show_tagcloud'     => false,
			'show_admin_column' => true,
			'hierarchical'      => true,
			'rewrite'           => array(
				'slug' => 'locations/category',
			),
			'supports'          => array(
				'stellar-places-location',
			),
		);
		$args = apply_filters( self::TAXONOMY . '-taxonomy_args', $args );
		register_taxonomy( self::TAXONOMY, null, $args );
	}

}