<?php

/*
 * Flush rewrite rules since this version adds 'with_front' => false to the post type args
 */
add_action( 'init', 'flush_rewrite_rules' );