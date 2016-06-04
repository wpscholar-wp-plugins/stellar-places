<?php

/**
 * Class Stellar_Places_Context
 */
class Stellar_Places_Context {

	/**
	 * Get context
	 *
	 * @return array
	 */
	public static function get_context() {
		$context = array();
		if ( is_front_page() ) {
			$context = self::get_front_page_context();
		} else if ( is_home() ) {
			$context = self::get_home_context();
		} else if ( is_singular() ) {
			$context = self::get_singular_context();
		} else if ( is_archive() ) {
			$context = self::get_archive_context();
		} else if ( is_search() ) {
			$context[] = 'search';
		} else if ( is_404() ) {
			$context[] = '404';
		}
		$context[] = 'index';
		return $context;
	}

	/**
	 * Get front page context
	 *
	 * @return array
	 */
	public static function get_front_page_context() {
		$context = array( 'front-page' );
		if ( is_home() ) {
			$context = array_merge( $context, self::get_home_context() );
		} else if ( is_page() ) {
			$context = array_merge( $context, self::get_page_context() );
		}
		return $context;
	}

	/**
	 * Get home context
	 *
	 * @return array
	 */
	public static function get_home_context() {
		return array( 'home' );
	}

	/**
	 * Get page context
	 *
	 * @return array
	 */
	public static function get_page_context() {
		$post = get_queried_object();
		$context = array(
			'page-' . sanitize_html_class( $post->post_name ),
			"page-{$post->ID}",
			'page',
		);
		if ( is_page_template() ) {
			$template = get_page_template_slug( $post->ID );
			array_unshift( $context, str_replace( '.php', '', $template ) );
		}
		return $context;
	}

	/**
	 * Get singular context
	 *
	 * @return array
	 */
	public static function get_singular_context() {
		$context = array();
		if ( is_attachment() ) {
			$context = self::get_attachment_context();
		}
		if ( is_single() ) {
			$context = self::get_single_context();
		}
		if ( is_page() ) {
			$context = self::get_page_context();
		}
		return $context;
	}

	/**
	 * Get attachment context
	 *
	 * @return array
	 */
	public static function get_attachment_context() {
		global $post;
		$context = array(
			'attachment',
			'single',
		);
		if ( ! empty( $post->post_mime_type ) ) {
			$type = explode( '/', $post->post_mime_type );
			array_unshift( $context, "{$type[0]}" );
			array_unshift( $context, "{$type[1]}" );
			array_unshift( $context, "{$type[0]}_{$type[1]}" );
		}
		return $context;
	}

	/**
	 * Get single context
	 *
	 * @return array
	 */
	public static function get_single_context() {
		global $post;
		$context = array(
			"single-{$post->post_type}",
			'single',
		);
		return $context;
	}

	/**
	 * Get archive context
	 *
	 * @return array
	 */
	public static function get_archive_context() {
		$context = array();
		if ( is_tax() ) {
			$context = self::get_taxonomy_archive_context();
		} else if ( is_category() ) {
			$context = self::get_category_archive_context();
		} else if ( is_tag() ) {
			$context = self::get_tag_archive_context();
		} else if ( is_author() ) {
			$context = self::get_author_archive_context();
		} else if ( is_date() ) {
			$context[] = 'date';
		}
		if ( is_post_type_archive() ) {
			$context = array_merge( $context, self::get_post_type_archive_context() );
		}
		$context[] = 'archive';
		if ( is_paged() ) {
			$context[] = 'paged';
		}
		return $context;
	}

	/**
	 * Get taxonomy archive context
	 *
	 * @return array
	 */
	public static function get_taxonomy_archive_context() {
		$term = get_queried_object();
		$context = array(
			"taxonomy-{$term->taxonomy}-" . sanitize_html_class( $term->slug ),
			"taxonomy-{$term->taxonomy}-{$term->term_id}",
			"taxonomy-{$term->taxonomy}",
			'taxonomy',
		);
		return $context;
	}

	/**
	 * Get category archive context
	 *
	 * @return array
	 */
	public static function get_category_archive_context() {
		$term = get_queried_object();
		$context = array(
			'category-' . sanitize_html_class( $term->slug ),
			"category-{$term->term_id}",
			'category',
		);
		return $context;
	}

	/**
	 * Get tag archive context
	 *
	 * @return array
	 */
	public static function get_tag_archive_context() {
		$term = get_queried_object();
		$context = array(
			'tag-' . sanitize_html_class( $term->slug ),
			"tag-{$term->term_id}",
			'tag',
		);
		return $context;
	}

	/**
	 * Get author archive context
	 *
	 * @return array
	 */
	public static function get_author_archive_context() {
		$user = get_queried_object();
		$context = array(
			'author-' . sanitize_html_class( $user->nicename ),
			"author-{$user->ID}",
			'author',
		);
		return $context;
	}

	/**
	 * Get post type archive context
	 *
	 * @return array
	 */
	public static function get_post_type_archive_context() {
		$post_type = get_query_var( 'post_type' );
		$context = array( "archive-{$post_type}" );
		return $context;
	}

}