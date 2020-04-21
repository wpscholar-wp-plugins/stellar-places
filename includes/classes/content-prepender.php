<?php

/**
 * Class Stellar_Places_Content_Prepender
 */
class Stellar_Places_Content_Prepender {

	/**
	 * The content to be prepended.
	 *
	 * @var string
	 */
	protected $content = '';

	/**
	 * Set content and call 'prepend' method at the appropriate time
	 *
	 * @param string $content The content to be prepended.
	 */
	public function __construct( $content ) {
		$this->content = $content;
		add_filter( 'the_content', array( $this, 'prepend' ) );
	}

	/**
	 * Prepend content
	 *
	 * @param string $content The content to be prepended.
	 *
	 * @return string
	 */
	public function prepend( $content ) {
		return $this->content . $content;
	}

}
