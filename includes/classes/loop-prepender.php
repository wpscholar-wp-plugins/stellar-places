<?php

/**
 * Class Stellar_Places_Loop_Prepender
 */
class Stellar_Places_Loop_Prepender {

	protected $_content = '';

	/**
	 * Set content and call 'prepend' method at the appropriate time
	 *
	 * @param string $content
	 */
	function __construct( $content ) {
		$this->_content = $content;
		add_filter( 'loop_start', array( $this, 'prepend' ) );
	}

	/**
	 * Prepend content
	 *
	 * @param WP_Query $query
	 * @return string
	 */
	public function prepend( WP_Query $query ) {
		if ( $query->is_main_query() ) {
			echo $this->_content;
		}
	}

}