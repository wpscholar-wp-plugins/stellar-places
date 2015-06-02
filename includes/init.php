<?php

/**
 * Class Stellar_Places
 */
final class Stellar_Places {

	protected static $_instance;

	protected static $_class_map = array(
		'Stellar_Places_Content_Prepender'   => '/classes/content-prepender.php',
		'Stellar_Places_Context'             => '/classes/context.php',
		'Stellar_Places_Google_Map'          => '/classes/google-map.php',
		'Stellar_Places_Google_Static_Map'   => '/classes/google-static-map.php',
		'Stellar_Places_Location_Category'   => '/taxonomies/location-category.php',
		'Stellar_Places_Location_Support'    => '/support/location.php',
		'Stellar_Places_Loop_Prepender'      => '/classes/loop-prepender.php',
		'Stellar_Places_Map_Shortcode'       => '/shortcodes/map.php',
		'Stellar_Places_Meta_Box_Controller' => '/meta-boxes/meta-box-controller.php',
		'Stellar_Places_Meta_Box_Model'      => '/meta-boxes/meta-box-model.php',
		'Stellar_Places_Meta_Box_View'       => '/meta-boxes/meta-box-view.php',
		'Stellar_Places_Pagination_Text'     => '/classes/pagination-text.php',
		'Stellar_Places_Place'               => '/post-types/place.php',
		'Stellar_Places_Place_Model'         => '/models/place.php',
		'Stellar_Places_Post_Type_Support'   => '/classes/post-type-support.php',
		'Stellar_Places_Postal_Address'      => '/classes/postal-address.php',
		'Stellar_Places_Query'               => '/queries/places-query.php',
		'Stellar_Places_Taxonomy_Support'    => '/classes/taxonomy-support.php',
		'Stellar_Places_Upgrade'             => '/classes/upgrade.php',
	);

	/**
	 * Instantiate class
	 */
	protected function __construct() {

		spl_autoload_register( array( $this, '_autoload' ) );

		if ( is_admin() ) {
			$this->upgrade();
		}

		register_activation_hook( STELLAR_PLACES_FILE, array( $this, 'activation' ) );
		register_deactivation_hook( STELLAR_PLACES_FILE, array( $this, 'deactivation' ) );

		add_action( 'after_setup_theme', array( $this, 'after_setup_theme' ) );

		add_action( 'init', array( $this, 'load_textdomain' ) );

		add_action( 'init', array( 'Stellar_Places_Location_Category', 'register_taxonomy' ) );
		add_action( 'init', array( 'Stellar_Places_Place', 'register_post_type' ) );

		add_action( 'init', array( $this, 'register_resources' ) );

		add_action( 'init', array( 'Stellar_Places_Location_Support', 'initialize' ) );

		add_shortcode( 'stellar_places_map', array( 'Stellar_Places_Map_Shortcode', 'shortcode' ) );

		// Enable shortcodes in widgets
		add_filter( 'widget_text', 'do_shortcode' );

		// Custom filters
		add_filter( 'stellar_places_description', 'strip_shortcodes' );
	}

	/**
	 * Provide access to this singleton class
	 *
	 * @return Stellar_Places
	 */
	public static function get_instance() {
		if ( ! isset( self::$_instance ) ) {
			self::$_instance = new self();
		}
		return self::$_instance;
	}

	/**
	 * Class autoloader
	 *
	 * @param string $class_name
	 */
	protected function _autoload( $class_name ) {
		if ( array_key_exists( $class_name, self::$_class_map ) ) {
			$file = dirname( __FILE__ ) . self::$_class_map[$class_name];
			if ( file_exists( $file ) ) {
				include( $file );
			}
		}
	}

	public function upgrade() {
		$previous_version = get_option( 'stellar_places_version' );
		if ( STELLAR_PLACES_VERSION !== $previous_version ) {
			$upgrade = new Stellar_Places_Upgrade();
			$upgrade->upgrade_directory = dirname( __FILE__ ) . '/upgrades';
			$upgrade->previous_version = $previous_version;
			$upgrade->upgrade();
			update_option( 'stellar_places_version', STELLAR_PLACES_VERSION );
		}
	}

	/**
	 * Plugin activation callback
	 */
	public function activation() {
		Stellar_Places_Location_Category::register_taxonomy();
		Stellar_Places_Place::register_post_type();
		flush_rewrite_rules();
	}

	/**
	 * Plugin deactivation callback
	 */
	public function deactivation() {
		flush_rewrite_rules();
	}

	/**
	 * Add required theme support, in case it isn't already enabled
	 */
	public function after_setup_theme() {
		add_theme_support( 'post-thumbnails' );
	}

	/**
	 * Load plugin text domain
	 */
	public function load_textdomain() {
		load_plugin_textdomain( 'stellar-places', false, dirname( __FILE__ ) . '/languages' );
	}

	/**
	 * Register stylesheets and scripts
	 */
	public function register_resources() {
		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';
		// Register stylesheets
		wp_register_style(
			'stellar-places',
			plugins_url( "/assets/css/stellar-places{$suffix}.css", STELLAR_PLACES_FILE ),
			array(),
			STELLAR_PLACES_VERSION
		);
		// Register scripts
		wp_register_script(
			'google-maps-js-api',
			'//maps.googleapis.com/maps/api/js',
			array(),
			null
		);
		wp_register_script(
			'google-maps-js-api-places-library',
			'//maps.googleapis.com/maps/api/js?libraries=places',
			array(),
			null
		);
		wp_register_script(
			'stellar-places-geocomplete',
			plugins_url( "/assets/js/jquery.geocomplete{$suffix}.js", STELLAR_PLACES_FILE ),
			array( 'jquery', 'google-maps-js-api-places-library' ),
			'1.4'
		);
		wp_register_script(
			'stellar-places-map',
			plugins_url( "/assets/js/stellar-places-map{$suffix}.js", STELLAR_PLACES_FILE ),
			array( 'backbone', 'google-maps-js-api' ),
			STELLAR_PLACES_VERSION
		);
	}

