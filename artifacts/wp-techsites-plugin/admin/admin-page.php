<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// ─── Register Admin Menu ──────────────────────────────────────────────────────
add_action( 'admin_menu', 'wpts_register_admin_menu' );
function wpts_register_admin_menu() {
    add_menu_page(
        'WP TechSites',
        'WP TechSites',
        'manage_options',
        'wp-techsites',
        'wpts_render_admin_page',
        'data:image/svg+xml;base64,' . base64_encode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#a5b4fc"><path d="M10 2L2 7l8 5 8-5-8-5zM2 13l8 5 8-5M2 10l8 5 8-5"/></svg>'),
        3
    );
}

// ─── Tools Definition ─────────────────────────────────────────────────────────
function wpts_get_tools() {
    return [
        [ 'id' => 'dashboard',    'icon' => '🏠', 'label' => 'Dashboard',           'badge' => '' ],
        [ 'id' => 'audit',        'icon' => '🔍', 'label' => 'SEO Audit',            'badge' => '' ],
        [ 'id' => 'directory',    'icon' => '📁', 'label' => 'Directory Builder',    'badge' => '' ],
        [ 'id' => 'scraping',     'icon' => '🌐', 'label' => 'Scraping',             'badge' => '' ],
        [ 'id' => 'populate',     'icon' => '⚡', 'label' => 'Popular Diretório',    'badge' => 'NOVO' ],
        [ 'id' => 'listings',     'icon' => '📌', 'label' => 'Listings',             'badge' => '' ],
        [ 'id' => 'page-from-url','icon' => '🔗', 'label' => 'Página de Empresa',   'badge' => 'NOVO' ],
        [ 'id' => 'article',      'icon' => '📰', 'label' => 'Artigo com Imagens',  'badge' => 'NOVO' ],
        [ 'id' => 'logo',         'icon' => '🎯', 'label' => 'Logo Builder',        'badge' => '' ],
        [ 'id' => 'content',      'icon' => '✍️', 'label' => 'Conteúdo IA',         'badge' => '' ],
        [ 'id' => 'branding',     'icon' => '🎨', 'label' => 'Identidade Visual',   'badge' => '' ],
        [ 'id' => 'menu',         'icon' => '📋', 'label' => 'Menu Builder',        'badge' => '' ],
        [ 'id' => 'chatbot',      'icon' => '💬', 'label' => 'Chatbot IA',          'badge' => '' ],
        [ 'id' => 'monetize',     'icon' => '💰', 'label' => 'Monetização',         'badge' => '' ],
        [ 'id' => 'chat-editor',  'icon' => '🤖', 'label' => 'Editor via Chat',     'badge' => '' ],
        [ 'id' => 'settings',     'icon' => '⚙️', 'label' => 'Configurações',       'badge' => '' ],
    ];
}

