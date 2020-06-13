<?php
/**
 * Plugin Name: Stellar Places
 * Plugin URI: https://wpscholar.com/wordpress-plugins/stellar-places/
 * Description: An intuitive plugin for easily creating, managing and displaying locations using Google Maps.
 * Author: Micah Wood
 * Author URI: https://wpscholar.com
 * Version: 1.2
 * Requires at least: 5.2
 * Requires PHP: 5.6
 * Text Domain: stellar-places
 * Domain Path: languages
 * License: GPL3
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 *
 * Copyright 2014-2020 by Micah Wood - All rights reserved.
 *
 * @package StellarPlaces
 */

define( 'STELLAR_PLACES_VERSION', '1.2' );
define( 'STELLAR_PLACES_FILE', __FILE__ );

require dirname( __FILE__ ) . '/vendor/autoload.php';

// Check plugin requirements
global $pagenow;
if ( 'plugins.php' === $pagenow ) {
	$plugin_check                  = new WP_Forge_Plugin_Check( __FILE__ );
	$plugin_check->min_php_version = '5.6';
	$plugin_check->min_wp_version  = '5.2';
	$plugin_check->check_plugin_requirements();
}

require dirname( __FILE__ ) . '/includes/init.php';

Stellar_Places::get_instance();
