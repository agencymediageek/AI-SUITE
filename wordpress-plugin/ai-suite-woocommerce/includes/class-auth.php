<?php
/**
 * REST API endpoint: /wp-json/ai-suite/v1/token
 * Issues a JWT token for logged-in WP users, valid in the AI Suite app.
 */
class AISuite_Auth {

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes(): void {
        register_rest_route( 'ai-suite/v1', '/token', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'issue_token' ],
            'permission_callback' => '__return_true',
        ] );

        register_rest_route( 'ai-suite/v1', '/verify', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'verify_token' ],
            'permission_callback' => '__return_true',
        ] );

        register_rest_route( 'ai-suite/v1', '/me', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_me' ],
            'permission_callback' => [ $this, 'check_token' ],
        ] );
    }

    /**
     * POST /wp-json/ai-suite/v1/token
     * Body: { username, password }
     * Returns: { token, user }
     */
    public function issue_token( WP_REST_Request $request ): WP_REST_Response {
        $username = sanitize_text_field( $request->get_param( 'username' ) );
        $password = $request->get_param( 'password' );

        $user = wp_authenticate( $username, $password );
        if ( is_wp_error( $user ) ) {
            return new WP_REST_Response( [ 'error' => 'Invalid credentials' ], 401 );
        }

        $token    = $this->generate_jwt( $user );
        $balance  = AISuite_Tokens::get_balance( $user->ID );

        return new WP_REST_Response( [
            'token' => $token,
            'user'  => [
                'id'           => $user->ID,
                'email'        => $user->user_email,
                'name'         => $user->display_name,
                'role'         => in_array( 'administrator', (array) $user->roles ) ? 'admin' : 'user',
                'tokenBalance' => $balance,
            ],
        ], 200 );
    }

    public function verify_token( WP_REST_Request $request ): WP_REST_Response {
        $token   = $request->get_param( 'token' );
        $payload = $this->decode_jwt( $token );
        if ( ! $payload ) {
            return new WP_REST_Response( [ 'valid' => false ], 401 );
        }
        return new WP_REST_Response( [ 'valid' => true, 'userId' => $payload->sub ], 200 );
    }

    public function get_me( WP_REST_Request $request ): WP_REST_Response {
        $user_id = $this->get_user_from_token( $request );
        $user    = get_userdata( $user_id );
        $balance = AISuite_Tokens::get_balance( $user_id );
        return new WP_REST_Response( [
            'id'           => $user->ID,
            'email'        => $user->user_email,
            'name'         => $user->display_name,
            'role'         => in_array( 'administrator', (array) $user->roles ) ? 'admin' : 'user',
            'tokenBalance' => $balance,
        ], 200 );
    }

    public function check_token( WP_REST_Request $request ): bool {
        return (bool) $this->get_user_from_token( $request );
    }

    private function get_user_from_token( WP_REST_Request $request ): ?int {
        $header = $request->get_header( 'authorization' );
        if ( ! $header || ! str_starts_with( $header, 'Bearer ' ) ) return null;
        $token   = substr( $header, 7 );
        $payload = $this->decode_jwt( $token );
        return $payload ? (int) $payload->sub : null;
    }

    private function generate_jwt( WP_User $user ): string {
        $secret = get_option( 'aisuite_jwt_secret', wp_salt( 'auth' ) );
        $header  = base64_encode( json_encode( [ 'alg' => 'HS256', 'typ' => 'JWT' ] ) );
        $payload = base64_encode( json_encode( [
            'sub'   => $user->ID,
            'email' => $user->user_email,
            'role'  => in_array( 'administrator', (array) $user->roles ) ? 'admin' : 'user',
            'iat'   => time(),
            'exp'   => time() + ( 30 * DAY_IN_SECONDS ),
        ] ) );
        $sig = base64_encode( hash_hmac( 'sha256', "$header.$payload", $secret, true ) );
        return "$header.$payload.$sig";
    }

    private function decode_jwt( string $token ): ?object {
        $parts = explode( '.', $token );
        if ( count( $parts ) !== 3 ) return null;
        [$header, $payload_b64, $sig] = $parts;
        $secret       = get_option( 'aisuite_jwt_secret', wp_salt( 'auth' ) );
        $expected_sig = base64_encode( hash_hmac( 'sha256', "$header.$payload_b64", $secret, true ) );
        if ( ! hash_equals( $expected_sig, $sig ) ) return null;
        $payload = json_decode( base64_decode( $payload_b64 ) );
        if ( ! $payload || $payload->exp < time() ) return null;
        return $payload;
    }
}
