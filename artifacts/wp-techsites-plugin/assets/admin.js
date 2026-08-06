/* WP TechSites Admin JS — v2.0.0 */
(function ($) {
    'use strict';

    var API    = WPTS.api;
    var KEY    = WPTS.key;
    var NONCE  = WPTS.nonce;
    var AJAX   = WPTS.ajaxurl;

    function apiPost(endpoint, data, opts) {
        opts = opts || {};
        return $.ajax({
            url:         API + endpoint,
            method:      'POST',
            contentType: 'application/json',
            headers:     { 'X-WP-Site-Key': KEY },
            data:        JSON.stringify(data),
            timeout:     90000,
        });
    }

    function wpAjax(action, data) {
        data.action = action;
        data.nonce  = NONCE;
        return $.post(AJAX, data);
    }

    function showResult(el, html) { $(el).html(html).show(); }
    function errHtml(msg) { return '<div class="wpts-alert wpts-alert-warn" style="margin-top:12px">❌ ' + msg + '</div>'; }
    function okHtml(msg)  { return '<div class="wpts-alert wpts-alert-success" style="margin-top:12px">✅ ' + msg + '</div>'; }

    // Auto-trigger removido — auditoria roda somente com clique explícito no botão.
    // (flag wpts_audit_pending agora só exibe o banner informativo)

    // ── SEO Audit ──────────────────────────────────────────────────────
    $(document).on('click', '#wpts-run-audit', function () {
        var $btn = $(this).prop('disabled', true).text('⏳ Analisando...');
        $('#wpts-audit-loading').show();
        wpAjax('wpts_run_audit', {}).done(function (r) {
            if (r.success) { location.reload(); }
            else { showResult('#wpts-audit-loading', errHtml(r.data || 'Erro ao rodar auditoria.')); }
        }).fail(function () {
            showResult('#wpts-audit-loading', errHtml('Erro de conexão.'));
        }).always(function () { $btn.prop('disabled', false).text('🔍 Executar Auditoria'); });
    });

    // ── Export PDF ─────────────────────────────────────────────────────
    $(document).on('click', '#wpts-export-pdf', function () {
        var el = document.getElementById('wpts-audit-report');
        if (!el) return;
        var opt = {
            margin:       [10, 10],
            filename:     'seo-audit-' + WPTS.sitename.replace(/\s+/g, '-').toLowerCase() + '.pdf',
            image:        { type: 'jpeg', quality: 0.95 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };
        if (typeof html2pdf !== 'undefined') {
            html2pdf().set(opt).from(el).save();
        } else {
            window.print();
        }
    });

    // ── Directory Builder ──────────────────────────────────────────────
    $(document).on('click', '#wpts-create-dir', function () {
        var $btn = $(this).prop('disabled', true).text('⏳ Criando...');
        wpAjax('wpts_create_directory', {
            title:      $('#wpts-dir-title').val(),
            categories: $('#wpts-dir-cats').val(),
            city:       $('#wpts-dir-city').val(),
            premium:    $('#wpts-dir-premium').is(':checked') ? 1 : 0,
        }).done(function (r) {
            if (r.success) {
                var d = r.data;
                showResult('#wpts-dir-result', '<div class="wpts-alert wpts-alert-success" style="margin-top:12px">' +
                    '✅ Diretório criado! <a href="' + d.page_url + '" target="_blank">Ver página →</a>' +
                    ' | <a href="' + d.edit_url + '">Editar →</a></div>');
            } else {
                showResult('#wpts-dir-result', errHtml(r.data));
            }
        }).fail(function () {
            showResult('#wpts-dir-result', errHtml('Erro de conexão.'));
        }).always(function () { $btn.prop('disabled', false).text('📁 Criar Diretório'); });
    });

    // ── Scraping ───────────────────────────────────────────────────────
    $(document).on('click', '#wpts-run-scraping', function () {
        var $btn     = $(this).prop('disabled', true).text('⏳ Buscando...');
        var category = $('#wpts-scr-custom').val() || $('#wpts-scr-category').val();
        $('#wpts-scr-progress').show();
        $('#wpts-scr-result').html('');
        wpAjax('wpts_run_scraping', {
            category:  category,
            city:      $('#wpts-scr-city').val(),
            limit:     $('#wpts-scr-limit').val(),
            save_to:   $('input[name="wpts-scr-save"]:checked').val(),
            min_rating:$('#wpts-scr-rating').val(),
        }).done(function (r) {
            $('#wpts-scr-progress').hide();
            if (r.success && r.data && r.data.listings) {
                var data     = r.data;
                var listings = data.listings || [];
                var html     = '<div class="wpts-alert wpts-alert-success" style="margin-top:12px">✅ ' +
                    listings.length + ' negócios encontrados' +
                    (data.inserted ? ' · ' + data.inserted + ' importados' : '') + '</div>';
                html += '<div class="wpts-listing-result-grid">';
                listings.forEach(function (l) {
                    html += '<div class="wpts-listing-mini">' +
                        '<strong>' + $('<div>').text(l.name).html() + '</strong>' +
                        (l.address ? '<div>📍 ' + $('<div>').text(l.address).html() + '</div>' : '') +
                        (l.phone   ? '<div>📞 ' + $('<div>').text(l.phone).html()   + '</div>' : '') +
                        (l.rating  ? '<div>★ '  + l.rating + '</div>' : '') +
                        '</div>';
                });
                html += '</div>';
                showResult('#wpts-scr-result', html);
                update_last_scraping_date();
            } else if (r.success) {
                showResult('#wpts-scr-result', errHtml('Nenhum resultado. Verifique sua chave de API e créditos.'));
            } else {
                showResult('#wpts-scr-result', errHtml(r.data || 'Erro.'));
            }
        }).fail(function () {
            $('#wpts-scr-progress').hide();
            showResult('#wpts-scr-result', errHtml('Erro de conexão.'));
        }).always(function () { $btn.prop('disabled', false).text('🌐 Iniciar Scraping'); });
    });

    function update_last_scraping_date() {
        wpAjax('wpts_save_settings', { api_key: KEY }); // piggyback
    }

    // ── Content AI ────────────────────────────────────────────────────
    $(document).on('click', '#wpts-gen-content', function () {
        var $btn = $(this).prop('disabled', true).text('⏳ Gerando...');
        $('#wpts-ct-loading').show();
        $('#wpts-ct-result').html('');
        wpAjax('wpts_generate_content', {
            type:   $('#wpts-ct-type').val(),
            topic:  $('#wpts-ct-topic').val(),
            tone:   $('#wpts-ct-tone').val(),
            length: $('#wpts-ct-length').val(),
            lang:   $('#wpts-ct-lang').val(),
        }).done(function (r) {
            $('#wpts-ct-loading').hide();
            if (r.success && r.data && r.data.content) {
                var d    = r.data;
                var html = '<div class="wpts-card" style="margin-top:16px">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
                    '<strong>' + $('<div>').text(d.title || 'Conteúdo gerado').html() + '</strong>' +
                    '<span class="wpts-meta">' + (d.word_count || '') + ' palavras</span>' +
                    '</div>' +
                    '<div style="max-height:300px;overflow-y:auto;background:#f8fafc;border-radius:8px;padding:14px;font-size:13px;line-height:1.7;white-space:pre-wrap">' +
                    $('<div>').text(d.content).html() +
                    '</div>' +
                    '<div style="display:flex;gap:8px;margin-top:14px">' +
                    '<button class="wpts-btn wpts-btn-primary" id="wpts-publish-content">📤 Publicar como rascunho</button>' +
                    '<button class="wpts-btn" id="wpts-copy-content">📋 Copiar</button>' +
                    '</div></div>';
                showResult('#wpts-ct-result', html);
                $('#wpts-publish-content').data('content', d);
            } else {
                $('#wpts-ct-loading').hide();
                showResult('#wpts-ct-result', errHtml((r.data && r.data.error) || r.data || 'Erro ao gerar conteúdo.'));
            }
        }).fail(function () {
            $('#wpts-ct-loading').hide();
            showResult('#wpts-ct-result', errHtml('Erro de conexão.'));
        }).always(function () { $btn.prop('disabled', false).text('✍️ Gerar Conteúdo'); });
    });

    $(document).on('click', '#wpts-publish-content', function () {
        var $btn = $(this).prop('disabled', true).text('Publicando...');
        var d    = $(this).data('content');
        wpAjax('wpts_publish_content', {
            title:     d.title || 'Post gerado por IA',
            content:   d.content || '',
            post_type: 'post',
        }).done(function (r) {
            if (r.success) {
                $btn.replaceWith('<a href="' + r.data.edit_url + '" target="_blank" class="wpts-btn">✅ Publicado! Editar rascunho →</a>');
            } else { $btn.prop('disabled', false).text('📤 Publicar'); alert(r.data); }
        });
    });

    $(document).on('click', '#wpts-copy-content', function () {
        var text = $('.wpts-ct-result > .wpts-card [style*="pre-wrap"]').text();
        navigator.clipboard && navigator.clipboard.writeText(text);
        $(this).text('✅ Copiado!');
        setTimeout(function () { $('#wpts-copy-content').text('📋 Copiar'); }, 2000);
    });

    // Use cases quick-fill
    $(document).on('click', '.wpts-use-case', function () {
        var $el = $(this);
        $('#wpts-ct-topic').val($el.data('topic'));
        $('#wpts-ct-type').val($el.data('type'));
    });

    // ── Branding / Colors ─────────────────────────────────────────────
    $(document).on('click', '#wpts-gen-colors', function () {
        var $btn = $(this).prop('disabled', true).text('⏳ Gerando...');
        wpAjax('wpts_generate_colors', {
            niche: $('#wpts-br-niche').val(),
            style: $('#wpts-br-style').val(),
        }).done(function (r) {
            if (r.success && r.data) {
                var d    = r.data;
                var html = '<div style="margin-top:16px">';
                if (d.palettes) {
                    d.palettes.forEach(function (p) {
                        html += '<div class="wpts-card" style="margin-bottom:12px">' +
                            '<div style="font-weight:600;margin-bottom:10px">' + p.name + '</div>' +
                            '<div style="display:flex;gap:8px;margin-bottom:12px">' +
                            '<div style="flex:1;height:40px;border-radius:8px;background:' + p.primary + '" title="' + p.primary + '"></div>' +
                            '<div style="flex:1;height:40px;border-radius:8px;background:' + p.secondary + '" title="' + p.secondary + '"></div>' +
                            '<div style="flex:1;height:40px;border-radius:8px;background:' + p.accent + '" title="' + p.accent + '"></div>' +
                            '</div>' +
                            '<button class="wpts-btn wpts-btn-primary wpts-apply-palette" data-p="' + p.primary + '" data-s="' + p.secondary + '">✅ Aplicar</button>' +
                            '</div>';
                    });
                }
                html += '</div>';
                showResult('#wpts-br-result', html);
            } else {
                showResult('#wpts-br-result', errHtml('Erro ao gerar paleta.'));
            }
        }).fail(function () { showResult('#wpts-br-result', errHtml('Erro.')); })
        .always(function () { $btn.prop('disabled', false).text('🎨 Gerar Paleta'); });
    });

    $(document).on('click', '.wpts-apply-palette', function () {
        var $btn = $(this).prop('disabled', true).text('Aplicando...');
        wpAjax('wpts_apply_colors', { primary: $(this).data('p'), secondary: $(this).data('s') }).done(function (r) {
            if (r.success) { $btn.replaceWith('<span style="color:#22c55e;font-weight:700">✅ Aplicado!</span>'); }
            else { $btn.prop('disabled', false).text('Aplicar'); alert(r.data); }
        });
    });

    $(document).on('click', '#wpts-apply-colors', function () {
        var $btn = $(this).prop('disabled', true).text('Aplicando...');
        wpAjax('wpts_apply_colors', {
            primary:   $('#wpts-manual-primary').val(),
            secondary: $('#wpts-manual-secondary').val(),
        }).done(function (r) {
            showResult('#wpts-colors-apply-result', r.success ? okHtml('Cores aplicadas!') : errHtml(r.data));
        }).always(function () { $btn.prop('disabled', false).text('✅ Aplicar ao site'); });
    });

    // ── Menu Builder ──────────────────────────────────────────────────
    $(document).on('click', '#wpts-gen-menu', function () {
        var $btn = $(this).prop('disabled', true).text('⏳ Gerando...');
        wpAjax('wpts_generate_menu', {
            niche:    $('#wpts-mn-niche').val(),
            language: $('#wpts-mn-lang').val(),
        }).done(function (r) {
            if (r.success && r.data && r.data.menuItems) {
                var items = r.data.menuItems;
                var html  = '<div class="wpts-card" style="margin-top:16px">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
                    '<strong>Menu sugerido (' + items.length + ' itens)</strong>' +
                    '<button class="wpts-btn wpts-btn-primary" id="wpts-apply-menu-btn">📋 Aplicar ao site</button>' +
                    '</div><ul style="list-style:none;padding:0;margin:0">';
                items.forEach(function (it) {
                    html += '<li style="padding:8px 0;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:10px">' +
                        '<span style="font-size:18px">' + (it.icon || '•') + '</span>' +
                        '<strong>' + $('<div>').text(it.label).html() + '</strong>' +
                        '<span class="wpts-meta">/' + $('<div>').text(it.slug).html() + '</span>' +
                        '</li>';
                });
                html += '</ul></div>';
                showResult('#wpts-mn-result', html);
                $('#wpts-apply-menu-btn').data('items', items);
            } else { showResult('#wpts-mn-result', errHtml('Erro ao gerar menu.')); }
        }).fail(function () { showResult('#wpts-mn-result', errHtml('Erro.')); })
        .always(function () { $btn.prop('disabled', false).text('📋 Gerar Menu'); });
    });

    $(document).on('click', '#wpts-apply-menu-btn', function () {
        var $btn  = $(this).prop('disabled', true).text('Aplicando...');
        var items = $(this).data('items');
        wpAjax('wpts_apply_menu', { items: JSON.stringify(items) }).done(function (r) {
            if (r.success) { $btn.replaceWith('<span style="color:#22c55e;font-weight:700">✅ Menu aplicado!</span>'); }
            else { $btn.prop('disabled', false).text('📋 Aplicar ao site'); alert(r.data); }
        });
    });

    // ── Logo Builder — Tabs ───────────────────────────────────────────
    $(document).on('click', '.wpts-tab', function () {
        var tab = $(this).data('tab');
        $(this).closest('.wpts-tab-bar').find('.wpts-tab').removeClass('active');
        $(this).addClass('active');
        $('.wpts-tab-content').hide();
        $('#wpts-logo-tab-' + tab).show();
    });

    // ── Logo AI ───────────────────────────────────────────────────────
    $(document).on('click', '#wpts-gen-logo', function () {
        var $btn = $(this).prop('disabled', true).text('⏳ Gerando...');
        $('#wpts-logo-loading').show();
        $('#wpts-logo-result').html('');
        wpAjax('wpts_generate_logo', {
            brand_name: $('#wpts-logo-name').val(),
            style:      $('#wpts-logo-style').val(),
            colors:     $('#wpts-logo-colors').val(),
            desc:       $('#wpts-logo-desc').val(),
        }).done(function (r) {
            $('#wpts-logo-loading').hide();
            if (r.success && r.data) {
                var d    = r.data;
                var html = '<div class="wpts-card" style="margin-top:16px;text-align:center">';
                if (d.image_url) {
                    html += '<img src="' + d.image_url + '" style="max-width:320px;border-radius:12px;margin-bottom:12px">';
                }
                if (d.svg) {
                    html += '<div style="max-width:320px;margin:0 auto 12px">' + d.svg + '</div>';
                }
                html += '<div style="display:flex;gap:8px;justify-content:center;margin-top:10px">';
                if (d.download_url) html += '<a href="' + d.download_url + '" download class="wpts-btn wpts-btn-primary">⬇️ Baixar logo</a>';
                html += '</div></div>';
                showResult('#wpts-logo-result', html);
            } else {
                showResult('#wpts-logo-result', errHtml('Erro ao gerar logo. Verifique seus créditos.'));
            }
        }).fail(function () {
            $('#wpts-logo-loading').hide();
            showResult('#wpts-logo-result', errHtml('Erro de conexão.'));
        }).always(function () { $btn.prop('disabled', false).text('🤖 Gerar Logo'); });
    });

    // ── Naming Suggestions ────────────────────────────────────────────
    $(document).on('click', '#wpts-gen-naming', function () {
        var $btn  = $(this).prop('disabled', true).text('⏳...');
        var niche = $('#wpts-naming-niche').val();
        var city  = $('#wpts-naming-city').val();
        wpAjax('wpts_generate_content', {
            type:   'naming',
            topic:  niche + ' em ' + city,
            tone:   'creative',
            length: 'short',
            lang:   'pt-BR',
        }).done(function (r) {
            if (r.success && r.data) {
                var names = (r.data.names || r.data.content || '').split('\n').filter(Boolean).slice(0, 8);
                var html  = '<div class="wpts-name-suggestions">';
                names.forEach(function (n) {
                    n = n.replace(/^[-\d\.\s]+/, '').trim();
                    if (n) html += '<div class="wpts-name-chip" onclick="document.getElementById(\'wpts-logo-name\').value=\'' + n.replace(/'/g, '') + '\'">' + $('<div>').text(n).html() + '</div>';
                });
                html += '</div>';
                showResult('#wpts-naming-result', html);
            } else { showResult('#wpts-naming-result', errHtml('Erro.')); }
        }).always(function () { $btn.prop('disabled', false).text('✨ Sugerir Nomes de Marca'); });
    });

    // ── Logo Composer Live Preview ────────────────────────────────────
    function updatePreview() {
        var name    = $('#wpts-comp-name').val()    || '';
        var tagline = $('#wpts-comp-tagline').val() || '';
        var color1  = $('#wpts-comp-color1').val()  || '#6366f1';
        var color2  = $('#wpts-comp-color2').val()  || '#1e1e2e';
        var font    = $('#wpts-comp-font').val()    || "'Inter', sans-serif";
        $('#wpts-preview-text').text(name).css({ color: color2, fontFamily: font });
        $('#wpts-preview-tagline').text(tagline).css('color', color2 + '99');
        $('#wpts-preview-icon').css('color', color1);
        $('#wpts-logo-preview').css('background', 'linear-gradient(135deg,' + color1 + '15,' + color1 + '08)');
    }
    $(document).on('input change', '#wpts-comp-name,#wpts-comp-tagline,#wpts-comp-color1,#wpts-comp-color2,#wpts-comp-font', updatePreview);

    // ── Chatbot ───────────────────────────────────────────────────────
    $(document).on('change', '#wpts-cb-color', function () {
        $('#wpts-cb-bubble').css('background', $(this).val());
    });

    $(document).on('click', '#wpts-save-chatbot', function () {
        var $btn = $(this).prop('disabled', true).text('Salvando...');
        wpAjax('wpts_save_chatbot', {
            enabled: $('#wpts-cb-enabled').is(':checked') ? '1' : '0',
            name:    $('#wpts-cb-name').val(),
            color:   $('#wpts-cb-color').val(),
            prompt:  $('#wpts-cb-prompt').val(),
        }).done(function (r) {
            showResult('#wpts-cb-result', r.success ? okHtml('Chatbot salvo!') : errHtml(r.data));
        }).always(function () { $btn.prop('disabled', false).text('💾 Salvar Chatbot'); });
    });

    // ── Settings ──────────────────────────────────────────────────────
    $(document).on('click', '#wpts-save-settings', function () {
        var $btn = $(this).prop('disabled', true).text('Salvando...');
        wpAjax('wpts_save_settings', { api_key: $('#wpts-api-key').val() }).done(function (r) {
            showResult('#wpts-settings-result', r.success ? okHtml('Salvo!') : errHtml(r.data));
        }).always(function () { $btn.prop('disabled', false).text('💾 Salvar'); });
    });

    // ── Connect WordPress REST API ────────────────────────────────────
    $(document).on('click', '#wpts-connect-rest', function () {
        var $btn  = $(this).prop('disabled', true).text('Conectando...');
        var $res  = $('#wpts-rest-result');
        var user  = $('#wpts-wp-user').val().trim();
        var pass  = $('#wpts-wp-app-pass').val().trim();
        var url   = $('#wpts-wp-rest-url').val().trim();
        if (!user || !pass) {
            showResult('#wpts-rest-result', errHtml('Preencha o usuário e a senha de aplicação.'));
            $btn.prop('disabled', false).text('🔗 Conectar');
            return;
        }
        wpAjax('wpts_connect_rest', { wp_user: user, wp_app_password: pass, wp_rest_url: url }).done(function (r) {
            if (r.success) {
                showResult('#wpts-rest-result', okHtml('✅ ' + (r.data.message || 'Conectado!')));
                $('#wpts-wp-app-pass').val('');
                setTimeout(function () { location.reload(); }, 1500);
            } else {
                showResult('#wpts-rest-result', errHtml(r.data || 'Erro ao conectar.'));
            }
        }).fail(function () {
            showResult('#wpts-rest-result', errHtml('Erro de conexão.'));
        }).always(function () { $btn.prop('disabled', false).text('🔗 Conectar'); });
    });

    $(document).on('click', '#wpts-disconnect-rest', function () {
        if (!confirm('Desconectar o WordPress REST API?')) return;
        wpAjax('wpts_disconnect_rest', {}).done(function () { location.reload(); });
    });

    // ── Chat Editor: show WP write-back results ───────────────────────
    // (enhances existing chat response to show wpResults detail)
    $(document).on('click', '#wpts-send-chat', function () {
        // Handled below, this hook adds wpResults display on top of existing handler
    });

    // ── Chat Editor ───────────────────────────────────────────────────
    function appendChatMsg(text, who) {
        var $box  = $('#wpts-chat-history');
        var cls   = who === 'user' ? 'wpts-chat-user' : 'wpts-chat-ai';
        var emoji = who === 'user' ? '👤' : '🤖';
        $box.append(
            '<div class="wpts-chat-msg ' + cls + '">' +
            '<span>' + emoji + '</span>' +
            '<div class="wpts-chat-bubble">' + $('<div>').text(text).html() + '</div>' +
            '</div>'
        );
        $box.scrollTop($box[0].scrollHeight);
    }

    $(document).on('click', '#wpts-send-chat', function () {
        var cmd = $('#wpts-chat-cmd').val().trim();
        if (!cmd) return;
        appendChatMsg(cmd, 'user');
        $('#wpts-chat-cmd').val('');
        var $btn = $(this).prop('disabled', true);
        wpAjax('wpts_chat_edit', { command: cmd, context: WPTS.siteurl }).done(function (r) {
            if (r.success && r.data) {
                var msg = r.data.message || r.data.response || 'Ação executada.';
                appendChatMsg(msg, 'ai');
                if (r.data.actions && r.data.actions.length) {
                    appendChatMsg('✅ ' + r.data.actions.length + ' ação(ões) aplicada(s) ao site.', 'ai');
                }
            } else {
                appendChatMsg('❌ ' + (r.data || 'Erro ao processar comando.'), 'ai');
            }
        }).fail(function () { appendChatMsg('❌ Erro de conexão com a API.', 'ai'); })
        .always(function () { $btn.prop('disabled', false); });
    });

    $(document).on('keydown', '#wpts-chat-cmd', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#wpts-send-chat').trigger('click'); }
    });

})(jQuery);
