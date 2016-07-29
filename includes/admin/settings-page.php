<?php

/**
 * Class Stellar_Places_Settings_Page
 */
class Stellar_Places_Settings_Page {

	public static function initialize() {
		add_action( 'admin_menu', array( __CLASS__, 'add_submenu_page' ) );
		add_action( 'admin_init', array( __CLASS__, 'settings_init' ) );
	}

	public static function add_submenu_page() {
		add_submenu_page(
			'edit.php?post_type=stlr_place',
			__( 'Settings - Stellar Places', 'stellar-places' ),
			__( 'Settings', 'stellar-places' ),
			'manage_options',
			'stellar-places-settings',
			array( __CLASS__, 'render' )
		);
	}

	public static function settings_init() {

		register_setting( 'stellar-places-settings', 'stellar_places_google_maps_api_key', 'sanitize_text_field' );

		add_settings_section(
			'google_maps_api',
			__( 'Google Maps API', 'stellar-places' ),
			'__return_false',
			'stellar-places-settings'
		);

		add_settings_field(
			'google-maps-api-key',
			__( 'Google Maps API Key', 'stellar-places' ),
			array( __CLASS__, 'text_field' ),
			'stellar-places-settings',
			'google_maps_api',
			array(
				'name'        => 'stellar_places_google_maps_api_key',
				'description' => 'Use of Google Maps requires an API key. For most use cases, this is free to setup. <a href="https://console.developers.google.com/flows/enableapi?apiid=maps_backend,static_maps_backend,geocoding_backend,directions_backend,distance_matrix_backend,elevation_backend,roads,street_view_image_backend,maps_embed_backend,places_backend,geolocation,timezone_backend,maps_android_backend,maps_ios_backend,placesandroid,placesios&keyType=CLIENT_SIDE&reusekey=true" target="_blank">Get a key</a> now, or read more about <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank">authentication</a> and <a href="https://developers.google.com/maps/pricing-and-plans/" target="_blank">pricing</a>.',
			)
		);

	}

	public static function text_field( $args ) {
		?>
		<input type="text"
		       class="widefat"
		       name="<?php echo esc_attr( $args['name'] ) ?>"
		       value="<?php echo esc_attr( get_option( $args['name'] ) ) ?>"/>
		<?php if ( isset( $args['description'] ) ) { ?>
			<p class="description"><?php echo $args['description'] ?></p>
		<?php }
	}

	public static function render() {
		?>
		<form action='options.php' method='post'>

			<h1><?php esc_html_e( 'Stellar Places Settings' ); ?></h1>

			<?php
			settings_fields( 'stellar-places-settings' );
			do_settings_sections( 'stellar-places-settings' );
			submit_button();
			?>

		</form>
		<?php
	}

}