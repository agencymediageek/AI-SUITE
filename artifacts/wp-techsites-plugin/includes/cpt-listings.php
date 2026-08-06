<?php
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', 'wpts_register_cpts' );
function wpts_register_cpts() {

    // ── Listing CPT ──────────────────────────────────────────────────────────
    register_post_type( 'wpts_listing', [
        'labels' => [
            'name'               => 'Listings',
            'singular_name'      => 'Listing',
            'add_new'            => 'Adicionar Listing',
            'add_new_item'       => 'Adicionar Novo Listing',
            'edit_item'          => 'Editar Listing',
            'new_item'           => 'Novo Listing',
            'view_item'          => 'Ver Listing',
            'search_items'       => 'Buscar Listings',
            'not_found'          => 'Nenhum listing encontrado',
            'not_found_in_trash' => 'Nenhum listing na lixeira',
        ],
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_rest'       => true,
        'query_var'          => true,
        'rewrite'            => [ 'slug' => 'listing' ],
        'capability_type'    => 'post',
        'has_archive'        => 'listings',
        'hierarchical'       => false,
        'menu_position'      => 25,
        'menu_icon'          => 'dashicons-location-alt',
        'supports'           => [ 'title', 'editor', 'thumbnail', 'custom-fields', 'excerpt' ],
    ]);

    // ── Category taxonomy ────────────────────────────────────────────────────
    register_taxonomy( 'wpts_category', 'wpts_listing', [
        'labels' => [
            'name'              => 'Categorias',
            'singular_name'     => 'Categoria',
            'search_items'      => 'Buscar Categorias',
            'all_items'         => 'Todas as Categorias',
            'edit_item'         => 'Editar Categoria',
            'update_item'       => 'Atualizar Categoria',
            'add_new_item'      => 'Adicionar Categoria',
            'new_item_name'     => 'Nova Categoria',
            'menu_name'         => 'Categorias',
        ],
        'hierarchical'      => true,
        'show_ui'           => true,
        'show_in_rest'      => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => [ 'slug' => 'listing-category' ],
    ]);

    // ── City/Region taxonomy ─────────────────────────────────────────────────
    register_taxonomy( 'wpts_city', 'wpts_listing', [
        'labels' => [
            'name'          => 'Cidades / Regiões',
            'singular_name' => 'Cidade',
            'menu_name'     => 'Cidades',
        ],
        'hierarchical'      => true,
        'show_ui'           => true,
        'show_in_rest'      => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => [ 'slug' => 'listing-city' ],
    ]);
}

/**
 * Insert a listing from scraped data
 */
function wpts_insert_listing( $data ) {
    $post_id = wp_insert_post([
        'post_type'    => 'wpts_listing',
        'post_title'   => sanitize_text_field( $data['name'] ?? 'Sem nome' ),
        'post_content' => sanitize_textarea_field( $data['description'] ?? '' ),
        'post_status'  => 'publish',
        'post_excerpt' => sanitize_text_field( $data['summary'] ?? '' ),
    ]);

    if ( is_wp_error( $post_id ) ) return $post_id;

    $meta_map = [
        'wpts_address'   => 'address',
        'wpts_phone'     => 'phone',
        'wpts_website'   => 'website',
        'wpts_email'     => 'email',
        'wpts_hours'     => 'hours',
        'wpts_rating'    => 'rating',
        'wpts_reviews'   => 'review_count',
        'wpts_lat'       => 'lat',
        'wpts_lng'       => 'lng',
        'wpts_place_id'  => 'place_id',
        'wpts_photos'    => 'photos',
        'wpts_premium'   => 'is_premium',
        'wpts_price_tier'=> 'price_tier',
        'wpts_source'    => 'source',
        'wpts_imported'  => 'imported_at',
    ];

    foreach ( $meta_map as $meta_key => $data_key ) {
        if ( isset( $data[ $data_key ] ) ) {
            update_post_meta( $post_id, $meta_key, $data[ $data_key ] );
        }
    }

    // Assign category
    if ( ! empty( $data['category'] ) ) {
        wp_set_object_terms( $post_id, $data['category'], 'wpts_category' );
    }

    // Assign city
    if ( ! empty( $data['city'] ) ) {
        wp_set_object_terms( $post_id, $data['city'], 'wpts_city' );
    }

    // Featured image from URL
    if ( ! empty( $data['photo_url'] ) ) {
        wpts_set_listing_image( $post_id, $data['photo_url'] );
    }

    return $post_id;
}