// ─── Main Render ──────────────────────────────────────────────────────────────
function wpts_render_admin_page() {
    $active = sanitize_key( $_GET['tab'] ?? 'dashboard' );
    $theme  = wpts_detect_theme();
    $credits = (int) get_option( 'wpts_credits', 0 );
    $plan    = get_option( 'wpts_plan', 'trial' );
    ?>
    <div class="wpts-wrap">

        <!-- SIDEBAR -->
        <aside class="wpts-sidebar">
            <div class="wpts-logo">
                <span class="wpts-logo-mark">⬡</span>
                <div>
                    <div class="wpts-logo-name">WP TechSites</div>
                    <div class="wpts-logo-sub">v<?php echo WPTS_VERSION; ?></div>
                </div>
            </div>

            <div class="wpts-credits-badge">
                <span class="wpts-credits-icon">⚡</span>
                <div>
                    <div class="wpts-credits-number"><?php echo number_format($credits); ?></div>
                    <div class="wpts-credits-label">créditos</div>
                </div>
                <span class="wpts-plan-tag plan-<?php echo esc_attr($plan); ?>"><?php echo strtoupper($plan); ?></span>
            </div>

            <nav class="wpts-nav">
                <?php foreach ( wpts_get_tools() as $tool ) :
                    $href = admin_url( 'admin.php?page=wp-techsites&tab=' . $tool['id'] );
                    $cls  = $active === $tool['id'] ? 'wpts-nav-item active' : 'wpts-nav-item';
                    ?>
                    <a href="<?php echo esc_url($href); ?>" class="<?php echo $cls; ?>">
                        <span class="wpts-nav-icon"><?php echo $tool['icon']; ?></span>
                        <span class="wpts-nav-label"><?php echo esc_html($tool['label']); ?></span>
                        <?php if ( $tool['badge'] ) : ?>
                        <span class="wpts-nav-badge"><?php echo esc_html($tool['badge']); ?></span>
                        <?php endif; ?>
                    </a>
                <?php endforeach; ?>
            </nav>

            <div class="wpts-sidebar-footer">
                <div class="wpts-theme-chip">
                    <span><?php echo $theme['icon']; ?></span>
                    <span><?php echo esc_html($theme['label']); ?></span>
                </div>
                <a href="https://wp.techsites.ai" target="_blank" class="wpts-upgrade-btn">
                    ↑ Upgrade
                </a>
            </div>
        </aside>

        <!-- MAIN CONTENT -->
        <main class="wpts-main">
            <div class="wpts-topbar">
                <div class="wpts-topbar-title">
                    <?php
                    $tools = wpts_get_tools();
                    $current = array_filter($tools, fn($t) => $t['id'] === $active);
                    $current = array_values($current)[0] ?? $tools[0];
                    echo $current['icon'] . ' ' . esc_html($current['label']);
                    ?>
                </div>
                <div class="wpts-topbar-right">
                    <span class="wpts-site-badge">🌐 <?php echo esc_html( get_bloginfo('name') ); ?></span>
                    <a href="<?php echo get_site_url(); ?>" target="_blank" class="wpts-view-btn">Ver site ↗</a>
                </div>
            </div>

            <div class="wpts-content">
                <?php
                switch ( $active ) {
                    case 'audit':         wpts_page_audit();         break;
                    case 'directory':     wpts_page_directory();     break;
                    case 'scraping':      wpts_page_scraping();      break;
                    case 'populate':      wpts_page_populate();      break;
                    case 'listings':      wpts_page_listings();      break;
                    case 'page-from-url': wpts_page_page_from_url(); break;
                    case 'article':       wpts_page_article();       break;
                    case 'logo':          wpts_page_logo();          break;
                    case 'content':       wpts_page_content();       break;
                    case 'branding':      wpts_page_branding();      break;
                    case 'menu':          wpts_page_menu();          break;
                    case 'chatbot':       wpts_page_chatbot();       break;
                    case 'monetize':      wpts_page_monetize();      break;
                    case 'chat-editor':   wpts_page_chat_editor();   break;
                    case 'settings':      wpts_page_settings();      break;
                    default:              wpts_page_dashboard();     break;
                }
                ?>
            </div>
        </main>
    </div>
    <?php
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function wpts_page_dashboard() {
    $theme   = wpts_detect_theme();
    $audit   = get_option( 'wpts_last_audit' );
    $pending = get_option( 'wpts_audit_pending' );
    $tools   = wpts_get_tools();
    ?>
    <?php if ( $pending ) : ?>
    <div class="wpts-alert wpts-alert-info">
        🔍 <strong>Auditoria SEO pendente</strong> — Clique em <a href="<?php echo admin_url('admin.php?page=wp-techsites&tab=audit'); ?>">SEO Audit</a> para gerar seu primeiro relatório gratuito.
    </div>
    <?php endif; ?>

    <!-- Theme Detection Banner -->
    <div class="wpts-theme-banner" style="background:linear-gradient(135deg,<?php echo esc_attr($theme['color']); ?>22,<?php echo esc_attr($theme['color']); ?>11);border:1px solid <?php echo esc_attr($theme['color']); ?>44">
        <div class="wpts-theme-banner-icon"><?php echo $theme['icon']; ?></div>
        <div>
            <div class="wpts-theme-banner-title">Tema detectado: <strong><?php echo esc_html($theme['label']); ?></strong></div>
            <div class="wpts-theme-banner-sub">Tipo: <?php echo esc_html($theme['type']); ?> · WordPress <?php echo get_bloginfo('version'); ?> · <?php echo is_ssl() ? '🔒 HTTPS' : '⚠️ Sem SSL'; ?></div>
            <?php if ( ! empty($theme['builders']) ) : ?>
            <div class="wpts-theme-banner-sub" style="margin-top:4px">
                <?php foreach ($theme['builders'] as $b) : ?><span class="wpts-chip"><?php echo esc_html($b); ?></span><?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
        <?php if ( $audit ) : ?>
        <div class="wpts-score-ring" style="border-color:<?php echo $audit['score'] >= 70 ? '#22c55e' : ($audit['score'] >= 40 ? '#f59e0b' : '#ef4444'); ?>">
            <span><?php echo $audit['score']; ?></span>
            <small>SEO</small>
        </div>
        <?php endif; ?>
    </div>

    <!-- Stats Row -->
    <div class="wpts-stats-row">
        <div class="wpts-stat"><span class="wpts-stat-n"><?php echo wp_count_posts()->publish; ?></span><span class="wpts-stat-l">Posts</span></div>
        <div class="wpts-stat"><span class="wpts-stat-n"><?php echo wp_count_posts('page')->publish; ?></span><span class="wpts-stat-l">Páginas</span></div>
        <div class="wpts-stat"><span class="wpts-stat-n"><?php echo wp_count_posts('wpts_listing')->publish; ?></span><span class="wpts-stat-l">Listings</span></div>
        <div class="wpts-stat"><span class="wpts-stat-n"><?php echo count_users()['total_users']; ?></span><span class="wpts-stat-l">Usuários</span></div>
    </div>

    <!-- Tool Grid -->
    <h3 class="wpts-section-title">Ferramentas disponíveis</h3>
    <div class="wpts-tool-grid">
        <?php foreach ( array_slice($tools, 1) as $tool ) : // skip dashboard
            $href = admin_url('admin.php?page=wp-techsites&tab='.$tool['id']);
            ?>
        <a href="<?php echo esc_url($href); ?>" class="wpts-tool-card">
            <div class="wpts-tool-icon"><?php echo $tool['icon']; ?></div>
            <div class="wpts-tool-name"><?php echo esc_html($tool['label']); ?></div>
            <?php if ( $tool['badge'] ) : ?><div class="wpts-tool-badge"><?php echo esc_html($tool['badge']); ?></div><?php endif; ?>
        </a>
        <?php endforeach; ?>
    </div>
    <?php
}

// ─── SEO AUDIT ────────────────────────────────────────────────────────────────
function wpts_page_audit() {
    $audit = get_option('wpts_last_audit');
    $date  = get_option('wpts_last_audit_date');
    ?>
    <div class="wpts-two-col">
        <div>
            <div class="wpts-card">
                <h3>🔍 Auditoria SEO Completa</h3>
                <p class="wpts-help">O plugin analisa seu site e gera um relatório completo com pontuação, problemas encontrados e recomendações de melhoria.</p>
                <?php if ($date) : ?><p class="wpts-meta">Última auditoria: <?php echo esc_html($date); ?></p><?php endif; ?>
                <button id="wpts-run-audit" class="wpts-btn wpts-btn-primary">🔍 Executar Auditoria</button>
                <?php if ($audit) : ?>
                <button id="wpts-export-pdf" class="wpts-btn" style="margin-left:8px">📄 Exportar PDF</button>
                <?php endif; ?>
                <div id="wpts-audit-loading" style="display:none" class="wpts-loading">⏳ Analisando seu site...</div>
            </div>

            <?php if ($audit) : ?>
            <div class="wpts-card" id="wpts-audit-report">
                <div class="wpts-audit-header">
                    <div>
                        <h2 style="margin:0">Relatório SEO — <?php echo esc_html($audit['site_name'] ?? get_bloginfo('name')); ?></h2>
                        <p style="color:#6b7280;margin:4px 0 0"><?php echo esc_html($audit['generated_at'] ?? $date); ?></p>
                    </div>
                    <div class="wpts-grade-badge grade-<?php echo strtolower($audit['grade'] ?? 'c'); ?>">
                        <?php echo esc_html($audit['grade'] ?? 'C'); ?>
                    </div>
                </div>
                <div class="wpts-score-bar-wrap">
                    <div class="wpts-score-bar-label"><span>Pontuação SEO</span><strong><?php echo $audit['score']; ?>/100</strong></div>
                    <div class="wpts-score-bar"><div class="wpts-score-fill" style="width:<?php echo $audit['score']; ?>%;background:<?php echo $audit['score'] >= 70 ? '#22c55e' : ($audit['score'] >= 40 ? '#f59e0b' : '#ef4444'); ?>"></div></div>
                </div>
                <?php if (!empty($audit['summary'])) : ?><p class="wpts-audit-summary"><?php echo esc_html($audit['summary']); ?></p><?php endif; ?>
                <h4 style="margin:24px 0 12px">Checklist detalhado</h4>
                <div class="wpts-checklist">
                    <?php foreach ($audit['checks'] ?? [] as $check) :
                        $icon = $check['status'] === 'ok' ? '✅' : ($check['status'] === 'fail' ? '❌' : ($check['status'] === 'warn' ? '⚠️' : 'ℹ️'));
                        ?>
                    <div class="wpts-check-item wpts-check-<?php echo esc_attr($check['status']); ?>">
                        <span class="wpts-check-icon"><?php echo $icon; ?></span>
                        <div>
                            <div class="wpts-check-label"><?php echo esc_html($check['label']); ?></div>
                            <div class="wpts-check-detail"><?php echo esc_html($check['detail']); ?></div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php if (!empty($audit['recommendations'])) : ?>
                <h4 style="margin:24px 0 12px">📋 Recomendações prioritárias</h4>
                <ul class="wpts-recs">
                    <?php foreach ($audit['recommendations'] as $rec) : ?><li><?php echo esc_html($rec); ?></li><?php endforeach; ?>
                </ul>
                <?php endif; ?>
                <div class="wpts-audit-footer">
                    <span>Gerado por WP TechSites v<?php echo WPTS_VERSION; ?></span>
                    <span>wp.techsites.ai</span>
                </div>
            </div>
            <?php endif; ?>
        </div>

        <div>
            <div class="wpts-card">
                <h4>O que é analisado?</h4>
                <ul class="wpts-feature-list">
                    <li>✅ SSL / HTTPS</li>
                    <li>✅ Estrutura de URLs</li>
                    <li>✅ Meta title & description</li>
                    <li>✅ Volume de conteúdo</li>
                    <li>✅ Plugin SEO instalado</li>
                    <li>✅ WooCommerce schema</li>
                    <li>✅ Tema e builders detectados</li>
                    <li>✅ Idioma e região</li>
                    <li>✅ Páginas essenciais</li>
                    <li>✅ Comentários & engajamento</li>
                </ul>
            </div>
            <div class="wpts-card" style="background:linear-gradient(135deg,#6366f133,#8b5cf633)">
                <h4>💡 Relatório = Seu primeiro produto</h4>
                <p style="font-size:13px;color:#4b5563">Envie o relatório PDF para prospects como um diagnóstico gratuito. É a porta de entrada perfeita para vender o plugin.</p>
            </div>
        </div>
    </div>
    <?php
}

// ─── DIRECTORY BUILDER ────────────────────────────────────────────────────────
function wpts_page_directory() {
    $config = get_option('wpts_directory_config', []);
    $page_id = get_option('wpts_directory_page', 0);
    ?>
    <div class="wpts-two-col">
        <div>
            <div class="wpts-card">
                <h3>📁 Directory Builder</h3>
                <p class="wpts-help">Crie um diretório de negócios ou listings em minutos. O plugin cria o CPT, as taxonomias e uma página de arquivo automaticamente.</p>
                <div class="wpts-field"><label>Título do diretório</label><input type="text" id="wpts-dir-title" value="<?php echo esc_attr($config['title'] ?? 'Diretório Local'); ?>" class="wpts-input" placeholder="Ex: Diretório de Curitiba"></div>
                <div class="wpts-field"><label>Categorias (separadas por vírgula)</label><input type="text" id="wpts-dir-cats" value="<?php echo esc_attr(implode(',', $config['categories'] ?? [])); ?>" class="wpts-input" placeholder="Restaurantes, Serviços, Saúde, Educação"></div>
                <div class="wpts-field"><label>Cidade / Região principal</label><input type="text" id="wpts-dir-city" value="<?php echo esc_attr($config['city'] ?? ''); ?>" class="wpts-input" placeholder="Ex: Curitiba"></div>
                <div class="wpts-field wpts-field-check">
                    <label><input type="checkbox" id="wpts-dir-premium" <?php checked(!empty($config['premium'])); ?>> Habilitar listings premium</label>
                    <p class="wpts-help" style="margin-top:4px">Listings premium aparecem em destaque com badge e modelo diferenciado.</p>
                </div>
                <button id="wpts-create-dir" class="wpts-btn wpts-btn-primary">📁 Criar Diretório</button>
                <div id="wpts-dir-result"></div>
            </div>

            <?php if ($page_id) : ?>
            <div class="wpts-card wpts-card-success">
                <h4>✅ Diretório configurado</h4>
                <p>Página do diretório criada com o shortcode <code>[wpts_directory]</code></p>
                <div class="wpts-btn-row">
                    <a href="<?php echo get_permalink($page_id); ?>" target="_blank" class="wpts-btn">🌐 Ver diretório</a>
                    <a href="<?php echo get_edit_post_link($page_id, 'url'); ?>" class="wpts-btn">✏️ Editar página</a>
                    <a href="<?php echo admin_url('edit.php?post_type=wpts_listing'); ?>" class="wpts-btn">📌 Gerenciar listings</a>
                </div>
            </div>
            <?php endif; ?>
        </div>

        <div>
            <div class="wpts-card">
                <h4>📌 Shortcode disponível</h4>
                <code class="wpts-code">[wpts_directory]</code>
                <code class="wpts-code">[wpts_directory city="curitiba" category="restaurantes" limit="30"]</code>
            </div>
            <div class="wpts-card">
                <h4>🏆 Listings premium</h4>
                <p class="wpts-help" style="font-size:13px">Listings premium têm:</p>
                <ul class="wpts-feature-list">
                    <li>⭐ Badge "PREMIUM" em destaque</li>
                    <li>🎨 Card com borda colorida</li>
                    <li>📸 Galeria de fotos</li>
                    <li>📞 Botão de contato direto</li>
                    <li>📊 Analytics de visitas</li>
                </ul>
                <a href="<?php echo admin_url('admin.php?page=wp-techsites&tab=monetize'); ?>" class="wpts-btn" style="margin-top:12px">💰 Configurar Monetização →</a>
            </div>
        </div>
    </div>
    <?php
}

// ─── SCRAPING ─────────────────────────────────────────────────────────────────
function wpts_page_scraping() { ?>
    <div class="wpts-two-col">
        <div>
            <div class="wpts-card">
                <h3>🌐 Scraping de Negócios</h3>
                <p class="wpts-help">Busca negócios reais via BrightData (Google Maps / Places). Os dados são importados diretamente como listings no seu WordPress.</p>

                <div class="wpts-field-row">
                    <div class="wpts-field">
                        <label>Tipo de estabelecimento</label>
                        <select id="wpts-scr-category" class="wpts-input">
                            <option>Restaurantes</option><option>Bares e Lanchonetes</option><option>Clínicas e Saúde</option>
                            <option>Salões de Beleza</option><option>Academias</option><option>Farmácias</option>
                            <option>Supermercados</option><option>Lojas de Roupas</option><option>Serviços Gerais</option>
                            <option>Advogados e Jurídico</option><option>Imobiliárias</option><option>Hotéis e Pousadas</option>
                            <option>Escolas e Educação</option><option>Petshops</option><option>Mecânicas</option>
                            <option>Outro (digitado abaixo)</option>
                        </select>
                    </div>
                    <div class="wpts-field">
                        <label>Tipo personalizado (opcional)</label>
                        <input type="text" id="wpts-scr-custom" class="wpts-input" placeholder="Ex: Pizzarias artesanais">
                    </div>
                </div>

                <div class="wpts-field-row">
                    <div class="wpts-field">
                        <label>Cidade / Região</label>
                        <input type="text" id="wpts-scr-city" class="wpts-input" placeholder="Ex: Curitiba, PR">
                    </div>
                    <div class="wpts-field">
                        <label>Quantidade (máx. 100)</label>
                        <input type="number" id="wpts-scr-limit" class="wpts-input" value="20" min="1" max="100">
                    </div>
                </div>

                <div class="wpts-field">
                    <label>Salvar resultados em</label>
                    <div class="wpts-radio-group">
                        <label><input type="radio" name="wpts-scr-save" value="wp" checked> 📌 WordPress (listings do site)</label>
                        <label><input type="radio" name="wpts-scr-save" value="gdrive"> ☁️ Google Drive (planilha)</label>
                        <label><input type="radio" name="wpts-scr-save" value="both"> 📌 + ☁️ Ambos</label>
                    </div>
                </div>

                <div class="wpts-field">
                    <label>Rating mínimo (0 = todos)</label>
                    <input type="number" id="wpts-scr-rating" class="wpts-input" value="0" min="0" max="5" step="0.5" style="width:120px">
                </div>

                <button id="wpts-run-scraping" class="wpts-btn wpts-btn-primary">🌐 Iniciar Scraping</button>
                <div id="wpts-scr-progress" style="display:none" class="wpts-loading">⏳ Buscando negócios via BrightData...</div>
                <div id="wpts-scr-result"></div>
            </div>
        </div>

        <div>
            <div class="wpts-card">
                <h4>⚡ Como funciona</h4>
                <ol class="wpts-steps">
                    <li>Configure o tipo de estabelecimento e cidade</li>
                    <li>BrightData busca no Google Maps / Places</li>
                    <li>Dados importados: nome, endereço, telefone, rating, fotos, horários</li>
                    <li>Listings criados automaticamente no WordPress</li>
                    <li>Opcionalmente salvo no Google Drive</li>
                </ol>
            </div>
            <div class="wpts-card">
                <h4>📊 Histórico</h4>
                <?php
                $count = wp_count_posts('wpts_listing')->publish;
                echo "<p><strong>$count</strong> listings no site</p>";
                $last = get_option('wpts_last_scraping_date');
                if ($last) echo "<p class='wpts-meta'>Último scraping: $last</p>";
                ?>
                <a href="<?php echo admin_url('edit.php?post_type=wpts_listing'); ?>" class="wpts-btn">Ver todos os listings →</a>
            </div>
            <div class="wpts-card" style="background:#fef9c3;border-color:#fde047">
                <h4>💡 Dica: Modo demo</h4>
                <p style="font-size:13px;color:#713f12">Para a apresentação, busque 10-20 listings de restaurantes de Curitiba. Resultado imediato e impressionante.</p>
            </div>
        </div>
    </div>
    <?php
}

// ─── LISTINGS ─────────────────────────────────────────────────────────────────
function wpts_page_listings() { ?>
    <div class="wpts-card">
        <h3>📌 Gerenciar Listings</h3>
        <p class="wpts-help">Listings são os negócios do seu diretório. Você pode criar manualmente, importar via scraping ou via CSV.</p>
        <div class="wpts-btn-row">
            <a href="<?php echo admin_url('post-new.php?post_type=wpts_listing'); ?>" class="wpts-btn wpts-btn-primary">+ Novo Listing</a>
            <a href="<?php echo admin_url('edit.php?post_type=wpts_listing'); ?>" class="wpts-btn">Ver todos</a>
            <a href="<?php echo admin_url('edit-tags.php?taxonomy=wpts_category&post_type=wpts_listing'); ?>" class="wpts-btn">Categorias</a>
            <a href="<?php echo admin_url('edit-tags.php?taxonomy=wpts_city&post_type=wpts_listing'); ?>" class="wpts-btn">Cidades</a>
        </div>
    </div>
    <?php
    // Recent listings table
    $posts = get_posts(['post_type' => 'wpts_listing', 'posts_per_page' => 20, 'post_status' => 'publish']);
    if ($posts) : ?>
    <div class="wpts-card" style="padding:0;overflow:hidden">
        <table class="wpts-table">
            <thead><tr><th>Nome</th><th>Endereço</th><th>Telefone</th><th>Rating</th><th>Premium</th><th>Ações</th></tr></thead>
            <tbody>
            <?php foreach ($posts as $post) :
                $address = get_post_meta($post->ID,'wpts_address',true);
                $phone   = get_post_meta($post->ID,'wpts_phone',true);
                $rating  = get_post_meta($post->ID,'wpts_rating',true);
                $premium = get_post_meta($post->ID,'wpts_premium',true);
                ?>
            <tr>
                <td><strong><?php echo esc_html($post->post_title); ?></strong></td>
                <td><?php echo esc_html($address ?: '—'); ?></td>
                <td><?php echo esc_html($phone ?: '—'); ?></td>
                <td><?php echo $rating ? '★ '.$rating : '—'; ?></td>
                <td><?php echo $premium ? '<span class="wpts-badge-premium">⭐ SIM</span>' : '<span class="wpts-badge-free">FREE</span>'; ?></td>
                <td>
                    <a href="<?php echo get_edit_post_link($post->ID,'url'); ?>" class="wpts-link">Editar</a>
                    <a href="<?php echo get_permalink($post->ID); ?>" target="_blank" class="wpts-link">Ver</a>
                </td>
            </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php else : ?>
    <div class="wpts-card wpts-empty">
        <div class="wpts-empty-icon">📌</div>
        <p>Nenhum listing ainda. Use o <a href="<?php echo admin_url('admin.php?page=wp-techsites&tab=scraping'); ?>">Scraping</a> para importar negócios automaticamente.</p>
    </div>
    <?php endif;
}

// ─── POPULAR DIRETÓRIO ────────────────────────────────────────────────────────
function wpts_page_populate() { ?>
    <div class="wpts-two-col">
        <div>
            <div class="wpts-card">
                <h3>⚡ Popular Diretório em Massa</h3>
                <p class="wpts-help">Importe listings reais de múltiplas categorias de uma só vez com BrightData + IA.</p>

                <div class="wpts-field">
                    <label>Cidade</label>
                    <input type="text" id="wpts-pop-city" class="wpts-input" value="Curitiba" placeholder="Ex: São Paulo">
                </div>
                <div class="wpts-field">
                    <label>Categorias (separadas por vírgula)</label>
                    <input type="text" id="wpts-pop-categories" class="wpts-input" value="restaurantes, hotéis, turismo, serviços, saúde" placeholder="restaurantes, hotéis, ...">
                </div>
                <div class="wpts-field">
                    <label>Listings por categoria</label>
                    <input type="number" id="wpts-pop-count" class="wpts-input" value="10" min="1" max="30" style="width:120px">
                </div>

                <button id="wpts-run-populate" class="wpts-btn wpts-btn-primary" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);width:100%">
                    ⚡ Iniciar Importação em Massa
                </button>
                <div id="wpts-pop-progress" style="display:none" class="wpts-loading">
                    ⏳ Importando listings via BrightData + IA… pode levar 30-90s por categoria.
                </div>
                <div id="wpts-pop-result"></div>
            </div>
        </div>
        <div>
            <div class="wpts-card" style="background:#f0fdf4;border-color:#86efac">
                <h4>✅ Como funciona</h4>
                <ol class="wpts-steps">
                    <li>Selecione as categorias e a cidade</li>
                    <li>BrightData busca dados reais do Google Maps</li>
                    <li>IA enriquece os dados (descrição, SEO)</li>
                    <li>Listings criados automaticamente no WP</li>
                    <li>Resultado: diretório completo em minutos</li>
                </ol>
            </div>
            <div class="wpts-card" style="background:#fef9c3;border-color:#fde047">
                <h4>⚡ Custo estimado</h4>
                <p style="font-size:13px;color:#713f12">20 créditos por categoria. 5 categorias = 100 créditos.<br>Você tem <strong><?php echo number_format(get_option('wpts_credits',0)); ?> créditos</strong> disponíveis.</p>
            </div>
        </div>
    </div>

    <script>
    document.getElementById('wpts-run-populate').addEventListener('click', function() {
        const city = document.getElementById('wpts-pop-city').value.trim();
        const rawCats = document.getElementById('wpts-pop-categories').value;
        const cats = rawCats.split(',').map(c => c.trim()).filter(c => c);
        const count = parseInt(document.getElementById('wpts-pop-count').value) || 10;
        const btn = this;
        const prog = document.getElementById('wpts-pop-progress');
        const res = document.getElementById('wpts-pop-result');

        btn.disabled = true;
        prog.style.display = 'block';
        prog.textContent = `⏳ Importando ${cats.length} categorias em ${city}… aguarde ${cats.length * 30}s`;
        res.innerHTML = '';

        jQuery.post(ajaxurl, {
            action: 'wpts_populate_directory',
            nonce: wptsAdmin.nonce,
            city, categories: JSON.stringify(cats), count_per_category: count
        }, function(r) {
            btn.disabled = false; prog.style.display = 'none';
            if (r.success) {
                let html = `<div class="wpts-alert wpts-alert-success"><strong>${r.data.summary}</strong><ul style="margin-top:8px">`;
                (r.data.breakdown || []).forEach(b => { html += `<li>${b.category}: ${b.imported} importados (${b.source})</li>`; });
                html += `</ul></div>`;
                res.innerHTML = html;
            } else {
                res.innerHTML = `<div class="wpts-alert wpts-alert-error">❌ ${r.data?.error || 'Erro desconhecido'}</div>`;
            }
        });
    });
    </script>
    <?php
}

