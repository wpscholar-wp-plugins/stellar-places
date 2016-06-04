<?php

/*
 * Flush rewrite rules since this version makes the location category taxonomy public
 */
add_action( 'init', 'flush_rewrite_rules' );