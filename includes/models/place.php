<?php

/**
 * Class Stellar_Places_Place_Model
 */
class Stellar_Places_Place_Model {

	/**
	 * Latitude.
	 *
	 * @var string
	 */
	public $latitude;

	/**
	 * Longitude.
	 *
	 * @var string
	 */
	public $longitude;

	/**
	 * Street address.
	 *
	 * @var string
	 */
	public $streetAddress;

	/**
	 * City.
	 *
	 * @var string
	 */
	public $addressLocality;

	/**
	 * State.
	 *
	 * @var string
	 */
	public $addressRegion;

	/**
	 * Zip code.
	 *
	 * @var string
	 */
	public $postalCode;

	/**
	 * Country.
	 *
	 * @var string
	 */
	public $addressCountry;

	/**
	 * Place name.
	 *
	 * @var string
	 */
	public $name;

	/**
	 * Place description.
	 *
	 * @var string
	 */
	public $description;

	/**
	 * Place URL.
	 *
	 * @var string
	 */
	public $url;

	/**
	 * Place image.
	 *
	 * @var string
	 */
	public $image;

	/**
	 * Place post type.
	 *
	 * @var string
	 */
	public $postType;

	/**
	 * Place taxonomies.
	 *
	 * @var array
	 */
	public $taxonomies = array();

	/**
	 * Google Marker icon.
	 *
	 * @var string
	 */
	public $icon;

	/**
	 * Populate class from an array
	 *
	 * @param array $args Initialization arguments.
	 */
	public function __construct( array $args = array() ) {
		foreach ( $args as $key => $value ) {
			if ( property_exists( $this, $key ) ) {
				$this->$key = $value;
			}
		}
	}

}
