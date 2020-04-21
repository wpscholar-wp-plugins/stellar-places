<?php
/**
 * Upgrade routing for version 1.0.2
 *
 * @package StellarPlaces
 */

/*
 * Flush rewrite rules since this version adds 'with_front' => false to the post type args
 */
add_action( 'init', 'flush_rewrite_rules' );
