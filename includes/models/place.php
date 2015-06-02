<?php

/**
 * Class Stellar_Places_Place_Model
 */
class Stellar_Places_Place_Model {

	// Geo Coordinates
	public $latitude;
	public $longitude;

	// Postal Address
	public $streetAddress;
	public $addressLocality;
	public $addressRegion;
	public $postalCode;
	public $addressCountry;

	// Details
	public $name;
	public $description;
	public $url;
	public $image;

	// Other
	public $postType;
	public $taxonomies = array();

	/**
	 * Populate class from an array
	 *
	 * @param array $args
	 */
	public function __construct( array $args = array() ) {
		foreach ( $args as $key => $value ) {
			if ( property_exists( $this, $key ) ) {
				$this->$key = $value;
			}
		}
	}

}