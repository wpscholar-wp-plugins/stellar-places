<?php

wp_enqueue_script( 'image-picker', 'https://cdnjs.cloudflare.com/ajax/libs/image-picker/0.3.1/image-picker.min.js', array(), STELLAR_PLACES_VERSION, true );
wp_enqueue_style( 'image-picker', 'https://cdnjs.cloudflare.com/ajax/libs/image-picker/0.3.1/image-picker.min.css', array(), STELLAR_PLACES_VERSION );

$value = '';
$name  = '_stlr_places_custom_icon';

if ( isset( $_GET['post'] ) ) { // phpcs:ignore
	$value = get_post_meta( get_the_ID(), '_stlr_places_custom_icon', true );
}

if ( isset( $_GET['taxonomy'], $_GET['tag_ID'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$value = get_term_meta( absint( $_GET['tag_ID'] ), '_stlr_places_custom_icon', true ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
}

if ( isset( $_GET['page'] ) && 'stellar-places-settings' === $_GET['page'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$name  = 'stellar_places_default_map_icon';
	$value = get_option( 'stellar_places_default_map_icon', 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' );
}

?>
<div class="stellar-places-icon-picker">

	<p>
		<label for="<?php echo esc_attr( $name ); ?>">
			<?php esc_html_e( 'Select a custom map icon:', 'stellar-places' ); ?>
		</label>
	</p>

	<select class="image-picker" id="<?php echo esc_attr( $name ); ?>" name="<?php echo esc_attr( $name ); ?>">
		<option value=""><?php esc_html_e( 'Default', 'stellar-places' ); ?></option>
		<?php foreach ( Stellar_Places_Custom_Icon_Support::available_icons() as $icon ) : ?>
			<option
				data-img-src="<?php echo esc_url( $icon ); ?>"
				value="<?php echo esc_url( $icon ); ?>"
				<?php selected( $icon, $value ); ?>
			>
				<?php echo esc_url( $icon ); ?>
			</option>
		<?php endforeach; ?>
	</select>

</div>
<script>
	jQuery('document').ready(function ($) {
		$('select.image-picker').imagepicker({
			hide_select: false,
		});
	});
</script>
<style>
	select.image-picker {
		margin-bottom: 1em;
	}
</style>
