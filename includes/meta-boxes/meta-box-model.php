<?php

/**
 * Class Stellar_Places_Meta_Box_Model
 *
 * @property $callback
 * @property $callback_args
 * @property $capability
 * @property $context
 * @property $id
 * @property $nonce_action
 * @property $nonce_name
 * @property $post_type
 * @property $priority
 * @property $title
 */
class Stellar_Places_Meta_Box_Model {

	/**
	 * The callback for displaying the meta box (required)
	 *
	 * @var callable $_callback
	 */
	protected $_callback;

	/**
	 * Arguments to be passed to the callback function
	 *
	 * @var array $_callback_args
	 */
	protected $_callback_args = array();

	/**
	 * Capability required to view meta box
	 *
	 * @var string $_capability
	 */
	protected $_capability = 'edit_post';

	/**
	 * Context in which the meta box will be displayed
	 *
	 * @var string $_context
	 */
	protected $_context = 'advanced';

	/**
	 * The HTML id attribute for the meta box (required)
	 *
	 * @var string $_id
	 */
	protected $_id;

	/**
	 * The nonce action used to validate requests related to this meta box
	 *
	 * @var string $_nonce_action
	 */
	protected $_nonce_action = '';

	/**
	 * The nonce name used to validate requests related to this meta box
	 *
	 * @var string $_nonce_name
	 */
	protected $_nonce_name = '';

	/**
	 * The post type(s) where the meta box will be displayed
	 *
	 * @var string|array $_post_type
	 */
	protected $_post_type = array( 'post' );

	/**
	 * The priority of the meta box in relation to the current context
	 *
	 * @var string $_priority
	 */
	public $_priority = 'default';

	/**
	 * The title for the meta box (required)
	 *
	 * @var string $_title
	 */
	public $_title;

	/**
	 * Instantiate the model
	 *
	 * @param string   $html_id
	 * @param string   $title
	 * @param callable $callback
	 * @param array    $args
	 * @throws InvalidArgumentException
	 */
	public function __construct( $html_id, $title, $callback, array $args = array() ) {
		// Ensure required arguments are valid
		if ( ! is_string( $html_id ) ) {
			throw new InvalidArgumentException( __( 'Meta box HTML id must be a string', 'stellar-places' ) );
		}
		if ( ! is_string( $title ) ) {
			throw new InvalidArgumentException( __( 'Meta box title must be a string', 'stellar-places' ) );
		}
		if ( ! is_callable( $callback ) ) {
			throw new InvalidArgumentException( __( 'Meta box callback must be a callable function', 'stellar-places' ) );
		}
		// Prevent overriding of required arguments via $args
		unset( $args['id'] );
		unset( $args['title'] );
		unset( $args['callback'] );
		// Set properties
		$defaults = array(
			'id'           => $html_id,
			'title'        => $title,
			'callback'     => $callback,
			'nonce_name'   => '_wp_nonce_' . $html_id,
			'nonce_action' => $html_id,
		);
		$args = wp_parse_args( $args, $defaults );
		foreach ( $args as $name => $value ) {
			$this->$name = $value;
		}
	}

	/**
	 * Set the callback function, if valid
	 *
	 * @param callable $callback
	 */
	public function set_callback( $callback ) {
		if ( $this->validate_callback( $callback ) ) {
			$this->_callback = $callback;
		}
	}

	/**
	 * Check to ensure callback is valid
	 *
	 * @param callable $callback
	 * @return bool
	 */
	public function validate_callback( $callback ) {
		return is_callable( $callback );
	}

	/**
	 * Set the arguments to be passed to the callback function
	 *
	 * @param array $args
	 */
	public function set_callback_args( array $args ) {
		$this->_callback_args = $args;
	}

	/**
	 * Set the capability required to view the meta box
	 *
	 * @param string $capability
	 */
	public function set_capability( $capability ) {
		$this->_capability = str_replace( '-', '_', sanitize_title_with_dashes( $capability ) );
	}

	/**
	 * Set the context in which the meta box will be displayed, if valid
	 *
	 * @param string $context
	 */
	public function set_context( $context ) {
		if ( $this->validate_context( $context ) ) {
			$this->_context = $context;
		}
	}

	/**
	 * Validate the context
	 *
	 * @param string $context
	 * @return bool
	 */
	public function validate_context( $context ) {
		return in_array( $context, array( 'normal', 'advanced', 'side' ) );
	}

	/**
	 * Set the HTML id attribute on the meta box
	 *
	 * @param string $html_id
	 */
	public function set_id( $html_id ) {
		$this->_id = esc_attr( $html_id );
	}

	/**
	 * Set the nonce action
	 *
	 * @param string $nonce_action
	 */
	public function set_nonce_action( $nonce_action ) {
		$this->_nonce_action = sanitize_title_with_dashes( $nonce_action );
	}

	/**
	 * Set the nonce name
	 *
	 * @param string $nonce_name
	 */
	public function set_nonce_name( $nonce_name ) {
		$this->_nonce_name = sanitize_title_with_dashes( $nonce_name );
	}

	/**
	 * Set the post type(s) that should display the meta box, if valid
	 *
	 * @param string|array $post_types
	 */
	public function set_post_type( $post_types ) {
		$valid_post_types = array();
		foreach ( (array) $post_types as $post_type ) {
			if ( $this->validate_post_type( $post_type ) ) {
				$valid_post_types[] = $post_type;
			}
		}
		if ( ! empty( $valid_post_types ) ) {
			$this->_post_type = $valid_post_types;
		}
	}

	/**
	 * Validate a post type
	 *
	 * @param string $post_type
	 * @return bool
	 */
	public function validate_post_type( $post_type ) {
		return post_type_exists( $post_type );
	}

	/**
	 * Set the priority, if valid
	 *
	 * @param string $priority
	 */
	public function set_priority( $priority ) {
		if ( $this->validate_priority( $priority ) ) {
			$this->_priority = $priority;
		}
	}

	/**
	 * Validate the priority
	 *
	 * @param string $priority
	 * @return bool
	 */
	public function validate_priority( $priority ) {
		return in_array( $priority, array( 'high', 'core', 'default', 'low' ) );
	}

	/**
	 * Set the meta box title
	 *
	 * @param string $title
	 */
	public function set_title( $title ) {
		$this->_title = sanitize_text_field( $title );
	}

	/**
	 * Magic method for getting property values
	 *
	 * @param string $name
	 * @return null|mixed
	 */
	public function __get( $name ) {
		$value = null;
		$property = "_{$name}";
		if ( property_exists( $this, $property ) ) {
			$value = $this->$property;
		}
		return $value;
	}

	/**
	 * Magic method for setting property values
	 *
	 * @param string $name
	 * @param mixed  $value
	 */
	public function __set( $name, $value ) {
		$property = "_{$name}";
		$method = "set_{$name}";
		if ( method_exists( $this, $method ) && is_callable( array( $this, $method ) ) ) {
			call_user_func( array( $this, $method ), $value );
		} else if ( property_exists( $this, $property ) ) {
			$this->$property = $value;
		}
	}

}