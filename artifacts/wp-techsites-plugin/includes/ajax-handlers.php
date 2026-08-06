<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// ─── Helper ───────────────────────────────────────────────────────────────────
function wpts_ajax_check() {
    if ( ! check_ajax_referer( 'wpts_ajax', 'nonce', false ) ) {
        wp_send_json_error( 'Nonce inválido.', 403 ); die;
    }
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Permissão negada.', 403 ); die;
    }
}

function wpts_call_api( $endpoint, $body, $timeout = 90 ) {
    $key = get_option( 'wpts_api_key', '' );
    $res = wp_remote_post( WPTS_API_BASE . $endpoint, [
        'timeout' => $timeout,
        'headers' => [ 'Content-Type' => 'application/json', 'X-WP-Site-Key' => $key ],
        'body'    => wp_json_encode( $body ),
    ]);
    if ( is_wp_error( $res ) ) return [ 'error' => $res->get_error_message() ];
    return json_decode( wp_remote_retrieve_body( $res ), true ) ?? [ 'error' => 'Resposta inválida' ];
}

// ─── Save Settings ────────────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_save_settings', function () {
    wpts_ajax_check();
    update_option( 'wpts_api_key', sanitize_text_field( $_POST['api_key'] ?? '' ) );
    wp_send_json_success( 'Configurações salvas.' );
});

// ─── Connect WordPress REST API ───────────────────────────────────────────────
add_action( 'wp_ajax_wpts_connect_rest', function () {
    wpts_ajax_check();
    $wp_user     = sanitize_text_field( $_POST['wp_user'] ?? '' );
    $wp_pass     = $_POST['wp_app_password'] ?? '';       // Application Password — don't sanitize
    $wp_rest_url = esc_url_raw( $_POST['wp_rest_url'] ?? ( get_site_url() . '/wp-json' ) );

    if ( ! $wp_user || ! $wp_pass ) {
        wp_send_json_error( 'Usuário e senha de aplicação são obrigatórios.' );
        return;
    }

    $result = wpts_call_api( '/connect-rest', [
        'wp_user'        => $wp_user,
        'wp_app_password'=> $wp_pass,
        'wp_rest_url'    => $wp_rest_url,
    ]);

    if ( ! empty( $result['error'] ) ) {
        wp_send_json_error( $result['error'] );
        return;
    }

    update_option( 'wpts_wp_user',          $wp_user );
    update_option( 'wpts_wp_rest_url',      $wp_rest_url );
    update_option( 'wpts_wp_rest_connected', 1 );
    wp_send_json_success( $result );
});

// ─── Disconnect REST API ──────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_disconnect_rest', function () {
    wpts_ajax_check();
    update_option( 'wpts_wp_user', '' );
    update_option( 'wpts_wp_rest_url', '' );
    update_option( 'wpts_wp_rest_connected', 0 );
    wp_send_json_success( 'Desconectado.' );
});

// ─── SEO Audit ────────────────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_run_audit', function () {
    wpts_ajax_check();
    // Zera a flag ANTES da chamada API — garante que não fica em loop mesmo se a chamada falhar
    update_option( 'wpts_audit_pending', 0 );
    try {
        $site_data = wpts_get_site_audit_data();
        $result    = wpts_call_api( '/audit/seo', $site_data );
        if ( ! empty( $result['error'] ) ) {
            $result = wpts_local_seo_audit( $site_data );
        }
        update_option( 'wpts_last_audit',      $result );
        update_option( 'wpts_last_audit_date', current_time('mysql') );
        wp_send_json_success( $result );
    } catch ( \Exception $e ) {
        // Fallback local em caso de exceção — nunca retorna erro vazio que trava o JS
        $result = wpts_local_seo_audit( wpts_get_site_audit_data() );
        update_option( 'wpts_last_audit',      $result );
        update_option( 'wpts_last_audit_date', current_time('mysql') );
        wp_send_json_success( $result );
    }
});

