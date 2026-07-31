<?php
/**
 * Plugin Name:  WP TechSites
 * Plugin URI:   https://wp.techsites.ai
 * Description:  Conecte seu WordPress ao ecossistema TechSites — IA, automação e marketing em um só plugin.
 * Version:      1.0.0
 * Author:       TechSites.ai
 * Author URI:   https://techsites.ai
 * License:      GPL-2.0+
 * Text Domain:  wp-techsites
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'WPTS_VERSION',  '1.0.0' );
define( 'WPTS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPTS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WPTS_API_BASE',   'https://apex.techsites.ai/api/wp' );

// ── Activation ────────────────────────────────────────────────────────────────
register_activation_hook( __FILE__, 'wpts_activate' );
function wpts_activate() {
    add_option( 'wpts_api_key',        '' );
    add_option( 'wpts_chatbot_enabled', '1' );
    add_option( 'wpts_bot_name',        get_bloginfo('name') . ' AI' );
    add_option( 'wpts_primary_color',   '#0ea5e9' );
    flush_rewrite_rules();
}

// ── Admin Menu ────────────────────────────────────────────────────────────────
add_action( 'admin_menu', 'wpts_register_menu' );
function wpts_register_menu() {
    add_menu_page(
        'WP TechSites',
        'WP TechSites',
        'manage_options',
        'wp-techsites',
        'wpts_dashboard_page',
        'data:image/svg+xml;base64,' . base64_encode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#0ea5e9"/><path d="M8 12h8M12 8v8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>'),
        30
    );
    add_submenu_page( 'wp-techsites', 'Configurações', 'Configurações', 'manage_options', 'wp-techsites-settings', 'wpts_settings_page' );
    add_submenu_page( 'wp-techsites', 'Ferramentas IA', 'Ferramentas IA', 'manage_options', 'wp-techsites-tools', 'wpts_tools_page' );
}

// ── Save Settings ─────────────────────────────────────────────────────────────
add_action( 'admin_init', 'wpts_save_settings' );
function wpts_save_settings() {
    if ( ! isset( $_POST['wpts_nonce'] ) ) return;
    if ( ! wp_verify_nonce( $_POST['wpts_nonce'], 'wpts_settings' ) ) return;
    if ( ! current_user_can( 'manage_options' ) ) return;

    update_option( 'wpts_api_key',         sanitize_text_field( $_POST['wpts_api_key'] ?? '' ) );
    update_option( 'wpts_chatbot_enabled',  isset( $_POST['wpts_chatbot_enabled'] ) ? '1' : '0' );
    update_option( 'wpts_bot_name',         sanitize_text_field( $_POST['wpts_bot_name'] ?? 'TechSites AI' ) );
    update_option( 'wpts_primary_color',    sanitize_hex_color( $_POST['wpts_primary_color'] ?? '#0ea5e9' ) );

    add_settings_error( 'wpts_settings', 'saved', 'Configurações salvas.', 'updated' );
}

// ── API Helper ────────────────────────────────────────────────────────────────
function wpts_api( $endpoint, $body = null, $method = 'GET' ) {
    $api_key = get_option( 'wpts_api_key', '' );
    $args = [
        'method'  => $method,
        'headers' => [
            'Content-Type'   => 'application/json',
            'X-WP-Site-Key'  => $api_key,
        ],
        'timeout' => 30,
    ];
    if ( $body !== null ) {
        $args['body'] = wp_json_encode( $body );
    }
    $response = wp_remote_request( WPTS_API_BASE . $endpoint, $args );
    if ( is_wp_error( $response ) ) return [ 'error' => $response->get_error_message() ];
    return json_decode( wp_remote_retrieve_body( $response ), true );
}

// ── Connection Status ─────────────────────────────────────────────────────────
function wpts_get_status() {
    $api_key = get_option( 'wpts_api_key', '' );
    if ( empty( $api_key ) ) return null;

    $transient_key = 'wpts_status_' . md5( $api_key );
    $cached = get_transient( $transient_key );
    if ( $cached !== false ) return $cached;

    $result = wpts_api( '/verify' );
    if ( ! empty( $result['connected'] ) ) {
        set_transient( $transient_key, $result, 5 * MINUTE_IN_SECONDS );
    }
    return $result;
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
function wpts_dashboard_page() {
    $status = wpts_get_status();
    $connected = ! empty( $status['connected'] );
    ?>
    <div class="wrap">
        <h1 style="display:flex;align-items:center;gap:10px;">
            <span style="color:#0ea5e9">●</span> WP TechSites
            <?php if ( $connected ) : ?>
                <span style="font-size:14px;font-weight:normal;background:#dcfce7;color:#166534;padding:3px 10px;border-radius:20px;">✓ Conectado</span>
            <?php else : ?>
                <span style="font-size:14px;font-weight:normal;background:#fee2e2;color:#991b1b;padding:3px 10px;border-radius:20px;">✗ Não conectado</span>
            <?php endif; ?>
        </h1>

        <?php if ( ! $connected ) : ?>
            <div class="notice notice-warning">
                <p>Configure sua <strong>Chave API</strong> em <a href="<?php echo admin_url('admin.php?page=wp-techsites-settings'); ?>">Configurações</a> para começar.
                Obtenha sua chave em <a href="https://wp.techsites.ai" target="_blank">wp.techsites.ai</a>.</p>
            </div>
        <?php else : ?>
            <!-- Stats -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:20px 0;">
                <?php
                $stats = [
                    [ 'label' => 'Créditos', 'value' => $status['credits'] ?? 0, 'icon' => '💰', 'color' => '#0ea5e9' ],
                    [ 'label' => 'Plano',    'value' => ucfirst($status['plan'] ?? 'Trial'), 'icon' => '🚀', 'color' => '#8b5cf6' ],
                    [ 'label' => 'Site',     'value' => $status['siteName'] ?? get_bloginfo('name'), 'icon' => '🌐', 'color' => '#10b981' ],
                ];
                foreach ( $stats as $s ) : ?>
                    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;border-left:4px solid <?php echo $s['color']; ?>">
                        <div style="font-size:28px;margin-bottom:6px;"><?php echo $s['icon']; ?></div>
                        <div style="font-size:22px;font-weight:700;color:<?php echo $s['color']; ?>"><?php echo esc_html($s['value']); ?></div>
                        <div style="color:#6b7280;font-size:13px;"><?php echo esc_html($s['label']); ?></div>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- Quick Links -->
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
                <h3 style="margin-top:0">Ações Rápidas</h3>
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <a href="<?php echo admin_url('admin.php?page=wp-techsites-tools'); ?>" class="button button-primary" style="background:#0ea5e9;border-color:#0ea5e9;">
                        ✍️ Gerar Conteúdo
                    </a>
                    <a href="<?php echo admin_url('admin.php?page=wp-techsites-tools#colors'); ?>" class="button" style="border-color:#8b5cf6;color:#8b5cf6;">
                        🎨 Identidade Visual
                    </a>
                    <a href="<?php echo admin_url('admin.php?page=wp-techsites-tools#menu'); ?>" class="button" style="border-color:#10b981;color:#10b981;">
                        📋 Editar Menu
                    </a>
                    <a href="https://wp.techsites.ai" target="_blank" class="button">
                        🔗 Painel TechSites
                    </a>
                </div>
            </div>

            <!-- Available Tools -->
            <?php if ( ! empty( $status['tools'] ) ) : ?>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;">
                <h3 style="margin-top:0">Ferramentas Disponíveis</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;">
                    <?php foreach ( $status['tools'] as $tool ) :
                        $avail = $tool['available'];
                        $style = $avail
                            ? 'background:#f0f9ff;border:1px solid #bae6fd;'
                            : 'background:#f9fafb;border:1px dashed #d1d5db;opacity:.6;';
                    ?>
                        <div style="<?php echo $style; ?>border-radius:10px;padding:14px;text-align:center;">
                            <div style="font-size:24px;margin-bottom:4px;"><?php echo esc_html($tool['icon']); ?></div>
                            <div style="font-size:13px;font-weight:600;color:<?php echo $avail ? '#0369a1' : '#6b7280'; ?>">
                                <?php echo esc_html($tool['name']); ?>
                            </div>
                            <div style="font-size:11px;color:#9ca3af;margin-top:2px;"><?php echo esc_html($tool['credits']); ?> créditos</div>
                            <?php if ( ! $avail ) : ?>
                                <div style="font-size:10px;color:#ef4444;margin-top:4px;">🔒 Plano Pro</div>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
    <?php
}

// ── Settings Page ─────────────────────────────────────────────────────────────
function wpts_settings_page() {
    settings_errors( 'wpts_settings' );
    $api_key         = get_option( 'wpts_api_key', '' );
    $chatbot_enabled = get_option( 'wpts_chatbot_enabled', '1' );
    $bot_name        = get_option( 'wpts_bot_name', get_bloginfo('name') . ' AI' );
    $primary_color   = get_option( 'wpts_primary_color', '#0ea5e9' );
    ?>
    <div class="wrap">
        <h1>⚙️ Configurações — WP TechSites</h1>
        <p>Não tem conta? <a href="https://wp.techsites.ai/register" target="_blank">Crie sua conta em wp.techsites.ai</a> e obtenha sua Chave API gratuitamente.</p>

        <form method="post">
            <?php wp_nonce_field( 'wpts_settings', 'wpts_nonce' ); ?>
            <table class="form-table">
                <tr>
                    <th><label for="wpts_api_key">Chave API *</label></th>
                    <td>
                        <input name="wpts_api_key" id="wpts_api_key" type="text"
                               value="<?php echo esc_attr($api_key); ?>"
                               class="regular-text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                        <p class="description">Cole a chave obtida em <a href="https://wp.techsites.ai" target="_blank">wp.techsites.ai</a></p>
                    </td>
                </tr>
                <tr>
                    <th><label for="wpts_chatbot_enabled">Chatbot IA</label></th>
                    <td>
                        <label>
                            <input name="wpts_chatbot_enabled" id="wpts_chatbot_enabled" type="checkbox"
                                   value="1" <?php checked($chatbot_enabled, '1'); ?> />
                            Exibir chatbot flutuante no site
                        </label>
                    </td>
                </tr>
                <tr>
                    <th><label for="wpts_bot_name">Nome do Chatbot</label></th>
                    <td>
                        <input name="wpts_bot_name" id="wpts_bot_name" type="text"
                               value="<?php echo esc_attr($bot_name); ?>"
                               class="regular-text" placeholder="TechSites AI" />
                    </td>
                </tr>
                <tr>
                    <th><label for="wpts_primary_color">Cor Principal</label></th>
                    <td>
                        <input name="wpts_primary_color" id="wpts_primary_color" type="color"
                               value="<?php echo esc_attr($primary_color); ?>" />
                        <p class="description">Cor do botão do chatbot e destaques</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Salvar Configurações'); ?>
        </form>

        <?php if ( ! empty($api_key) ) : ?>
        <div style="margin-top:20px;padding:16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;">
            <h3 style="margin:0 0 8px">🔌 Testar Conexão</h3>
            <?php
            $test = wpts_api('/verify');
            if ( ! empty($test['connected']) ) :
            ?>
                <p style="color:#166534;margin:0">✅ Conectado! Site: <strong><?php echo esc_html($test['siteName'] ?? ''); ?></strong> | Créditos: <strong><?php echo esc_html($test['credits'] ?? 0); ?></strong></p>
            <?php else : ?>
                <p style="color:#991b1b;margin:0">❌ Chave inválida ou API inacessível. Verifique a chave e tente novamente.</p>
            <?php endif; ?>
        </div>
        <?php endif; ?>
    </div>
    <?php
}

// ── Tools Page (Demo Actions) ─────────────────────────────────────────────────
function wpts_tools_page() {
    ?>
    <div class="wrap">
        <h1>🛠️ Ferramentas IA — WP TechSites</h1>
        <p>Use o poder da IA para criar conteúdo, aplicar identidade visual e otimizar seu site.</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px;">

            <!-- Generate Content -->
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;" id="content">
                <h3 style="margin-top:0;color:#0369a1;">✍️ Gerar Conteúdo</h3>
                <table class="form-table" style="margin:0">
                    <tr>
                        <th style="width:120px"><label>Tópico</label></th>
                        <td><input id="wpts-content-topic" type="text" class="regular-text" placeholder="ex: Serviços de SEO para PMEs" /></td>
                    </tr>
                    <tr>
                        <th><label>Tipo</label></th>
                        <td>
                            <select id="wpts-content-type">
                                <option value="page">Página</option>
                                <option value="post">Artigo de Blog</option>
                                <option value="section">Seção / Bloco</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th><label>Tom</label></th>
                        <td>
                            <select id="wpts-content-tone">
                                <option value="professional">Profissional</option>
                                <option value="friendly">Amigável</option>
                                <option value="persuasive">Persuasivo</option>
                                <option value="technical">Técnico</option>
                            </select>
                        </td>
                    </tr>
                </table>
                <button id="wpts-btn-content" class="button button-primary" style="margin-top:12px;background:#0ea5e9;border-color:#0ea5e9;">
                    ✍️ Gerar Conteúdo (5 créditos)
                </button>
                <div id="wpts-content-result" style="display:none;margin-top:16px;"></div>
            </div>

            <!-- Apply Colors -->
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;" id="colors">
                <h3 style="margin-top:0;color:#7c3aed;">🎨 Identidade Visual</h3>
                <table class="form-table" style="margin:0">
                    <tr>
                        <th style="width:120px"><label>Cor Principal</label></th>
                        <td><input id="wpts-color-primary" type="color" value="#0ea5e9" /></td>
                    </tr>
                    <tr>
                        <th><label>Cor Secundária</label></th>
                        <td><input id="wpts-color-secondary" type="color" value="#0284c7" /></td>
                    </tr>
                    <tr>
                        <th><label>Estilo</label></th>
                        <td>
                            <select id="wpts-color-style">
                                <option value="modern">Moderno</option>
                                <option value="professional">Profissional</option>
                                <option value="minimal">Minimalista</option>
                            </select>
                        </td>
                    </tr>
                </table>
                <button id="wpts-btn-colors" class="button" style="margin-top:12px;border-color:#7c3aed;color:#7c3aed;">
                    🎨 Aplicar Cores (2 créditos)
                </button>
                <div id="wpts-colors-result" style="display:none;margin-top:16px;"></div>
            </div>

            <!-- Generate Menu -->
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;" id="menu">
                <h3 style="margin-top:0;color:#059669;">📋 Sugestão de Menu</h3>
                <table class="form-table" style="margin:0">
                    <tr>
                        <th style="width:120px"><label>Nicho</label></th>
                        <td><input id="wpts-menu-niche" type="text" class="regular-text" placeholder="ex: Agência de Marketing Digital" /></td>
                    </tr>
                </table>
                <button id="wpts-btn-menu" class="button" style="margin-top:12px;border-color:#059669;color:#059669;">
                    📋 Gerar Menu (3 créditos)
                </button>
                <div id="wpts-menu-result" style="display:none;margin-top:16px;"></div>
            </div>

            <!-- Chatbot Preview -->
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;">
                <h3 style="margin-top:0;color:#0369a1;">💬 Chatbot</h3>
                <?php $chatbot_on = get_option('wpts_chatbot_enabled', '1') === '1'; ?>
                <p style="color:<?php echo $chatbot_on ? '#166534' : '#6b7280'; ?>">
                    <?php echo $chatbot_on ? '✅ Chatbot ativo — visível no seu site' : '❌ Chatbot desativado'; ?>
                </p>
                <p class="description">O chatbot aparece como um botão flutuante no canto inferior direito do site. Os visitantes podem fazer perguntas e receber respostas da IA.</p>
                <a href="<?php echo admin_url('admin.php?page=wp-techsites-settings'); ?>" class="button">
                    Configurar chatbot
                </a>
            </div>

        </div>
    </div>

    <script>
    (function($) {
        var API_BASE = '<?php echo esc_js(WPTS_API_BASE); ?>';
        var API_KEY  = '<?php echo esc_js(get_option("wpts_api_key","")); ?>';

        function wpts_call(endpoint, data, method) {
            method = method || 'POST';
            return $.ajax({
                url: API_BASE + endpoint,
                method: method,
                contentType: 'application/json',
                data: JSON.stringify(data),
                headers: { 'X-WP-Site-Key': API_KEY }
            });
        }

        function showLoading(id) {
            $('#' + id).show().html('<p>⏳ Processando com IA...</p>');
        }

        // Generate Content
        $('#wpts-btn-content').on('click', function() {
            var topic = $('#wpts-content-topic').val();
            if (!topic) { alert('Informe um tópico.'); return; }
            showLoading('wpts-content-result');
            wpts_call('/generate-content', {
                topic: topic,
                type: $('#wpts-content-type').val(),
                tone: $('#wpts-content-tone').val(),
                language: 'pt'
            }).done(function(data) {
                if (data.error) {
                    $('#wpts-content-result').html('<p style="color:red">❌ ' + data.error + '</p>');
                    return;
                }
                $('#wpts-content-result').html(
                    '<div style="background:#f0f9ff;padding:14px;border-radius:8px;border:1px solid #bae6fd;">' +
                    '<h4 style="margin:0 0 6px;color:#0369a1;">✅ Conteúdo gerado! (' + data.creditsUsed + ' créditos)</h4>' +
                    '<strong>' + $('<div>').text(data.title).html() + '</strong>' +
                    '<p style="font-size:12px;color:#475569;margin:4px 0 8px">' + $('<div>').text(data.metaDescription||'').html() + '</p>' +
                    '<details><summary style="cursor:pointer;color:#0369a1;">Ver HTML gerado</summary><pre style="font-size:11px;overflow:auto;max-height:200px;margin-top:8px">' + $('<div>').text(data.content||'').html() + '</pre></details>' +
                    '<button class="button button-primary" style="margin-top:10px;background:#0ea5e9;border-color:#0ea5e9;" id="wpts-publish-btn">📤 Criar página no WordPress</button>' +
                    '</div>'
                );
                // Publish to WordPress
                $('#wpts-publish-btn').on('click', function() {
                    $(this).text('Publicando...').prop('disabled', true);
                    $.post(ajaxurl, {
                        action: 'wpts_create_post',
                        nonce: '<?php echo wp_create_nonce("wpts_ajax"); ?>',
                        title: data.title,
                        content: data.content,
                        excerpt: data.excerpt || '',
                        type: $('#wpts-content-type').val()
                    }, function(res) {
                        if (res.success) {
                            $('#wpts-publish-btn').replaceWith('<a href="' + res.data.edit_url + '" target="_blank" class="button">✅ Ver página criada →</a>');
                        } else {
                            alert('Erro ao criar: ' + res.data);
                        }
                    });
                });
            }).fail(function() {
                $('#wpts-content-result').html('<p style="color:red">❌ Erro de conexão. Verifique sua Chave API.</p>');
            });
        });

        // Apply Colors
        $('#wpts-btn-colors').on('click', function() {
            showLoading('wpts-colors-result');
            wpts_call('/apply-colors', {
                primaryColor:   $('#wpts-color-primary').val(),
                secondaryColor: $('#wpts-color-secondary').val(),
                style: $('#wpts-color-style').val()
            }).done(function(data) {
                if (data.error) { $('#wpts-colors-result').html('<p style="color:red">❌ ' + data.error + '</p>'); return; }
                // Inject CSS into page immediately (preview)
                var el = document.getElementById('wpts-preview-css');
                if (!el) { el = document.createElement('style'); el.id = 'wpts-preview-css'; document.head.appendChild(el); }
                el.textContent = data.css;
                $('#wpts-colors-result').html(
                    '<div style="background:#f5f3ff;padding:14px;border-radius:8px;border:1px solid #ddd6fe;">' +
                    '<h4 style="margin:0 0 6px;color:#7c3aed;">✅ Prévia aplicada nesta página!</h4>' +
                    '<p style="font-size:12px;color:#475569;margin:0 0 10px">O CSS foi injetado como prévia. Clique abaixo para salvar permanentemente.</p>' +
                    '<button class="button" style="border-color:#7c3aed;color:#7c3aed;" id="wpts-save-colors">💾 Salvar no site</button>' +
                    '</div>'
                );
                $('#wpts-save-colors').on('click', function() {
                    $(this).text('Salvando...').prop('disabled', true);
                    $.post(ajaxurl, {
                        action: 'wpts_save_css',
                        nonce: '<?php echo wp_create_nonce("wpts_ajax"); ?>',
                        css: data.css
                    }, function(res) {
                        if (res.success) {
                            $('#wpts-save-colors').replaceWith('<span style="color:#059669;font-weight:600;">✅ CSS salvo com sucesso!</span>');
                        }
                    });
                });
            }).fail(function() {
                $('#wpts-colors-result').html('<p style="color:red">❌ Erro de conexão.</p>');
            });
        });

        // Generate Menu
        $('#wpts-btn-menu').on('click', function() {
            var niche = $('#wpts-menu-niche').val();
            if (!niche) { alert('Informe o nicho do site.'); return; }
            showLoading('wpts-menu-result');
            wpts_call('/generate-menu', { niche: niche, language: 'pt' }).done(function(data) {
                if (data.error) { $('#wpts-menu-result').html('<p style="color:red">❌ ' + data.error + '</p>'); return; }
                var items = data.menuItems || [];
                var html = '<div style="background:#ecfdf5;padding:14px;border-radius:8px;border:1px solid #a7f3d0;">' +
                           '<h4 style="margin:0 0 10px;color:#059669;">✅ Menu sugerido! (' + data.creditsUsed + ' créditos)</h4>' +
                           '<ul style="margin:0;padding:0;list-style:none;">';
                items.forEach(function(item) {
                    html += '<li style="padding:6px 0;border-bottom:1px solid #d1fae5;display:flex;align-items:center;gap:8px;">' +
                            '<span>' + item.icon + '</span>' +
                            '<strong>' + $('<div>').text(item.label).html() + '</strong>' +
                            '<span style="color:#6b7280;font-size:12px;">' + $('<div>').text(item.slug).html() + '</span>' +
                            '</li>';
                });
                html += '</ul><button class="button" style="margin-top:12px;border-color:#059669;color:#059669;" id="wpts-apply-menu">📋 Aplicar ao menu principal</button></div>';
                $('#wpts-menu-result').html(html);
                $('#wpts-apply-menu').on('click', function() {
                    $(this).text('Aplicando...').prop('disabled', true);
                    $.post(ajaxurl, {
                        action: 'wpts_apply_menu',
                        nonce: '<?php echo wp_create_nonce("wpts_ajax"); ?>',
                        items: JSON.stringify(items)
                    }, function(res) {
                        if (res.success) {
                            $('#wpts-apply-menu').replaceWith('<span style="color:#059669;font-weight:600;">✅ Menu atualizado!</span>');
                        } else {
                            alert('Erro: ' + res.data);
                        }
                    });
                });
            }).fail(function() {
                $('#wpts-menu-result').html('<p style="color:red">❌ Erro de conexão.</p>');
            });
        });
    })(jQuery);
    </script>
    <?php
}

// ── AJAX: Create Post/Page ────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_create_post', 'wpts_ajax_create_post' );
function wpts_ajax_create_post() {
    check_ajax_referer( 'wpts_ajax', 'nonce' );
    if ( ! current_user_can( 'publish_posts' ) ) wp_send_json_error( 'Permissão negada' );

    $title   = sanitize_text_field( $_POST['title'] ?? '' );
    $content = wp_kses_post( $_POST['content'] ?? '' );
    $excerpt = sanitize_textarea_field( $_POST['excerpt'] ?? '' );
    $type    = in_array( $_POST['type'] ?? '', ['post', 'page', 'section'] ) ? $_POST['type'] : 'page';
    $post_type = $type === 'post' ? 'post' : 'page';

    $post_id = wp_insert_post([
        'post_title'   => $title,
        'post_content' => $content,
        'post_excerpt' => $excerpt,
        'post_status'  => 'draft',
        'post_type'    => $post_type,
    ]);

    if ( is_wp_error( $post_id ) ) {
        wp_send_json_error( $post_id->get_error_message() );
    }

    wp_send_json_success([
        'post_id'  => $post_id,
        'edit_url' => get_edit_post_link( $post_id, 'raw' ),
        'view_url' => get_permalink( $post_id ),
    ]);
}

// ── AJAX: Save CSS ────────────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_save_css', 'wpts_ajax_save_css' );
function wpts_ajax_save_css() {
    check_ajax_referer( 'wpts_ajax', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permissão negada' );
    $css = wp_strip_all_tags( $_POST['css'] ?? '' );
    update_option( 'wpts_custom_css', $css );
    wp_send_json_success();
}

// ── AJAX: Apply Menu ──────────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_apply_menu', 'wpts_ajax_apply_menu' );
function wpts_ajax_apply_menu() {
    check_ajax_referer( 'wpts_ajax', 'nonce' );
    if ( ! current_user_can( 'edit_theme_options' ) ) wp_send_json_error( 'Permissão negada' );

    $items_raw = $_POST['items'] ?? '[]';
    $items = json_decode( stripslashes( $items_raw ), true );
    if ( ! is_array( $items ) || empty( $items ) ) wp_send_json_error( 'Itens inválidos' );

    // Get or create main nav menu
    $menus = wp_get_nav_menus();
    $menu_id = ! empty( $menus ) ? $menus[0]->term_id : null;

    if ( ! $menu_id ) {
        $menu_id = wp_create_nav_menu( 'Menu Principal' );
        if ( is_wp_error( $menu_id ) ) wp_send_json_error( $menu_id->get_error_message() );
    }

    // Delete existing items
    $existing = wp_get_nav_menu_items( $menu_id );
    if ( $existing ) {
        foreach ( $existing as $item ) wp_delete_post( $item->ID, true );
    }

    // Add new items
    foreach ( $items as $i => $item ) {
        $label = sanitize_text_field( $item['label'] ?? '' );
        $slug  = sanitize_text_field( $item['slug'] ?? '/' );
        if ( ! $label ) continue;

        wp_update_nav_menu_item( $menu_id, 0, [
            'menu-item-title'  => $label,
            'menu-item-url'    => home_url( $slug ),
            'menu-item-status' => 'publish',
            'menu-item-position' => $i + 1,
            'menu-item-type'   => 'custom',
        ]);
    }

    // Assign to primary location if available
    $locations = get_theme_mod( 'nav_menu_locations', [] );
    if ( ! empty( $locations ) ) {
        $loc_key = array_key_first( $locations );
        $locations[ $loc_key ] = $menu_id;
        set_theme_mod( 'nav_menu_locations', $locations );
    }

    wp_send_json_success( [ 'menu_id' => $menu_id, 'items_added' => count($items) ] );
}

// ── Inject Chatbot ────────────────────────────────────────────────────────────
add_action( 'wp_footer', 'wpts_inject_chatbot' );
function wpts_inject_chatbot() {
    if ( get_option('wpts_chatbot_enabled', '1') !== '1' ) return;
    $api_key = get_option( 'wpts_api_key', '' );
    if ( empty($api_key) ) return;

    $bot_name = esc_attr( get_option('wpts_bot_name', 'TechSites AI') );
    $color    = esc_attr( get_option('wpts_primary_color', '#0ea5e9') );
    $api_url  = esc_attr( WPTS_API_BASE );
    ?>
    <script
        src="<?php echo esc_url( WPTS_PLUGIN_URL . 'assets/chatbot.js' ); ?>"
        data-wpts-key="<?php echo esc_attr($api_key); ?>"
        data-wpts-api="<?php echo $api_url; ?>"
        data-wpts-name="<?php echo $bot_name; ?>"
        data-wpts-color="<?php echo $color; ?>"
        defer
    ></script>
    <?php
}

// ── Inject Custom CSS ─────────────────────────────────────────────────────────
add_action( 'wp_head', 'wpts_inject_custom_css' );
function wpts_inject_custom_css() {
    $css = get_option( 'wpts_custom_css', '' );
    if ( ! empty($css) ) {
        echo '<style id="wpts-brand-css">' . wp_strip_all_tags($css) . '</style>' . PHP_EOL;
    }
}

// ── Admin Scripts ─────────────────────────────────────────────────────────────
add_action( 'admin_enqueue_scripts', 'wpts_admin_scripts' );
function wpts_admin_scripts( $hook ) {
    if ( strpos($hook, 'wp-techsites') === false ) return;
    wp_enqueue_script('jquery');
}