// ─── PÁGINA DE EMPRESA ────────────────────────────────────────────────────────
function wpts_page_page_from_url() { ?>
    <div class="wpts-two-col">
        <div>
            <div class="wpts-card">
                <h3>🔗 Criar Página de Empresa a partir de URL</h3>
                <p class="wpts-help">Cole a URL de qualquer negócio. A IA extrai as informações e cria uma página profissional automaticamente.</p>

                <div class="wpts-field">
                    <label>URL do site da empresa</label>
                    <input type="url" id="wpts-pfu-url" class="wpts-input" placeholder="https://www.empresa.com.br">
                </div>
                <div class="wpts-field">
                    <label>Tipo de página</label>
                    <select id="wpts-pfu-type" class="wpts-input">
                        <option value="empresa">Empresa / Negócio</option>
                        <option value="restaurante">Restaurante / Bar</option>
                        <option value="clinica">Clínica / Saúde</option>
                        <option value="servico">Serviço Profissional</option>
                        <option value="loja">Loja / Comércio</option>
                    </select>
                </div>
                <div class="wpts-field" style="display:flex;gap:8px;align-items:center">
                    <input type="checkbox" id="wpts-pfu-publish" checked>
                    <label for="wpts-pfu-publish" style="margin:0">Publicar imediatamente</label>
                </div>

                <button id="wpts-run-pfu" class="wpts-btn wpts-btn-primary" style="width:100%">🔗 Criar Página da Empresa (5 créditos)</button>
                <div id="wpts-pfu-progress" style="display:none" class="wpts-loading">⏳ Analisando o site e gerando conteúdo…</div>
                <div id="wpts-pfu-result"></div>
            </div>
        </div>
        <div>
            <div class="wpts-card" style="background:#eff6ff;border-color:#93c5fd">
                <h4>🔗 O que a IA extrai:</h4>
                <ul style="font-size:13px;line-height:2">
                    <li>✅ Nome e descrição do negócio</li>
                    <li>✅ Telefone, email, endereço</li>
                    <li>✅ Serviços e produtos oferecidos</li>
                    <li>✅ Conteúdo SEO (400+ palavras)</li>
                    <li>✅ Meta description otimizada</li>
                    <li>✅ Slug amigável para URLs</li>
                </ul>
            </div>
            <div id="wpts-pfu-preview" style="display:none" class="wpts-card" style="background:#f0fdf4;border-color:#86efac">
                <h4>✅ Página criada!</h4>
                <div id="wpts-pfu-preview-content"></div>
            </div>
        </div>
    </div>

    <script>
    document.getElementById('wpts-run-pfu').addEventListener('click', function() {
        const url = document.getElementById('wpts-pfu-url').value.trim();
        if (!url) { alert('Informe a URL da empresa'); return; }
        const type = document.getElementById('wpts-pfu-type').value;
        const publish = document.getElementById('wpts-pfu-publish').checked ? 1 : 0;
        const btn = this; const prog = document.getElementById('wpts-pfu-progress'); const res = document.getElementById('wpts-pfu-result');
        btn.disabled = true; prog.style.display = 'block'; res.innerHTML = '';

        jQuery.post(ajaxurl, {
            action: 'wpts_page_from_url', nonce: wptsAdmin.nonce,
            url, page_type: type, publish
        }, function(r) {
            btn.disabled = false; prog.style.display = 'none';
            if (r.success) {
                const d = r.data;
                const previewEl = document.getElementById('wpts-pfu-preview');
                const previewContent = document.getElementById('wpts-pfu-preview-content');
                previewEl.style.display = 'block';
                previewContent.innerHTML = `<p><strong>${d.title}</strong></p><p style="font-size:12px;color:#666">${d.meta_description}</p>
                    ${d.wp_page_url ? `<a href="${d.wp_page_url}" target="_blank" class="wpts-btn wpts-btn-primary" style="margin-top:8px">Ver página →</a>` : ''}`;
                res.innerHTML = `<div class="wpts-alert wpts-alert-success">✅ Página criada: <strong>${d.title}</strong></div>`;
            } else {
                res.innerHTML = `<div class="wpts-alert wpts-alert-error">❌ ${r.data?.error || 'Erro ao criar página'}</div>`;
            }
        });
    });
    </script>
    <?php
}

