<?php
/**
 * Handles incoming webhooks from the AI Suite app.
 * POST /wp-json/ai-suite/v1/deduct-tokens  — deduct tokens after AI generation
 * POST /wp-json/ai-suite/v1/sync-user      — sync token balance from API
 */
class AISuite_Webhook {

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes(): void {
        register_rest_route( 'ai-suite/v1', '/deduct-tokens', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'deduct_tokens' ],
            'permission_callback' => [ $this, 'verify_api_key' ],
        ] );

        register_rest_route( 'ai-suite/v1', '/sync-user', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'sync_user' ],
            'permission_callback' => [ $this, 'verify_api_key' ],
        ] );

        register_rest_route( 'ai-suite/v1', '/token-balance', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_balance' ],
            'permission_callback' => [ $this, 'verify_api_key' ],
        ] );
    }

    public function verify_api_key( WP_REST_Request $request ): bool {
        $key    = get_option( 'aisuite_admin_api_key', '' );
        $header = $request->get_header( 'x-api-key' ) ?: $request->get_param( 'api_key' );
        return $key && hash_equals( $key, (string) $header );
    }

    public function deduct_tokens( WP_REST_Request $request ): WP_REST_Response {
        $email  = sanitize_email( $request->get_param( 'email' ) );
        $amount = (int) $request->get_param( 'amount' );

        $user = get_user_by( 'email', $email );
        if ( ! $user ) {
            return new WP_REST_Response( [ 'error' => 'User not found' ], 404 );
        }

        $ok = AISuite_Tokens::deduct( $user->ID, $amount );
        if ( ! $ok ) {
            return new WP_REST_Response( [ 'error' => 'Insufficient tokens' ], 402 );
        }

        return new WP_REST_Response( [
            'success'    => true,
            'newBalance' => AISuite_Tokens::get_balance( $user->ID ),
        ], 200 );
    }

    public function sync_user( WP_REST_Request $request ): WP_REST_Response {
        $email   = sanitize_email( $request->get_param( 'email' ) );
        $balance = (int) $request->get_param( 'tokenBalance' );

        $user = get_user_by( 'email', $email );
        if ( ! $user ) {
            return new WP_REST_Response( [ 'error' => 'User not found' ], 404 );
        }

        AISuite_Tokens::set_balance( $user->ID, $balance );
        return new WP_REST_Response( [ 'success' => true ], 200 );
    }

    public function get_balance( WP_REST_Request $request ): WP_REST_Response {
        $email = sanitize_email( $request->get_param( 'email' ) );
        $user  = get_user_by( 'email', $email );
        if ( ! $user ) {
            return new WP_REST_Response( [ 'error' => 'User not found' ], 404 );
        }
        return new WP_REST_Response( [
            'balance' => AISuite_Tokens::get_balance( $user->ID ),
        ], 200 );
    }
}