function wpts_local_seo_audit( $data ) {
    $score  = 0;
    $checks = [];

    // SSL
    $checks[] = [ 'label' => 'HTTPS / SSL', 'status' => $data['ssl'] ? 'ok' : 'fail', 'detail' => $data['ssl'] ? 'Site usa HTTPS ✓' : 'Site não usa SSL — crítico para SEO' ];
    if ( $data['ssl'] ) $score += 10;

    // Tagline
    $checks[] = [ 'label' => 'Tagline / Meta Description', 'status' => ! empty( $data['tagline'] ) ? 'ok' : 'warn', 'detail' => ! empty( $data['tagline'] ) ? $data['tagline'] : 'Tagline vazia — configure em Configurações → Geral' ];
    if ( ! empty( $data['tagline'] ) ) $score += 8;

    // Permalink
    $good_permalink = ! empty( $data['permalink'] ) && $data['permalink'] !== '/?p=%postname%';
    $checks[] = [ 'label' => 'Estrutura de URLs', 'status' => $good_permalink ? 'ok' : 'warn', 'detail' => $good_permalink ? 'URLs amigáveis ativadas ✓' : 'Use /%postname%/ para melhor SEO' ];
    if ( $good_permalink ) $score += 8;

    // Content
    $checks[] = [ 'label' => 'Volume de Conteúdo', 'status' => $data['posts_count'] >= 10 ? 'ok' : 'warn', 'detail' => "{$data['posts_count']} posts publicados" . ( $data['posts_count'] < 10 ? ' — publique mais conteúdo' : ' ✓' ) ];
    if ( $data['posts_count'] >= 10 ) $score += 10;

    // Pages
    $checks[] = [ 'label' => 'Páginas Essenciais', 'status' => $data['pages_count'] >= 3 ? 'ok' : 'warn', 'detail' => "{$data['pages_count']} páginas criadas" ];
    if ( $data['pages_count'] >= 3 ) $score += 5;

    // WooCommerce
    $has_woo = in_array( 'woocommerce', $data['plugins'] );
    $checks[] = [ 'label' => 'WooCommerce', 'status' => $has_woo ? 'ok' : 'info', 'detail' => $has_woo ? 'WooCommerce ativo — habilite Schema de Produtos' : 'Não detectado — necessário para e-commerce' ];
    if ( $has_woo ) $score += 5;

    // Yoast / RankMath
    $has_seo_plugin = in_array( 'wordpress-seo', $data['plugins'] ) || in_array( 'seo-by-rank-math', $data['plugins'] );
    $checks[] = [ 'label' => 'Plugin SEO', 'status' => $has_seo_plugin ? 'ok' : 'fail', 'detail' => $has_seo_plugin ? 'Plugin SEO detectado ✓' : 'Instale Yoast SEO ou Rank Math — essencial' ];
    if ( $has_seo_plugin ) $score += 15;

    // Theme
    $theme = $data['theme'];
    $checks[] = [ 'label' => 'Tema Detectado', 'status' => 'info', 'detail' => "{$theme['icon']} {$theme['label']} — tipo: {$theme['type']}" ];
    $score += 10;

    // Language
    $pt_es = strpos( $data['language'], 'pt' ) !== false || strpos( $data['language'], 'es' ) !== false;
    $checks[] = [ 'label' => 'Idioma Configurado', 'status' => 'ok', 'detail' => "Idioma: {$data['language']}" ];
    $score += 5;

    $max   = 76;
    $pct   = min( 100, round( ( $score / $max ) * 100 ) );
    $grade = $pct >= 80 ? 'A' : ( $pct >= 60 ? 'B' : ( $pct >= 40 ? 'C' : 'D' ) );

    $recs = [];
    foreach ( $checks as $c ) {
        if ( $c['status'] === 'fail' ) $recs[] = '🔴 ' . $c['label'] . ': ' . $c['detail'];
        elseif ( $c['status'] === 'warn' ) $recs[] = '🟡 ' . $c['label'] . ': ' . $c['detail'];
    }

    return [
        'score'           => $pct,
        'grade'           => $grade,
        'checks'          => $checks,
        'recommendations' => $recs,
        'summary'         => "Seu site '{$data['site_name']}' obteve nota $grade ($pct/100) na auditoria SEO. " . count( array_filter( $checks, fn($c) => $c['status'] === 'fail' ) ) . " problemas críticos encontrados.",
        'site_name'       => $data['site_name'],
        'theme'           => $theme,
        'generated_at'    => current_time('mysql'),
    ];
}

