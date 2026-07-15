<?php
/**
 * Shortcodes to embed AI Suite tools inside WordPress pages.
 *
 * [ai_suite_embed]               — Full app iframe
 * [ai_suite_tool tool="writer"]  — Single tool iframe
 * [ai_suite_login]               — Login form that issues a JWT and redirects into the app
 * [ai_suite_token_balance]       — Displays current user's token balance
 */
class AISuite_Shortcodes {

    public function __construct() {
        add_shortcode( 'ai_suite_embed',         [ $this, 'embed' ] );
        add_shortcode( 'ai_suite_tool',          [ $this, 'tool_embed' ] );
        add_shortcode( 'ai_suite_login',         [ $this, 'login_form' ] );
        add_shortcode( 'ai_suite_token_balance', [ $this, 'token_balance' ] );
    }

    public function embed( $atts ): string {
        $atts    = shortcode_atts( [ 'height' => '800px', 'page' => '' ], $atts );
        $app_url = trailingslashit( get_option( 'aisuite_api_url', '' ) );
        if ( ! $app_url ) return '<p>AI Suite: configure the App URL in settings.</p>';
        $url = $app_url . ltrim( $atts['page'], '/' );
        return '<iframe src="' . esc_url( $url ) . '" style="width:100%;height:' . esc_attr( $atts['height'] ) . ';border:none;border-radius:8px;" allowfullscreen></iframe>';
    }

    public function tool_embed( $atts ): string {
        $atts   = shortcode_atts( [ 'tool' => 'chat', 'height' => '700px' ], $atts );
        $app_url = trailingslashit( get_option( 'aisuite_api_url', '' ) );
        if ( ! $app_url ) return '<p>AI Suite: configure the App URL in settings.</p>';
        $url = $app_url . 'tools/' . sanitize_text_field( $atts['tool'] );
        return '<iframe src="' . esc_url( $url ) . '" style="width:100%;height:' . esc_attr( $atts['height'] ) . ';border:none;border-radius:8px;" allowfullscreen></iframe>';
    }

    public function login_form(): string {
        ob_start();
        ?>
        <div id="aisuite-login-form" style="max-width:400px;margin:0 auto;">
            <h3>Login to AI Suite</h3>
            <p id="aisuite-login-msg" style="color:red;display:none;"></p>
            <div style="margin-bottom:12px;">
                <label>Username / Email</label><br>
                <input type="text" id="aisuite-user" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;">
            </div>
            <div style="margin-bottom:12px;">
                <label>Password</label><br>
                <input type="password" id="aisuite-pass" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;">
            </div>
            <button onclick="aisuiteLogin()" style="background:#7c3aed;color:#fff;border:none;padding:10px 24px;border-radius:4px;cursor:pointer;width:100%;">Login & Open AI Suite</button>
        </div>
        <script>
        async function aisuiteLogin() {
            const user = document.getElementById('aisuite-user').value;
            const pass = document.getElementById('aisuite-pass').value;
            const msg  = document.getElementById('aisuite-login-msg');
            msg.style.display = 'none';
            try {
                const res  = await fetch('<?= esc_url( get_rest_url(null,'ai-suite/v1/token') ) ?>', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user, password: pass })
                });
                const data = await res.json();
                if (!res.ok) { msg.textContent = data.error || 'Login failed'; msg.style.display='block'; return; }
                localStorage.setItem('ai_suite_token', data.token);
                localStorage.setItem('ai_suite_user', JSON.stringify(data.user));
                window.location.href = '<?= esc_url( trailingslashit(get_option('aisuite_api_url','')) . 'dashboard' ) ?>';
            } catch(e) { msg.textContent = 'Connection error'; msg.style.display='block'; }
        }
        </script>
        <?php
        return ob_get_clean();
    }

    public function token_balance(): string {
        if ( ! is_user_logged_in() ) return '';
        $balance = AISuite_Tokens::get_balance( get_current_user_id() );
        return '<span class="aisuite-token-balance"><strong>' . number_format( $balance ) . '</strong> AI tokens remaining</span>';
    }
}
