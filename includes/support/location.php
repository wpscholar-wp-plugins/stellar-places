<?php

/**
 * Class Stellar_Places_Location_Support
 */
class Stellar_Places_Location_Support {

	const FEATURE = 'stellar-places-location';

	/**
	 * Initialize post type support
	 */
	public static function initialize() {
		if ( is_admin() ) {
			add_action( 'admin_init', array( 'Stellar_Places_Location_Support', 'add_meta_boxes' ) );
		} else {
			add_action( 'wp', array( __CLASS__, 'wp' ) );
		}
	}

	/**
	 * Locate template
	 *
	 * @param string $name
	 * @return string
	 */
	protected static function _locate_template( $name ) {
		$templates = array();
		foreach ( Stellar_Places_Context::get_context() as $context ) {
			$templates[] = "stellar-places/{$context}.php";
		}
		$template = locate_template( $templates );
		if ( empty( $template ) ) {
			$template = dirname( STELLAR_PLACES_FILE ) . "/includes/templates/{$name}.php";
		}
		return $template;
	}

	/**
	 * Load templates where appropriate
	 */
	public static function wp() {
		$queried_object = get_queried_object();
		if ( is_singular( Stellar_Places::get_post_types() ) ) {
			self::load_single_template();
		} else if (
			is_post_type_archive( Stellar_Places::get_post_types() ) ||
			(
				( is_tax() || is_category() || is_tag() ) &&
				Stellar_Places_Taxonomy_Support::taxonomy_supports( $queried_object->taxonomy, self::FEATURE )
			)
		) {
			self::load_archive_template();
		}
	}

	/**
	 * Load the single.php template - shown before the content on single pages
	 */
	public static function load_single_template() {
		$template = self::_locate_template( 'single' );
		if ( $template ) {
			wp_enqueue_style( 'stellar-places' );
			ob_start();
			include( $template );
			$content = ob_get_clean();
			new Stellar_Places_Content_Prepender( $content );
		}
	}

	/**
	 * Load the archive.php template - shown before the loop on archive pages
	 */
	public static function load_archive_template() {
		$template = self::_locate_template( 'archive' );
		if ( $template ) {
			wp_enqueue_style( 'stellar-places' );
			ob_start();
			include( $template );
			$content = ob_get_clean();
			new Stellar_Places_Loop_Prepender( $content );
		}
	}

	/**
	 * Add meta boxes
	 */
	public static function add_meta_boxes() {
		$model = new Stellar_Places_Meta_Box_Model(
			'stellar-places-location',
			__( 'Location', 'stellar-places' ),
			array( __CLASS__, 'render_meta_box' ),
			array( 'post_type' => Stellar_Places::get_post_types() )
		);
		new Stellar_Places_Meta_Box_View( $model );
		new Stellar_Places_Meta_Box_Controller( $model, array( __CLASS__, 'save_fields' ) );
	}

	/**
	 * Render the location meta box
	 */
	public static function render_meta_box() {
		wp_enqueue_script( 'stellar-places-geocomplete' );
		include( dirname( __FILE__ ) . '/views/location.php' );
	}

	/**
	 * Save location fields
	 *
	 * @param int $post_id
	 */
	public static function save_fields( $post_id ) {
		$fields = array(
			'_stlr_places_formatted_address' => 'sanitize_text_field',
			'_stlr_places_street_address'    => 'sanitize_text_field',
			'_stlr_places_locality'          => 'sanitize_text_field',
			'_stlr_places_region'            => 'sanitize_text_field',
			'_stlr_places_postal_code'       => 'sanitize_text_field',
			'_stlr_places_country'           => 'sanitize_text_field',
			'_stlr_places_latitude'          => 'sanitize_text_field',
			'_stlr_places_longitude'         => 'sanitize_text_field',
		);
		foreach ( $fields as $field_name => $sanitization_callback ) {
			if ( isset( $_POST[$field_name] ) ) {
				$value = $_POST[$field_name];
				if ( is_callable( $sanitization_callback ) ) {
					$value = call_user_func( $sanitization_callback, $value );
				}
				update_post_meta( $post_id, $field_name, $value );
			} else {
				delete_post_meta( $post_id, $field_name );
			}
		}
		self::_set_geodata( $post_id );
	}

	/**
	 * Set WordPress GeoData (http://codex.wordpress.org/Geodata)
	 *
	 * @param $post_id
	 */
	protected static function _set_geodata( $post_id ) {
		// Latitude
		$latitude = get_post_meta( $post_id, '_stlr_places_latitude', true );
		if ( $latitude ) {
			update_post_meta( $post_id, 'geo_latitude', floatval( $latitude ) );
		} else {
			delete_post_meta( $post_id, 'geo_latitude' );
		}
		// Longitude
		$longitude = get_post_meta( $post_id, '_stlr_places_longitude', true );
		if ( $longitude ) {
			update_post_meta( $post_id, 'geo_longitude', floatval( $longitude ) );
		} else {
			delete_post_meta( $post_id, 'geo_longitude' );
		}
	}

}