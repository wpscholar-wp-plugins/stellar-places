<?php

/**
 * Class Stellar_Places_Postal_Address
 */
class Stellar_Places_Postal_Address {

	public $streetAddress = '';
	public $addressLocality = '';
	public $addressRegion = '';
	public $postalCode = '';
	public $addressCountry = '';

	/**
	 * Create a new instance
	 *
	 * @param array $address
	 */
	public function __construct( array $address = array() ) {
		foreach ( $address as $field_name => $field_value ) {
			if ( property_exists( $this, $field_name ) && ! empty( $field_value ) ) {
				$this->$field_name = (string) $field_value;
			}
		}
	}

	/**
	 * Check if a postal address field is set
	 *
	 * @param string $field_name
	 * @return bool
	 */
	public function has( $field_name ) {
		return property_exists( $this, $field_name ) && ! empty( $this->$field_name );
	}

	/**
	 * Check if any postal address fields are set
	 *
	 * @return bool
	 */
	public function has_data() {
		$postal_address = $this->to_array();
		return ! empty( $postal_address );
	}

	/**
	 * Get HTML for a postal address field
	 *
	 * @param string $field_name
	 * @param string $args
	 * @return string
	 */
	public function get_field_html( $field_name, $args = '' ) {
		$html = '';
		if ( $this->has( $field_name ) ) {
			$args = wp_parse_args( $args, array( 'class' => '', 'delimiter' => ',', 'last' => '' ) );
			$html .= '<span class="' . esc_attr( $args['class'] ) . '">';
			$html .= '<span itemprop="' . esc_attr( $field_name ) . '">';
			$html .= esc_html( $this->$field_name );
			$html .= '</span>';
			if ( $field_name != $args['last'] && ! empty( $args['delimiter'] ) ) {
				$html .= '<span class="delimiter">' . esc_html( $args['delimiter'] ) . '</span> ';
			}
			$html .= '</span>';
		}
		return apply_filters( 'stellar_places_postal_address_field_html', $html );
	}

	/**
	 * Get postal address HTML
	 *
	 * @return string
	 */
	public function get_html() {
		$html = '';

		// Find last address field
		$postal_address = $this->to_array();
		end( $postal_address );
		$last_field = key( $postal_address );

		if ( $this->has_data() ) {
			$html .= '<span class="postal-address" itemscope itemtype="http://schema.org/PostalAddress">';
			if ( $this->has( 'streetAddress' ) ) {
				$html .= $this->get_field_html( 'streetAddress', "class=street-address&last={$last_field}" );
			}
			if ( $this->has( 'addressLocality' ) ) {
				$html .= $this->get_field_html( 'addressLocality', "class=locality&last={$last_field}" );
			}
			if ( $this->has( 'addressRegion' ) ) {
				$html .= $this->get_field_html( 'addressRegion', "class=region&last={$last_field}" );
			}
			if ( $this->has( 'postalCode' ) ) {
				$html .= $this->get_field_html( 'postalCode', "class=postal-code&last={$last_field}" );
			}
			if ( $this->has( 'addressCountry' ) ) {
				$html .= $this->get_field_html( 'addressCountry', "class=country&last={$last_field}" );
			}
			$html .= '</span>';
		}
		return apply_filters( 'stellar_places_postal_address_html', $html );
	}

	/**
	 * Render postal address HTML
	 */
	public function render() {
		echo $this->get_html();
	}

	/**
	 * Return address as an array
	 *
	 * @return array
	 */
	public function to_array() {
		return array_filter( get_object_vars( $this ) );
	}

	/**
	 * Magic method for converting object into a string
	 *
	 * @return string
	 */
	public function __toString() {
		return join( ', ', $this->to_array() );
	}

}