// ─── Content AI ───────────────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_generate_content', function () {
    @set_time_limit( 120 );
    wpts_ajax_check();
    $type    = sanitize_text_field( $_POST['type']    ?? 'post' );
    $topic   = sanitize_text_field( $_POST['topic']   ?? '' );
    $tone    = sanitize_text_field( $_POST['tone']    ?? 'professional' );
    $length  = sanitize_text_field( $_POST['length']  ?? 'medium' );
    $lang    = sanitize_text_field( $_POST['lang']    ?? 'pt-BR' );
    $result  = wpts_call_api( '/generate-content', compact('type','topic','tone','length','lang'), 90 );
    if ( ! empty( $result['error'] ) ) { wp_send_json_error( $result['error'] ); return; }
    wp_send_json_success( $result );
});

// ─── Publish generated content ────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_publish_content', function () {
    wpts_ajax_check();
    $title   = sanitize_text_field( $_POST['title']   ?? '' );
    $content = wp_kses_post( $_POST['content'] ?? '' );
    $type    = sanitize_text_field( $_POST['post_type'] ?? 'post' );
    $post_id = wp_insert_post([
        'post_title'   => $title,
        'post_content' => $content,
        'post_status'  => 'draft',
        'post_type'    => $type,
    ]);
    if ( is_wp_error( $post_id ) ) wp_send_json_error( $post_id->get_error_message() );
    wp_send_json_success( [ 'post_id' => $post_id, 'edit_url' => get_edit_post_link( $post_id, 'url' ) ] );
});

// ─── Branding / Colors ────────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_generate_colors', function () {
    @set_time_limit( 120 );
    wpts_ajax_check();
    $niche  = sanitize_text_field( $_POST['niche']  ?? '' );
    $style  = sanitize_text_field( $_POST['style']  ?? 'modern' );
    $result = wpts_call_api( '/generate-colors', compact('niche','style'), 90 );
    if ( ! empty( $result['error'] ) ) { wp_send_json_error( $result['error'] ); return; }
    wp_send_json_success( $result );
});

add_action( 'wp_ajax_wpts_apply_colors', function () {
    wpts_ajax_check();
    $primary   = sanitize_hex_color( $_POST['primary']   ?? '' );
    $secondary = sanitize_hex_color( $_POST['secondary'] ?? '' );
    $css = ":root { --wpts-primary: {$primary}; --wpts-secondary: {$secondary}; }\na { color: {$primary}; }\n.wpts-btn, button[type=submit] { background: {$primary} !important; }";
    wp_update_custom_css_post( $css );
    wp_send_json_success( 'Cores aplicadas.' );
});

// ─── Menu Builder ─────────────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_generate_menu', function () {
    @set_time_limit( 120 );
    wpts_ajax_check();
    $niche    = sanitize_text_field( $_POST['niche']    ?? '' );
    $language = sanitize_text_field( $_POST['language'] ?? 'pt-BR' );
    $result   = wpts_call_api( '/generate-menu', compact('niche','language'), 90 );
    if ( ! empty( $result['error'] ) ) { wp_send_json_error( $result['error'] ); return; }
    wp_send_json_success( $result );
});

add_action( 'wp_ajax_wpts_apply_menu', function () {
    wpts_ajax_check();
    $items = json_decode( wp_unslash( $_POST['items'] ?? '[]' ), true );
    $menu_name = 'Menu WP TechSites';
    $menu_id   = wp_get_nav_menu_object( $menu_name );
    if ( ! $menu_id ) $menu_id = wp_create_nav_menu( $menu_name );
    else               $menu_id = $menu_id->term_id;

    foreach ( wp_get_nav_menu_items( $menu_id ) ?: [] as $item ) {
        wp_delete_post( $item->ID, true );
    }
    foreach ( $items as $item ) {
        wp_update_nav_menu_item( $menu_id, 0, [
            'menu-item-title'  => sanitize_text_field( $item['label'] ),
            'menu-item-url'    => esc_url( home_url( '/' . $item['slug'] ) ),
            'menu-item-status' => 'publish',
        ]);
    }
    $locations = get_theme_mod( 'nav_menu_locations' ) ?: [];
    if ( ! empty( $locations ) ) {
        $locations[ array_key_first( $locations ) ] = $menu_id;
        set_theme_mod( 'nav_menu_locations', $locations );
    }
    wp_send_json_success( [ 'menu_id' => $menu_id ] );
});

