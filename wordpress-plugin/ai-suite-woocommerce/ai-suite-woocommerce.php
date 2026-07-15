<?php
/**
 * Plugin Name: AI Suite WooCommerce Integration
 * Plugin URI:  https://your-site.com/ai-suite
 * Description: Integrates AI Suite SaaS with WooCommerce — auto-creates subscription products for every AI tool bundle, manages token credits, and authenticates users via JWT.
 * Version:     1.0.0
 * Author:      AI Suite
 * License:     GPL-2.0+
 * Text Domain: ai-suite-wc
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'AISUITE_VERSION', '1.0.0' );
define( 'AISUITE_DIR',     plugin_dir_path( __FILE__ ) );
define( 'AISUITE_URL',     plugin_dir_url( __FILE__ ) );

// ── Includes ──────────────────────────────────────────────────────────────────
require_once AISUITE_DIR . 'includes/class-products.php';
require_once AISUITE_DIR . 'includes/class-tokens.php';
require_once AISUITE_DIR . 'includes/class-auth.php';
require_once AISUITE_DIR . 'includes/class-webhook.php';
require_once AISUITE_DIR . 'includes/class-admin-page.php';
require_once AISUITE_DIR . 'includes/class-shortcodes.php';

// ── Activation ────────────────────────────────────────────────────────────────
register_activation_hook( __FILE__, function () {
    AISuite_Tokens::create_table();
    AISuite_Products::create_all_products();
    flush_rewrite_rules();
} );

// ── Init ──────────────────────────────────────────────────────────────────────
add_action( 'plugins_loaded', function () {
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', function () {
            echo '<div class="notice notice-error"><p><strong>AI Suite WooCommerce</strong> requires WooCommerce to be active.</p></div>';
        } );
        return;
    }

    new AISuite_Auth();
    new AISuite_Webhook();
    new AISuite_Admin_Page();
    new AISuite_Shortcodes();

    // Grant tokens on order completion
    add_action( 'woocommerce_order_status_completed', [ 'AISuite_Tokens', 'grant_tokens_for_order' ] );
    // Renew tokens on subscription renewal
    add_action( 'woocommerce_subscription_renewal_payment_complete', [ 'AISuite_Tokens', 'renew_subscription_tokens' ] );
} );

// ── Settings link ─────────────────────────────────────────────────────────────
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), function ( $links ) {
    $links[] = '<a href="' . admin_url( 'admin.php?page=ai-suite-settings' ) . '">Settings</a>';
    return $links;
} );