// ─── ARTIGO COM IMAGENS ───────────────────────────────────────────────────────
function wpts_page_article() { ?>
    <div class="wpts-two-col">
        <div>
            <div class="wpts-card">
                <h3>📰 Gerar Artigo SEO com Imagens</h3>
                <p class="wpts-help">Crie artigos de blog profissionais com imagens reais, otimizados para SEO, prontos para publicar.</p>

                <div class="wpts-field">
                    <label>Tópico do artigo</label>
                    <input type="text" id="wpts-art-topic" class="wpts-input" placeholder="Ex: Melhores restaurantes do Batel em Curitiba">
                </div>
                <div class="wpts-field">
                    <label>Cidade (opcional)</label>
                    <input type="text" id="wpts-art-city" class="wpts-input" placeholder="Ex: Curitiba">
                </div>
                <div class="wpts-field">
                    <label>Categoria</label>
                    <input type="text" id="wpts-art-cat" class="wpts-input" placeholder="Ex: restaurantes, turismo, saúde">
                </div>
                <div class="wpts-field">
                    <label>Tom do artigo</label>
                    <select id="wpts-art-tone" class="wpts-input">
                        <option value="professional">Profissional</option>
                        <option value="friendly">Amigável / Informal</option>
                        <option value="journalistic">Jornalístico</option>
                        <option value="expert">Especialista</option>
                    </select>
                </div>
                <div class="wpts-field">
                    <label>Tamanho aproximado</label>
                    <select id="wpts-art-words" class="wpts-input">
                        <option value="400">Curto (~400 palavras)</option>
                        <option value="600" selected>Médio (~600 palavras)</option>
                        <option value="900">Longo (~900 palavras)</option>
                    </select>
                </div>
                <div class="wpts-field" style="display:flex;gap:8px;align-items:center">
                    <input type="checkbox" id="wpts-art-publish" checked>
                    <label for="wpts-art-publish" style="margin:0">Publicar imediatamente</label>
                </div>

                <button id="wpts-run-article" class="wpts-btn wpts-btn-primary" style="width:100%">📰 Gerar Artigo com Imagens (8 créditos)</button>
                <div id="wpts-art-progress" style="display:none" class="wpts-loading">✍️ Gerando artigo SEO com imagens…</div>
                <div id="wpts-art-result"></div>
            </div>
        </div>
        <div>
            <div class="wpts-card" style="background:#fdf4ff;border-color:#e879f9">
                <h4>📰 O que você recebe:</h4>
                <ul style="font-size:13px;line-height:2">
                    <li>✅ Título SEO com palavra-chave</li>
                    <li>✅ Meta description otimizada</li>
                    <li>✅ Imagem hero em destaque</li>
                    <li>✅ Conteúdo H2/H3 estruturado</li>
                    <li>✅ Imagem de apoio no meio do artigo</li>
                    <li>✅ Tags e slug otimizados</li>
                    <li>✅ CTA ao final do artigo</li>
                </ul>
            </div>
            <div id="wpts-art-preview" style="display:none" class="wpts-card">
                <div id="wpts-art-preview-content"></div>
            </div>
        </div>
    </div>

    <script>
    document.getElementById('wpts-run-article').addEventListener('click', function() {
        const topic = document.getElementById('wpts-art-topic').value.trim();
        if (!topic) { alert('Informe o tópico do artigo'); return; }
        const city = document.getElementById('wpts-art-city').value.trim();
        const cat = document.getElementById('wpts-art-cat').value.trim();
        const tone = document.getElementById('wpts-art-tone').value;
        const words = parseInt(document.getElementById('wpts-art-words').value);
        const publish = document.getElementById('wpts-art-publish').checked ? 1 : 0;
        const btn = this; const prog = document.getElementById('wpts-art-progress'); const res = document.getElementById('wpts-art-result');
        btn.disabled = true; prog.style.display = 'block'; res.innerHTML = '';

        jQuery.post(ajaxurl, {
            action: 'wpts_article_with_images', nonce: wptsAdmin.nonce,
            topic, city, category: cat, tone, word_count: words, publish
        }, function(r) {
            btn.disabled = false; prog.style.display = 'none';
            if (r.success) {
                const d = r.data;
                const prev = document.getElementById('wpts-art-preview');
                const prevContent = document.getElementById('wpts-art-preview-content');
                prev.style.display = 'block';
                prevContent.innerHTML = `
                    <img src="${d.hero_image}" style="width:100%;border-radius:8px;margin-bottom:8px" alt="${d.title}">
                    <strong>${d.title}</strong><br>
                    <span style="font-size:12px;color:#666">🔑 ${d.focus_keyword} · ⏱ ${d.reading_time} min leitura</span><br>
                    <span style="font-size:11px;color:#999">Tags: ${(d.tags||[]).join(', ')}</span>
                    ${d.wp_post_url ? `<br><a href="${d.wp_post_url}" target="_blank" class="wpts-btn wpts-btn-primary" style="margin-top:8px;display:inline-block">Ver artigo →</a>` : ''}`;
                res.innerHTML = `<div class="wpts-alert wpts-alert-success">✅ Artigo publicado: <strong>${d.title}</strong></div>`;
            } else {
                res.innerHTML = `<div class="wpts-alert wpts-alert-error">❌ ${r.data?.error || 'Erro ao gerar artigo'}</div>`;
            }
        });
    });
    </script>
    <?php
}