// ─── Logo AI ─────────────────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_generate_logo', function () {
    @set_time_limit( 120 );
    wpts_ajax_check();
    $brand_name = sanitize_text_field( $_POST['brand_name'] ?? get_bloginfo('name') );
    $style      = sanitize_text_field( $_POST['style']      ?? 'modern minimalist' );
    $colors     = sanitize_text_field( $_POST['colors']     ?? 'blue and white' );
    $result     = wpts_call_api( '/generate-logo', compact('brand_name','style','colors'), 90 );
    if ( ! empty( $result['error'] ) ) { wp_send_json_error( $result['error'] ); return; }
    wp_send_json_success( $result );
});

// ─── Scraping ─────────────────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_run_scraping', function () {
    wpts_ajax_check();
    $category = sanitize_text_field( $_POST['category'] ?? '' );
    $city     = sanitize_text_field( $_POST['city']     ?? '' );
    $limit    = min( 100, absint( $_POST['limit'] ?? 20 ) );
    $save_to  = sanitize_text_field( $_POST['save_to']  ?? 'wp' );
    $result   = wpts_call_api( '/scraping/run', compact('category','city','limit','save_to') );
    if ( ! empty( $result['listings'] ) && $save_to === 'wp' ) {
        $inserted = 0;
        foreach ( $result['listings'] as $listing ) {
            $listing['city']     = $city;
            $listing['category'] = $category;
            $listing['source']   = 'brightdata';
            $listing['imported_at'] = current_time('mysql');
            $id = wpts_insert_listing( $listing );
            if ( ! is_wp_error( $id ) ) $inserted++;
        }
        $result['inserted'] = $inserted;
    }
    if ( ! empty( $result['error'] ) ) { wp_send_json_error( $result['error'] ); return; }
    wp_send_json_success( $result );
});

// ─── Directory Builder ────────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_create_directory', function () {
    wpts_ajax_check();
    $config = [
        'title'      => sanitize_text_field( $_POST['title']      ?? 'Diretório' ),
        'categories' => array_map( 'sanitize_text_field', explode(',', $_POST['categories'] ?? '') ),
        'city'       => sanitize_text_field( $_POST['city']       ?? '' ),
        'premium'    => (bool) ( $_POST['premium'] ?? false ),
    ];
    // Create archive page
    $page_id = wp_insert_post([
        'post_title'   => $config['title'],
        'post_content' => '[wpts_directory]',
        'post_status'  => 'publish',
        'post_type'    => 'page',
    ]);
    // Save config
    update_option( 'wpts_directory_config', $config );
    update_option( 'wpts_directory_page',   $page_id );

    // Create category taxonomy terms so Popular Diretório can assign them
    foreach ( $config['categories'] as $cat_name ) {
        $cat_name = trim( $cat_name );
        if ( $cat_name && ! get_term_by( 'name', $cat_name, 'wpts_category' ) ) {
            wp_insert_term( $cat_name, 'wpts_category' );
        }
    }
    // Create city term if provided
    if ( ! empty( $config['city'] ) && ! get_term_by( 'name', $config['city'], 'wpts_city' ) ) {
        wp_insert_term( $config['city'], 'wpts_city' );
    }

    flush_rewrite_rules();
    wp_send_json_success([
        'page_id'   => $page_id,
        'page_url'  => get_permalink( $page_id ),
        'edit_url'  => get_edit_post_link( $page_id, 'url' ),
        'config'    => $config,
    ]);
});

