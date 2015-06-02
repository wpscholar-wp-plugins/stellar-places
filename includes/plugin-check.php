<?php

/**
 * Class Stellar_Places_Plugin_Check
 * NOTE: This class is responsible for performing basic checks to see if the minimum requirements
 * for the plugin have been met. It is designed to be PHP 4 friendly so that older versions
 * of PHP don't choke during parsing.
 */
class Stellar_Places_Plugin_Check {

	/**
	 * Callbacks for additional checks
	 *
	 * @var array
	 */
	var $callbacks = array();

	/**
	 * @var WP_Error
	 */
	var $errors;

	/**
	 * A reference to the main plugin file
	 *
	 * @var string
	 */
	var $file;

	/**
	 * Minimum PHP version required for this plugin
	 *
	 * @var string
	 */
	var $min_php_version;

	/**
	 * Minimum WordPress version required for this plugin
	 *
	 * @var string
	 */
	var $min_wp_version;

	/**
	 * Plugin name
	 *
	 * @var string
	 */
	var $name = '';

	/**
	 * Required PHP extensions
	 *
	 * @var array
	 */
	var $req_php_extensions = array();

	/**
	 * Setup our class properties
	 *
	 * @param string $file
	 */
	function __construct( $file ) {
		$this->errors = new WP_Error();
		$this->file = $file;
		$this->name = $this->get_plugin_name();
	}

	/**
	 * Setup our class properties
	 *
	 * @param string $file
	 */
	function Stellar_Places_Plugin_Check( $file ) {
		$this->__construct( $file );
	}

	/**
	 * Get the plugin name from the plugin file headers
	 *
	 * @return string
	 */
	function get_plugin_name() {
		$plugin = get_file_data( $this->file, array( 'name' => 'Plugin Name' ) );
		return isset( $plugin['name'] ) ? $plugin['name'] : '';
	}

	/**
	 * Check all our plugin requirements.
	 * Displays an admin notice and deactivates the plugin if all requirements are not met.
	 */
	function check_plugin_requirements() {
		if ( isset( $this->min_php_version ) ) {
			$this->check_has_min_php_version();
		}
		if ( ! empty( $this->req_php_extensions ) ) {
			$this->check_has_required_php_extensions();
		}
		if ( isset( $this->min_wp_version ) ) {
			$this->check_has_min_wp_version();
		}
		if ( ! empty( $this->callbacks ) ) {
			foreach ( $this->callbacks as $callback ) {
				if ( is_callable( $callback ) ) {
					call_user_func_array( $callback, array( $this ) );
				}
			}
		}
		if ( $this->has_errors() ) {
			unset( $_GET['activate'] ); // Suppress 'Plugin Activated' notice
			$this->deactivate();
			add_action( 'admin_notices', array( $this, 'admin_notices' ) );
		}
	}

	/**
	 * Check if the minimum required PHP version is available
	 */
	function check_has_min_php_version() {
		if ( version_compare( PHP_VERSION, $this->min_php_version, '<' ) ) {
			$error_msg = sprintf(
				__( '%s requires PHP version %s or later. You are currently running version %s.', 'stellar-places' ),
				$this->name,
				$this->min_php_version,
				PHP_VERSION
			);
			$error_msg .= __( ' Please contact your web host about upgrading PHP.', 'stellar-places' );
			$this->errors->add( 'php_version', $error_msg );
		}
	}

	/**
	 * Check if a required PHP extension is available.
	 * See http://www.php.net/manual/en/extensions.alphabetical.php for a full list.
	 */
	function check_has_required_php_extensions() {
		foreach ( $this->req_php_extensions as $extension ) {
			if ( ! extension_loaded( $extension ) ) {
				$this->errors->add(
					'php_extension',
					sprintf(
						__( '%s requires the %s PHP extension.', 'stellar-places' ),
						$this->name,
						$extension
					)
				);
			}
		}
	}

	/**
	 * Check if the minimum required WordPress version is available
	 */
	function check_has_min_wp_version() {
		global $wp_version;
		if ( version_compare( $wp_version, $this->min_wp_version, '<' ) ) {
			$this->errors->add(
				'wp_version',
				sprintf(
					__( '%s requires WordPress version %s or later. You are currently running version %s.', 'stellar-places' ),
					$this->name,
					$this->min_wp_version,
					$wp_version
				)
			);
		}
	}

	/**
	 * Check if any errors were encountered during our plugin checks
	 *
	 * @return bool
	 */
	function has_errors() {
		return (boolean) count( $this->errors->errors );
	}

	/**
	 * Deactivate the plugin
	 */
	function deactivate() {
		require_once( ABSPATH . '/wp-admin/includes/plugin.php' );
		if ( function_exists( 'deactivate_plugins' ) ) {
			deactivate_plugins( $this->file );
		}
	}

	/**
	 * Display error messages in the admin
	 */
	function admin_notices() {
		echo '<div class="error">';
		foreach ( $this->errors->get_error_messages() as $msg ) {
			echo '<p>' . $msg . '</p>';
		}
		printf(
			__( '<p>The <strong>%s</strong> plugin has been deactivated.</p>', 'stellar-places' ),
			$this->name
		);
		echo '</div>';
	}

}