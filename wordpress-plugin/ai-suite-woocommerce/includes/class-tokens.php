<?php
/**
 * Manages AI token credits per user.
 */
class AISuite_Tokens {

    public static function create_table(): void {
        global $wpdb;
        $table   = $wpdb->prefix . 'aisuite_tokens';
        $charset = $wpdb->get_charset_collate();
        $sql     = "CREATE TABLE IF NOT EXISTS {$table} (
            id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id     BIGINT UNSIGNED NOT NULL,
            balance     INT             NOT NULL DEFAULT 0,
            plan_slug   VARCHAR(100)    DEFAULT NULL,
            plan_name   VARCHAR(200)    DEFAULT NULL,
            reset_date  DATETIME        DEFAULT NULL,
            updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY user_id (user_id)
        ) {$charset};";
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );
    }

    public static function get_balance( int $user_id ): int {
        global $wpdb;
        $table = $wpdb->prefix . 'aisuite_tokens';
        $row   = $wpdb->get_row( $wpdb->prepare( "SELECT balance FROM {$table} WHERE user_id = %d", $user_id ) );
        return $row ? (int) $row->balance : 0;
    }

    public static function set_balance( int $user_id, int $balance ): void {
        global $wpdb;
        $table = $wpdb->prefix . 'aisuite_tokens';
        $wpdb->replace( $table, [ 'user_id' => $user_id, 'balance' => max( 0, $balance ) ] );
    }

    public static function deduct( int $user_id, int $amount ): bool {
        global $wpdb;
        $table   = $wpdb->prefix . 'aisuite_tokens';
        $current = self::get_balance( $user_id );
        if ( $current < $amount ) return false;
        $wpdb->query( $wpdb->prepare(
            "UPDATE {$table} SET balance = balance - %d WHERE user_id = %d AND balance >= %d",
            $amount, $user_id, $amount
        ) );
        return true;
    }

    public static function add( int $user_id, int $amount ): void {
        global $wpdb;
        $table = $wpdb->prefix . 'aisuite_tokens';
        $wpdb->query( $wpdb->prepare(
            "INSERT INTO {$table} (user_id, balance) VALUES (%d, %d)
             ON DUPLICATE KEY UPDATE balance = balance + %d",
            $user_id, $amount, $amount
        ) );
    }

    /**
     * Called when a WooCommerce order is completed.
     * Grants the token allowance from the purchased product.
     */
    public static function grant_tokens_for_order( int $order_id ): void {
        $order = wc_get_order( $order_id );
        if ( ! $order ) return;

        $user_id = $order->get_customer_id();
        if ( ! $user_id ) return;

        foreach ( $order->get_items() as $item ) {
            $product_id      = $item->get_product_id();
            $token_allowance = (int) get_post_meta( $product_id, '_aisuite_token_allowance', true );
            $plan_slug       = get_post_meta( $product_id, '_aisuite_plan_slug', true );
            $plan_name       = get_the_title( $product_id );

            if ( $token_allowance > 0 ) {
                self::add( $user_id, $token_allowance );

                // Update plan info
                global $wpdb;
                $wpdb->update(
                    $wpdb->prefix . 'aisuite_tokens',
                    [
                        'plan_slug'  => $plan_slug,
                        'plan_name'  => $plan_name,
                        'reset_date' => date( 'Y-m-d H:i:s', strtotime( '+1 month' ) ),
                    ],
                    [ 'user_id' => $user_id ]
                );

                // Sync to AI Suite API
                self::sync_user_to_api( $user_id );
            }
        }
    }

    /**
     * Called on WooCommerce Subscriptions renewal.
     */
    public static function renew_subscription_tokens( $subscription ): void {
        $user_id = $subscription->get_customer_id();
        if ( ! $user_id ) return;

        foreach ( $subscription->get_items() as $item ) {
            $product_id      = $item->get_product_id();
            $token_allowance = (int) get_post_meta( $product_id, '_aisuite_token_allowance', true );
            if ( $token_allowance > 0 ) {
                // Reset (not add) tokens on renewal
                self::set_balance( $user_id, $token_allowance );
                self::sync_user_to_api( $user_id );
            }
        }
    }

    /**
     * Syncs user token balance to the AI Suite API.
     */
    public static function sync_user_to_api( int $user_id ): void {
        $api_url = get_option( 'aisuite_api_url', '' );
        $api_key = get_option( 'aisuite_admin_api_key', '' );
        if ( ! $api_url || ! $api_key ) return;

        $user    = get_userdata( $user_id );
        $balance = self::get_balance( $user_id );

        wp_remote_post( trailingslashit( $api_url ) . 'api/admin/sync-user', [
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type'  => 'application/json',
            ],
            'body'    => wp_json_encode( [
                'email'        => $user->user_email,
                'tokenBalance' => $balance,
            ] ),
            'timeout' => 10,
        ] );
    }
}
