<?php
/**
 * WordPress admin settings page for AI Suite.
 */
class AISuite_Admin_Page {

    public function __construct() {
        add_action( 'admin_menu',  [ $this, 'add_menu' ] );
        add_action( 'admin_init',  [ $this, 'register_settings' ] );
    }

    public function add_menu(): void {
        add_menu_page(
            'AI Suite Settings',
            'AI Suite',
            'manage_options',
            'ai-suite-settings',
            [ $this, 'render_page' ],
            'dashicons-superhero',
            56
        );
        add_submenu_page( 'ai-suite-settings', 'Products', 'Products', 'manage_options', 'ai-suite-products', [ $this, 'render_products' ] );
        add_submenu_page( 'ai-suite-settings', 'Token Manager', 'Tokens', 'manage_options', 'ai-suite-tokens', [ $this, 'render_tokens' ] );
    }

    public function register_settings(): void {
        register_setting( 'aisuite_options', 'aisuite_api_url',       [ 'sanitize_callback' => 'esc_url_raw' ] );
        register_setting( 'aisuite_options', 'aisuite_admin_api_key', [ 'sanitize_callback' => 'sanitize_text_field' ] );
        register_setting( 'aisuite_options', 'aisuite_jwt_secret',    [ 'sanitize_callback' => 'sanitize_text_field' ] );
        register_setting( 'aisuite_options', 'aisuite_n8n_base_url',  [ 'sanitize_callback' => 'esc_url_raw' ] );
        register_setting( 'aisuite_options', 'aisuite_gemini_key',    [ 'sanitize_callback' => 'sanitize_text_field' ] );
    }

    public function render_page(): void {
        $api_url  = get_option( 'aisuite_api_url', '' );
        $n8n_url  = get_option( 'aisuite_n8n_base_url', '' );
        $rest_url = get_rest_url( null, 'ai-suite/v1' );
        ?>
        <div class="wrap">
            <h1>AI Suite Settings</h1>

            <?php if ( isset( $_GET['settings-updated'] ) ) : ?>
                <div class="notice notice-success"><p>Settings saved.</p></div>
            <?php endif; ?>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;">

                <div style="background:#fff;padding:20px;border:1px solid #ddd;border-radius:6px;">
                    <h2>Connection Settings</h2>
                    <form method="post" action="options.php">
                        <?php settings_fields( 'aisuite_options' ); ?>
                        <table class="form-table">
                            <tr>
                                <th>AI Suite App URL</th>
                                <td><input type="url" name="aisuite_api_url" value="<?= esc_attr( get_option('aisuite_api_url') ) ?>" class="regular-text" placeholder="https://your-replit-app.replit.app" /></td>
                            </tr>
                            <tr>
                                <th>Admin API Key</th>
                                <td><input type="text" name="aisuite_admin_api_key" value="<?= esc_attr( get_option('aisuite_admin_api_key') ) ?>" class="regular-text" /></td>
                            </tr>
                            <tr>
                                <th>JWT Secret</th>
                                <td><input type="password" name="aisuite_jwt_secret" value="<?= esc_attr( get_option('aisuite_jwt_secret') ) ?>" class="regular-text" /></td>
                            </tr>
                            <tr>
                                <th>N8N Base URL</th>
                                <td><input type="url" name="aisuite_n8n_base_url" value="<?= esc_attr( get_option('aisuite_n8n_base_url') ) ?>" class="regular-text" placeholder="https://your-n8n.com" /></td>
                            </tr>
                            <tr>
                                <th>Gemini API Key</th>
                                <td><input type="password" name="aisuite_gemini_key" value="<?= esc_attr( get_option('aisuite_gemini_key') ) ?>" class="regular-text" /></td>
                            </tr>
                        </table>
                        <?php submit_button(); ?>
                    </form>
                </div>

                <div style="background:#fff;padding:20px;border:1px solid #ddd;border-radius:6px;">
                    <h2>Integration Info</h2>
                    <p><strong>WordPress REST Endpoint:</strong><br><code><?= esc_html( $rest_url ) ?></code></p>
                    <p><strong>Token Issue Endpoint:</strong><br><code><?= esc_html( $rest_url ) ?>/token</code></p>
                    <p><strong>Deduct Tokens Webhook:</strong><br><code><?= esc_html( $rest_url ) ?>/deduct-tokens</code></p>
                    <hr>
                    <h3>Quick Setup Guide</h3>
                    <ol>
                        <li>Deploy the AI Suite app to Replit and copy its URL above</li>
                        <li>Generate an admin API key and paste it above</li>
                        <li>Set the JWT Secret to the same value in both WordPress and your AI Suite app <code>.env</code></li>
                        <li>Deploy N8N and import the workflow JSON files from the <code>n8n-workflows/</code> folder</li>
                        <li>Set your Gemini API key in N8N as an environment variable <code>GEMINI_API_KEY</code></li>
                        <li>Activate products below and they will appear in your WooCommerce shop</li>
                    </ol>
                    <p>
                        <a href="<?= admin_url('admin.php?page=ai-suite-products') ?>" class="button button-primary">Manage Products</a>
                        <a href="<?= admin_url('admin.php?page=ai-suite-tokens') ?>" class="button">Manage Tokens</a>
                    </p>
                </div>
            </div>
        </div>
        <?php
    }