// ─── LOGO BUILDER ─────────────────────────────────────────────────────────────
function wpts_page_logo() { ?>
    <div class="wpts-tab-bar" id="wpts-logo-tabs">
        <button class="wpts-tab active" data-tab="ai">🤖 Logo com IA</button>
        <button class="wpts-tab" data-tab="compose">🎨 Compositor Manual</button>
    </div>

    <div class="wpts-tab-content" id="wpts-logo-tab-ai">
        <div class="wpts-two-col">
            <div>
                <div class="wpts-card">
                    <h3>🤖 Gerar Logo com IA</h3>
                    <div class="wpts-field"><label>Nome da marca</label><input type="text" id="wpts-logo-name" class="wpts-input" value="<?php echo esc_attr(get_bloginfo('name')); ?>" placeholder="Nome do seu negócio"></div>
                    <div class="wpts-field"><label>Estilo visual</label>
                        <select id="wpts-logo-style" class="wpts-input">
                            <option value="modern minimalist">Moderno Minimalista</option>
                            <option value="bold geometric">Geométrico Arrojado</option>
                            <option value="elegant luxury">Elegante / Luxo</option>
                            <option value="friendly rounded">Amigável / Arredondado</option>
                            <option value="tech futuristic">Tech / Futurista</option>
                            <option value="handcrafted artisan">Artesanal / Orgânico</option>
                            <option value="corporate professional">Corporativo</option>
                        </select>
                    </div>
                    <div class="wpts-field"><label>Cores principais</label>
                        <select id="wpts-logo-colors" class="wpts-input">
                            <option>azul e branco</option><option>verde e cinza</option><option>roxo e dourado</option>
                            <option>vermelho e preto</option><option>laranja e branco</option><option>azul-marinho e dourado</option>
                            <option>preto e dourado</option><option>verde e branco</option>
                        </select>
                    </div>
                    <div class="wpts-field"><label>Descrição adicional (opcional)</label>
                        <textarea id="wpts-logo-desc" class="wpts-input" rows="2" placeholder="Ex: ícone de folha, transmite saúde e natureza"></textarea>
                    </div>
                    <button id="wpts-gen-logo" class="wpts-btn wpts-btn-primary">🤖 Gerar Logo</button>
                    <div id="wpts-logo-loading" style="display:none" class="wpts-loading">⏳ Gerando logo com IA...</div>
                    <div id="wpts-logo-result"></div>
                </div>
            </div>
            <div>
                <div class="wpts-card">
                    <h4>🎯 Naming & Branding</h4>
                    <div class="wpts-field"><label>Nicho do negócio</label><input type="text" id="wpts-naming-niche" class="wpts-input" placeholder="Ex: clinica de estética"></div>
                    <div class="wpts-field"><label>Cidade / Região</label><input type="text" id="wpts-naming-city" class="wpts-input" placeholder="Ex: Curitiba"></div>
                    <button id="wpts-gen-naming" class="wpts-btn">✨ Sugerir Nomes de Marca</button>
                    <div id="wpts-naming-result"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="wpts-tab-content" id="wpts-logo-tab-compose" style="display:none">
        <div class="wpts-card">
            <h3>🎨 Compositor de Logo</h3>
            <p class="wpts-help">Monte seu logo visualmente: escolha ícone, fonte e cores.</p>
            <div class="wpts-logo-composer">
                <div class="wpts-composer-preview" id="wpts-logo-preview">
                    <div id="wpts-preview-icon" style="font-size:48px">⬡</div>
                    <div id="wpts-preview-text" style="font-size:24px;font-weight:700;margin-top:8px"><?php echo esc_html(get_bloginfo('name')); ?></div>
                    <div id="wpts-preview-tagline" style="font-size:12px;opacity:0.6;margin-top:4px"><?php echo esc_html(get_bloginfo('description')); ?></div>
                </div>
                <div class="wpts-composer-controls">
                    <div class="wpts-field"><label>Nome da marca</label><input type="text" id="wpts-comp-name" class="wpts-input" value="<?php echo esc_attr(get_bloginfo('name')); ?>"></div>
                    <div class="wpts-field"><label>Tagline</label><input type="text" id="wpts-comp-tagline" class="wpts-input" value="<?php echo esc_attr(get_bloginfo('description')); ?>"></div>
                    <div class="wpts-field"><label>Ícone / Emoji</label>
                        <div class="wpts-icon-grid">
                            <?php $icons = ['⬡','⬢','◆','▲','●','★','⚡','🚀','🌟','💡','🎯','🔮','💎','🌿','🦋','🔥','⚙️','🌊','🏔️','🎨'];
                            foreach ($icons as $ic) : ?><button class="wpts-icon-btn" onclick="document.getElementById('wpts-preview-icon').textContent='<?php echo $ic; ?>'"><?php echo $ic; ?></button><?php endforeach; ?>
                        </div>
                    </div>
                    <div class="wpts-field-row">
                        <div class="wpts-field"><label>Cor principal</label><input type="color" id="wpts-comp-color1" class="wpts-color-input" value="#6366f1"></div>
                        <div class="wpts-field"><label>Cor do texto</label><input type="color" id="wpts-comp-color2" class="wpts-color-input" value="#1e1e2e"></div>
                    </div>
                    <div class="wpts-field"><label>Fonte</label>
                        <select id="wpts-comp-font" class="wpts-input">
                            <option value="'Inter', sans-serif">Inter (moderna)</option>
                            <option value="'Georgia', serif">Georgia (elegante)</option>
                            <option value="'Courier New', monospace">Courier (tech)</option>
                            <option value="'Arial Black', sans-serif">Arial Black (forte)</option>
                            <option value="'Trebuchet MS', sans-serif">Trebuchet (amigável)</option>
                        </select>
                    </div>
                    <button id="wpts-apply-logo" class="wpts-btn wpts-btn-primary" style="width:100%">✅ Aplicar como logo do site</button>
                </div>
            </div>
        </div>
    </div>
    <?php
}

