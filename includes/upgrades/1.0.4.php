<?php
/**
 * Upgrade routing for version 1.0.4
 *
 * @package StellarPlaces
 */

/*
 * Flush rewrite rules since this version makes the location category taxonomy public
 */
add_action( 'init', 'flush_rewrite_rules' );
