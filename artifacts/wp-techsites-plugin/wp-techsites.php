<?php
/**
 * Plugin Name:  WP TechSites
 * Plugin URI:   https://wp.techsites.ai
 * Description:  O SaaS de IA mais completo para WordPress — directory builder, scraping, logo, SEO, chatbot e muito mais.
 * Version:      2.8.0
 * Author:       TechSites.ai
 * Author URI:   https://techsites.ai
 * License:      GPL-2.0+
 * Text Domain:  wp-techsites
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'WPTS_VERSION',    '2.8.0' );
define( 'WPTS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPTS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WPTS_API_BASE',   'https://wp.techsites.ai/api/wp' );

// Load modules
require_once WPTS_PLUGIN_DIR . 'includes/theme-detector.php';
require_once WPTS_PLUGIN_DIR . 'includes/cpt-listings.php';
require_once WPTS_PLUGIN_DIR . 'includes/ajax-handlers.php';
require_once WPTS_PLUGIN_DIR . 'admin/admin-page.php';

// ─── Application Password OAuth Callback ─────────────────────────────────────
// Intercepts the return from wp.techsites.ai after the user authorises the
// WordPress Application Password. WordPress sends back:
//   ?page=wp-techsites&auth=sucesso&user_login=X&password=Y&techsites_key=ts_...
add_action( 'admin_init', 'wpts_handle_auth_callback' );
function wpts_handle_auth_callback() {
    if ( ! isset( $_GET['page'] ) || $_GET['page'] !== 'wp-techsites' ) return;
    if ( ! current_user_can( 'manage_options' ) ) return;

    // ── Rejection handler ──────────────────────────────────────────────────
    if ( isset( $_GET['auth'] ) && $_GET['auth'] === 'rejeitado' ) {
        add_action( 'admin_notices', function() {
            echo '<div class="notice notice-warning is-dismissible"><p>⚠️ Conexão com WP TechSites cancelada. <a href="' .
                esc_url( admin_url('admin.php?page=wp-techsites&tab=settings') ) . '">Tentar novamente →</a></p></div>';
        });
        return;
    }

    // ── Success handler ────────────────────────────────────────────────────
    if ( ! isset( $_GET['auth'] ) || $_GET['auth'] !== 'sucesso' ) return;

    $techsites_key = isset( $_GET['techsites_key'] ) ? sanitize_text_field( wp_unslash( $_GET['techsites_key'] ) ) : '';
    $wp_user       = isset( $_GET['user_login'] )    ? sanitize_text_field( wp_unslash( $_GET['user_login'] ) )    : '';
    $wp_password   = isset( $_GET['password'] )      ? sanitize_text_field( wp_unslash( $_GET['password'] ) )      : '';

    if ( ! $techsites_key || ! $wp_user || ! $wp_password ) {
        add_action( 'admin_notices', function() {
            echo '<div class="notice notice-error is-dismissible"><p>❌ Dados de conexão incompletos. Por favor, tente conectar novamente.</p></div>';
        });
        return;
    }

    // ── Save all credentials at once ───────────────────────────────────────
    $rest_url = rtrim( get_rest_url(), '/' ); // e.g. https://site.com/wp-json

    update_option( 'wpts_api_key',           $techsites_key );
    update_option( 'wpts_wp_user',           $wp_user );
    update_option( 'wpts_wp_app_password',   $wp_password );
    update_option( 'wpts_wp_rest_url',       $rest_url );
    update_option( 'wpts_wp_rest_connected', 1 );

    // Notify api-server of new REST credentials (non-blocking / fire-and-forget)
    wp_remote_post( WPTS_API_BASE . '/connect-rest', [
        'timeout'  => 5,
        'blocking' => false,
        'headers'  => [
            'Content-Type'  => 'application/json',
            'X-WP-Site-Key' => $techsites_key,
        ],
        'body' => wp_json_encode([
            'wp_rest_url'     => $rest_url,
            'wp_user'         => $wp_user,
            'wp_app_password' => $wp_password,
        ]),
    ]);

    // Redirect to settings tab with success flag (cleans up URL params)
    wp_safe_redirect( admin_url( 'admin.php?page=wp-techsites&tab=settings&connected=1' ) );
    exit;
}

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
    if ( ! get_option( 'wpts_credits' ) ) update_option( 'wpts_credits', 150 );
    if ( ! get_option( 'wpts_plan' )    ) update_option( 'wpts_plan', 'trial' );
    if ( ! get_option( 'wpts_audit_done' ) ) {
        update_option( 'wpts_audit_pending', 1 );
    }

    // ── Auto-register: cria conta automaticamente se ainda não há API key ──────
    if ( ! get_option( 'wpts_api_key' ) ) {
        $admin    = get_user_by( 'email', get_bloginfo( 'admin_email' ) );
        $response = wp_remote_post( WPTS_API_BASE . '/register', [
            'timeout'     => 15,
            'headers'     => [ 'Content-Type' => 'application/json' ],
            'body'        => wp_json_encode( [
                'siteUrl'  => get_site_url(),
                'siteName' => get_bloginfo( 'name' ),
                'email'    => get_bloginfo( 'admin_email' ),
                'name'     => $admin ? $admin->display_name : get_bloginfo( 'name' ),
            ] ),
        ] );

        if ( ! is_wp_error( $response ) ) {
            $data = json_decode( wp_remote_retrieve_body( $response ), true );
            if ( ! empty( $data['apiKey'] ) ) {
                update_option( 'wpts_api_key', sanitize_text_field( $data['apiKey'] ) );
                if ( ! empty( $data['credits'] ) ) {
                    update_option( 'wpts_credits', (int) $data['credits'] );
                }
            }
        }
        // Se falhar, segue normalmente — o usuário pode entrar com a chave manualmente
    }

    // Trigger onboarding on next admin load
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
        'auditPending' => 0, // sempre 0 — auditoria só roda com clique explícito no botão
    ]);
}

// ─── Auto-update checker ──────────────────────────────────────────────────────
// Hooks into WordPress's native update system so the "Plugins" list shows
// "Update Available" automatically whenever a new version is released on
// wp.techsites.ai — no external update server plugin needed.

add_filter( 'pre_set_site_transient_update_plugins', 'wpts_check_for_update' );
function wpts_check_for_update( $transient ) {
    if ( empty( $transient->checked ) ) return $transient;

    $plugin_file = 'wp-techsites/wp-techsites.php';
    $current_ver = WPTS_VERSION;

    // Cache remote check for 12 hours to avoid hammering the API on every page load
    $cached = get_transient( 'wpts_remote_version' );
    if ( false === $cached ) {
        $response = wp_remote_get( WPTS_API_BASE . '/plugin-version', [
            'timeout'   => 5,
            'sslverify' => true,
        ]);
        if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
            set_transient( 'wpts_remote_version', [ 'version' => $current_ver, 'url' => '' ], HOUR_IN_SECONDS );
            return $transient;
        }
        $data   = json_decode( wp_remote_retrieve_body( $response ), true );
        $cached = [
            'version'   => $data['latest']       ?? $current_ver,
            'url'       => $data['download_url'] ?? '',
            'changelog' => $data['changelog']    ?? '',
        ];
        set_transient( 'wpts_remote_version', $cached, HOUR_IN_SECONDS );
    }

    if ( version_compare( $current_ver, $cached['version'], '<' ) ) {
        $transient->response[ $plugin_file ] = (object) [
            'id'          => 'w.org/plugins/wp-techsites',
            'slug'        => 'wp-techsites',
            'plugin'      => $plugin_file,
            'new_version' => $cached['version'],
            'url'         => 'https://wp.techsites.ai',
            'package'     => $cached['url'],
            'icons'       => [],
            'banners'     => [],
            'requires'    => '5.8',
            'requires_php'=> '7.4',
            'tested'      => '6.6',
        ];
    }

    return $transient;
}

// Provide plugin info in the "View version details" popup
add_filter( 'plugins_api', 'wpts_plugin_info', 20, 3 );
function wpts_plugin_info( $result, $action, $args ) {
    if ( $action !== 'plugin_information' ) return $result;
    if ( ! isset( $args->slug ) || $args->slug !== 'wp-techsites' ) return $result;

    $cached = get_transient( 'wpts_remote_version' );

    return (object) [
        'name'          => 'WP TechSites',
        'slug'          => 'wp-techsites',
        'version'       => $cached['version'] ?? WPTS_VERSION,
        'author'        => '<a href="https://techsites.ai">TechSites.ai</a>',
        'homepage'      => 'https://wp.techsites.ai',
        'requires'      => '5.8',
        'requires_php'  => '7.4',
        'tested'        => '6.6',
        'sections'      => [
            'description' => 'O SaaS de IA mais completo para WordPress — directory builder, scraping, logo, SEO, chatbot e muito mais.',
            'changelog'   => '<p>' . esc_html( $cached['changelog'] ?? '' ) . '</p>',
        ],
        'download_link' => $cached['url'] ?? '',
    ];
}

// Force WordPress to re-check for updates after plugin is saved/updated
add_action( 'upgrader_process_complete', 'wpts_clear_update_cache', 10, 2 );
function wpts_clear_update_cache( $upgrader, $options ) {
    if (
        $options['type'] === 'plugin' &&
        isset( $options['plugins'] ) &&
        in_array( 'wp-techsites/wp-techsites.php', (array) $options['plugins'], true )
    ) {
        delete_transient( 'wpts_remote_version' );
        delete_transient( 'wpts_update_check' );
    }
}

// ─── SEO Articles Cron ───────────────────────────────────────────────────────
add_action( 'wpts_cron_article_job', 'wpts_run_cron_article' );

function wpts_run_cron_article() {
    $schedule = (array) get_option( 'wpts_seo_schedule', [] );
    if ( empty( $schedule['active'] ) || empty( $schedule['keyword'] ) ) return;

    $keyword   = $schedule['keyword']    ?? '';
    $category  = $schedule['category']  ?? '';
    $quantity  = max( 1, min( 3, intval( $schedule['quantity']   ?? 1 ) ) );
    $wordcount = intval( $schedule['word_count'] ?? 800 );
    $variants  = [ '', 'Guia completo: ', 'Melhores dicas de: ', 'Como usar: ', 'Tudo sobre: ', 'Por que escolher: ' ];
    $log       = (array) get_option( 'wpts_seo_log', [] );

    for ( $i = 0; $i < $quantity; $i++ ) {
        $topic  = ( $i === 0 ? '' : $variants[ $i % count( $variants ) ] ) . $keyword;
        $result = wp_remote_post( WPTS_API_BASE . '/article-with-images', [
            'timeout' => 150,
            'headers' => [
                'Content-Type'   => 'application/json',
                'X-WP-Site-Key'  => get_option( 'wpts_api_key', '' ),
            ],
            'body' => wp_json_encode([
                'topic'      => $topic,
                'category'   => $category,
                'tone'       => 'professional',
                'word_count' => $wordcount,
                'publish'    => true,
                'city'       => '',
            ]),
        ]);
        $body  = is_wp_error( $result ) ? null : json_decode( wp_remote_retrieve_body( $result ), true );
        $log[] = [
            'date'   => current_time( 'mysql' ),
            'topic'  => $topic,
            'status' => ( ! is_wp_error( $result ) && ! empty( $body['success'] ) ) ? 'publicado' : 'erro',
            'title'  => $body['title']       ?? '',
            'url'    => $body['wp_post_url'] ?? '',
        ];
    }
    update_option( 'wpts_seo_log', array_slice( $log, -50 ) );

    // Schedule next run with random interval
    $next = wpts_next_cron_time( $schedule );
    if ( $next ) wp_schedule_single_event( $next, 'wpts_cron_article_job' );
}

/**
 * Calculate next valid publish timestamp with randomness for stealth.
 */
