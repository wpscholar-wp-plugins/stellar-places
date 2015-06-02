<?php

/**
 * Class Stellar_Places_Taxonomy_Support
 */
class Stellar_Places_Taxonomy_Support {

	/**
	 * Add taxonomy support for a specific feature
	 *
	 * @param string $taxonomy
	 * @param string $feature
	 */
	public static function add_taxonomy_support( $taxonomy, $feature ) {
		global $wp_taxonomies;
		if ( taxonomy_exists( $taxonomy ) ) {
			if ( isset( $wp_taxonomies[$taxonomy]->supports ) && is_array( $wp_taxonomies[$taxonomy]->supports ) ) {
				$wp_taxonomies[$taxonomy]->supports[] = $feature;
			} else {
				$wp_taxonomies[$taxonomy]->supports = array( $feature );
			}
		}
	}

	/**
	 * Remove taxonomy support for a specific feature
	 *
	 * @param string $taxonomy
	 * @param string $feature
	 */
	public static function remove_taxonomy_support( $taxonomy, $feature ) {
		global $wp_taxonomies;
		if ( taxonomy_exists( $taxonomy ) ) {
			if ( isset( $wp_taxonomies[$taxonomy]->supports ) && is_array( $wp_taxonomies[$taxonomy]->supports ) ) {
				unset( $wp_taxonomies[$taxonomy]->supports[$feature] );
			}
		}
	}

	/**
	 * Checks if a taxonomy supports a specific feature
	 *
	 * @param string $taxonomy
	 * @param string $feature
	 * @return bool
	 */
	public static function taxonomy_supports( $taxonomy, $feature ) {
		global $wp_taxonomies;
		return (
			isset( $wp_taxonomies[$taxonomy]->supports ) &&
			is_array( $wp_taxonomies[$taxonomy]->supports ) &&
			in_array( $feature, $wp_taxonomies[$taxonomy]->supports )
		);
	}

	/**
	 * Fetch a list of all features supported by a taxonomy
	 * NOTE: I think that get_taxonomy_features() is a better name, but the naming was selected to match the WordPress
	 * core function get_all_post_type_supports().
	 *
	 * @param string $taxonomy
	 * @return array
	 */
	public static function get_all_taxonomy_supports( $taxonomy ) {
		global $wp_taxonomies;
		$features = array();
		if ( taxonomy_exists( $taxonomy ) ) {
			if ( isset( $wp_taxonomies[$taxonomy]->supports ) && is_array( $wp_taxonomies[$taxonomy]->supports ) ) {
				$features = $wp_taxonomies[$taxonomy]->supports;
			}
		}
		return $features;
	}

	/**
	 * Fetch a list of all taxonomies that support a specific feature
	 *
	 * @param string $feature
	 * @return array
	 */
	public static function get_taxonomies_that_support( $feature ) {
		global $wp_taxonomies;
		$supported_taxonomies = array();
		foreach ( $wp_taxonomies as $taxonomy => $taxonomy_object ) {
			if ( self::taxonomy_supports( $taxonomy, $feature ) ) {
				$supported_taxonomies[] = $taxonomy;
			}
		}
		return $supported_taxonomies;
	}

}