	/**
	 * Get all post types that support stellar-places-location
	 *
	 * @return array
	 */
	public static function get_post_types() {
		return Stellar_Places_Post_Type_Support::get_post_types_that_support( Stellar_Places_Location_Support::FEATURE );
	}

	/**
	 * Gets a list of all taxonomies related to post types that support stellar_places_location
	 *
	 * @return array
	 */
	public static function get_taxonomies() {
		return get_taxonomies( array( 'object_type' => self::get_post_types() ) );
	}

	/**
	 * Get a collection of place objects
	 *
	 * @param string|array $query
	 * @return array
	 */
	public static function get_places( $query = '' ) {
		$places = array();
		$places_query = new Stellar_Places_Query( $query );
		if ( $places_query->have_posts() ) {
			while ( $places_query->have_posts() ) {
				$places_query->the_post();
				$place = self::get_place_object( $places_query->post );
				if ( ! is_null( $place ) ) {
					$places[] = $place;
				}
			}
			wp_reset_postdata();
		}
		$places = apply_filters( 'stellar_places', $places, $places_query );
		return $places;
	}

	/**
	 * Get a place object given a $post
	 *
	 * @param WP_Post $post
	 * @return Stellar_Places_Place_Model
	 */
	public static function get_place_object( WP_Post $post ) {
		$place = null;
		if ( post_type_supports( get_post_type( $post ), Stellar_Places_Location_Support::FEATURE ) ) {
			$place = new Stellar_Places_Place_Model();
			// Coordinates
			$place->latitude = $post->_stlr_places_latitude;
			$place->longitude = $post->_stlr_places_longitude;
			// Postal Address
			$place->streetAddress = $post->_stlr_places_street_address;
			$place->addressLocality = $post->_stlr_places_locality;
			$place->addressRegion = $post->_stlr_places_region;
			$place->postalCode = $post->_stlr_places_postal_code;
			$place->addressCountry = $post->_stlr_places_country;
			// Details
			$place->name = get_the_title( $post );
			$place->description = apply_filters( 'stellar_places_description', self::get_excerpt_by_id( $post->ID ) );
			$place->url = get_permalink( $post );
			// Thumbnail URL
			if ( has_post_thumbnail( $post->ID ) ) {
				$image_size = apply_filters( 'stellar_places_image_size', 'thumbnail' );
				$image = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), $image_size );
				if ( ! empty( $image[0] ) ) {
					$place->image = $image[0];
				}
			}
			// Post Type
			$place->postType = get_post_type( $post );
			// Taxonomies
			$taxonomies = array_intersect( self::get_taxonomies(), get_object_taxonomies( $post ) );
			foreach ( $taxonomies as $taxonomy ) {
				$terms = wp_list_pluck( wp_get_post_terms( $post->ID, $taxonomy ), 'slug' );
				if ( ! empty( $terms ) ) {
					$place->taxonomies[$taxonomy] = $terms;
				}
			}
		}
		$place = apply_filters( 'stellar_place', $place, $post );
		return $place;
	}

	/**
	 * Get a postal address
	 *
	 * @param Stellar_Places_Place_Model $place
	 * @return Stellar_Places_Postal_Address
	 */
	public static function get_postal_address( Stellar_Places_Place_Model $place ) {
		$postal_address = new Stellar_Places_Postal_Address( array(
			'streetAddress'   => $place->streetAddress,
			'addressLocality' => $place->addressLocality,
			'addressRegion'   => $place->addressRegion,
			'postalCode'      => $place->postalCode,
			'addressCountry'  => $place->addressCountry,
		) );
		return $postal_address;
	}

	/**
	 * Get a map object
	 *
	 * @param null|WP_Post|WP_Query|Stellar_Places_Place_Model $args
	 * @return Stellar_Places_Google_Map
	 */
	public static function get_map( $args = null ) {
		if ( is_null( $args ) ) {
			global $wp_query;
			$args = $wp_query;
		}
		$map = new Stellar_Places_Google_Map( $args );
		return $map;
	}

	/**
	 * Get a static Google Map
	 * NOTE: Technically, this is just a dynamic map made to behave as a static map.  This approach allows the map to be
	 * responsive as opposed to using the Google Static Maps API.
	 *
	 * @param Stellar_Places_Place_Model $place
	 * @return Stellar_Places_Google_Map
	 */
	public static function get_static_map( Stellar_Places_Place_Model $place ) {
		$map = new Stellar_Places_Google_Map( $place );
		$map->infoWindows = false;
		$map->mapOptions['disableDefaultUI'] = true;
		$map->mapOptions['draggable'] = false;
		$map->mapOptions['maxZoom'] = 16;
		$map->mapOptions['scrollwheel'] = false;
		$map->mapOptions['styles'] = array(
			array(
				'featureType' => 'poi',
				'stylers'     => array(
					array(
						'visibility' => 'off',
					),
				),
			),
		);
		return $map;
	}

	/**
	 * Get the excerpt for a WP_Post by post ID.
	 *
	 * @param int $post_id
	 * @return string
	 */
	public static function get_excerpt_by_id( $post_id = 0 ) {
		global $post;
		$save_post = $post;
		$post = get_post( $post_id );
		setup_postdata( $post );
		$excerpt = get_the_excerpt();
		$post = $save_post;
		wp_reset_postdata( $post );
		return $excerpt;
	}

}