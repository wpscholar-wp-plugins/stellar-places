<?php

/**
 * Class Stellar_Places_Custom_Icon_Support
 */
class Stellar_Places_Custom_Icon_Support {

	/**
	 * Initialize the custom icon functionality.
	 */
	public static function initialize() {
		add_filter( 'stellar_places_icon', array( __CLASS__, 'category_icon' ), 7, 2 );
		add_filter( 'stellar_places_icon', array( __CLASS__, 'post_icon' ), 9, 2 );

		if ( is_admin() ) {
			$taxonomy = Stellar_Places_Location_Category::TAXONOMY;
			add_action( "{$taxonomy}_add_form_fields", array( __CLASS__, 'add_term_meta_field' ) );
			add_action( "{$taxonomy}_edit_form_fields", array( __CLASS__, 'edit_term_meta_field' ), 30 );
			add_action( "create_{$taxonomy}", array( __CLASS__, 'save_term_meta' ) );
			add_action( "edited_{$taxonomy}", array( __CLASS__, 'save_term_meta' ) );
			add_action( 'admin_init', array( __CLASS__, 'add_meta_boxes' ) );
		}
	}

	/**
	 * Get the custom icon URL.
	 *
	 * @param int $post_id The WordPress post ID.
	 *
	 * @return string
	 */
	public static function get_icon( $post_id = 0 ) {
		return apply_filters( 'stellar_places_icon', self::default_icon(), $post_id );
	}

