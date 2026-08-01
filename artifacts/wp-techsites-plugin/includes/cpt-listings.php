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
