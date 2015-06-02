<?php

/**
 * Class Stellar_Places_Pagination_Text
 */
class Stellar_Places_Pagination_Text {

	public $query;

	/**
	 * Setup query
	 *
	 * @param WP_Query $query
	 */
	public function __construct( WP_Query $query = null ) {
		global $wp_query;
		$this->query = is_null( $query ) ? $wp_query : $query;
	}

	/**
	 * Check if pagination text should display
	 *
	 * @return bool
	 */
	public function should_display() {
		return $this->query->max_num_pages > 1;
	}

	/**
	 * Display the pagination text
	 */
	public function render( $pagination_text = null ) {
		// Set pagination text
		if ( is_null( $pagination_text ) ) {
			$pagination_text = __( 'Showing results %1$d - %2$d of %3$d', 'stellar-places' );
		}
		$pagination_text = apply_filters( 'stellar_places_pagination_text', $pagination_text, $this->query );

		// Get vars
		$page = max( 1, $this->query->get( 'paged' ) );
		$posts_per_page = $this->query->get( 'posts_per_page' );
		$first_result = ( $page * $posts_per_page ) - ( $posts_per_page - 1 );
		$last_result = $page * $posts_per_page;
		$total_results = $this->query->found_posts;

		// Render
		printf( $pagination_text, $first_result, $last_result, $total_results );
	}

}