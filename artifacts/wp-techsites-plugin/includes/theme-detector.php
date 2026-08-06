<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Detect active theme and return structured info
 */
function wpts_detect_theme() {
    $theme = wp_get_theme();
    $slug  = $theme->get_stylesheet();
    $name  = $theme->get( 'Name' );

    $known = [
        'mylisting'         => [ 'label' => 'MyListing', 'type' => 'directory', 'color' => '#f59e0b', 'icon' => '📁', 'features' => ['directory','listings','scraping'] ],
        'my-listing'        => [ 'label' => 'MyListing', 'type' => 'directory', 'color' => '#f59e0b', 'icon' => '📁', 'features' => ['directory','listings','scraping'] ],
        'betheme'           => [ 'label' => 'BeTheme',   'type' => 'multipurpose', 'color' => '#6366f1', 'icon' => '🎨', 'features' => ['content','branding','logo'] ],
        'be-theme'          => [ 'label' => 'BeTheme',   'type' => 'multipurpose', 'color' => '#6366f1', 'icon' => '🎨', 'features' => ['content','branding','logo'] ],
        'divi'              => [ 'label' => 'Divi',      'type' => 'page-builder', 'color' => '#8b5cf6', 'icon' => '🧩', 'features' => ['content','wysiwyg'] ],
        'elementor'         => [ 'label' => 'Elementor', 'type' => 'page-builder', 'color' => '#e11d48', 'icon' => '⚡', 'features' => ['content','wysiwyg'] ],
        'hello-elementor'   => [ 'label' => 'Elementor', 'type' => 'page-builder', 'color' => '#e11d48', 'icon' => '⚡', 'features' => ['content','wysiwyg'] ],
        'astra'             => [ 'label' => 'Astra',     'type' => 'multipurpose', 'color' => '#0ea5e9', 'icon' => '🚀', 'features' => ['content','branding'] ],
        'generatepress'     => [ 'label' => 'GeneratePress', 'type' => 'multipurpose', 'color' => '#059669', 'icon' => '⚙️', 'features' => ['content'] ],
        'flatsome'          => [ 'label' => 'Flatsome',  'type' => 'woocommerce', 'color' => '#f97316', 'icon' => '🛒', 'features' => ['listings','monetization'] ],
        'woodmart'          => [ 'label' => 'WoodMart',  'type' => 'woocommerce', 'color' => '#84cc16', 'icon' => '🛒', 'features' => ['listings','monetization'] ],
        'listify'           => [ 'label' => 'Listify',   'type' => 'directory', 'color' => '#f59e0b', 'icon' => '📋', 'features' => ['directory','listings'] ],
        'listable'          => [ 'label' => 'Listable',  'type' => 'directory', 'color' => '#f59e0b', 'icon' => '📋', 'features' => ['directory','listings'] ],
        'jobster'           => [ 'label' => 'Jobster',   'type' => 'directory', 'color' => '#0284c7', 'icon' => '💼', 'features' => ['directory','listings'] ],
    ];

    $info = $known[ strtolower( $slug ) ] ?? [
        'label'    => $name,
        'type'     => 'custom',
        'color'    => '#6b7280',
        'icon'     => '🌐',
        'features' => ['content','chatbot'],
    ];

    $info['slug']    = $slug;
    $info['name']    = $name;
    $info['version'] = $theme->get( 'Version' );
    $info['parent']  = $theme->parent() ? $theme->parent()->get( 'Name' ) : null;

    // ── BeTheme: detect active template/preset ─────────────────────────────────
    // BeTheme has 700+ templates stored as presets. We read the active one so the
    // api-server can decide if it's a directory-style template without needing to
    // know all 700+ slugs. The active template slug is stored in BeTheme's options.
    if ( in_array( $slug, [ 'betheme', 'be-theme', 'mfn-theme' ], true ) ) {
        $active_template = '';
        // BeTheme stores the currently applied preset in mfn-theme-options
        $mfn_opts = get_option( 'mfn-theme-options', [] );
        if ( ! empty( $mfn_opts['mfn-presets-current'] ) ) {
            $active_template = sanitize_title( $mfn_opts['mfn-presets-current'] );
        } elseif ( ! empty( $mfn_opts['preset'] ) ) {
            $active_template = sanitize_title( $mfn_opts['preset'] );
        } elseif ( ! empty( $mfn_opts['mfn_presets_current'] ) ) {
            $active_template = sanitize_title( $mfn_opts['mfn_presets_current'] );
        } else {
            // Fallback: check if a preset file name is stored as the active skin
            $skin = get_option( 'mfn_presets', [] );
            if ( is_array( $skin ) && ! empty( $skin['current'] ) ) {
                $active_template = sanitize_title( $skin['current'] );
            }
        }
        // Directory-style templates in BeTheme include bedirectory, belisting,
        // real-estate, cars, hotels, restaurants, travel, jobs, classified etc.
        $dir_keywords = [ 'directory', 'listing', 'real-estate', 'realestate',
                          'hotel', 'restaurant', 'travel', 'cars', 'jobs',
                          'classified', 'property', 'estate', 'rental' ];
        foreach ( $dir_keywords as $kw ) {
            if ( str_contains( strtolower( $active_template ), $kw ) ) {
                $info['type'] = 'directory';
                break;
            }
        }
        if ( $active_template ) {
            $info['activeTemplate'] = $active_template;
        }
    }

    // detect page builders in use
    $builders = [];
    if ( defined( 'ELEMENTOR_VERSION' ) )       $builders[] = 'Elementor';
    if ( defined( 'ET_BUILDER_VERSION' ) )       $builders[] = 'Divi';
    if ( class_exists( 'WooCommerce' ) )         $builders[] = 'WooCommerce';
    if ( class_exists( 'WPBakeryVisualComposer') || class_exists('Vc_Manager') ) $builders[] = 'WPBakery';

    $info['builders'] = $builders;
    $info['woo']      = class_exists( 'WooCommerce' );

    return $info;
}