// ─── CONTENT AI ───────────────────────────────────────────────────────────────
function wpts_page_content() { ?>
    <div class="wpts-two-col">
        <div>
            <div class="wpts-card">
                <h3>✍️ Gerador de Conteúdo IA</h3>
                <div class="wpts-field-row">
                    <div class="wpts-field"><label>Tipo de conteúdo</label>
                        <select id="wpts-ct-type" class="wpts-input">
                            <option value="post">Post de Blog</option><option value="page">Página</option>
                            <option value="product">Descrição de Produto</option><option value="listing">Descrição de Listing</option>
                            <option value="meta_description">Meta Description SEO</option><option value="social">Post para Redes Sociais</option>
                            <option value="email">E-mail Marketing</option><option value="faq">FAQ (Perguntas e Respostas)</option>
                        </select>
                    </div>
                    <div class="wpts-field"><label>Idioma</label>
                        <select id="wpts-ct-lang" class="wpts-input">
                            <option value="pt-BR">Português (BR)</option><option value="pt-PT">Português (PT)</option>
                            <option value="es">Espanhol</option><option value="en">Inglês</option>
                        </select>
                    </div>
                </div>
                <div class="wpts-field"><label>Tópico / Assunto</label><input type="text" id="wpts-ct-topic" class="wpts-input" placeholder="Ex: Os 5 melhores restaurantes de Curitiba"></div>
                <div class="wpts-field-row">
                    <div class="wpts-field"><label>Tom de voz</label>
                        <select id="wpts-ct-tone" class="wpts-input">
                            <option value="professional">Profissional</option><option value="friendly">Amigável</option>
                            <option value="authoritative">Autoritativo</option><option value="casual">Casual</option>
                            <option value="persuasive">Persuasivo</option>
                        </select>
                    </div>
                    <div class="wpts-field"><label>Tamanho</label>
                        <select id="wpts-ct-length" class="wpts-input">
                            <option value="short">Curto (~300 palavras)</option>
                            <option value="medium" selected>Médio (~600 palavras)</option>
                            <option value="long">Longo (~1200 palavras)</option>
                        </select>
                    </div>
                </div>
                <button id="wpts-gen-content" class="wpts-btn wpts-btn-primary">✍️ Gerar Conteúdo</button>
                <div id="wpts-ct-loading" style="display:none" class="wpts-loading">⏳ Gerando conteúdo com IA...</div>
                <div id="wpts-ct-result"></div>
            </div>
        </div>
        <div>
            <div class="wpts-card">
                <h4>💡 Use Cases populares</h4>
                <div class="wpts-use-cases">
                    <button class="wpts-use-case" data-topic="Melhores restaurantes de [cidade]" data-type="post">🍕 Guia de restaurantes</button>
                    <button class="wpts-use-case" data-topic="Por que escolher [negócio]" data-type="page">⭐ Página Sobre</button>
                    <button class="wpts-use-case" data-topic="[serviço] em [cidade]" data-type="meta_description">🔍 Meta SEO</button>
                    <button class="wpts-use-case" data-topic="Promoção especial de [produto]" data-type="social">📱 Post Redes Sociais</button>
                    <button class="wpts-use-case" data-topic="Perguntas frequentes sobre [negócio]" data-type="faq">❓ FAQ Completo</button>
                </div>
            </div>
        </div>
    </div>
    <?php
}

// ─── BRANDING ─────────────────────────────────────────────────────────────────
function wpts_page_branding() { ?>
    <div class="wpts-two-col">
        <div>
            <div class="wpts-card">
                <h3>🎨 Identidade Visual</h3>
                <div class="wpts-field"><label>Nicho do site</label><input type="text" id="wpts-br-niche" class="wpts-input" placeholder="Ex: restaurante, clínica, imobiliária"></div>
                <div class="wpts-field"><label>Estilo</label>
                    <select id="wpts-br-style" class="wpts-input">
                        <option value="modern">Moderno</option><option value="elegant">Elegante</option>
                        <option value="bold">Arrojado</option><option value="minimal">Minimalista</option>
                        <option value="warm">Caloroso / Acolhedor</option>
                    </select>
                </div>
                <button id="wpts-gen-colors" class="wpts-btn wpts-btn-primary">🎨 Gerar Paleta</button>
                <div id="wpts-br-result"></div>
            </div>
        </div>
        <div>
            <div class="wpts-card">
                <h4>🖌️ Aplicar cores manualmente</h4>
                <div class="wpts-field-row">
                    <div class="wpts-field"><label>Cor principal</label><input type="color" id="wpts-manual-primary" class="wpts-color-input" value="#6366f1"></div>
                    <div class="wpts-field"><label>Cor secundária</label><input type="color" id="wpts-manual-secondary" class="wpts-color-input" value="#8b5cf6"></div>
                </div>
                <button id="wpts-apply-colors" class="wpts-btn">✅ Aplicar ao site</button>
                <div id="wpts-colors-apply-result"></div>
            </div>
        </div>
    </div>
    <?php
}

