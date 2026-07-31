/**
 * WP TechSites — Chatbot Widget
 * Injected by the WP TechSites plugin via wp_footer.
 * Reads config from data attributes on the script tag.
 */
(function () {
  'use strict';

  // Read config from script data attributes
  var scripts = document.querySelectorAll('script[data-wpts-key]');
  var scriptTag = scripts[scripts.length - 1];
  if (!scriptTag) return;

  var API_KEY   = scriptTag.getAttribute('data-wpts-key') || '';
  var API_URL   = scriptTag.getAttribute('data-wpts-api') || 'https://apex.techsites.ai/api/wp';
  var BOT_NAME  = scriptTag.getAttribute('data-wpts-name') || 'TechSites AI';
  var BOT_COLOR = scriptTag.getAttribute('data-wpts-color') || '#0ea5e9';
  var SITE_URL  = window.location.origin;

  // ── Styles ─────────────────────────────────────────────────────────────────
  var styles = `
    #wpts-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 56px; height: 56px; border-radius: 50%;
      background: ${BOT_COLOR}; border: none; cursor: pointer;
      box-shadow: 0 4px 24px rgba(0,0,0,.25);
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s, box-shadow .2s;
    }
    #wpts-btn:hover { transform: scale(1.08); box-shadow: 0 6px 32px rgba(0,0,0,.32); }
    #wpts-btn svg { width: 26px; height: 26px; fill: #fff; }
    #wpts-bubble {
      position: fixed; bottom: 92px; right: 24px; z-index: 99998;
      width: 340px; max-height: 520px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 48px rgba(0,0,0,.18);
      display: none; flex-direction: column; overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #wpts-bubble.open { display: flex; }
    #wpts-header {
      background: ${BOT_COLOR}; color: #fff;
      padding: 14px 16px; display: flex; align-items: center; gap: 10px;
    }
    #wpts-header .avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(255,255,255,.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
    }
    #wpts-header .info { flex: 1; }
    #wpts-header .name { font-weight: 600; font-size: 14px; }
    #wpts-header .status { font-size: 11px; opacity: .85; }
    #wpts-close {
      background: none; border: none; color: #fff; cursor: pointer;
      font-size: 18px; opacity: .8; padding: 4px;
    }
    #wpts-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      max-height: 340px;
    }
    .wpts-msg { display: flex; gap: 8px; align-items: flex-end; }
    .wpts-msg.user { flex-direction: row-reverse; }
    .wpts-bubble-text {
      max-width: 75%; padding: 10px 14px; border-radius: 16px;
      font-size: 13px; line-height: 1.45;
    }
    .wpts-msg.bot .wpts-bubble-text {
      background: #f1f5f9; color: #1e293b; border-bottom-left-radius: 4px;
    }
    .wpts-msg.user .wpts-bubble-text {
      background: ${BOT_COLOR}; color: #fff; border-bottom-right-radius: 4px;
    }
    .wpts-avatar-sm {
      width: 28px; height: 28px; border-radius: 50%;
      background: ${BOT_COLOR}22; display: flex; align-items: center;
      justify-content: center; font-size: 13px; flex-shrink: 0;
    }
    #wpts-input-row {
      padding: 12px 12px 14px; border-top: 1px solid #f1f5f9;
      display: flex; gap: 8px;
    }
    #wpts-input {
      flex: 1; border: 1px solid #e2e8f0; border-radius: 20px;
      padding: 8px 14px; font-size: 13px; outline: none;
      transition: border-color .15s;
    }
    #wpts-input:focus { border-color: ${BOT_COLOR}; }
    #wpts-send {
      width: 36px; height: 36px; border-radius: 50%;
      background: ${BOT_COLOR}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: opacity .15s;
    }
    #wpts-send:hover { opacity: .88; }
    #wpts-send svg { width: 16px; height: 16px; fill: #fff; }
    .wpts-typing { display: flex; gap: 4px; padding: 8px 4px; }
    .wpts-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: #94a3b8; animation: bounce 1s infinite;
    }
    .wpts-typing span:nth-child(2) { animation-delay: .15s; }
    .wpts-typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes bounce {
      0%,60%,100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // ── HTML ───────────────────────────────────────────────────────────────────
  var html = `
    <button id="wpts-btn" title="${BOT_NAME}">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
    </button>
    <div id="wpts-bubble">
      <div id="wpts-header">
        <div class="avatar">🤖</div>
        <div class="info">
          <div class="name">${BOT_NAME}</div>
          <div class="status">● Online — respondo em segundos</div>
        </div>
        <button id="wpts-close">✕</button>
      </div>
      <div id="wpts-messages"></div>
      <div id="wpts-input-row">
        <input id="wpts-input" type="text" placeholder="Digite sua mensagem..." maxlength="500" />
        <button id="wpts-send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  `;

  var wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  // ── State ──────────────────────────────────────────────────────────────────
  var messages = [];
  var isOpen = false;
  var isTyping = false;

  // ── Elements ───────────────────────────────────────────────────────────────
  var btn      = document.getElementById('wpts-btn');
  var bubble   = document.getElementById('wpts-bubble');
  var closeBtn = document.getElementById('wpts-close');
  var msgsEl   = document.getElementById('wpts-messages');
  var input    = document.getElementById('wpts-input');
  var sendBtn  = document.getElementById('wpts-send');

  // ── Helpers ────────────────────────────────────────────────────────────────
  function addMessage(role, text) {
    messages.push({ role: role, text: text });
    renderMessages();
  }

  function renderMessages() {
    msgsEl.innerHTML = '';
    messages.forEach(function (m) {
      var div = document.createElement('div');
      div.className = 'wpts-msg ' + m.role;
      if (m.role === 'bot') {
        div.innerHTML = '<div class="wpts-avatar-sm">🤖</div><div class="wpts-bubble-text">' + escapeHtml(m.text) + '</div>';
      } else {
        div.innerHTML = '<div class="wpts-bubble-text">' + escapeHtml(m.text) + '</div>';
      }
      msgsEl.appendChild(div);
    });
    if (isTyping) {
      var t = document.createElement('div');
      t.className = 'wpts-msg bot';
      t.innerHTML = '<div class="wpts-avatar-sm">🤖</div><div class="wpts-bubble-text"><div class="wpts-typing"><span></span><span></span><span></span></div></div>';
      msgsEl.appendChild(t);
    }
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function toggleChat() {
    isOpen = !isOpen;
    bubble.classList.toggle('open', isOpen);
    if (isOpen && messages.length === 0) {
      addMessage('bot', 'Olá! Sou o assistente de IA do seu site. Como posso ajudar hoje?');
    }
    if (isOpen) { input.focus(); }
  }

  async function sendMessage() {
    var text = input.value.trim();
    if (!text || isTyping) return;
    input.value = '';
    addMessage('user', text);
    isTyping = true;
    renderMessages();

    try {
      var res = await fetch(API_URL + '/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Site-Key': API_KEY,
        },
        body: JSON.stringify({ message: text, siteUrl: SITE_URL }),
      });
      var data = await res.json();
      isTyping = false;
      addMessage('bot', data.reply || 'Desculpe, não consegui processar sua mensagem.');
    } catch (e) {
      isTyping = false;
      addMessage('bot', 'Erro de conexão. Verifique sua configuração do WP TechSites.');
    }
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  btn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage();
  });
})();
