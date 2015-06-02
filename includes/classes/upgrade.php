<?php

/**
 * Class Stellar_Places_Upgrade
 */
class Stellar_Places_Upgrade {

	/**
	 * The previous plugin version
	 *
	 * @var string|false
	 */
	public $previous_version;

	/**
	 * The directory containing the upgrade routines
	 *
	 * @var string
	 */
	public $upgrade_directory;

	/**
	 * Get a collection of version numbers for which there are available upgrade routines
	 *
	 * @return array
	 */
	public function get_available_upgrades() {
		$files = array_map( 'basename', glob( rtrim( $this->upgrade_directory, '/' ) . '/*.php' ) );
		return str_replace( '.php', '', $files );
	}

	/**
	 * Get a list of version numbers for which there are required upgrades
	 *
	 * @param array $available_upgrades
	 * @return array
	 */
	public function get_required_upgrades( array $available_upgrades ) {
		return array_filter( $available_upgrades, array( $this, 'filter_upgrades' ) );
	}

	/**
	 * Filter used to find required upgrades
	 *
	 * @see get_required_upgrades()
	 * @param string $version
	 * @return bool
	 */
	public function filter_upgrades( $version ) {
		return version_compare( $this->previous_version, $version, '<' );
	}

	/**
	 * Run upgrades
	 *
	 * @param array $upgrades
	 */
	public function run_upgrades( array $upgrades ) {
		foreach ( $upgrades as $version ) {
			$file = rtrim( $this->upgrade_directory, '/' ) . '/' . $version . '.php';
			require( $file );
		}
	}

	/**
	 * Upgrade
	 */
	public function upgrade() {
		$available_upgrades = $this->get_available_upgrades();
		$required_upgrades = $this->get_required_upgrades( $available_upgrades );
		$this->run_upgrades( $required_upgrades );
	}

}