<?php

/**
 * Class Stellar_Places_Google_Static_Map
 */
class Stellar_Places_Google_Static_Map {

	/**
	 * Google Static Maps - API URL
	 */
	const URL = 'http://maps.googleapis.com/maps/api/staticmap?';

	/**
	 * Image alt text
	 *
	 * @var string
	 */
	public $alt = '';

	/**
	 * Map center in the form of an address (required if no markers are set)
	 *
	 * @var string
	 */
	public $center = '0,0';

	/**
	 * Map size in pixels (required)
	 *
	 * @var string
	 */
	public $size = '350x250';

	/**
	 * Map zoom level (required)
	 *
	 * @var string
	 */
	public $zoom = '15';

	/**
	 * Storage for all map markers
	 *
	 * @var array
	 */
	protected $_markers = array();

	/**
	 * Convert a location array into a string
	 *
	 * @param array $location
	 * @return mixed
	 */
	public function get_location_string( array $location ) {
		return str_replace( ' ', '+', join( ',', array_map( 'trim', $location ) ) );
	}

	/**
	 * Add a marker to the map
	 *
	 * @param string $location
	 * @param bool   $color
	 * @param bool   $label
	 * @param bool   $size
	 */
	function add_marker( $location, $color = false, $label = false, $size = false ) {
		$this->_markers[] = array_filter(
			array(
				'color'    => $color,
				'label'    => $label,
				'location' => $location,
				'size'     => $size,
			)
		);
	}

	/**
	 * Get map src URL
	 *
	 * @return string
	 */
	function get_src() {
		$parameters = array(
			'size' => $this->size,
			'zoom' => $this->zoom,
			'scale' => 2,
		);
		if ( empty( $this->_markers ) ) {
			$parameters['center'] = $this->center;
		}
		$query_string = http_build_query( $parameters );
		if ( ! empty( $this->_markers ) ) {
			$markers = '';
			foreach ( $this->_markers as $marker ) {
				$properties = array();
				foreach ( $marker as $name => $value ) {
					if ( 'location' == $name ) {
						$properties[] = $value;
					} else {
						$properties[] = "{$name}:{$value}";
					}
				}
				$markers = '&markers=' . join( '%7c', $properties );
			}
			$query_string .= $markers;
		}
		$src = self::URL . $query_string;
		return $src;
	}

	/**
	 * Get map HTML
	 *
	 * @return string
	 */
	function get_html() {
		list( $width, $height ) = explode( 'x', $this->size );
		$attributes = 'src="' . esc_url( $this->get_src() ) . '"';
		$attributes .= 'width="' . esc_attr( $width ) . '"';
		$attributes .= 'height="' . esc_attr( $height ) . '"';
		$attributes .= 'alt="' . esc_attr( $this->alt ) . '"';
		$html = '<img ' . $attributes . ' />';
		return $html;
	}

}