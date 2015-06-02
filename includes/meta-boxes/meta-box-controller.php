<?php

/**
 * Class Stellar_Places_Meta_Box_Controller
 */
class Stellar_Places_Meta_Box_Controller {

	/**
	 * The callback for saving data
	 *
	 * @var callable $callback
	 */
	protected $callback;

	/**
	 * The meta box model
	 *
	 * @var Stellar_Places_Meta_Box_Model $model
	 */
	protected $model;

	/**
	 * Setup the controller properties and initiate a listener for post save / update actions
	 *
	 * @param Stellar_Places_Meta_Box_Model $model
	 * @param callable                           $callback
	 */
	public function __construct( Stellar_Places_Meta_Box_Model $model, $callback ) {
		$this->model = $model;
		// Require a valid callback before listening for save events
		if ( is_callable( $callback ) ) {
			$this->callback = $callback;
			add_action( 'save_post', array( $this, 'save_post' ), 10, 2 );
		}
	}

	/**
	 * Verify that the user is saving and has proper permissions before handing off saving to the callback
	 *
	 * @param int     $post_id
	 * @param WP_Post $post
	 */
	public function save_post( $post_id, WP_Post $post ) {
		// Make sure this is a $_POST action and validate that the required nonce name is set
		if ( isset( $_POST[$this->model->nonce_name] ) ) {
			// Check the post type
			if ( in_array( $post->post_type, (array) $this->model->post_type ) ) {
				// Verify nonce
				if ( wp_verify_nonce( $_POST[$this->model->nonce_name], $this->model->nonce_action ) ) {
					// Check capabilities
					if ( current_user_can( 'edit_post', $post_id ) ) {
						// If we have cleared all checks, hand off saving to the callback
						call_user_func( $this->callback, $post_id, $post, $this->model );
					}
				}
			}
		}
	}

}