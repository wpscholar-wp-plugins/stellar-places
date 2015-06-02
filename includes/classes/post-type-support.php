<?php

/**
 * Class Stellar_Places_Post_Type_Support
 */
class Stellar_Places_Post_Type_Support {

	/**
	 * Get a list of post types that support a specific feature.
	 *
	 * @param string $feature
	 * @return array
	 */
	public static function get_post_types_that_support( $feature ) {
		global $_wp_post_type_features;
		return array_keys( wp_filter_object_list( $_wp_post_type_features, array( $feature => true ) ) );
	}

}