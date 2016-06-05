<?php

/*
 * Plugin Name: Stellar Places
 * Plugin URI: http://stellarplaces.com/
 * Description: An intuitive plugin for easily creating, managing and displaying locations using Google Maps.
 * Author: Micah Wood
 * Author URI: https://wpscholar.com
 * Version: 1.0.5
 * Text Domain: stellar-places
 * License: GPL3
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 *
 * Copyright 2014-2016 by Micah Wood - All rights reserved.
 */

define( 'STELLAR_PLACES_VERSION', '1.0.5' );
define( 'STELLAR_PLACES_FILE', __FILE__ );

// Check plugin requirements
global $pagenow;
if ( 'plugins.php' == $pagenow ) {
	require( dirname( __FILE__ ) . '/includes/plugin-check.php' );
	$plugin_check = new Stellar_Places_Plugin_Check( __FILE__ );
	$plugin_check->min_php_version = '5.2';
	$plugin_check->min_wp_version = '4.5.0';
	$plugin_check->check_plugin_requirements();
}

// Freemius
require dirname( __FILE__ ) . '/includes/freemius.php';

require dirname( __FILE__ ) . '/includes/init.php';
Stellar_Places::get_instance();