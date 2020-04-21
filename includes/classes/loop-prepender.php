<?php

/**
 * Class Stellar_Places_Loop_Prepender
 */
class Stellar_Places_Loop_Prepender {

	/**
	 * The content to prepend.
	 *
	 * @var string
	 */
	protected $content = '';

	/**
	 * Set content and call 'prepend' method at the appropriate time
	 *
	 * @param string $content The content.
	 */
	public function __construct( $content ) {
		$this->content = $content;
		add_filter( 'loop_start', array( $this, 'prepend' ) );
	}

	/**
	 * Prepend content
	 *
	 * @param WP_Query $query The query.
	 *
	 * @return void
	 */
	public function prepend( WP_Query $query ) {
		if ( $query->is_main_query() ) {
			echo $this->content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
	}

}
