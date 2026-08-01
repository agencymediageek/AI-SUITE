<?php
/**
 * Plugin Name:  WP TechSites
 * Plugin URI:   https://wp.techsites.ai
 * Description:  O SaaS de IA mais completo para WordPress — directory builder, scraping, logo, SEO, chatbot e muito mais.
 * Version:      2.0.0
 * Author:       TechSites.ai
 * Author URI:   https://techsites.ai
 * License:      GPL-2.0+
 * Text Domain:  wp-techsites
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'WPTS_VERSION',    '2.0.0' );
define( 'WPTS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPTS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WPTS_API_BASE',   'https://wp.techsites.ai/api/wp' );

// Load modules
require_once WPTS_PLUGIN_DIR . 'includes/theme-detector.php';
require_once WPTS_PLUGIN_DIR . 'includes/cpt-listings.php';
require_once WPTS_PLUGIN_DIR . 'includes/ajax-handlers.php';
require_once WPTS_PLUGIN_DIR . 'admin/admin-page.php';

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
