<?php
/**
 * Plugin Name:  WP TechSites
 * Plugin URI:   https://wp.techsites.ai
 * Description:  O SaaS de IA mais completo para WordPress — directory builder, scraping, logo, SEO, chatbot e muito mais.
 * Version:      2.2.0
 * Author:       TechSites.ai
 * Author URI:   https://techsites.ai
 * License:      GPL-2.0+
 * Text Domain:  wp-techsites
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'WPTS_VERSION',    '2.2.0' );
define( 'WPTS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPTS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WPTS_API_BASE',   'https://wp.techsites.ai/api/wp' );

// Load modules
require_once WPTS_PLUGIN_DIR . 'includes/theme-detector.php';
require_once WPTS_PLUGIN_DIR . 'includes/cpt-listings.php';
require_once WPTS_PLUGIN_DIR . 'includes/ajax-handlers.php';
require_once WPTS_PLUGIN_DIR . 'admin/admin-page.php';

// ─── Enable REST API for MyListing / WP Job Manager CPT ──────────────────────
add_filter( 'register_post_type_args', 'wpts_enable_listing_rest', 10, 2 );
function wpts_enable_listing_rest( $args, $post_type ) {
    $rest_types = [ 'job_listing', 'listing', 'wpts_listing', 'wpjm_job' ];
    if ( in_array( $post_type, $rest_types, true ) ) {
        $args['show_in_rest'] = true;
        $args['rest_base']    = $args['rest_base'] ?? $post_type;
    }
    return $args;
}

// ─── Custom REST endpoint for listing creation (fallback for any CPT) ─────────
add_action( 'rest_api_init', 'wpts_register_rest_routes' );
function wpts_register_rest_routes() {
    register_rest_route( 'wp-techsites/v1', '/listings', [
        'methods'             => 'POST',
        'callback'            => 'wpts_rest_create_listing',
        'permission_callback' => function( $req ) {
            return current_user_can( 'publish_posts' );
        },
    ]);
    register_rest_route( 'wp-techsites/v1', '/listings', [
        'methods'             => 'GET',
        'callback'            => 'wpts_rest_get_listings',
        'permission_callback' => '__return_true',
    ]);
}

function wpts_rest_create_listing( WP_REST_Request $req ) {
    $params = $req->get_json_params();
    $cpt    = post_type_exists( 'job_listing' ) ? 'job_listing' : 'wpts_listing';

    $post_id = wp_insert_post([
        'post_title'   => sanitize_text_field( $params['title'] ?? 'Listing' ),
        'post_content' => wp_kses_post( $params['content'] ?? '' ),
        'post_status'  => 'publish',
        'post_type'    => $cpt,
    ]);

    if ( is_wp_error( $post_id ) ) {
        return new WP_Error( 'insert_failed', $post_id->get_error_message(), [ 'status' => 500 ] );
    }

    // Save meta fields
    $meta_map = [
        'address'      => '_job_location',
        'phone'        => '_phone',
        'website'      => '_job_website',
        'rating'       => '_rating',
        'review_count' => '_review_count',
        'hours'        => '_hours',
        'lat'          => '_geolocation_lat',
        'lng'          => '_geolocation_long',
        'category'     => '_listing_category',
        'source'       => '_import_source',
    ];
    foreach ( $meta_map as $key => $meta_key ) {
        if ( isset( $params[ $key ] ) ) {
            update_post_meta( $post_id, $meta_key, sanitize_text_field( (string) $params[ $key ] ) );
        }
    }

    return rest_ensure_response([
        'id'     => $post_id,
        'title'  => get_the_title( $post_id ),
        'link'   => get_permalink( $post_id ),
        'type'   => $cpt,
        'status' => 'publish',
    ]);
}

function wpts_rest_get_listings( WP_REST_Request $req ) {
    $cpt  = post_type_exists( 'job_listing' ) ? 'job_listing' : 'wpts_listing';
    $args = [
        'post_type'      => $cpt,
        'post_status'    => 'publish',
        'posts_per_page' => (int) ( $req->get_param('per_page') ?? 20 ),
        'paged'          => (int) ( $req->get_param('page') ?? 1 ),
    ];
    $query = new WP_Query( $args );
    $items = [];
    foreach ( $query->posts as $post ) {
        $items[] = [
            'id'      => $post->ID,
            'title'   => $post->post_title,
            'link'    => get_permalink( $post->ID ),
            'address' => get_post_meta( $post->ID, '_job_location', true ),
            'phone'   => get_post_meta( $post->ID, '_phone', true ),
            'rating'  => get_post_meta( $post->ID, '_rating', true ),
        ];
    }
    return rest_ensure_response([ 'listings' => $items, 'total' => $query->found_posts ]);
}

// ─── Activation ───────────────────────────────────────────────────────────────
register_activation_hook( __FILE__, 'wpts_activate' );
function wpts_activate() {
    wpts_register_cpts();
    flush_rewrite_rules();
    if ( ! get_option( 'wpts_credits' ) ) update_option( 'wpts_credits', 100 );
    if ( ! get_option( 'wpts_plan' )    ) update_option( 'wpts_plan', 'trial' );
    if ( ! get_option( 'wpts_audit_done' ) ) {
        update_option( 'wpts_audit_pending', 1 );
    }
    // Trigger onboarding on next admin load (API key may not be set yet)
    update_option( 'wpts_onboarding_pending', 1 );
}

// Run onboarding once after API key is saved (fires on admin_init)
add_action( 'admin_init', 'wpts_maybe_run_onboarding' );
function wpts_maybe_run_onboarding() {
    if ( ! get_option( 'wpts_onboarding_pending' ) ) return;
    $key = get_option( 'wpts_api_key', '' );
    if ( ! $key ) return; // wait until key is saved
    delete_option( 'wpts_onboarding_pending' );

    $theme = wpts_detect_theme();
    $response = wp_remote_post( WPTS_API_BASE . '/onboarding', [
        'timeout' => 15,
        'headers' => [ 'Content-Type' => 'application/json', 'X-WP-Site-Key' => $key ],
        'body'    => wp_json_encode([
            'site_name'    => get_bloginfo( 'name' ),
            'site_url'     => get_site_url(),
            'tagline'      => get_bloginfo( 'description' ),
            'theme'        => $theme,
            'permalink'    => get_option( 'permalink_structure' ),
            'ssl'          => is_ssl(),
            'wp_version'   => get_bloginfo( 'version' ),
            'language'     => get_bloginfo( 'language' ),
            'pages_count'  => wp_count_posts( 'page' )->publish,
            'posts_count'  => wp_count_posts( 'post' )->publish,
            'plugins'      => array_keys( get_plugins() ),
        ]),
    ]);

    if ( ! is_wp_error( $response ) ) {
        $data = json_decode( wp_remote_retrieve_body( $response ), true );
        if ( ! empty( $data['seo_audit']['score'] ) ) {
            update_option( 'wpts_seo_score', $data['seo_audit']['score'] );
        }
        if ( ! empty( $data['credits_remaining'] ) ) {
            update_option( 'wpts_credits', $data['credits_remaining'] );
        }
        update_option( 'wpts_onboarding_done', 1 );
    }
}

// ─── Enqueue admin assets ─────────────────────────────────────────────────────
add_action( 'admin_enqueue_scripts', 'wpts_admin_assets' );
function wpts_admin_assets( $hook ) {
    if ( strpos( $hook, 'wp-techsites' ) === false ) return;
    wp_enqueue_style(  'wpts-admin', WPTS_PLUGIN_URL . 'assets/admin.css', [], WPTS_VERSION );
    wp_enqueue_script( 'wpts-admin', WPTS_PLUGIN_URL . 'assets/admin.js',  ['jquery'], WPTS_VERSION, true );
    wp_enqueue_script( 'wpts-pdf', 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', [], null, true );
    wp_localize_script( 'wpts-admin', 'WPTS', [
        'api'       => WPTS_API_BASE,
        'key'       => get_option( 'wpts_api_key', '' ),
        'nonce'     => wp_create_nonce( 'wpts_ajax' ),
        'ajaxurl'   => admin_url( 'admin-ajax.php' ),
        'credits'   => (int) get_option( 'wpts_credits', 0 ),
        'plan'      => get_option( 'wpts_plan', 'trial' ),
        'siteurl'   => get_site_url(),
        'sitename'  => get_bloginfo( 'name' ),
        'theme'     => wpts_detect_theme(),
        'auditPending' => (int) get_option( 'wpts_audit_pending', 0 ),
    ]);
}

// ─── Chatbot frontend ─────────────────────────────────────────────────────────
add_action( 'wp_footer', 'wpts_chatbot_frontend' );
function wpts_chatbot_frontend() {
    if ( get_option( 'wpts_chatbot_enabled' ) !== '1' ) return;
    $key   = get_option( 'wpts_api_key', '' );
    $color = get_option( 'wpts_chatbot_color', '#6366f1' );
    $name  = get_option( 'wpts_chatbot_name', 'Assistente' );
    wp_enqueue_script( 'wpts-chatbot', WPTS_PLUGIN_URL . 'assets/chatbot.js', ['jquery'], WPTS_VERSION, true );
    wp_localize_script( 'wpts-chatbot', 'WPTS_CHAT', [
        'api'   => WPTS_API_BASE,
        'key'   => $key,
        'color' => $color,
        'name'  => $name,
    ]);
}