function wpts_next_cron_time( array $s ): int {
    $min_days  = max( 1, intval( $s['min_days']  ?? 2 ) );
    $max_days  = max( $min_days, intval( $s['max_days']  ?? 7 ) );
    $hour_min  = max( 0, min( 23, intval( $s['hour_min'] ?? 8 ) ) );
    $hour_max  = max( $hour_min, min( 23, intval( $s['hour_max'] ?? 20 ) ) );
    $week_bits = intval( $s['week_days'] ?? 31 ); // bitmask: bit0=Mon..bit6=Sun

    $delay = rand( $min_days, $max_days );

    // Find a valid weekday within the next 14 days
    for ( $attempt = 0; $attempt < 14; $attempt++ ) {
        $ts  = strtotime( "+{$delay} days", current_time( 'timestamp' ) );
        $dow = (int) date( 'N', $ts ) - 1; // 0=Mon..6=Sun
        if ( $week_bits & ( 1 << $dow ) ) {
            $h = rand( $hour_min, $hour_max );
            $m = rand( 0, 59 );
            return mktime( $h, $m, 0, (int) date( 'n', $ts ), (int) date( 'j', $ts ), (int) date( 'Y', $ts ) );
        }
        $delay++;
    }
    // Fallback: 3-7 days from now
    return time() + rand( 3 * DAY_IN_SECONDS, 7 * DAY_IN_SECONDS );
}