// ── REST API routes ───────────────────────────────────────────────────────────
add_action( 'rest_api_init', 'wpts_register_rest_routes' );
function wpts_register_rest_routes() {
    // POST /wp-json/wp-techsites/v1/listings — create a wpts_listing
    register_rest_route( 'wp-techsites/v1', '/listings', [
        'methods'             => 'POST',
        'callback'            => 'wpts_rest_create_listing',
        'permission_callback' => 'wpts_rest_permission',
    ]);
    // POST /wp-json/wp-techsites/v1/add-to-menu — add a page/post to a nav menu
    register_rest_route( 'wp-techsites/v1', '/add-to-menu', [
        'methods'             => 'POST',
        'callback'            => 'wpts_rest_add_to_menu',
        'permission_callback' => 'wpts_rest_permission',
    ]);
}

function wpts_rest_permission( WP_REST_Request $request ): bool {
    $site_key = $request->get_header( 'x_wp_site_key' );
    if ( $site_key && $site_key === get_option( 'wpts_api_key' ) ) return true;
    return current_user_can( 'manage_options' );
}

function wpts_rest_create_listing( WP_REST_Request $request ) {
    $d = $request->get_json_params();
    $post_id = wpts_insert_listing([
        'name'         => sanitize_text_field( $d['title']        ?? '' ),
        'description'  => wp_kses_post(        $d['content']      ?? '' ),
        'summary'      => sanitize_text_field( $d['excerpt']      ?? '' ),
        'address'      => sanitize_text_field( $d['address']      ?? '' ),
        'phone'        => sanitize_text_field( $d['phone']        ?? '' ),
        'website'      => esc_url_raw(         $d['website']      ?? '' ),
        'email'        => sanitize_email(      $d['email']        ?? '' ),
        'rating'       => floatval(            $d['rating']       ?? 0 ),
        'review_count' => intval(              $d['review_count'] ?? 0 ),
        'hours'        => sanitize_textarea_field( $d['hours']    ?? '' ),
        'lat'          => floatval(            $d['lat']          ?? 0 ),
        'lng'          => floatval(            $d['lng']          ?? 0 ),
        'place_id'     => sanitize_text_field( $d['place_id']     ?? '' ),
        'category'     => sanitize_text_field( $d['category']     ?? '' ),
        'city'         => sanitize_text_field( $d['city']         ?? '' ),
        'source'       => sanitize_text_field( $d['source']       ?? 'api' ),
        'photo_url'    => esc_url_raw(         $d['photo_url']    ?? '' ),
        'is_premium'   => (bool) ( $d['is_premium'] ?? false ),
    ]);
    if ( is_wp_error( $post_id ) ) {
        return new WP_Error( 'insert_failed', $post_id->get_error_message(), [ 'status' => 500 ] );
    }
    return rest_ensure_response([
        'id'   => $post_id,
        'link' => get_permalink( $post_id ),
    ]);
}