    public function render_products(): void {
        if ( isset( $_POST['create_products'] ) && check_admin_referer( 'aisuite_create_products' ) ) {
            AISuite_Products::create_all_products();
            echo '<div class="notice notice-success"><p>Products created/updated.</p></div>';
        }
        $plans = AISuite_Products::get_plans();
        ?>
        <div class="wrap">
            <h1>AI Suite Products</h1>
            <form method="post">
                <?php wp_nonce_field( 'aisuite_create_products' ); ?>
                <input type="submit" name="create_products" class="button button-primary" value="Create / Sync All Products">
            </form>
            <table class="wp-list-table widefat fixed striped" style="margin-top:20px;">
                <thead><tr><th>Product</th><th>Price</th><th>Tokens/Month</th><th>Features</th></tr></thead>
                <tbody>
                <?php foreach ( $plans as $p ) : ?>
                    <tr>
                        <td><strong><?= esc_html( $p['name'] ) ?></strong><br><small><?= esc_html( $p['slug'] ) ?></small></td>
                        <td>$<?= esc_html( $p['price'] ) ?>/<?= esc_html( $p['period'] ) ?></td>
                        <td><?= number_format( $p['token_allowance'] ) ?></td>
                        <td><?= esc_html( implode( ', ', array_slice( $p['features'], 0, 3 ) ) ) ?>...</td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    public function render_tokens(): void {
        $search  = isset( $_GET['s'] ) ? sanitize_text_field( $_GET['s'] ) : '';
        $users   = get_users( [ 's' => $search, 'number' => 50 ] );
        ?>
        <div class="wrap">
            <h1>Token Manager</h1>
            <?php if ( isset( $_POST['update_tokens'] ) && check_admin_referer( 'aisuite_update_tokens' ) ) :
                $uid = (int) $_POST['user_id'];
                $bal = (int) $_POST['balance'];
                AISuite_Tokens::set_balance( $uid, $bal );
                AISuite_Tokens::sync_user_to_api( $uid );
                echo '<div class="notice notice-success"><p>Tokens updated.</p></div>';
            endif; ?>
            <form method="get">
                <input type="hidden" name="page" value="ai-suite-tokens">
                <p><input type="search" name="s" value="<?= esc_attr($search) ?>" placeholder="Search users..."> <input type="submit" class="button" value="Search"></p>
            </form>
            <table class="wp-list-table widefat fixed striped">
                <thead><tr><th>User</th><th>Email</th><th>Balance</th><th>Action</th></tr></thead>
                <tbody>
                <?php foreach ( $users as $user ) :
                    $balance = AISuite_Tokens::get_balance( $user->ID );
                ?>
                    <tr>
                        <td><?= esc_html( $user->display_name ) ?></td>
                        <td><?= esc_html( $user->user_email ) ?></td>
                        <td><strong><?= number_format( $balance ) ?></strong></td>
                        <td>
                            <form method="post" style="display:inline">
                                <?php wp_nonce_field( 'aisuite_update_tokens' ); ?>
                                <input type="hidden" name="user_id" value="<?= $user->ID ?>">
                                <input type="number" name="balance" value="<?= $balance ?>" style="width:80px">
                                <input type="submit" name="update_tokens" class="button button-small" value="Set">
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php
    }
}