// ─── SEO Articles Schedule (Cron) ────────────────────────────────────────────
add_action( 'wp_ajax_wpts_save_seo_schedule', function () {
    wpts_ajax_check();
    $raw = [
        'active'     => (bool)( $_POST['active']     ?? false ),
        'keyword'    => sanitize_text_field( $_POST['keyword']    ?? '' ),
        'category'   => sanitize_text_field( $_POST['category']   ?? '' ),
        'quantity'   => max( 1, min( 3, intval( $_POST['quantity']   ?? 1 ) ) ),
        'word_count' => max( 300, min( 2000, intval( $_POST['word_count'] ?? 800 ) ) ),
        'min_days'   => max( 1, min( 30,  intval( $_POST['min_days']  ?? 2 ) ) ),
        'max_days'   => max( 1, min( 30,  intval( $_POST['max_days']  ?? 7 ) ) ),
        'hour_min'   => max( 0, min( 23,  intval( $_POST['hour_min']  ?? 8 ) ) ),
        'hour_max'   => max( 0, min( 23,  intval( $_POST['hour_max']  ?? 20) ) ),
        'week_days'  => max( 1, intval( $_POST['week_days'] ?? 31 ) ),
    ];
    update_option( 'wpts_seo_schedule', $raw );

    // Clear any existing job
    $existing = wp_next_scheduled( 'wpts_cron_article_job' );
    if ( $existing ) wp_unschedule_event( $existing, 'wpts_cron_article_job' );

    $next_ts = null;
    if ( $raw['active'] && $raw['keyword'] ) {
        $next_ts = wpts_next_cron_time( $raw );
        if ( $next_ts ) wp_schedule_single_event( $next_ts, 'wpts_cron_article_job' );
    }

    wp_send_json_success([
        'active'   => $raw['active'],
        'next_run' => $next_ts ? wp_date( 'd/m/Y \à\s H:i', $next_ts ) : null,
        'message'  => $raw['active']
            ? 'Automação ativada! Próxima publicação: ' . ( $next_ts ? wp_date( 'd/m/Y \à\s H:i', $next_ts ) : '—' )
            : 'Automação pausada.',
    ]);
});

add_action( 'wp_ajax_wpts_get_seo_status', function () {
    wpts_ajax_check();
    $schedule = (array) get_option( 'wpts_seo_schedule', [] );
    $log      = array_reverse( (array) get_option( 'wpts_seo_log', [] ) );
    $next_ts  = wp_next_scheduled( 'wpts_cron_article_job' );
    wp_send_json_success([
        'schedule' => $schedule,
        'next_run' => $next_ts ? wp_date( 'd/m/Y \à\s H:i', $next_ts ) : null,
        'log'      => array_slice( $log, 0, 10 ),
    ]);
});

// ─── Chatbot Settings ─────────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_save_chatbot', function () {
    wpts_ajax_check();
    update_option( 'wpts_chatbot_enabled', sanitize_text_field( $_POST['enabled'] ?? '0' ) );
    update_option( 'wpts_chatbot_name',    sanitize_text_field( $_POST['name']    ?? 'Assistente' ) );
    update_option( 'wpts_chatbot_color',   sanitize_hex_color(  $_POST['color']   ?? '#6366f1' ) );
    update_option( 'wpts_chatbot_prompt',  sanitize_textarea_field( $_POST['prompt'] ?? '' ) );
    wp_send_json_success( 'Chatbot atualizado.' );
});

// ─── Chat Editor ──────────────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_chat_edit', function () {
    @set_time_limit( 120 );
    wpts_ajax_check();
    $command = sanitize_textarea_field( $_POST['command'] ?? '' );
    $context = sanitize_text_field(     $_POST['context'] ?? '' );
    $result  = wpts_call_api( '/chat-editor', [ 'command' => $command, 'context' => $context, 'site_url' => get_site_url() ], 90 );
    if ( ! empty( $result['actions'] ) ) {
        foreach ( $result['actions'] as $action ) {
            wpts_apply_chat_action( $action );
        }
    }
    if ( ! empty( $result['error'] ) ) { wp_send_json_error( $result['error'] ); return; }
    wp_send_json_success( $result );
});

