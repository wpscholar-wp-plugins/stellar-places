<?php

/**
 * Class Stellar_Places_Meta_Box_View
 */
class Stellar_Places_Meta_Box_View {

	/**
	 * The model associated with this view
	 *
	 * @var Stellar_Places_Meta_Box_Model $model
	 */
	protected $model;

	/**
	 * Store the model and setup the meta box for display
	 *
	 * @param Stellar_Places_Meta_Box_Model $model
	 */
	function __construct( Stellar_Places_Meta_Box_Model $model ) {
		$this->model = $model;
		// Hook into the 'add_meta_boxes' action, but only for applicable post types
		foreach ( (array) $this->model->post_type as $post_type ) {
			add_action( "add_meta_boxes_{$post_type}", array( $this, 'add_meta_box' ) );
		}
	}

	/**
	 * Add the meta box
	 *
	 * @param WP_Post $post
	 */
	public function add_meta_box( WP_Post $post ) {
		// Add meta box only if user has the proper capability
		if ( current_user_can( $this->model->capability, $post ) ) {
			add_meta_box(
				$this->model->id,
				$this->model->title,
				array( $this, 'render_meta_box' ),
				$post->post_type,
				$this->model->context,
				$this->model->priority,
				$this->model->callback_args
			);
		}
	}

	/**
	 * Render the meta box
	 *
	 * @param WP_Post $post
	 * @param object  $box Contains the callback arguments along with other data on the current meta box
	 */
	public function render_meta_box( WP_Post $post, $box ) {
		// Automate the display of the nonce field
		wp_nonce_field( $this->model->nonce_action, $this->model->nonce_name );
		// Hand off control of rendering to the user's callback function and keep the same function signature
		call_user_func( $this->model->callback, $post, $box );
	}

}