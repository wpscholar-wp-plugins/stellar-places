<?php
$map = Stellar_Places::get_map();
$pagination_text = new Stellar_Places_Pagination_Text();
?>

<div class="stellar-places-archive">

	<?php if ( $pagination_text->should_display() ): ?>
		<div class="stellar-places-results-text"><?php $pagination_text->render(); ?></div>
	<?php endif; ?>

	<?php $map->render(); ?>

</div>