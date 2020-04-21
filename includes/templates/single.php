<?php
$place       = Stellar_Places::get_place_object( get_post() );
$address     = Stellar_Places::get_postal_address( $place );
$stellar_map = Stellar_Places::get_static_map( $place );
?>

<div class="stellar-places-single">

	<?php $stellar_map->render(); ?>

	<span class="stellar-places-postal-address formatted">
		<?php $address->render(); ?>
	</span>

</div>
