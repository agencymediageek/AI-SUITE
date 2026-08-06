/* WP TechSites — Chatbot Frontend v2.7.0 */
(function () {
    'use strict';

    var cfg    = window.WPTS_CHAT || {};
    var API    = cfg.api    || '';
    var KEY    = cfg.key    || '';
    var COLOR  = cfg.color  || '#6366f1';
    var NAME   = cfg.name   || 'Assistente';
    var PROMPT = cfg.prompt || '';
    var WP_JSON = cfg.wpJson || (window.location.origin + '/wp-json');

    var open      = false;
    var msgs      = [];
    var sitePages = null;   // lazy-loaded on first open

    // ── Styles ────────────────────────────────────────────────────────
    var style = document.createElement('style');
    style.textContent = [
        '#wpts-chat-widget{position:fixed;bottom:24px;right:24px;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
        '#wpts-chat-btn{width:58px;height:58px;border-radius:50%;background:' + COLOR + ';display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px ' + COLOR + '66;transition:transform .2s;border:none;outline:none}',
        '#wpts-chat-btn:hover{transform:scale(1.08)}',
        '#wpts-chat-btn svg{width:26px;height:26px;fill:#fff}',
        '#wpts-chat-box{position:absolute;bottom:70px;right:0;width:360px;background:#fff;border-radius:18px;box-shadow:0 8px 40px rgba(0,0,0,.18);overflow:hidden;display:none;flex-direction:column;max-height:520px}',
        '#wpts-chat-box.open{display:flex}',
        '#wpts-chat-head{background:' + COLOR + ';padding:16px 18px;display:flex;align-items:center;gap:10px}',
        '#wpts-chat-head .avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:18px}',
        '#wpts-chat-head .info .name{color:#fff;font-weight:700;font-size:14px}',
        '#wpts-chat-head .info .sub{color:rgba(255,255,255,.75);font-size:12px}',
        '#wpts-chat-head .close-btn{margin-left:auto;background:rgba(255,255,255,.2);border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center}',
        '#wpts-chat-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f8fafc}',
        '.wpts-msg{display:flex;gap:8px;max-width:90%}',
        '.wpts-msg.user{align-self:flex-end;flex-direction:row-reverse}',
        '.wpts-bubble{padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.6}',
        '.wpts-msg.bot .wpts-bubble{background:#fff;border:1px solid #e2e8f0;color:#1e293b;border-radius:4px 14px 14px 14px}',
        '.wpts-msg.user .wpts-bubble{background:' + COLOR + ';color:#fff;border-radius:14px 14px 4px 14px}',
        '.wpts-bubble a{color:' + COLOR + ';font-weight:600;text-decoration:underline}',
        '.wpts-msg.user .wpts-bubble a{color:#fff}',
        '.wpts-bubble strong{font-weight:700}',
        '.wpts-bubble code{background:#f1f5f9;padding:1px 5px;border-radius:4px;font-size:12px;font-family:monospace}',
        '.wpts-bubble br{display:block;content:"";margin-top:4px}',
        '.wpts-typing{display:flex;gap:4px;align-items:center;padding:10px 14px;background:#fff;border:1px solid #e2e8f0;border-radius:4px 14px 14px 14px;width:fit-content}',
        '.wpts-typing span{width:8px;height:8px;background:#94a3b8;border-radius:50%;animation:wpts-bounce .8s infinite}',
        '.wpts-typing span:nth-child(2){animation-delay:.15s}.wpts-typing span:nth-child(3){animation-delay:.3s}',
        '@keyframes wpts-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}',
        '#wpts-chat-form{padding:12px;border-top:1px solid #e2e8f0;display:flex;gap:8px;background:#fff}',
        '#wpts-chat-input{flex:1;border:1px solid #e2e8f0;border-radius:10px;padding:9px 12px;font-size:13px;outline:none;resize:none;font-family:inherit}',
        '#wpts-chat-input:focus{border-color:' + COLOR + '}',
        '#wpts-chat-send{background:' + COLOR + ';color:#fff;border:none;border-radius:10px;width:38px;min-width:38px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px}',
        '#wpts-chat-send:hover{opacity:.9}',
        '#wpts-chat-badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;display:none}',
    ].join('');
    document.head.appendChild(style);

    // ── DOM ───────────────────────────────────────────────────────────
    var widget = document.createElement('div');
    widget.id  = 'wpts-chat-widget';
    widget.innerHTML = [
        '<div id="wpts-chat-box">',
        '  <div id="wpts-chat-head">',
        '    <div class="avatar">🤖</div>',
        '    <div class="info"><div class="name">' + escHtml(NAME) + '</div><div class="sub">Online · IA powered</div></div>',
        '    <button class="close-btn" id="wpts-chat-close">✕</button>',
        '  </div>',
        '  <div id="wpts-chat-msgs"></div>',
        '  <form id="wpts-chat-form">',
        '    <textarea id="wpts-chat-input" rows="1" placeholder="Digite sua mensagem..."></textarea>',
        '    <button type="submit" id="wpts-chat-send">➤</button>',
        '  </form>',
        '</div>',
        '<button id="wpts-chat-btn" aria-label="Abrir chat">',
        '  <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
        '  <div id="wpts-chat-badge">1</div>',
        '</button>',
    ].join('');
    document.body.appendChild(widget);

    var $box   = document.getElementById('wpts-chat-box');
    var $msgs  = document.getElementById('wpts-chat-msgs');
    var $input = document.getElementById('wpts-chat-input');
    var $badge = document.getElementById('wpts-chat-badge');

    // ── Lazy-load site pages & posts for context ──────────────────────
    function loadSiteContext() {
        if (sitePages !== null) return;
        sitePages = [];
        Promise.all([
            fetch(WP_JSON + '/wp/v2/pages?per_page=20&status=publish&_fields=title,excerpt,link', { signal: AbortSignal.timeout(6000) }).then(function(r){ return r.ok ? r.json() : []; }).catch(function(){ return []; }),
            fetch(WP_JSON + '/wp/v2/posts?per_page=20&status=publish&_fields=title,excerpt,link', { signal: AbortSignal.timeout(6000) }).then(function(r){ return r.ok ? r.json() : []; }).catch(function(){ return []; }),
        ]).then(function(results) {
            var pages = results[0]; var posts = results[1];
            var all   = (Array.isArray(pages) ? pages : []).concat(Array.isArray(posts) ? posts : []);
            sitePages = all.map(function(p) {
                return {
                    title:   (p.title && p.title.rendered) ? p.title.rendered.replace(/<[^>]+>/g,'') : '',
                    excerpt: (p.excerpt && p.excerpt.rendered) ? p.excerpt.rendered.replace(/<[^>]+>/g,'').trim().slice(0, 200) : '',
                    link:    p.link || '',
                };
            });
        });
    }

    // ── Welcome ───────────────────────────────────────────────────────
    setTimeout(function () {
        addMsg('Olá! 👋 Sou o ' + NAME + '. Como posso te ajudar hoje?', 'bot');
        $badge.style.display = 'flex';
    }, 1500);

    // ── Toggle ────────────────────────────────────────────────────────
    document.getElementById('wpts-chat-btn').addEventListener('click', function () {
        open = !open;
        $box.classList.toggle('open', open);
        $badge.style.display = 'none';
        if (open) { $input.focus(); scrollBottom(); loadSiteContext(); }
    });
    document.getElementById('wpts-chat-close').addEventListener('click', function () {
        open = false; $box.classList.remove('open');
    });

    // ── Send ──────────────────────────────────────────────────────────
    document.getElementById('wpts-chat-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var text = $input.value.trim();
        if (!text) return;
        $input.value = '';
        autoResize($input);
        addMsg(text, 'user');
        msgs.push({ role: 'user', content: text });
        sendToApi(text);
    });

    $input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('wpts-chat-form').dispatchEvent(new Event('submit')); }
    });
    $input.addEventListener('input', function () { autoResize(this); });

    function autoResize(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 100) + 'px'; }

    function sendToApi(text) {
        var $typing = addTyping();
        var payload = {
            messages:    msgs,
            siteUrl:     window.location.origin,
            prompt:      PROMPT,
            sitePages:   sitePages || [],
        };
        fetch(API + '/chatbot', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'X-WP-Site-Key': KEY },
            body:    JSON.stringify(payload),
        }).then(function (res) { return res.json(); }).then(function (data) {
            removeTyping($typing);
            var reply = data.reply || data.message || data.error || 'Desculpe, não consegui responder agora.';
            addMsg(reply, 'bot', true);
            msgs.push({ role: 'assistant', content: reply });
        }).catch(function () {
            removeTyping($typing);
            addMsg('Desculpe, ocorreu um erro. Tente novamente em instantes.', 'bot');
        });
    }

    // ── Render ────────────────────────────────────────────────────────
    function formatReply(text) {
        // Escape HTML first, then apply light markdown
        return text
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            // Links [texto](url) → <a>
            .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1 ↗</a>')
            // **bold**
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // *italic*
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            // `code`
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // newlines
            .replace(/\n/g, '<br>');
    }

    function addMsg(text, who, isHtml) {
        var div    = document.createElement('div');
        div.className = 'wpts-msg ' + who;
        var bubble = document.createElement('div');
        bubble.className = 'wpts-bubble';
        if (isHtml && who === 'bot') {
            bubble.innerHTML = formatReply(text);
        } else {
            bubble.textContent = text;
        }
        div.appendChild(bubble);
        $msgs.appendChild(div);
        scrollBottom();
        return div;
    }

    function addTyping() {
        var div = document.createElement('div');
        div.className = 'wpts-msg bot';
        div.innerHTML = '<div class="wpts-typing"><span></span><span></span><span></span></div>';
        $msgs.appendChild(div); scrollBottom(); return div;
    }

    function removeTyping(el) { el && el.parentNode && el.parentNode.removeChild(el); }
    function scrollBottom()   { $msgs.scrollTop = $msgs.scrollHeight; }
    function escHtml(s)       { return s.replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

})();