function wpts_rest_add_to_menu( WP_REST_Request $request ) {
    $d       = $request->get_json_params();
    $page_id = intval( $d['page_id'] ?? 0 );
    $search  = sanitize_text_field( $d['menu'] ?? '' );
    if ( ! $page_id ) return new WP_Error( 'missing_page_id', 'page_id required', [ 'status' => 400 ] );

    $menus = wp_get_nav_menus();
    if ( empty( $menus ) ) return new WP_Error( 'no_menus', 'No nav menus found', [ 'status' => 404 ] );

    $menu = null;
    foreach ( $menus as $m ) {
        if ( ! $search || stripos( $m->name, $search ) !== false ) { $menu = $m; break; }
    }
    if ( ! $menu ) $menu = $menus[0];

    $item_id = wp_update_nav_menu_item( $menu->term_id, 0, [
        'menu-item-object-id' => $page_id,
        'menu-item-object'    => get_post_type( $page_id ) ?: 'page',
        'menu-item-type'      => 'post_type',
        'menu-item-status'    => 'publish',
        'menu-item-title'     => get_the_title( $page_id ),
    ]);
    if ( is_wp_error( $item_id ) ) {
        return new WP_Error( 'menu_failed', $item_id->get_error_message(), [ 'status' => 500 ] );
    }
    return rest_ensure_response([ 'item_id' => $item_id, 'menu' => $menu->name ]);
}

