<?php

/**
 * Class Stellar_Places_Content_Prepender
 */
class Stellar_Places_Content_Prepender {

	protected $_content = '';

	/**
	 * Set content and call 'prepend' method at the appropriate time
	 *
	 * @param string $content
	 */
	function __construct( $content ) {
		$this->_content = $content;
		add_filter( 'the_content', array( $this, 'prepend' ) );
	}

	/**
	 * Prepend content
	 *
	 * @param string $content
	 * @return string
	 */
	public function prepend( $content ) {
		return $this->_content . $content;
	}

}