// ─── MENU BUILDER ─────────────────────────────────────────────────────────────
function wpts_page_menu() { ?>
    <div class="wpts-two-col">
        <div>
            <div class="wpts-card">
                <h3>📋 Menu Builder</h3>
                <div class="wpts-field"><label>Nicho do site</label><input type="text" id="wpts-mn-niche" class="wpts-input" placeholder="Ex: diretório de restaurantes"></div>
                <div class="wpts-field"><label>Idioma</label>
                    <select id="wpts-mn-lang" class="wpts-input">
                        <option value="pt-BR">Português (BR)</option><option value="es">Espanhol</option><option value="en">Inglês</option>
                    </select>
                </div>
                <button id="wpts-gen-menu" class="wpts-btn wpts-btn-primary">📋 Gerar Menu</button>
                <div id="wpts-mn-result"></div>
            </div>
        </div>
        <div>
            <div class="wpts-card">
                <h4>📍 Menus existentes</h4>
                <?php $menus = wp_get_nav_menus();
                if ($menus) foreach ($menus as $m) echo "<div class='wpts-meta'>📋 " . esc_html($m->name) . " (" . $m->count . " itens)</div>";
                else echo "<p class='wpts-help'>Nenhum menu criado ainda.</p>";
                ?>
                <a href="<?php echo admin_url('nav-menus.php'); ?>" class="wpts-btn" style="margin-top:12px">Gerenciar menus do WP →</a>
            </div>
        </div>
    </div>
    <?php
}

// ─── CHATBOT ──────────────────────────────────────────────────────────────────
function wpts_page_chatbot() { ?>
    <div class="wpts-two-col">
        <div>
            <div class="wpts-card">
                <h3>💬 Chatbot IA</h3>
                <div class="wpts-field wpts-field-check">
                    <label><input type="checkbox" id="wpts-cb-enabled" <?php checked(get_option('wpts_chatbot_enabled'),'1'); ?>> Chatbot ativo no site</label>
                </div>
                <div class="wpts-field"><label>Nome do assistente</label><input type="text" id="wpts-cb-name" class="wpts-input" value="<?php echo esc_attr(get_option('wpts_chatbot_name','Assistente')); ?>"></div>
                <div class="wpts-field"><label>Cor do widget</label><input type="color" id="wpts-cb-color" class="wpts-color-input" value="<?php echo esc_attr(get_option('wpts_chatbot_color','#6366f1')); ?>"></div>
                <div class="wpts-field"><label>Prompt de personalidade</label>
                    <textarea id="wpts-cb-prompt" class="wpts-input" rows="4" placeholder="Ex: Você é um assistente especialista em restaurantes de Curitiba. Responda sempre em português, seja amigável e recomende nossos listings..."><?php echo esc_textarea(get_option('wpts_chatbot_prompt','')); ?></textarea>
                </div>
                <button id="wpts-save-chatbot" class="wpts-btn wpts-btn-primary">💾 Salvar Chatbot</button>
                <div id="wpts-cb-result"></div>
            </div>
        </div>
        <div>
            <div class="wpts-card">
                <h4>Preview do widget</h4>
                <div id="wpts-cb-preview" style="position:relative;height:200px;background:#f3f4f6;border-radius:12px;overflow:hidden">
                    <div id="wpts-cb-bubble" style="position:absolute;bottom:16px;right:16px;width:52px;height:52px;border-radius:50%;background:#6366f1;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.4)">💬</div>
                </div>
            </div>
        </div>
    </div>
    <?php
}

// ─── MONETIZAÇÃO ──────────────────────────────────────────────────────────────
function wpts_page_monetize() { ?>
    <div class="wpts-two-col">
        <div>
            <div class="wpts-card">
                <h3>💰 Modelo de Monetização</h3>
                <p class="wpts-help">Configure como o dono do site recebe pagamentos por listings premium.</p>

                <div class="wpts-monetize-options">
                    <div class="wpts-monetize-card">
                        <div class="wpts-monetize-icon">🏆</div>
                        <h4>Recomendado: WooCommerce</h4>
                        <p>WooCommerce é gratuito e suporta Stripe, PagSeguro, Mercado Pago e PayPal. Ideal para listings premium.</p>
                        <ol class="wpts-steps" style="margin-top:12px">
                            <li>Instale o plugin WooCommerce</li>
                            <li>Configure o gateway de pagamento preferido</li>
                            <li>Crie um "Produto" para cada plano de listing</li>
                            <li>Use o meta <code>wpts_premium=1</code> para marcar listings pagos</li>
                        </ol>
                        <?php if (!class_exists('WooCommerce')) : ?>
                        <a href="<?php echo admin_url('plugin-install.php?s=woocommerce&tab=search&type=term'); ?>" class="wpts-btn wpts-btn-primary" style="margin-top:12px">Instalar WooCommerce →</a>
                        <?php else : ?>
                        <div class="wpts-alert wpts-alert-success" style="margin-top:12px">✅ WooCommerce já está instalado!</div>
                        <a href="<?php echo admin_url('admin.php?page=wc-settings&tab=checkout'); ?>" class="wpts-btn" style="margin-top:8px">Configurar gateways →</a>
                        <?php endif; ?>
                    </div>

                    <div class="wpts-monetize-card" style="border-color:#6366f1;background:#f5f3ff">
                        <div class="wpts-monetize-icon">⚡</div>
                        <h4>Gateway WP TechSites</h4>
                        <p>Centralize os pagamentos em wp.techsites.ai. Nós processamos e repassamos. Sem precisar configurar WooCommerce.</p>
                        <ul class="wpts-feature-list" style="margin-top:12px">
                            <li>✅ Stripe, Pix, Boleto, Mercado Pago</li>
                            <li>✅ Dashboard unificado de receita</li>
                            <li>✅ Repasse automático em D+2</li>
                            <li>✅ Taxa: 5% por transação</li>
                        </ul>
                        <a href="https://wp.techsites.ai/monetizacao" target="_blank" class="wpts-btn wpts-btn-primary" style="margin-top:12px;background:#6366f1">Ativar gateway TechSites →</a>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <div class="wpts-card">
                <h4>💡 Produtos para vender</h4>
                <div class="wpts-product-list">
                    <div class="wpts-product-item">
                        <div class="wpts-product-name">Listing Básico</div>
                        <div class="wpts-product-price">Grátis</div>
                        <div class="wpts-product-features">Nome, endereço, telefone</div>
                    </div>
                    <div class="wpts-product-item" style="border-color:#6366f1;background:#f5f3ff">
                        <div class="wpts-product-name">⭐ Listing Premium</div>
                        <div class="wpts-product-price">R$ 97/mês</div>
                        <div class="wpts-product-features">Destaque + fotos + analytics + contato direto</div>
                    </div>
                    <div class="wpts-product-item">
                        <div class="wpts-product-name">🏆 Listing Destaque</div>
                        <div class="wpts-product-price">R$ 197/mês</div>
                        <div class="wpts-product-features">Topo do diretório + banner + vídeo embed</div>
                    </div>
                    <div class="wpts-product-item">
                        <div class="wpts-product-name">🤖 Chatbot por Negócio</div>
                        <div class="wpts-product-price">R$ 47/mês</div>
                        <div class="wpts-product-features">Chatbot customizado para o listing</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php
}

