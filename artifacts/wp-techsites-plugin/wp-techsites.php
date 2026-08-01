<?php
/**
 * Plugin Name:  WP TechSites
 * Plugin URI:   https://wp.techsites.ai
 * Description:  Conecte seu WordPress ao ecossistema TechSites — IA, automação, directory e marketing em um só plugin.
 * Version:      1.1.0
 * Author:       TechSites.ai
 * Author URI:   https://techsites.ai
 * License:      GPL-2.0+
 * Text Domain:  wp-techsites
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'WPTS_VERSION',    '1.1.0' );
define( 'WPTS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPTS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WPTS_API_BASE',   'https://wp.techsites.ai/api/wp' );

// ─── Feature Registry ─────────────────────────────────────────────────────────
// status: 'active' | 'beta' | 'soon'
function wpts_get_features() {
    return [
        // ── ATIVAS ──────────────────────────────────────────────────────────
        [ 'id' => 'content',    'slug' => 'wp-techsites-content',   'name' => 'Conteúdo IA',       'icon' => '✍️',  'status' => 'active', 'credits' => 5,  'color' => '#0ea5e9', 'desc' => 'Gera posts, páginas e textos SEO-otimizados com IA' ],
        [ 'id' => 'colors',     'slug' => 'wp-techsites-colors',    'name' => 'Identidade Visual',  'icon' => '🎨',  'status' => 'active', 'credits' => 2,  'color' => '#7c3aed', 'desc' => 'Paleta de cores e CSS para sua marca' ],
        [ 'id' => 'menu',       'slug' => 'wp-techsites-menu',      'name' => 'Menu Builder',       'icon' => '📋',  'status' => 'active', 'credits' => 3,  'color' => '#059669', 'desc' => 'Cria e aplica menus inteligentes em 1 clique' ],
        [ 'id' => 'chatbot',    'slug' => 'wp-techsites-chatbot',   'name' => 'Chatbot IA',         'icon' => '💬',  'status' => 'active', 'credits' => 1,  'color' => '#0284c7', 'desc' => 'Chatbot flutuante com IA para atender visitantes' ],
        // ── EM BREVE ────────────────────────────────────────────────────────
        [ 'id' => 'directory',  'slug' => 'wp-techsites-directory', 'name' => 'Directory Builder',  'icon' => '📁',  'status' => 'soon',   'credits' => 10, 'color' => '#f59e0b', 'desc' => 'Cria diretórios e Yellow Pages com scraping automático' ],
        [ 'id' => 'scraping',   'slug' => 'wp-techsites-scraping',  'name' => 'Scraping & Index',   'icon' => '🔍',  'status' => 'soon',   'credits' => 20, 'color' => '#f59e0b', 'desc' => 'Captura e indexa negócios locais via BrightData' ],
        [ 'id' => 'listings',   'slug' => 'wp-techsites-listings',  'name' => 'Listings Manager',   'icon' => '📌',  'status' => 'soon',   'credits' => 5,  'color' => '#f59e0b', 'desc' => 'Gerencia listings padrão e premium com vitrine' ],
        [ 'id' => 'logo-ai',    'slug' => 'wp-techsites-logo-ai',   'name' => 'Logo IA',            'icon' => '🎯',  'status' => 'soon',   'credits' => 15, 'color' => '#f59e0b', 'desc' => 'Cria logotipos profissionais com inteligência artificial' ],
        [ 'id' => 'logo-swap',  'slug' => 'wp-techsites-logo-swap', 'name' => 'Troca de Logo',      'icon' => '🔄',  'status' => 'soon',   'credits' => 2,  'color' => '#f59e0b', 'desc' => 'Substitui o logo do tema em 1 clique' ],
        [ 'id' => 'wysiwyg',    'slug' => 'wp-techsites-wysiwyg',   'name' => 'Editor WYSIWYG',     'icon' => '📝',  'status' => 'soon',   'credits' => 0,  'color' => '#f59e0b', 'desc' => 'Editor visual avançado direto no painel WordPress' ],
        [ 'id' => 'seo',        'slug' => 'wp-techsites-seo',       'name' => 'SEO Audit',          'icon' => '🔎',  'status' => 'soon',   'credits' => 10, 'color' => '#f59e0b', 'desc' => 'Análise completa de SEO com sugestões da IA' ],
        [ 'id' => 'ads',        'slug' => 'wp-techsites-ads',       'name' => 'Ad Campaign IA',     'icon' => '📣',  'status' => 'soon',   'credits' => 8,  'color' => '#f59e0b', 'desc' => 'Cria campanhas para Google Ads e Meta com IA' ],
        [ 'id' => 'analytics',  'slug' => 'wp-techsites-analytics', 'name' => 'Analytics',          'icon' => '📊',  'status' => 'soon',   'credits' => 0,  'color' => '#f59e0b', 'desc' => 'Métricas, relatórios e insights do seu site' ],
    ];
}

// ─── Activation ───────────────────────────────────────────────────────────────
register_activation_hook( __FILE__, 'wpts_activate' );
function wpts_activate() {
    add_option( 'wpts_api_key',         '' );
    add_option( 'wpts_chatbot_enabled', '1' );
    add_option( 'wpts_bot_name',        get_bloginfo('name') . ' AI' );
    add_option( 'wpts_primary_color',   '#0ea5e9' );
    flush_rewrite_rules();
}

// ─── Admin Menu ───────────────────────────────────────────────────────────────
add_action( 'admin_menu', 'wpts_register_menu' );
function wpts_register_menu() {
    $icon = 'data:image/svg+xml;base64,' . base64_encode(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
        . '<circle cx="12" cy="12" r="10" fill="#0ea5e9"/>'
        . '<path d="M8 12h8M12 8v8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>'
        . '</svg>'
    );

    add_menu_page( 'WP TechSites', 'WP TechSites', 'manage_options', 'wp-techsites', 'wpts_dashboard_page', $icon, 30 );
    add_submenu_page( 'wp-techsites', 'Dashboard',      'Dashboard',      'manage_options', 'wp-techsites',          'wpts_dashboard_page' );
    add_submenu_page( 'wp-techsites', 'Configurações',  'Configurações',  'manage_options', 'wp-techsites-settings', 'wpts_settings_page' );

    foreach ( wpts_get_features() as $f ) {
        $badge = $f['status'] === 'active'
            ? '<span style="background:#dcfce7;color:#166534;font-size:9px;padding:1px 5px;border-radius:8px;margin-left:4px;font-weight:600;">●</span>'
            : '<span style="background:#fee2e2;color:#991b1b;font-size:9px;padding:1px 5px;border-radius:8px;margin-left:4px;font-weight:600;">●</span>';

        add_submenu_page(
            'wp-techsites',
            $f['name'] . ' — WP TechSites',
            $f['icon'] . ' ' . $f['name'] . $badge,
            'manage_options',
            $f['slug'],
            'wpts_feature_page_dispatcher'
        );
    }
}

// ─── Feature Page Dispatcher ──────────────────────────────────────────────────
function wpts_feature_page_dispatcher() {
    $page = $_GET['page'] ?? '';
    $features = wpts_get_features();
    foreach ( $features as $f ) {
        if ( $f['slug'] === $page ) {
            if ( $f['status'] === 'active' ) {
                call_user_func( 'wpts_active_' . str_replace('-', '_', $f['id']) . '_page', $f );
            } else {
                wpts_coming_soon_page( $f );
            }
            return;
        }
    }
    echo '<div class="wrap"><h1>Página não encontrada</h1></div>';
}

// ─── Coming Soon Page ─────────────────────────────────────────────────────────
function wpts_coming_soon_page( $feature ) {
    ?>
    <div class="wrap">
        <?php wpts_render_page_header( $feature['name'], $feature['status'] ); ?>

        <div style="max-width:680px;margin:40px auto;text-align:center;padding:60px 40px;
                    background:#fff;border-radius:16px;border:2px dashed <?php echo esc_attr($feature['color']); ?>20;
                    box-shadow:0 4px 24px rgba(0,0,0,.06);">

            <div style="font-size:72px;margin-bottom:16px;"><?php echo $feature['icon']; ?></div>
            <h2 style="font-size:28px;font-weight:700;color:#111827;margin:0 0 12px">
                <?php echo esc_html( $feature['name'] ); ?>
            </h2>
            <p style="color:#6b7280;font-size:16px;max-width:400px;margin:0 auto 28px;line-height:1.6">
                <?php echo esc_html( $feature['desc'] ); ?>
            </p>

            <!-- Roadmap badge -->
            <div style="display:inline-flex;align-items:center;gap:8px;background:#fef3c7;color:#92400e;
                        padding:10px 20px;border-radius:40px;font-size:14px;font-weight:600;margin-bottom:32px;">
                🚧 Em desenvolvimento — disponível em breve
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:left;margin-bottom:32px;">
                <?php
                $roadmap_items = wpts_get_roadmap_items( $feature['id'] );
                foreach ( $roadmap_items as $item ) : ?>
                    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;
                                display:flex;align-items:flex-start;gap:10px;">
                        <span style="font-size:18px;flex-shrink:0;"><?php echo $item['icon']; ?></span>
                        <div>
                            <div style="font-weight:600;font-size:13px;color:#111827;"><?php echo esc_html($item['title']); ?></div>
                            <div style="font-size:11px;color:#6b7280;margin-top:2px;"><?php echo esc_html($item['desc']); ?></div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <a href="https://wp.techsites.ai" target="_blank" class="button button-primary"
               style="background:<?php echo esc_attr($feature['color']); ?>;border-color:<?php echo esc_attr($feature['color']); ?>;
                      font-size:14px;padding:8px 24px;height:auto;">
                🔔 Me avise quando lançar
            </a>
        </div>
    </div>
    <?php
}

// ─── Roadmap Items per Feature ────────────────────────────────────────────────
function wpts_get_roadmap_items( $feature_id ) {
    $map = [
        'directory' => [
            [ 'icon' => '📡', 'title' => 'Scraping automático',  'desc' => 'Importa negócios via BrightData' ],
            [ 'icon' => '📄', 'title' => 'Páginas de listing',   'desc' => 'Cria páginas para cada negócio' ],
            [ 'icon' => '⭐', 'title' => 'Listings premium',     'desc' => 'Destaque pago para anunciantes' ],
            [ 'icon' => '🗂️', 'title' => 'Categorias e índice', 'desc' => 'Navegação por categoria/bairro' ],
        ],
        'scraping' => [
            [ 'icon' => '🌐', 'title' => 'BrightData SERP',      'desc' => 'Captura resultados de busca local' ],
            [ 'icon' => '🏪', 'title' => 'Google Maps scraping',  'desc' => 'Importa negócios do Maps' ],
            [ 'icon' => '📋', 'title' => 'N8N Workflow',         'desc' => 'Pipeline automatizado de scraping' ],
            [ 'icon' => '🔄', 'title' => 'Re-indexação',         'desc' => 'Atualiza dados automaticamente' ],
        ],
        'listings' => [
            [ 'icon' => '📌', 'title' => 'Listing padrão',       'desc' => 'Endereço, telefone, horário' ],
            [ 'icon' => '👑', 'title' => 'Listing premium',      'desc' => 'Fotos, reviews, destaque' ],
            [ 'icon' => '💳', 'title' => 'Pagamento online',     'desc' => 'Stripe/MP para anunciantes' ],
            [ 'icon' => '📊', 'title' => 'Painel do anunciante', 'desc' => 'Estatísticas de visualizações' ],
        ],
        'logo-ai' => [
            [ 'icon' => '🎨', 'title' => 'Geração com IA',       'desc' => 'Logo único para sua marca' ],
            [ 'icon' => '📐', 'title' => 'Vetorial SVG',         'desc' => 'Alta resolução para qualquer uso' ],
            [ 'icon' => '🎭', 'title' => 'Variações de estilo',  'desc' => 'Moderno, minimalista, bold' ],
            [ 'icon' => '⬇️', 'title' => 'Export PNG/SVG',      'desc' => 'Download imediato' ],
        ],
        'logo-swap' => [
            [ 'icon' => '📤', 'title' => 'Upload em 1 clique',   'desc' => 'Substitui logo do tema' ],
            [ 'icon' => '📱', 'title' => 'Favicon automático',   'desc' => 'Gera favicon a partir do logo' ],
            [ 'icon' => '🖼️', 'title' => 'Pré-visualização',    'desc' => 'Preview antes de salvar' ],
            [ 'icon' => '↩️', 'title' => 'Reverter fácil',      'desc' => 'Volta ao logo original' ],
        ],
        'wysiwyg' => [
            [ 'icon' => '📝', 'title' => 'Editor visual',        'desc' => 'Arrastar e soltar blocos' ],
            [ 'icon' => '🤖', 'title' => 'IA integrada',         'desc' => 'Sugestões em tempo real' ],
            [ 'icon' => '📱', 'title' => 'Preview responsivo',   'desc' => 'Mobile, tablet, desktop' ],
            [ 'icon' => '🔗', 'title' => 'Sync com WP',          'desc' => 'Salva diretamente no site' ],
        ],
        'seo' => [
            [ 'icon' => '🔎', 'title' => 'Auditoria completa',   'desc' => 'Score de 0 a 100 com IA' ],
            [ 'icon' => '🏷️', 'title' => 'Meta tags IA',        'desc' => 'Gera e aplica meta tags' ],
            [ 'icon' => '🔗', 'title' => 'Análise de links',     'desc' => 'Internos, externos, quebrados' ],
            [ 'icon' => '📈', 'title' => 'Relatório PDF',        'desc' => 'Exporta para o cliente' ],
        ],
        'ads' => [
            [ 'icon' => '📣', 'title' => 'Copy para Google Ads', 'desc' => 'Headlines e descrições com IA' ],
            [ 'icon' => '📘', 'title' => 'Copy para Meta',       'desc' => 'Facebook e Instagram Ads' ],
            [ 'icon' => '🎯', 'title' => 'Segmentação sugerida', 'desc' => 'Público-alvo por nicho' ],
            [ 'icon' => '💰', 'title' => 'Estimativa de ROI',    'desc' => 'Previsão de performance' ],
        ],
        'analytics' => [
            [ 'icon' => '📊', 'title' => 'Dashboard de métricas','desc' => 'Visitas, conversões, receita' ],
            [ 'icon' => '🔥', 'title' => 'Heatmap',              'desc' => 'Onde os usuários clicam' ],
            [ 'icon' => '📧', 'title' => 'Relatório semanal',    'desc' => 'Email automático todo domingo' ],
            [ 'icon' => '🎯', 'title' => 'Metas e funil',        'desc' => 'Taxa de conversão por página' ],
        ],
    ];
    return $map[$feature_id] ?? [
        [ 'icon' => '🚀', 'title' => 'Em desenvolvimento',  'desc' => 'Feature chegando em breve' ],
        [ 'icon' => '🔔', 'title' => 'Seja o primeiro',     'desc' => 'Notificação quando lançar' ],
    ];
}

// ─── Page Header Helper ───────────────────────────────────────────────────────
function wpts_render_page_header( $title, $status = 'active' ) {
    $badge_style = $status === 'active'
        ? 'background:#dcfce7;color:#166534;'
        : ( $status === 'beta' ? 'background:#dbeafe;color:#1d4ed8;' : 'background:#fee2e2;color:#991b1b;' );
    $badge_text = $status === 'active' ? '● Ativo' : ( $status === 'beta' ? '● Beta' : '● Em breve' );
    ?>
    <h1 style="display:flex;align-items:center;gap:10px;font-size:22px;margin-bottom:4px;">
        <span style="color:#0ea5e9;font-size:28px">●</span>
        WP TechSites &rsaquo; <?php echo esc_html($title); ?>
        <span style="font-size:12px;font-weight:600;<?php echo $badge_style; ?>padding:3px 12px;border-radius:20px;">
            <?php echo $badge_text; ?>
        </span>
    </h1>
    <?php
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
function wpts_dashboard_page() {
    $status    = wpts_get_status();
    $connected = ! empty( $status['connected'] );
    $features  = wpts_get_features();
    $active    = array_filter( $features, fn($f) => $f['status'] === 'active' );
    $soon      = array_filter( $features, fn($f) => $f['status'] !== 'active' );
    ?>
    <div class="wrap" style="max-width:1100px;">
        <h1 style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
            <span style="color:#0ea5e9;font-size:26px">●</span> WP TechSites
            <span style="font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px;
                <?php echo $connected ? 'background:#dcfce7;color:#166534' : 'background:#fee2e2;color:#991b1b'; ?>">
                <?php echo $connected ? '✓ Conectado' : '✗ Não conectado'; ?>
            </span>
            <span style="font-size:11px;color:#9ca3af;font-weight:400;">v<?php echo WPTS_VERSION; ?></span>
        </h1>
        <p style="color:#6b7280;margin:0 0 20px;">Painel central de todas as ferramentas TechSites para o seu WordPress.</p>

        <?php if ( ! $connected ) : ?>
            <div class="notice notice-warning" style="border-left-color:#f59e0b;border-radius:8px;padding:14px 16px;">
                <strong>⚡ Comece aqui:</strong> Configure sua <strong>Chave API</strong> em
                <a href="<?php echo admin_url('admin.php?page=wp-techsites-settings'); ?>">Configurações</a>
                para ativar todas as ferramentas.
                Obtenha sua chave em <a href="https://wp.techsites.ai/register" target="_blank">wp.techsites.ai</a>.
            </div>
        <?php else : ?>
            <!-- Stats Row -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;">
                <?php
                $stats = [
                    [ 'label' => 'Créditos',         'value' => number_format($status['credits'] ?? 0), 'icon' => '💰', 'color' => '#0ea5e9' ],
                    [ 'label' => 'Plano',             'value' => ucfirst($status['plan'] ?? 'Trial'),    'icon' => '🚀', 'color' => '#8b5cf6' ],
                    [ 'label' => 'Ferramentas ativas','value' => count($active),                         'icon' => '⚡', 'color' => '#10b981' ],
                    [ 'label' => 'Em desenvolvimento','value' => count($soon),                           'icon' => '🔧', 'color' => '#f59e0b' ],
                ];
                foreach ( $stats as $s ) : ?>
                    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px 18px;
                                border-left:4px solid <?php echo $s['color']; ?>;">
                        <div style="font-size:22px;margin-bottom:4px;"><?php echo $s['icon']; ?></div>
                        <div style="font-size:20px;font-weight:700;color:<?php echo $s['color']; ?>"><?php echo esc_html($s['value']); ?></div>
                        <div style="color:#6b7280;font-size:12px;margin-top:2px;"><?php echo esc_html($s['label']); ?></div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <!-- ── Active Features ────────────────────────────────────────────── -->
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:22px;margin-bottom:20px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                <h2 style="margin:0;font-size:16px;display:flex;align-items:center;gap:8px;">
                    <span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:12px;font-size:12px;">● ATIVAS</span>
                    Ferramentas Disponíveis
                </h2>
                <span style="font-size:12px;color:#6b7280;"><?php echo count($active); ?> de <?php echo count($features); ?> ferramentas</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;">
                <?php foreach ( $active as $f ) : ?>
                    <a href="<?php echo admin_url('admin.php?page=' . esc_attr($f['slug'])); ?>"
                       style="text-decoration:none;display:block;background:#f0f9ff;border:1.5px solid #bae6fd;
                              border-radius:12px;padding:16px;transition:all .15s;
                              border-left:4px solid <?php echo esc_attr($f['color']); ?>;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                            <span style="font-size:26px;"><?php echo $f['icon']; ?></span>
                            <span style="font-size:10px;font-weight:700;background:#dcfce7;color:#166534;
                                         padding:2px 8px;border-radius:10px;">● ATIVO</span>
                        </div>
                        <div style="font-size:14px;font-weight:700;color:#0369a1;margin-bottom:4px;"><?php echo esc_html($f['name']); ?></div>
                        <div style="font-size:11px;color:#64748b;line-height:1.4;"><?php echo esc_html($f['desc']); ?></div>
                        <?php if ( $f['credits'] > 0 ) : ?>
                            <div style="margin-top:8px;font-size:11px;color:#0369a1;font-weight:600;">
                                ⚡ <?php echo $f['credits']; ?> créditos/uso
                            </div>
                        <?php endif; ?>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- ── Coming Soon Features ───────────────────────────────────────── -->
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:22px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                <h2 style="margin:0;font-size:16px;display:flex;align-items:center;gap:8px;">
                    <span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:12px;font-size:12px;">🔧 EM BREVE</span>
                    Próximas Funcionalidades
                </h2>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;">
                <?php foreach ( $soon as $f ) : ?>
                    <a href="<?php echo admin_url('admin.php?page=' . esc_attr($f['slug'])); ?>"
                       style="text-decoration:none;display:block;background:#fffbeb;border:1.5px dashed #fde68a;
                              border-radius:12px;padding:16px;opacity:.85;
                              border-left:4px solid #f59e0b;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                            <span style="font-size:26px;"><?php echo $f['icon']; ?></span>
                            <span style="font-size:10px;font-weight:700;background:#fee2e2;color:#991b1b;
                                         padding:2px 8px;border-radius:10px;">EM BREVE</span>
                        </div>
                        <div style="font-size:14px;font-weight:700;color:#92400e;margin-bottom:4px;"><?php echo esc_html($f['name']); ?></div>
                        <div style="font-size:11px;color:#78716c;line-height:1.4;"><?php echo esc_html($f['desc']); ?></div>
                        <?php if ( $f['credits'] > 0 ) : ?>
                            <div style="margin-top:8px;font-size:11px;color:#92400e;font-weight:600;">
                                ⚡ <?php echo $f['credits']; ?> créditos/uso
                            </div>
                        <?php endif; ?>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Quick Links bar -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-top:20px;
                    display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <span style="font-size:13px;color:#64748b;font-weight:600;">Acessar:</span>
            <a href="<?php echo admin_url('admin.php?page=wp-techsites-settings'); ?>" class="button">⚙️ Configurações</a>
            <a href="https://wp.techsites.ai" target="_blank" class="button">🔗 Painel TechSites</a>
            <a href="https://wp.techsites.ai/register" target="_blank" class="button">➕ Criar conta</a>
            <a href="https://wp.techsites.ai/docs" target="_blank" class="button">📖 Documentação</a>
        </div>
    </div>
    <?php
}

// ─── Active Tool Pages ────────────────────────────────────────────────────────

function wpts_active_content_page( $feature ) { ?>
    <div class="wrap" style="max-width:900px;">
        <?php wpts_render_page_header( $feature['name'], 'active' ); ?>
        <p style="color:#6b7280;margin-bottom:20px;">Gere conteúdo otimizado para SEO — posts, páginas e seções — e publique diretamente no WordPress.</p>

        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:24px;">
            <table class="form-table" style="margin:0">
                <tr>
                    <th style="width:140px"><label for="wpts-content-topic">Tópico *</label></th>
                    <td><input id="wpts-content-topic" type="text" class="large-text" placeholder="ex: Melhores serviços de SEO em Curitiba" /></td>
                </tr>
                <tr>
                    <th><label for="wpts-content-type">Tipo</label></th>
                    <td>
                        <select id="wpts-content-type">
                            <option value="page">Página</option>
                            <option value="post">Artigo de Blog</option>
                            <option value="section">Seção / Bloco</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><label for="wpts-content-tone">Tom de voz</label></th>
                    <td>
                        <select id="wpts-content-tone">
                            <option value="professional">Profissional</option>
                            <option value="friendly">Amigável</option>
                            <option value="persuasive">Persuasivo</option>
                            <option value="technical">Técnico</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><label for="wpts-content-lang">Idioma</label></th>
                    <td>
                        <select id="wpts-content-lang">
                            <option value="pt">Português</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                        </select>
                    </td>
                </tr>
            </table>
            <button id="wpts-btn-content" class="button button-primary"
                    style="margin-top:16px;background:#0ea5e9;border-color:#0ea5e9;height:36px;font-size:13px;">
                ✍️ Gerar Conteúdo &nbsp;<span style="opacity:.7;font-size:11px;">(<?php echo $feature['credits']; ?> créditos)</span>
            </button>
            <div id="wpts-content-result" style="display:none;margin-top:20px;"></div>
        </div>
    </div>
    <?php wpts_content_script(); ?>
<?php }

function wpts_active_colors_page( $feature ) { ?>
    <div class="wrap" style="max-width:900px;">
        <?php wpts_render_page_header( $feature['name'], 'active' ); ?>
        <p style="color:#6b7280;margin-bottom:20px;">Gere uma paleta CSS para sua marca e aplique com 1 clique no seu site.</p>

        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:24px;">
            <table class="form-table" style="margin:0">
                <tr>
                    <th style="width:140px"><label for="wpts-color-primary">Cor Principal</label></th>
                    <td><input id="wpts-color-primary" type="color" value="<?php echo esc_attr(get_option('wpts_primary_color','#0ea5e9')); ?>" /></td>
                </tr>
                <tr>
                    <th><label for="wpts-color-secondary">Cor Secundária</label></th>
                    <td><input id="wpts-color-secondary" type="color" value="#0284c7" /></td>
                </tr>
                <tr>
                    <th><label for="wpts-color-style">Estilo</label></th>
                    <td>
                        <select id="wpts-color-style">
                            <option value="modern">Moderno</option>
                            <option value="professional">Profissional</option>
                            <option value="minimal">Minimalista</option>
                            <option value="bold">Bold / Impactante</option>
                        </select>
                    </td>
                </tr>
            </table>
            <button id="wpts-btn-colors" class="button"
                    style="margin-top:16px;border-color:#7c3aed;color:#7c3aed;height:36px;font-size:13px;">
                🎨 Aplicar Identidade Visual &nbsp;<span style="opacity:.7;font-size:11px;">(<?php echo $feature['credits']; ?> créditos)</span>
            </button>
            <div id="wpts-colors-result" style="display:none;margin-top:20px;"></div>
        </div>
    </div>
    <?php wpts_colors_script(); ?>
<?php }

function wpts_active_menu_page( $feature ) { ?>
    <div class="wrap" style="max-width:900px;">
        <?php wpts_render_page_header( $feature['name'], 'active' ); ?>
        <p style="color:#6b7280;margin-bottom:20px;">Gere um menu inteligente para o seu nicho e aplique ao menu principal em 1 clique.</p>

        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:24px;">
            <table class="form-table" style="margin:0">
                <tr>
                    <th style="width:140px"><label for="wpts-menu-niche">Nicho do site *</label></th>
                    <td><input id="wpts-menu-niche" type="text" class="large-text" placeholder="ex: Agência de Marketing Digital em Curitiba" /></td>
                </tr>
                <tr>
                    <th><label for="wpts-menu-lang">Idioma</label></th>
                    <td>
                        <select id="wpts-menu-lang">
                            <option value="pt">Português</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                        </select>
                    </td>
                </tr>
            </table>
            <button id="wpts-btn-menu" class="button"
                    style="margin-top:16px;border-color:#059669;color:#059669;height:36px;font-size:13px;">
                📋 Gerar Menu &nbsp;<span style="opacity:.7;font-size:11px;">(<?php echo $feature['credits']; ?> créditos)</span>
            </button>
            <div id="wpts-menu-result" style="display:none;margin-top:20px;"></div>
        </div>
    </div>
    <?php wpts_menu_script(); ?>
<?php }

function wpts_active_chatbot_page( $feature ) {
    $chatbot_on = get_option('wpts_chatbot_enabled', '1') === '1';
    $bot_name   = get_option('wpts_bot_name', 'TechSites AI');
    $color      = get_option('wpts_primary_color', '#0ea5e9');
    ?>
    <div class="wrap" style="max-width:900px;">
        <?php wpts_render_page_header( $feature['name'], 'active' ); ?>
        <p style="color:#6b7280;margin-bottom:20px;">Chatbot flutuante com IA para atender visitantes 24/7 no seu site WordPress.</p>

        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:24px;">
            <!-- Status -->
            <div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:10px;margin-bottom:20px;
                <?php echo $chatbot_on ? 'background:#dcfce7;border:1px solid #bbf7d0;' : 'background:#f3f4f6;border:1px solid #e5e7eb;'; ?>">
                <span style="font-size:28px;"><?php echo $chatbot_on ? '✅' : '❌'; ?></span>
                <div>
                    <div style="font-weight:700;color:<?php echo $chatbot_on ? '#166534' : '#374151'; ?>;">
                        Chatbot <?php echo $chatbot_on ? 'ativo' : 'desativado'; ?>
                    </div>
                    <div style="font-size:12px;color:<?php echo $chatbot_on ? '#166534' : '#6b7280'; ?>;">
                        <?php echo $chatbot_on ? "Aparece no canto inferior direito do seu site" : "Ative nas Configurações para exibir no site"; ?>
                    </div>
                </div>
            </div>

            <!-- Config preview -->
            <table class="form-table" style="margin:0">
                <tr>
                    <th style="width:140px">Nome do bot</th>
                    <td><strong><?php echo esc_html($bot_name); ?></strong></td>
                </tr>
                <tr>
                    <th>Cor principal</th>
                    <td>
                        <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:<?php echo esc_attr($color); ?>;
                                     vertical-align:middle;border:1px solid #ccc;margin-right:6px;"></span>
                        <?php echo esc_html($color); ?>
                    </td>
                </tr>
                <tr>
                    <th>Custo por mensagem</th>
                    <td><strong><?php echo $feature['credits']; ?> crédito</strong></td>
                </tr>
            </table>
            <a href="<?php echo admin_url('admin.php?page=wp-techsites-settings'); ?>" class="button button-primary"
               style="margin-top:16px;background:#0284c7;border-color:#0284c7;">
                ⚙️ Configurar chatbot
            </a>
        </div>
    </div>
<?php }

// ─── Settings Page ─────────────────────────────────────────────────────────────
function wpts_settings_page() {
    settings_errors( 'wpts_settings' );
    $api_key         = get_option( 'wpts_api_key', '' );
    $chatbot_enabled = get_option( 'wpts_chatbot_enabled', '1' );
    $bot_name        = get_option( 'wpts_bot_name', get_bloginfo('name') . ' AI' );
    $primary_color   = get_option( 'wpts_primary_color', '#0ea5e9' );
    ?>
    <div class="wrap" style="max-width:800px;">
        <?php wpts_render_page_header( 'Configurações' ); ?>
        <p style="color:#6b7280;margin-bottom:20px;">
            Não tem conta? <a href="https://wp.techsites.ai/register" target="_blank"><strong>Crie em wp.techsites.ai</strong></a> e obtenha sua Chave API gratuitamente.
        </p>

        <form method="post">
            <?php wp_nonce_field( 'wpts_settings', 'wpts_nonce' ); ?>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:24px;margin-bottom:20px;">
                <h3 style="margin-top:0;font-size:15px;border-bottom:1px solid #f3f4f6;padding-bottom:12px;">🔑 Conexão com TechSites</h3>
                <table class="form-table" style="margin:0">
                    <tr>
                        <th style="width:160px"><label for="wpts_api_key">Chave API *</label></th>
                        <td>
                            <input name="wpts_api_key" id="wpts_api_key" type="text"
                                   value="<?php echo esc_attr($api_key); ?>"
                                   class="large-text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                            <p class="description">Cole a chave obtida em <a href="https://wp.techsites.ai" target="_blank">wp.techsites.ai</a></p>
                        </td>
                    </tr>
                </table>
            </div>

            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:24px;margin-bottom:20px;">
                <h3 style="margin-top:0;font-size:15px;border-bottom:1px solid #f3f4f6;padding-bottom:12px;">💬 Chatbot IA</h3>
                <table class="form-table" style="margin:0">
                    <tr>
                        <th style="width:160px"><label for="wpts_chatbot_enabled">Ativar chatbot</label></th>
                        <td>
                            <label>
                                <input name="wpts_chatbot_enabled" id="wpts_chatbot_enabled" type="checkbox"
                                       value="1" <?php checked($chatbot_enabled, '1'); ?> />
                                Exibir chatbot flutuante no site
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="wpts_bot_name">Nome do bot</label></th>
                        <td>
                            <input name="wpts_bot_name" id="wpts_bot_name" type="text"
                                   value="<?php echo esc_attr($bot_name); ?>"
                                   class="regular-text" placeholder="TechSites AI" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="wpts_primary_color">Cor do botão</label></th>
                        <td>
                            <input name="wpts_primary_color" id="wpts_primary_color" type="color"
                                   value="<?php echo esc_attr($primary_color); ?>" />
                        </td>
                    </tr>
                </table>
            </div>

            <?php submit_button('💾 Salvar Configurações'); ?>
        </form>

        <?php if ( ! empty($api_key) ) :
            $test = wpts_api('/verify'); ?>
            <div style="padding:16px;border-radius:10px;
                <?php echo ! empty($test['connected']) ? 'background:#dcfce7;border:1px solid #bbf7d0;' : 'background:#fee2e2;border:1px solid #fecaca;'; ?>">
                <?php if ( ! empty($test['connected']) ) : ?>
                    <strong style="color:#166534;">✅ Conectado!</strong>
                    Site: <strong><?php echo esc_html($test['siteName'] ?? ''); ?></strong> |
                    Créditos: <strong><?php echo esc_html($test['credits'] ?? 0); ?></strong> |
                    Plano: <strong><?php echo esc_html(ucfirst($test['plan'] ?? 'trial')); ?></strong>
                <?php else : ?>
                    <strong style="color:#991b1b;">❌ Chave inválida ou API inacessível.</strong>
                    Verifique a chave e tente novamente.
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
}

// ─── API Helper ───────────────────────────────────────────────────────────────
function wpts_api( $endpoint, $body = null, $method = 'GET' ) {
    $api_key = get_option( 'wpts_api_key', '' );
    $args = [
        'method'  => $method,
        'headers' => [ 'Content-Type' => 'application/json', 'X-WP-Site-Key' => $api_key ],
        'timeout' => 30,
    ];
    if ( $body !== null ) $args['body'] = wp_json_encode( $body );
    $response = wp_remote_request( WPTS_API_BASE . $endpoint, $args );
    if ( is_wp_error( $response ) ) return [ 'error' => $response->get_error_message() ];
    return json_decode( wp_remote_retrieve_body( $response ), true );
}

// ─── Connection Status (cached) ───────────────────────────────────────────────
function wpts_get_status() {
    $api_key = get_option( 'wpts_api_key', '' );
    if ( empty( $api_key ) ) return null;
    $key = 'wpts_status_' . md5( $api_key );
    $cached = get_transient( $key );
    if ( $cached !== false ) return $cached;
    $result = wpts_api( '/verify' );
    if ( ! empty( $result['connected'] ) ) set_transient( $key, $result, 5 * MINUTE_IN_SECONDS );
    return $result;
}

// ─── AJAX Handlers ────────────────────────────────────────────────────────────
add_action( 'wp_ajax_wpts_create_post', 'wpts_ajax_create_post' );
function wpts_ajax_create_post() {
    check_ajax_referer( 'wpts_ajax', 'nonce' );
    if ( ! current_user_can( 'publish_posts' ) ) wp_send_json_error( 'Permissão negada' );
    $title    = sanitize_text_field( $_POST['title'] ?? '' );
    $content  = wp_kses_post( $_POST['content'] ?? '' );
    $excerpt  = sanitize_textarea_field( $_POST['excerpt'] ?? '' );
    $type     = in_array( $_POST['type'] ?? '', ['post', 'page', 'section'] ) ? $_POST['type'] : 'page';
    $post_type = $type === 'post' ? 'post' : 'page';
    $post_id = wp_insert_post([ 'post_title' => $title, 'post_content' => $content, 'post_excerpt' => $excerpt, 'post_status' => 'draft', 'post_type' => $post_type ]);
    if ( is_wp_error( $post_id ) ) wp_send_json_error( $post_id->get_error_message() );
    wp_send_json_success([ 'post_id' => $post_id, 'edit_url' => get_edit_post_link( $post_id, 'raw' ) ]);
}

add_action( 'wp_ajax_wpts_save_css', 'wpts_ajax_save_css' );
function wpts_ajax_save_css() {
    check_ajax_referer( 'wpts_ajax', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permissão negada' );
    update_option( 'wpts_custom_css', wp_strip_all_tags( $_POST['css'] ?? '' ) );
    wp_send_json_success();
}

add_action( 'wp_ajax_wpts_apply_menu', 'wpts_ajax_apply_menu' );
function wpts_ajax_apply_menu() {
    check_ajax_referer( 'wpts_ajax', 'nonce' );
    if ( ! current_user_can( 'edit_theme_options' ) ) wp_send_json_error( 'Permissão negada' );
    $items = json_decode( stripslashes( $_POST['items'] ?? '[]' ), true );
    if ( ! is_array( $items ) || empty( $items ) ) wp_send_json_error( 'Itens inválidos' );
    $menus = wp_get_nav_menus();
    $menu_id = ! empty( $menus ) ? $menus[0]->term_id : wp_create_nav_menu( 'Menu Principal' );
    if ( is_wp_error( $menu_id ) ) wp_send_json_error( $menu_id->get_error_message() );
    foreach ( wp_get_nav_menu_items($menu_id) ?: [] as $item ) wp_delete_post( $item->ID, true );
    foreach ( $items as $i => $item ) {
        wp_update_nav_menu_item( $menu_id, 0, [
            'menu-item-title'    => sanitize_text_field( $item['label'] ?? '' ),
            'menu-item-url'      => home_url( sanitize_text_field($item['slug'] ?? '/') ),
            'menu-item-status'   => 'publish',
            'menu-item-position' => $i + 1,
            'menu-item-type'     => 'custom',
        ]);
    }
    $locs = get_theme_mod( 'nav_menu_locations', [] );
    if ( ! empty($locs) ) { $locs[array_key_first($locs)] = $menu_id; set_theme_mod( 'nav_menu_locations', $locs ); }
    wp_send_json_success([ 'menu_id' => $menu_id, 'items_added' => count($items) ]);
}

// ─── Save Settings ─────────────────────────────────────────────────────────────
add_action( 'admin_init', 'wpts_save_settings' );
function wpts_save_settings() {
    if ( ! isset( $_POST['wpts_nonce'] ) ) return;
    if ( ! wp_verify_nonce( $_POST['wpts_nonce'], 'wpts_settings' ) ) return;
    if ( ! current_user_can( 'manage_options' ) ) return;
    update_option( 'wpts_api_key',         sanitize_text_field( $_POST['wpts_api_key'] ?? '' ) );
    update_option( 'wpts_chatbot_enabled',  isset( $_POST['wpts_chatbot_enabled'] ) ? '1' : '0' );
    update_option( 'wpts_bot_name',         sanitize_text_field( $_POST['wpts_bot_name'] ?? 'TechSites AI' ) );
    update_option( 'wpts_primary_color',    sanitize_hex_color( $_POST['wpts_primary_color'] ?? '#0ea5e9' ) );
    add_settings_error( 'wpts_settings', 'saved', '✅ Configurações salvas com sucesso.', 'updated' );
}

// ─── Inject Chatbot ────────────────────────────────────────────────────────────
add_action( 'wp_footer', 'wpts_inject_chatbot' );
function wpts_inject_chatbot() {
    if ( get_option('wpts_chatbot_enabled', '1') !== '1' ) return;
    $api_key = get_option( 'wpts_api_key', '' );
    if ( empty($api_key) ) return;
    ?>
    <script src="<?php echo esc_url( WPTS_PLUGIN_URL . 'assets/chatbot.js' ); ?>"
        data-wpts-key="<?php echo esc_attr($api_key); ?>"
        data-wpts-api="<?php echo esc_attr(WPTS_API_BASE); ?>"
        data-wpts-name="<?php echo esc_attr(get_option('wpts_bot_name','TechSites AI')); ?>"
        data-wpts-color="<?php echo esc_attr(get_option('wpts_primary_color','#0ea5e9')); ?>"
        defer></script>
    <?php
}

// ─── Inject Custom CSS ─────────────────────────────────────────────────────────
add_action( 'wp_head', 'wpts_inject_custom_css' );
function wpts_inject_custom_css() {
    $css = get_option( 'wpts_custom_css', '' );
    if ( $css ) echo '<style id="wpts-brand-css">' . wp_strip_all_tags($css) . '</style>' . PHP_EOL;
}

// ─── Admin Scripts ─────────────────────────────────────────────────────────────
add_action( 'admin_enqueue_scripts', 'wpts_admin_scripts' );
function wpts_admin_scripts( $hook ) {
    if ( strpos($hook, 'wp-techsites') === false ) return;
    wp_enqueue_script('jquery');
}

// ─── JavaScript: Content Tool ─────────────────────────────────────────────────
function wpts_content_script() { ?>
<script>
(function($){
    var API = '<?php echo esc_js(WPTS_API_BASE); ?>';
    var KEY = '<?php echo esc_js(get_option("wpts_api_key","")); ?>';
    var NONCE = '<?php echo wp_create_nonce("wpts_ajax"); ?>';

    $('#wpts-btn-content').on('click', function(){
        var topic = $('#wpts-content-topic').val();
        if (!topic) { alert('Informe um tópico.'); return; }
        $(this).prop('disabled',true).text('⏳ Gerando...');
        $('#wpts-content-result').show().html('<p style="color:#6b7280;">⏳ A IA está criando seu conteúdo...</p>');
        $.ajax({
            url: API+'/generate-content', method:'POST', contentType:'application/json',
            headers:{'X-WP-Site-Key':KEY},
            data: JSON.stringify({ topic: topic, type: $('#wpts-content-type').val(), tone: $('#wpts-content-tone').val(), language: $('#wpts-content-lang').val() })
        }).done(function(d){
            if(d.error){ $('#wpts-content-result').html('<p style="color:red">❌ '+d.error+'</p>'); return; }
            $('#wpts-content-result').html(
                '<div style="background:#f0f9ff;padding:16px;border-radius:10px;border:1px solid #bae6fd;">'
                +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">'
                +'<strong style="color:#0369a1;font-size:15px;">✅ Conteúdo gerado!</strong>'
                +'<span style="background:#dbeafe;color:#1d4ed8;padding:3px 10px;border-radius:10px;font-size:11px;">⚡ '+d.creditsUsed+' créditos usados</span>'
                +'</div>'
                +'<p style="font-weight:700;font-size:16px;margin:0 0 6px;">'+$('<div>').text(d.title).html()+'</p>'
                +'<p style="font-size:12px;color:#475569;margin:0 0 12px;">'+$('<div>').text(d.metaDescription||'').html()+'</p>'
                +'<details><summary style="cursor:pointer;color:#0369a1;font-size:13px;">📄 Ver HTML gerado</summary>'
                +'<pre style="font-size:11px;overflow:auto;max-height:200px;margin-top:8px;background:#e0f2fe;padding:10px;border-radius:8px;">'+$('<div>').text(d.content||'').html()+'</pre></details>'
                +'<button class="button button-primary" style="margin-top:12px;background:#0ea5e9;border-color:#0ea5e9;" id="wpts-publish-btn">📤 Criar rascunho no WordPress</button>'
                +'</div>'
            );
            $('#wpts-publish-btn').on('click',function(){
                $(this).text('Publicando...').prop('disabled',true);
                $.post(ajaxurl,{action:'wpts_create_post',nonce:NONCE,title:d.title,content:d.content,excerpt:d.excerpt||'',type:$('#wpts-content-type').val()},function(r){
                    if(r.success){ $('#wpts-publish-btn').replaceWith('<a href="'+r.data.edit_url+'" target="_blank" class="button">✅ Ver rascunho criado →</a>'); }
                    else { alert('Erro: '+r.data); }
                });
            });
        }).fail(function(){ $('#wpts-content-result').html('<p style="color:red">❌ Erro de conexão.</p>'); })
        .always(function(){ $('#wpts-btn-content').prop('disabled',false).text('✍️ Gerar Conteúdo'); });
    });
})(jQuery);
</script>
<?php }

// ─── JavaScript: Colors Tool ──────────────────────────────────────────────────
function wpts_colors_script() { ?>
<script>
(function($){
    var API = '<?php echo esc_js(WPTS_API_BASE); ?>';
    var KEY = '<?php echo esc_js(get_option("wpts_api_key","")); ?>';
    var NONCE = '<?php echo wp_create_nonce("wpts_ajax"); ?>';

    $('#wpts-btn-colors').on('click',function(){
        $(this).prop('disabled',true).text('⏳ Gerando...');
        $('#wpts-colors-result').show().html('<p style="color:#6b7280;">⏳ Gerando paleta de cores...</p>');
        $.ajax({
            url: API+'/apply-colors', method:'POST', contentType:'application/json',
            headers:{'X-WP-Site-Key':KEY},
            data: JSON.stringify({ primaryColor: $('#wpts-color-primary').val(), secondaryColor: $('#wpts-color-secondary').val(), style: $('#wpts-color-style').val() })
        }).done(function(d){
            if(d.error){ $('#wpts-colors-result').html('<p style="color:red">❌ '+d.error+'</p>'); return; }
            var el=document.getElementById('wpts-preview-css');
            if(!el){ el=document.createElement('style'); el.id='wpts-preview-css'; document.head.appendChild(el); }
            el.textContent=d.css;
            $('#wpts-colors-result').html(
                '<div style="background:#f5f3ff;padding:16px;border-radius:10px;border:1px solid #ddd6fe;">'
                +'<strong style="color:#7c3aed;">✅ Prévia aplicada nesta página!</strong>'
                +'<p style="font-size:12px;color:#475569;margin:8px 0;">O CSS foi aplicado como prévia. Clique abaixo para salvar permanentemente no site.</p>'
                +'<button class="button" style="border-color:#7c3aed;color:#7c3aed;" id="wpts-save-colors">💾 Salvar no site</button>'
                +'</div>'
            );
            $('#wpts-save-colors').on('click',function(){
                $(this).text('Salvando...').prop('disabled',true);
                $.post(ajaxurl,{action:'wpts_save_css',nonce:NONCE,css:d.css},function(r){
                    if(r.success){ $('#wpts-save-colors').replaceWith('<span style="color:#059669;font-weight:600;">✅ CSS salvo com sucesso!</span>'); }
                });
            });
        }).fail(function(){ $('#wpts-colors-result').html('<p style="color:red">❌ Erro de conexão.</p>'); })
        .always(function(){ $('#wpts-btn-colors').prop('disabled',false).text('🎨 Aplicar Identidade Visual'); });
    });
})(jQuery);
</script>
<?php }

// ─── JavaScript: Menu Tool ────────────────────────────────────────────────────
function wpts_menu_script() { ?>
<script>
(function($){
    var API = '<?php echo esc_js(WPTS_API_BASE); ?>';
    var KEY = '<?php echo esc_js(get_option("wpts_api_key","")); ?>';
    var NONCE = '<?php echo wp_create_nonce("wpts_ajax"); ?>';

    $('#wpts-btn-menu').on('click',function(){
        var niche=$('#wpts-menu-niche').val();
        if(!niche){ alert('Informe o nicho do site.'); return; }
        $(this).prop('disabled',true).text('⏳ Gerando...');
        $('#wpts-menu-result').show().html('<p style="color:#6b7280;">⏳ Gerando menu...</p>');
        $.ajax({
            url: API+'/generate-menu', method:'POST', contentType:'application/json',
            headers:{'X-WP-Site-Key':KEY},
            data: JSON.stringify({ niche: niche, language: $('#wpts-menu-lang').val() })
        }).done(function(d){
            if(d.error){ $('#wpts-menu-result').html('<p style="color:red">❌ '+d.error+'</p>'); return; }
            var items=d.menuItems||[], html='<div style="background:#ecfdf5;padding:16px;border-radius:10px;border:1px solid #a7f3d0;">'
                +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'
                +'<strong style="color:#059669;">✅ Menu sugerido</strong>'
                +'<span style="background:#d1fae5;color:#065f46;padding:3px 10px;border-radius:10px;font-size:11px;">⚡ '+d.creditsUsed+' créditos</span>'
                +'</div><ul style="margin:0;padding:0;list-style:none;">';
            items.forEach(function(item){
                html+='<li style="padding:8px 0;border-bottom:1px solid #d1fae5;display:flex;align-items:center;gap:8px;">'
                    +'<span style="font-size:18px;">'+item.icon+'</span>'
                    +'<strong>'+$('<div>').text(item.label).html()+'</strong>'
                    +'<span style="color:#6b7280;font-size:12px;">'+$('<div>').text(item.slug).html()+'</span>'
                    +'</li>';
            });
            html+='</ul><button class="button" style="margin-top:14px;border-color:#059669;color:#059669;" id="wpts-apply-menu">📋 Aplicar ao menu principal</button></div>';
            $('#wpts-menu-result').html(html);
            $('#wpts-apply-menu').on('click',function(){
                $(this).text('Aplicando...').prop('disabled',true);
                $.post(ajaxurl,{action:'wpts_apply_menu',nonce:NONCE,items:JSON.stringify(items)},function(r){
                    if(r.success){ $('#wpts-apply-menu').replaceWith('<span style="color:#059669;font-weight:700;">✅ Menu aplicado com sucesso!</span>'); }
                    else { alert('Erro: '+r.data); }
                });
            });
        }).fail(function(){ $('#wpts-menu-result').html('<p style="color:red">❌ Erro de conexão.</p>'); })
        .always(function(){ $('#wpts-btn-menu').prop('disabled',false).text('📋 Gerar Menu'); });
    });
})(jQuery);
</script>
<?php }