/**
 * Get SEO-relevant site data for the audit
 */
function wpts_get_site_audit_data() {
    global $wpdb;

    $data = [
        'site_url'     => get_site_url(),
        'site_name'    => get_bloginfo( 'name' ),
        'tagline'      => get_bloginfo( 'description' ),
        'theme'        => wpts_detect_theme(),
        'wp_version'   => get_bloginfo( 'version' ),
        'language'     => get_bloginfo( 'language' ),
        'timezone'     => get_option( 'timezone_string' ) ?: 'UTC',
        'permalink'    => get_option( 'permalink_structure' ),
        'posts_count'  => (int) wp_count_posts()->publish,
        'pages_count'  => (int) wp_count_posts('page')->publish,
        'comments'     => (int) wp_count_comments()->approved,
        'media_count'  => (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type='attachment'"),
        'users_count'  => (int) count_users()['total_users'],
        'plugins'      => wpts_get_active_plugins_list(),
        'ssl'          => is_ssl(),
        'home_title'   => get_bloginfo('name'),
        'home_meta'    => get_bloginfo('description'),
        'reading_set'  => [
            'front_page' => get_option('show_on_front'),
            'posts_page' => get_option('page_for_posts'),
        ],
    ];

    // Try to get homepage content
    $front_id = (int) get_option('page_on_front');
    if ( $front_id ) {
        $front = get_post( $front_id );
        $data['home_content_length'] = $front ? strlen( wp_strip_all_tags( $front->post_content ) ) : 0;
    }

    return $data;
}

function wpts_get_active_plugins_list() {
    $active = get_option('active_plugins', []);
    $list   = [];
    foreach ( array_slice( $active, 0, 20 ) as $plugin_path ) {
        $parts  = explode('/', $plugin_path);
        $list[] = $parts[0];
    }
    return $list;
}