// ─── EDITOR VIA CHAT ─────────────────────────────────────────────────────────
function wpts_page_chat_editor() { ?>
    <div class="wpts-two-col">
        <div>
            <div class="wpts-card">
                <h3>🤖 Editor via Chat</h3>
                <p class="wpts-help">Edite seu site usando linguagem natural. Digite um comando e a IA executa a ação diretamente no WordPress.</p>
                <div class="wpts-chat-editor-box" id="wpts-chat-history">
                    <div class="wpts-chat-msg wpts-chat-system">
                        <span>🤖</span> Olá! Posso editar seu site. Exemplos: "muda o título do site para X", "cria um post sobre Y", "altera a tagline para Z"
                    </div>
                </div>
                <div class="wpts-chat-input-row">
                    <textarea id="wpts-chat-cmd" class="wpts-input" rows="2" placeholder="Ex: Muda a tagline do site para 'O melhor diretório de Curitiba'"></textarea>
                    <button id="wpts-send-chat" class="wpts-btn wpts-btn-primary">Enviar</button>
                </div>
            </div>
        </div>
        <div>
            <div class="wpts-card">
                <h4>💬 Comandos disponíveis</h4>
                <div class="wpts-commands">
                    <div class="wpts-cmd" onclick="document.getElementById('wpts-chat-cmd').value=this.dataset.cmd" data-cmd="Muda o título do site para [nome]">📝 Alterar título do site</div>
                    <div class="wpts-cmd" onclick="document.getElementById('wpts-chat-cmd').value=this.dataset.cmd" data-cmd="Cria um post sobre [tópico] com 500 palavras">✍️ Criar post</div>
                    <div class="wpts-cmd" onclick="document.getElementById('wpts-chat-cmd').value=this.dataset.cmd" data-cmd="Muda a tagline para [nova tagline]">🏷️ Alterar tagline</div>
                    <div class="wpts-cmd" onclick="document.getElementById('wpts-chat-cmd').value=this.dataset.cmd" data-cmd="Ativa o chatbot no site">💬 Ativar chatbot</div>
                    <div class="wpts-cmd" onclick="document.getElementById('wpts-chat-cmd').value=this.dataset.cmd" data-cmd="Cria uma página de contato">📄 Criar página</div>
                </div>
            </div>
        </div>
    </div>
    <?php
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function wpts_page_settings() {
    $saved = ! empty( $_GET['saved'] );
    ?>
    <?php if ($saved) : ?><div class="wpts-alert wpts-alert-success">✅ Configurações salvas com sucesso.</div><?php endif; ?>
    <div class="wpts-two-col">
        <div>
            <div class="wpts-card">
                <h3>⚙️ Configurações</h3>
                <div class="wpts-field">
                    <label>Chave de API WP TechSites</label>
                    <input type="text" id="wpts-api-key" class="wpts-input" value="<?php echo esc_attr(get_option('wpts_api_key','')); ?>" placeholder="ts_xxxxxxxxxxxxxxxxxxxx">
                    <p class="wpts-help">Obtenha sua chave em <a href="https://wp.techsites.ai/api-keys" target="_blank">wp.techsites.ai/api-keys</a></p>
                </div>
                <button id="wpts-save-settings" class="wpts-btn wpts-btn-primary">💾 Salvar</button>
                <div id="wpts-settings-result"></div>
            </div>

            <!-- WP REST API Connection -->
            <?php
            $rest_connected = get_option('wpts_wp_rest_connected', 0);
            $rest_user      = get_option('wpts_wp_user', '');
            $rest_url       = get_option('wpts_wp_rest_url', get_site_url().'/wp-json');
            ?>
            <div class="wpts-card" style="border:1px solid <?php echo $rest_connected ? '#22c55e33' : '#6366f133'; ?>">
                <h4><?php echo $rest_connected ? '🟢' : '🔗'; ?> Conectar WordPress REST API</h4>
                <p class="wpts-help" style="margin-bottom:12px">Permite que o api-server escreva listings, posts e configurações diretamente no WordPress — sem copiar e colar.</p>

                <?php if ($rest_connected) : ?>
                <div class="wpts-alert wpts-alert-success" style="margin-bottom:12px">
                    ✅ Conectado como <strong><?php echo esc_html($rest_user); ?></strong> — write-back ativo
                </div>
                <?php endif; ?>

                <div class="wpts-field">
                    <label>Usuário WordPress (login)</label>
                    <input type="text" id="wpts-wp-user" class="wpts-input"
                           value="<?php echo esc_attr($rest_user); ?>"
                           placeholder="admin ou seu nome de usuário">
                </div>
                <div class="wpts-field">
                    <label>Application Password <small style="color:#64748b">(WordPress → Usuários → Seu Perfil → Application Passwords)</small></label>
                    <input type="password" id="wpts-wp-app-pass" class="wpts-input"
                           value="" placeholder="xxxx xxxx xxxx xxxx xxxx xxxx">
                    <p class="wpts-help">A senha de aplicação é gerada pelo próprio WordPress e pode ser revogada a qualquer momento.</p>
                </div>
                <div class="wpts-field">
                    <label>URL da REST API</label>
                    <input type="text" id="wpts-wp-rest-url" class="wpts-input"
                           value="<?php echo esc_attr($rest_url); ?>"
                           placeholder="https://seusite.com/wp-json">
                </div>
                <div style="display:flex;gap:8px;margin-top:12px">
                    <button id="wpts-connect-rest" class="wpts-btn wpts-btn-primary">🔗 Conectar</button>
                    <?php if ($rest_connected) : ?>
                    <button id="wpts-disconnect-rest" class="wpts-btn" style="background:#1e293b;color:#94a3b8">Desconectar</button>
                    <?php endif; ?>
                </div>
                <div id="wpts-rest-result" style="margin-top:8px"></div>
            </div>

            <div class="wpts-card">
                <h4>🔍 Informações do ambiente</h4>
                <?php $theme = wpts_detect_theme(); ?>
                <div class="wpts-info-grid">
                    <div class="wpts-info-row"><span>Tema</span><strong><?php echo esc_html($theme['label']); ?></strong></div>
                    <div class="wpts-info-row"><span>Tipo</span><strong><?php echo esc_html($theme['type']); ?></strong></div>
                    <div class="wpts-info-row"><span>WordPress</span><strong><?php echo get_bloginfo('version'); ?></strong></div>
                    <div class="wpts-info-row"><span>PHP</span><strong><?php echo PHP_VERSION; ?></strong></div>
                    <div class="wpts-info-row"><span>SSL</span><strong><?php echo is_ssl() ? '✅ Ativo' : '❌ Inativo'; ?></strong></div>
                    <div class="wpts-info-row"><span>WooCommerce</span><strong><?php echo class_exists('WooCommerce') ? '✅ '.WC_VERSION : '❌ Não instalado'; ?></strong></div>
                    <div class="wpts-info-row"><span>Plugin Version</span><strong><?php echo WPTS_VERSION; ?></strong></div>
                    <div class="wpts-info-row"><span>Plano</span><strong><?php echo strtoupper(get_option('wpts_plan','trial')); ?></strong></div>
                    <div class="wpts-info-row"><span>Créditos</span><strong><?php echo number_format(get_option('wpts_credits',0)); ?></strong></div>
                </div>
            </div>
        </div>

        <div>
            <div class="wpts-card" style="background:linear-gradient(135deg,#1e1e2e,#2d2b55);color:#e2e8f0">
                <h4 style="color:#a5b4fc">🚀 Planos WP TechSites</h4>
                <?php $plan = get_option('wpts_plan','trial'); ?>
                <div class="wpts-plans">
                    <?php $plans = [
                        'trial'   => ['name'=>'Trial','credits'=>100,'price'=>'Grátis','color'=>'#6b7280'],
                        'starter' => ['name'=>'Starter','credits'=>2000,'price'=>'R$ 97/mês','color'=>'#0ea5e9'],
                        'pro'     => ['name'=>'Pro','credits'=>10000,'price'=>'R$ 197/mês','color'=>'#6366f1'],
                        'agency'  => ['name'=>'Agency','credits'=>50000,'price'=>'R$ 497/mês','color'=>'#f59e0b'],
                    ];
                    foreach ($plans as $slug => $p) : ?>
                    <div class="wpts-plan-row <?php echo $plan === $slug ? 'current' : ''; ?>" style="border-color:<?php echo $p['color']; ?>33">
                        <div>
                            <div class="wpts-plan-name" style="color:<?php echo $p['color']; ?>"><?php echo $p['name']; ?></div>
                            <div class="wpts-plan-credits"><?php echo number_format($p['credits']); ?> créditos/mês</div>
                        </div>
                        <div style="text-align:right">
                            <div class="wpts-plan-price"><?php echo $p['price']; ?></div>
                            <?php if ($plan === $slug) : ?><span class="wpts-badge-current">✓ Atual</span>
                            <?php else : ?><a href="https://wp.techsites.ai/planos" target="_blank" class="wpts-upgrade-link">Assinar</a><?php endif; ?>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
    <?php
}
