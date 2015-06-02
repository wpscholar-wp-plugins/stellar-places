<?php
$post = get_post();
$place = Stellar_Places::get_place_object( $post );
$address = Stellar_Places::get_postal_address( $place );
$map = Stellar_Places::get_static_map( $place );
?>

<div class="stellar-places-single">

	<?php $map->render(); ?>

	<span class="stellar-places-postal-address formatted">
		<?php $address->render(); ?>
	</span>

</div>