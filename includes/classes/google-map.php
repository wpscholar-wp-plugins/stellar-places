<?php

/**
 * Class Stellar_Places_Google_Map
 */
class Stellar_Places_Google_Map {

	// HTML Attributes
	public $id = '';
	public $class = '';
	public $width = '100%';
	public $height = '350px';

	// Map Center
	public $latitude = 0;
	public $longitude = 0;

	// Custom Map Options
	public $autoZoom = true;
	public $infoWindows = true;

	// Google Map Options
	public $mapOptions = array(
		'backgroundColor'           => null,
		'disableDefaultUI'          => null,
		'disableDoubleClickZoom'    => null,
		'draggable'                 => null,
		'draggableCursor'           => null,
		'draggingCursor'            => null,
		'heading'                   => null,
		'keyboardShortcuts'         => null,
		'mapMaker'                  => null,
		'mapTypeControl'            => null,
		'mapTypeControlOptions'     => null,
		'mapTypeId'                 => null,
		'maxZoom'                   => null,
		'minZoom'                   => null,
		'noClear'                   => null,
		'overviewMapControl'        => null,
		'overviewMapControlOptions' => null,
		'panControl'                => null,
		'panControlOptions'         => null,
		'rotateControl'             => null,
		'rotateControlOptions'      => null,
		'scaleControl'              => null,
		'scaleControlOptions'       => null,
		'scrollwheel'               => false,
		'streetView'                => null,
		'streetViewControl'         => null,
		'streetViewControlOptions'  => null,
		'styles'                    => null,
		'tilt'                      => null,
		'zoom'                      => 14,
		'zoomControl'               => null,
		'zoomControlOptions'        => null,
	);

	// Locations
	protected $_locations = array();

	/**
	 * Instantiate class
	 *
	 * @param mixed $args
	 */
	public function __construct( $args = null ) {
		if ( is_object( $args ) ) {
			if ( is_a( $args, 'WP_Post' ) ) {
				$post = $args;
				$this->set_location( $post );
			} else if ( is_a( $args, 'WP_Query' ) ) {
				$query = $args;
				$this->set_locations( $query );
			} else if ( is_a( $args, 'Stellar_Places_Place_Model' ) ) {
				$place = $args;
				$this->add_location( $place );
			}
		}
	}

	/**
	 * Add a location
	 *
	 * @param Stellar_Places_Place_Model $place
	 */
	public function add_location( Stellar_Places_Place_Model $place ) {
		$this->_locations[] = $place;
	}

	/**
	 * Add a location
	 *
	 * @param WP_Post $post
	 */
	public function set_location( WP_Post $post ) {
		$this->_locations = array();
		$place = Stellar_Places::get_place_object( $post );
		if ( $place ) {
			$this->add_location( $place );
		}
	}

	/**
	 * Set all locations at once
	 *
	 * @param WP_Query $query
	 */
	public function set_locations( WP_Query $query ) {
		$this->_locations = array();
		$posts = $query->get_posts();
		foreach ( $posts as $post ) {
			$place = Stellar_Places::get_place_object( $post );
			if ( $place ) {
				$this->add_location( $place );
			}
		}
	}

	/**
	 * Get map HTML
	 *
	 * @return string
	 */
	public function get_html() {

		$class = join(
			' ',
			array_merge(
				array( 'stellar-places-map-canvas' ),
				array_unique( array_filter( (array) explode( ' ', $this->class ) ) )
			)
		);
		$style = "width: {$this->width}; height: {$this->height};";
		$autoZoom = filter_var( $this->autoZoom, FILTER_VALIDATE_BOOLEAN ) ? 'true' : 'false';
		$infoWindows = filter_var( $this->infoWindows, FILTER_VALIDATE_BOOLEAN ) ? 'true' : 'false';
		$mapOptions = array_filter( $this->mapOptions, array( $this, '_is_not_null' ) );

		// Load JS and CSS
		wp_enqueue_script( 'stellar-places-map' );
		wp_enqueue_style( 'stellar-places' );

		// Load infoWindow template, if needed
		if ( $this->infoWindows ) {
			if ( ! has_action( 'wp_print_footer_scripts', array( __CLASS__, 'wp_print_footer_scripts' ) ) ) {
				add_action( 'wp_print_footer_scripts', array( __CLASS__, 'wp_print_footer_scripts' ) );
			}
		}

		ob_start();
		?>
		<div id="<?php echo esc_attr( $this->id ); ?>"
				 class="<?php echo esc_attr( $class ); ?>"
				 style="<?php echo esc_attr( $style ); ?>"
				 data-stellar-places-map-auto-zoom="<?php echo esc_attr( $autoZoom ); ?>"
				 data-stellar-places-map-info-windows="<?php echo esc_attr( $infoWindows ); ?>"
				 data-stellar-places-map-lat="<?php echo esc_attr( $this->latitude ); ?>"
				 data-stellar-places-map-lng="<?php echo esc_attr( $this->longitude ); ?>"
				 data-stellar-places-map-locations="<?php echo esc_attr( json_encode( $this->_locations ) ); ?>"
				 data-stellar-places-map-options="<?php echo esc_attr( json_encode( $mapOptions ) ); ?>"></div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Render map
	 */
	public function render() {
		echo $this->get_html();
	}

	/**
	 * Output infoWindow Backbone template in footer
	 */
	public static function wp_print_footer_scripts() {
		$template = locate_template( 'stellar-places/info-window.html' );
		if ( empty( $template ) ) {
			$template = dirname( STELLAR_PLACES_FILE ) . '/includes/templates/info-window.html';
		}
		echo '<script type="text/template" id="stellar-places-info-window-template">';
		echo file_get_contents( $template );
		echo '</script>';
	}

	/**
	 * Helper function to check if a value is not null
	 *
	 * @param mixed $value
	 * @return bool
	 */
	protected function _is_not_null( $value ) {
		return ! is_null( $value );
	}

}