// Clear cron on plugin deactivation
register_deactivation_hook( __FILE__, function () {
    $ts = wp_next_scheduled( 'wpts_cron_article_job' );
    if ( $ts ) wp_unschedule_event( $ts, 'wpts_cron_article_job' );
});

// ─── Chatbot frontend ─────────────────────────────────────────────────────────
add_action( 'wp_footer', 'wpts_chatbot_frontend' );
function wpts_chatbot_frontend() {
    if ( get_option( 'wpts_chatbot_enabled' ) !== '1' ) return;
    $key   = get_option( 'wpts_api_key', '' );
    $color = get_option( 'wpts_chatbot_color', '#6366f1' );
    $name  = get_option( 'wpts_chatbot_name', 'Assistente' );
    wp_enqueue_script( 'wpts-chatbot', WPTS_PLUGIN_URL . 'assets/chatbot.js', ['jquery'], WPTS_VERSION, true );
    wp_localize_script( 'wpts-chatbot', 'WPTS_CHAT', [
        'api'    => WPTS_API_BASE,
        'key'    => $key,
        'color'  => $color,
        'name'   => $name,
        'prompt' => get_option( 'wpts_chatbot_prompt', '' ),
        'wpJson' => esc_url( trailingslashit( get_site_url() ) . 'wp-json' ),
    ]);
}
