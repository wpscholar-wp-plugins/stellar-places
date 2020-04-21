<?php

/**
 * Class Stellar_Places_Location_Category
 */
class Stellar_Places_Location_Category {

	/**
	 * Taxonomy name.
	 *
	 * @var string
	 */
	const TAXONOMY = 'stlr_location_categories';

	/**
	 * Register the taxonomy.
	 */
	public static function register_taxonomy() {

		register_taxonomy(
			self::TAXONOMY,
			array(),
			array(
				'labels'            => array(
					'name'              => esc_html_x( 'Location Categories', 'taxonomy general name', 'stellar-places' ),
					'singular_name'     => esc_html_x( 'Location Category', 'taxonomy singular name', 'stellar-places' ),
					'edit_item'         => esc_html__( 'Edit Location Category', 'stellar-places' ),
					'view_item'         => esc_html__( 'View Location Category', 'stellar-places' ),
					'update_item'       => esc_html__( 'Update Location Category', 'stellar-places' ),
					'add_new_item'      => esc_html__( 'Add New Location Category', 'stellar-places' ),
					'new_item_name'     => esc_html__( 'New Location Category Name', 'stellar-places' ),
					'parent_item'       => esc_html__( 'Parent Location Category', 'stellar-places' ),
					'parent_item_colon' => esc_html__( 'Parent Location Category:', 'stellar-places' ),
					'search_items'      => esc_html__( 'Search Location Categories', 'stellar-places' ),
				),
				'public'            => true,
				'hierarchical'      => true,
				'show_tagcloud'     => false,
				'show_admin_column' => true,
				'show_in_rest'      => true,
				'rest_base'         => 'location-categories',
				'rewrite'           => array(
					'slug'       => 'locations/category',
					'with_front' => false,
				),
				'supports'          => array(
					'stellar-places-location',
				),
			)
		);

	}

}