function wpts_apply_chat_action( $action ) {
    $type = $action['type'] ?? '';
    switch ( $type ) {
        case 'update_post_title':
            wp_update_post([ 'ID' => (int)$action['post_id'], 'post_title' => sanitize_text_field($action['value']) ]);
            break;
        case 'update_post_content':
            wp_update_post([ 'ID' => (int)$action['post_id'], 'post_content' => wp_kses_post($action['value']) ]);
            break;
        case 'update_option':
            update_option( sanitize_key($action['option']), sanitize_text_field($action['value']) );
            break;
        case 'update_tagline':
            update_option( 'blogdescription', sanitize_text_field($action['value']) );
            break;
        case 'update_site_title':
            update_option( 'blogname', sanitize_text_field($action['value']) );
            break;
        case 'create_post':
            wp_insert_post([
                'post_title'   => sanitize_text_field($action['value'] ?? 'Novo Post'),
                'post_content' => wp_kses_post($action['content'] ?? ''),
                'post_status'  => 'publish',
                'post_type'    => 'post',
            ]);
            break;
        case 'create_listing':
            $listing_data = [
                'name'        => $action['value'] ?? ($action['title'] ?? 'Listing'),
                'description' => $action['content'] ?? '',
                'address'     => $action['address'] ?? '',
                'phone'       => $action['phone'] ?? '',
                'website'     => $action['website'] ?? '',
                'rating'      => $action['rating'] ?? null,
                'category'    => $action['category'] ?? '',
                'city'        => $action['city'] ?? '',
                'source'      => 'chat-editor',
            ];
            wpts_insert_listing( $listing_data );
            break;
        case 'create_directory_page':
            $page_id = wp_insert_post([
                'post_title'   => sanitize_text_field($action['value'] ?? 'Diretório'),
                'post_content' => '[wpts_directory]',
                'post_status'  => 'publish',
                'post_type'    => 'page',
            ]);
            update_option( 'wpts_directory_page', $page_id );
            flush_rewrite_rules();
            break;
    }
}

// ─── Popular Diretório em Massa ───────────────────────────────────────────────
add_action( 'wp_ajax_wpts_populate_directory', function () {
    wpts_ajax_check();
    $city       = sanitize_text_field( $_POST['city']       ?? 'Curitiba' );
    $cats_json  = sanitize_text_field( $_POST['categories'] ?? '["restaurantes"]' );
    $categories = json_decode( $cats_json, true ) ?: ['restaurantes'];
    $count      = max(1, min(30, intval( $_POST['count_per_category'] ?? 10 )));

    $result = wpts_call_api( '/populate-directory', [
        'city'               => $city,
        'categories'         => $categories,
        'count_per_category' => $count,
        'save_to'            => 'wp',
    ]);

    if ( ! empty( $result['error'] ) ) {
        wp_send_json_error( $result );
        return;
    }
    // Update local credits cache
    if ( isset( $result['credits_remaining'] ) ) {
        update_option( 'wpts_credits', $result['credits_remaining'] );
    }
    wp_send_json_success( $result );
});

// ─── Página de Empresa a partir de URL ───────────────────────────────────────
add_action( 'wp_ajax_wpts_page_from_url', function () {
    @set_time_limit( 180 );
    wpts_ajax_check();
    // Use sanitize_text_field instead of esc_url_raw — esc_url_raw can empty valid URLs
    // (e.g. URLs with special chars or missing scheme), causing false "URL is required" errors.
    $url = sanitize_text_field( wp_unslash( $_POST['url'] ?? '' ) );
    // Auto-prepend https:// if missing (mirrors the JS-side fix)
    if ( $url && ! preg_match( '/^https?:\/\//i', $url ) ) {
        $url = 'https://' . $url;
    }
    $page_type = sanitize_text_field( $_POST['page_type'] ?? 'empresa' );
    $publish   = ! empty( $_POST['publish'] );

    if ( ! $url ) { wp_send_json_error( 'URL é obrigatória.' ); return; }

    $result = wpts_call_api( '/page-from-url', [
        'url'       => $url,
        'page_type' => $page_type,
        'publish'   => $publish,
    ], 120 );

    if ( ! empty( $result['error'] ) ) { wp_send_json_error( $result ); return; }
    if ( isset( $result['credits_remaining'] ) ) update_option( 'wpts_credits', $result['credits_remaining'] );
    wp_send_json_success( $result );
});

