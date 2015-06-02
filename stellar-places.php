<?php

/*
 * Plugin Name: Stellar Places
 * Plugin URI: http://stellarplaces.com/
 * Description: An intuitive plugin for easily creating, managing and displaying locations using Google Maps.
 * Author: Stellar Web Services, LLC
 * Author URI: http://stellarplaces.com/
 * Version: 1.0.3
 * Text Domain: stellar-places
 * License: GPL3
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 *
 * Copyright 2014 by Stellar Web Services - All rights reserved.
 */

define( 'STELLAR_PLACES_VERSION', '1.0.3' );
define( 'STELLAR_PLACES_FILE', __FILE__ );

// Check plugin requirements
global $pagenow;
if ( 'plugins.php' == $pagenow ) {
	require( dirname( __FILE__ ) . '/includes/plugin-check.php' );
	$plugin_check = new Stellar_Places_Plugin_Check( __FILE__ );
	$plugin_check->min_php_version = '5.2';
	$plugin_check->min_wp_version = '3.5';
	$plugin_check->check_plugin_requirements();
}

require( dirname( __FILE__ ) . '/includes/init.php' );
Stellar_Places::get_instance();