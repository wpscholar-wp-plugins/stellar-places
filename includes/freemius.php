<?php

function stellar_places_freemius() {
	global $stellar_places_freemius;

	if ( ! isset( $stellar_places_freemius ) ) {

		if ( ! function_exists( 'fs_dynamic_init' ) ) {
			require dirname( __FILE__ ) . '/freemius/start.php';
		}

		$stellar_places_freemius = fs_dynamic_init( array(
			'id'             => '314',
			'slug'           => 'stellar-places',
			'public_key'     => 'pk_0f325a94650318ab3e2a1601a2231',
			'is_premium'     => false,
			'has_addons'     => false,
			'has_paid_plans' => false,
			'menu'           => array(
				'slug'       => 'stellar-places',
				'first-path' => 'plugins.php',
			),
		) );
	}

	return $stellar_places_freemius;
}

stellar_places_freemius();