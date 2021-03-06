<?php

/**
 * Class Stellar_Places_Settings_Page
 */
class Stellar_Places_Settings_Page {

	/**
	 * Initialization function.
	 */
	public static function initialize() {
		add_action( 'admin_menu', array( __CLASS__, 'add_submenu_page' ) );
		add_action( 'admin_init', array( __CLASS__, 'settings_init' ) );
	}

	/**
	 * Add a submenu page.
	 */
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

	/**
	 * Register settings.
	 */
	public static function settings_init() {

		register_setting( 'stellar-places-settings', 'stellar_places_google_maps_api_key', 'sanitize_text_field' );
		register_setting( 'stellar-places-settings', 'stellar_places_default_map_icon', 'esc_url_raw' );

		add_settings_section(
			'stellar-general-settings',
			__( 'General Settings', 'stellar-places' ),
			function () {
				printf(
					'<p>%s</p>',
					esc_html__( 'This plugin requires the use of the Google Maps JavaScript, Places, and Geolocation APIs.', 'stellar-places' )
				);
			},
			'stellar-places-settings'
		);

		add_settings_field(
			'google-maps-api-key',
			__( 'Google Maps API Key', 'stellar-places' ),
			array( __CLASS__, 'text_field' ),
			'stellar-places-settings',
			'stellar-general-settings',
			array(
				'name'        => 'stellar_places_google_maps_api_key',
				'description' => sprintf(
				/* translators: %1$s is the opening HTML tag for the API set up link, %2$s is the opening tag for the API documentation, %3$s is the opening tag for the API pricing, %4$s is the closing HTML link tag */
					esc_html__( 'Use of Google Maps requires an API key. For most use cases, this is free to setup. %1$sGet a key%4$s now, or read more about %2$sauthentication%4$s and %3$spricing%4$s.', 'stellar-places' ),
					'<a href="' . esc_url( 'https://console.developers.google.com/flows/enableapi?apiid=maps_backend,places_backend,geolocation&keyType=CLIENT_SIDE&reusekey=true' ) . ' target="_blank" rel="noopener noreferrer">',
					'<a href="' . esc_url( 'https://developers.google.com/maps/documentation/javascript/get-api-key' ) . ' target="_blank" rel="noopener noreferrer">',
					'<a href="' . esc_url( 'https://developers.google.com/maps/pricing-and-plans/' ) . ' target="_blank" rel="noopener noreferrer">',
					'</a>'
				),
			)
		);

		add_settings_field(
			'default-map-icon',
			__( 'Default Map Icon', 'stellar-places' ),
			array( 'Stellar_Places_Custom_Icon_Support', 'render_picker' ),
			'stellar-places-settings',
			'stellar-general-settings'
		);

	}

	/**
	 * Display a text field.
	 *
	 * @param array $args Field args.
	 */
	public static function text_field( $args ) {
		?>
		<input
			type="text"
			class="widefat"
			name="<?php echo esc_attr( $args['name'] ); ?>"
			value="<?php echo esc_attr( get_option( $args['name'] ) ); ?>"
		/>
		<?php if ( isset( $args['description'] ) ) { ?>
			<p
				class="description"><?php echo $args['description']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></p>
			<?php
		}
	}

	/**
	 * Render the page.
	 */
	public static function render() {
		?>
		<form action='options.php' method='post'>

			<h1><?php esc_html_e( 'Stellar Places Settings', 'stellar-places' ); ?></h1>

			<?php
			settings_fields( 'stellar-places-settings' );
			do_settings_sections( 'stellar-places-settings' );
			submit_button();
			?>

		</form>
		<?php
	}

}