// ─── Artigo SEO com Imagens ───────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_article_with_images', function () {
    // Aumenta o tempo limite do PHP para esta requisição — geração de artigo leva ~30-60s
    @set_time_limit( 180 );
    wpts_ajax_check();
    $topic      = sanitize_text_field( $_POST['topic']      ?? '' );
    $city       = sanitize_text_field( $_POST['city']       ?? '' );
    $category   = sanitize_text_field( $_POST['category']   ?? '' );
    $tone       = sanitize_text_field( $_POST['tone']       ?? 'professional' );
    $word_count = max(200, min(1200, intval( $_POST['word_count'] ?? 600 )));
    $publish    = ! empty( $_POST['publish'] );

    if ( ! $topic ) { wp_send_json_error( 'Tópico é obrigatório.' ); return; }

    // timeout 150s para suportar geração de artigo longo via IA
    $result = wpts_call_api( '/article-with-images', [
        'topic'      => $topic,
        'city'       => $city,
        'category'   => $category,
        'tone'       => $tone,
        'word_count' => $word_count,
        'publish'    => $publish,
    ], 150 );

    if ( ! empty( $result['error'] ) ) { wp_send_json_error( $result['error'] ); return; }
    if ( isset( $result['credits_remaining'] ) ) update_option( 'wpts_credits', $result['credits_remaining'] );
    wp_send_json_success( $result );
});

// ─── Shortcode: [wpts_directory] ─────────────────────────────────────────────
add_shortcode( 'wpts_directory', function ( $atts ) {
    $atts = shortcode_atts([ 'city' => '', 'category' => '', 'limit' => 20 ], $atts );
    $args = [
        'post_type'      => 'wpts_listing',
        'posts_per_page' => (int) $atts['limit'],
        'post_status'    => 'publish',
    ];
    $tax_query = [];
    if ( $atts['city'] )     $tax_query[] = [ 'taxonomy' => 'wpts_city',     'field' => 'slug', 'terms' => $atts['city'] ];
    if ( $atts['category'] ) $tax_query[] = [ 'taxonomy' => 'wpts_category', 'field' => 'slug', 'terms' => $atts['category'] ];
    if ( $tax_query ) $args['tax_query'] = $tax_query;

    $posts = get_posts( $args );
    ob_start(); ?>
    <div class="wpts-directory-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;padding:20px 0">
    <?php foreach ( $posts as $post ) :
        $address = get_post_meta( $post->ID, 'wpts_address', true );
        $phone   = get_post_meta( $post->ID, 'wpts_phone',   true );
        $rating  = get_post_meta( $post->ID, 'wpts_rating',  true );
        $premium = get_post_meta( $post->ID, 'wpts_premium', true ); ?>
        <div class="wpts-listing-card" style="background:#fff;border:1px solid <?php echo $premium ? '#6366f1' : '#e5e7eb'; ?>;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.07)">
            <?php if ( has_post_thumbnail( $post ) ) : ?>
            <div style="height:160px;overflow:hidden"><?php echo get_the_post_thumbnail( $post, 'medium', ['style' => 'width:100%;height:100%;object-fit:cover'] ); ?></div>
            <?php endif; ?>
            <div style="padding:16px">
                <?php if ( $premium ) : ?><span style="background:#6366f1;color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600">⭐ PREMIUM</span><?php endif; ?>
                <h3 style="margin:8px 0 6px;font-size:16px"><?php echo esc_html( $post->post_title ); ?></h3>
                <?php if ( $address ) : ?><p style="margin:0 0 4px;color:#6b7280;font-size:13px">📍 <?php echo esc_html($address); ?></p><?php endif; ?>
                <?php if ( $phone )   : ?><p style="margin:0 0 4px;font-size:13px">📞 <a href="tel:<?php echo esc_attr($phone); ?>"><?php echo esc_html($phone); ?></a></p><?php endif; ?>
                <?php if ( $rating )  : ?><p style="margin:0;font-size:13px;color:#f59e0b">★ <?php echo esc_html($rating); ?></p><?php endif; ?>
                <a href="<?php echo get_permalink( $post ); ?>" style="display:inline-block;margin-top:10px;padding:6px 14px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none;font-size:13px">Ver detalhes →</a>
            </div>
        </div>
    <?php endforeach; ?>
    </div>
    <?php return ob_get_clean();
});