// ── Shortcode [wpts_directory] ────────────────────────────────────────────────
add_shortcode( 'wpts_directory', 'wpts_directory_shortcode' );
function wpts_directory_shortcode( $atts ): string {
    $atts = shortcode_atts([
        'category' => '',
        'city'     => '',
        'limit'    => 24,
        'columns'  => 3,
    ], $atts, 'wpts_directory' );

    $args = [
        'post_type'      => 'wpts_listing',
        'post_status'    => 'publish',
        'posts_per_page' => max( 1, intval( $atts['limit'] ) ),
        'orderby'        => 'date',
        'order'          => 'DESC',
    ];
    if ( $atts['category'] ) {
        $args['tax_query'] = [[ 'taxonomy' => 'wpts_category', 'field' => 'slug', 'terms' => explode( ',', $atts['category'] ) ]];
    }
    if ( $atts['city'] ) {
        $city_tax = [ 'taxonomy' => 'wpts_city', 'field' => 'slug', 'terms' => explode( ',', $atts['city'] ) ];
        $args['tax_query'] = isset( $args['tax_query'] ) ? [ 'relation' => 'AND', $args['tax_query'][0], $city_tax ] : [ $city_tax ];
    }

    $query = new WP_Query( $args );
    $cols  = max( 1, min( 4, intval( $atts['columns'] ) ) );

    ob_start(); ?>
<style>
.wpts-dir-wrap{padding:16px 0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.wpts-dir-grid{display:grid;grid-template-columns:repeat(<?php echo $cols; ?>,1fr);gap:24px}
@media(max-width:900px){.wpts-dir-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.wpts-dir-grid{grid-template-columns:1fr}}
.wpts-card{background:#fff;border-radius:14px;box-shadow:0 2px 16px rgba(0,0,0,.07);overflow:hidden;display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s}
.wpts-card:hover{transform:translateY(-5px);box-shadow:0 10px 30px rgba(0,0,0,.13)}
.wpts-card-img{width:100%;height:190px;object-fit:cover;display:block}
.wpts-card-img-ph{width:100%;height:190px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:52px}
.wpts-card-body{padding:16px;flex:1;display:flex;flex-direction:column;gap:6px}
.wpts-card-cat{font-size:11px;font-weight:700;background:#ede9fe;color:#7c3aed;border-radius:20px;padding:3px 10px;display:inline-block;width:fit-content;text-transform:uppercase;letter-spacing:.5px}
.wpts-card-title{font-size:16px;font-weight:700;color:#0f172a;margin:4px 0 0;line-height:1.3}
.wpts-card-rating{color:#f59e0b;font-size:13px;font-weight:700;display:flex;align-items:center;gap:4px}
.wpts-card-rating small{color:#94a3b8;font-weight:400}
.wpts-card-meta{font-size:12px;color:#64748b;display:flex;flex-direction:column;gap:3px;margin-top:4px}
.wpts-card-desc{font-size:12px;color:#64748b;line-height:1.5;margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.wpts-card-cta{margin-top:auto;padding-top:14px;display:flex;gap:8px;flex-wrap:wrap}
.wpts-card-cta a{flex:1;min-width:80px;text-align:center;padding:9px 6px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;transition:opacity .2s}
.wpts-card-cta a:hover{opacity:.85}
.wpts-btn-primary{background:#6366f1;color:#fff !important}
.wpts-btn-secondary{background:#f1f5f9;color:#475569 !important}
.wpts-dir-empty{text-align:center;padding:60px 24px;color:#94a3b8}
.wpts-dir-empty-icon{font-size:56px;display:block;margin-bottom:12px}
.wpts-dir-empty p{font-size:15px;margin:0}
</style>
<div class="wpts-dir-wrap">
<?php if ( ! $query->have_posts() ) : ?>
<div class="wpts-dir-empty">
    <span class="wpts-dir-empty-icon">📋</span>
    <p>Nenhum listing encontrado.<br>Use <strong>Popular Diretório em Massa</strong> no painel WP TechSites para importar estabelecimentos.</p>
</div>
<?php else : ?>
<div class="wpts-dir-grid">
<?php while ( $query->have_posts() ) : $query->the_post();
    $id       = get_the_ID();
    $address  = get_post_meta( $id, 'wpts_address',  true );
    $phone    = get_post_meta( $id, 'wpts_phone',    true );
    $website  = get_post_meta( $id, 'wpts_website',  true );
    $rating   = get_post_meta( $id, 'wpts_rating',   true );
    $reviews  = get_post_meta( $id, 'wpts_reviews',  true );
    $thumb    = get_the_post_thumbnail_url( $id, 'medium_large' );
    $cats     = get_the_terms( $id, 'wpts_category' );
    $cat_name = ( $cats && ! is_wp_error( $cats ) ) ? $cats[0]->name : '';
    $excerpt  = get_the_excerpt();
    $link     = get_permalink();
?>
<div class="wpts-card">
    <?php if ( $thumb ) : ?>
    <img class="wpts-card-img" src="<?php echo esc_url( $thumb ); ?>" alt="<?php the_title_attribute(); ?>" loading="lazy">
    <?php else : ?>
    <div class="wpts-card-img-ph"><?php echo $cat_name ? '🏢' : '📍'; ?></div>
    <?php endif; ?>
    <div class="wpts-card-body">
        <?php if ( $cat_name ) : ?><span class="wpts-card-cat"><?php echo esc_html( $cat_name ); ?></span><?php endif; ?>
        <h3 class="wpts-card-title"><?php the_title(); ?></h3>
        <?php if ( $rating ) : ?>
        <div class="wpts-card-rating">★ <?php echo esc_html( number_format( floatval($rating), 1 ) ); ?><small>(<?php echo esc_html( $reviews ?: 0 ); ?> avaliações)</small></div>
        <?php endif; ?>
        <div class="wpts-card-meta">
            <?php if ( $address ) echo '<span>📍 ' . esc_html( $address ) . '</span>'; ?>
            <?php if ( $phone   ) echo '<span>📞 ' . esc_html( $phone   ) . '</span>'; ?>
        </div>
        <?php if ( $excerpt ) : ?><p class="wpts-card-desc"><?php echo esc_html( $excerpt ); ?></p><?php endif; ?>
        <div class="wpts-card-cta">
            <a class="wpts-btn-primary" href="<?php echo esc_url( $link ); ?>">Ver Detalhes →</a>
            <?php if ( $website ) : ?><a class="wpts-btn-secondary" href="<?php echo esc_url( $website ); ?>" target="_blank" rel="noopener">Site 🌐</a><?php endif; ?>
        </div>
    </div>
</div>
<?php endwhile; wp_reset_postdata(); ?>
</div>
<?php endif; ?>
</div>
<?php
    return ob_get_clean();
}

function wpts_set_listing_image( $post_id, $url ) {
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    $tmp  = download_url( $url );
    if ( is_wp_error( $tmp ) ) return;

    $file = [
        'name'     => basename( parse_url( $url, PHP_URL_PATH ) ) ?: 'listing.jpg',
        'tmp_name' => $tmp,
    ];
    $attach_id = media_handle_sideload( $file, $post_id );
    if ( ! is_wp_error( $attach_id ) ) {
        set_post_thumbnail( $post_id, $attach_id );
    }
    @unlink( $tmp );
}