	/**
	 * Get the default icon.
	 *
	 * @return string
	 */
	public static function default_icon() {
		return apply_filters( 'stellar_places_default_icon', get_option( 'stellar_places_default_map_icon', 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' ) );
	}

	/**
	 * Callback to set the icon at the category level.
	 *
	 * @param string $icon    The icon URL.
	 * @param int    $post_id The WordPress post ID.
	 *
	 * @return string
	 */
	public static function category_icon( $icon, $post_id ) {
		$terms = wp_get_object_terms( $post_id, Stellar_Places_Location_Category::TAXONOMY );
		foreach ( $terms as $term ) {
			$icon_url = get_term_meta( $term->term_id, '_stlr_places_custom_icon', true );
			if ( ! empty( $icon_url ) ) {
				$icon = $icon_url;
				break;
			}
		}

		return $icon;
	}

	/**
	 * Callback to set the icon at the post level.
	 *
	 * @param string $icon    The icon URL.
	 * @param int    $post_id The WordPress post ID.
	 *
	 * @return string
	 */
	public static function post_icon( $icon, $post_id ) {
		$icon_url = get_post_meta( $post_id, '_stlr_places_custom_icon', true );
		if ( $icon_url ) {
			$icon = $icon_url;
		}

		return $icon;
	}

	/**
	 * Get a list of all the available icon URLs.
	 *
	 * @link https://sites.google.com/site/gmapsdevelopment/
	 *
	 * @return string[]
	 */
	public static function available_icons() {
		$base_url  = 'https://maps.google.com/mapfiles/ms/icons/';
		$extension = '.png';

		$names = array(
			'blue',
			'blue-dot',
			'green',
			'green-dot',
			'lightblue',
			'ltblue-dot',
			'orange',
			'orange-dot',
			'pink',
			'pink-dot',
			'purple',
			'purple-dot',
			'red',
			'red-dot',
			'yellow',
			'yellow-dot',
			'blue-pushpin',
			'grn-pushpin',
			'ltblu-pushpin',
			'pink-pushpin',
			'purple-pushpin',
			'red-pushpin',
			'ylw-pushpin',
			'water',
			'waterfalls',
			'webcam',
			'wheel_chair_accessible',
			'arts',
			'bar',
			'bus',
			'cabs',
			'campfire',
			'campground',
			'caution',
			'coffeehouse',
			'convienancestore',
			'cycling',
			'dollar',
			'drinking_water',
			'earthquake',
			'electronics',
			'ferry',
			'firedept',
			'fishing',
			'flag',
			'gas',
			'golfer',
			'grocerystore',
			'helicopter',
			'hiker',
			'homegardenbusiness',
			'horsebackriding',
			'hospitals',
			'hotsprings',
			'info',
			'lodging',
			'marina',
			'mechanic',
			'motorcycling',
			'movies',
			'parkinglot',
			'pharmacy-us',
			'phone',
			'picnic',
			'plane',
			'POI',
			'police',
			'postoffice-us',
			'question',
			'rail',
			'rangerstation',
			'realestate',
			'recycle',
			'restaurant',
			'sailing',
			'salon',
			'shopping',
			'snack_bar',
			'snowflake_simple',
			'sportvenue',
			'swimming',
			'toilets',
			'trail',
			'tree',
			'truck',
		);

		$icons = array();
		foreach ( $names as $name ) {
			$icons[] = "{$base_url}{$name}{$extension}";
		}

		return apply_filters( 'stellar_places_available_icons', $icons );
	}

	/**
	 * Render the custom icon picker.
	 */
	public static function render_picker() {
		include __DIR__ . '/views/icon-picker.php';
	}

	/**
	 * Add meta box.
	 */
	public static function add_meta_boxes() {
		$model = new Stellar_Places_Meta_Box_Model(
			'stellar-places-icon-picker',
			__( 'Custom Icon', 'stellar-places' ),
			array( __CLASS__, 'render_picker' ),
			array( 'post_type' => Stellar_Places::get_post_types() )
		);
		new Stellar_Places_Meta_Box_View( $model );
		new Stellar_Places_Meta_Box_Controller( $model, array( __CLASS__, 'save_fields' ) );
	}

	/**
	 * Add term meta field.
	 */
	public static function add_term_meta_field() {
		?>
		<div class="form-field">
			<label>
				<?php esc_html_e( 'Custom Map Icon', 'stellar-places' ); ?>
				<?php self::render_picker(); ?>
			</label>
		</div>
		<?php
	}

	/**
	 * Add term meta field.
	 *
	 * @param WP_Term $term The WordPress term object.
	 */
	public static function edit_term_meta_field( WP_Term $term ) {
		?>
		<tr class="form-field">
			<th>
				<label for="_stlr_places_custom_icon">
					<?php esc_html_e( 'Custom Map Icon', 'stellar-places' ); ?>
				</label>
			</th>
			<td>
				<?php self::render_picker(); ?>
			</td>
		</tr>
		<?php
	}

	/**
	 * Save custom icon field.
	 *
	 * @param int $post_id The post ID.
	 */
	public static function save_fields( $post_id ) {
		$fields = array(
			'_stlr_places_custom_icon' => 'esc_url_raw',
		);
		foreach ( $fields as $field_name => $sanitization_callback ) {
			if ( isset( $_POST[ $field_name ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
				$value = $_POST[ $field_name ]; // phpcs:ignore WordPress.Security.NonceVerification.Missing
				if ( is_callable( $sanitization_callback ) ) {
					$value = call_user_func( $sanitization_callback, $value );
				}
				update_post_meta( $post_id, $field_name, $value );
			} else {
				delete_post_meta( $post_id, $field_name );
			}
		}
	}

	/**
	 * Save the term meta data.
	 *
	 * @param int $term_id The term ID.
	 */
	public static function save_term_meta( $term_id ) {
		$fields = array(
			'_stlr_places_custom_icon' => 'esc_url_raw',
		);
		foreach ( $fields as $field_name => $sanitization_callback ) {
			if ( isset( $_POST[ $field_name ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
				$value = $_POST[ $field_name ]; // phpcs:ignore WordPress.Security.NonceVerification.Missing
				if ( is_callable( $sanitization_callback ) ) {
					$value = call_user_func( $sanitization_callback, $value );
				}
				update_term_meta( $term_id, $field_name, $value );
			} else {
				delete_term_meta( $term_id, $field_name );
			}
		}
	}

}
