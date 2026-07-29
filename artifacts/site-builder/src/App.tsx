import { useState, useRef, useEffect } from 'react';
import { Send, Globe, Sparkles, RefreshCw, ExternalLink } from 'lucide-react';

const NICHES = [
  { value: 'real-estate', label: '🏠 Real Estate' },
  { value: 'restaurant', label: '🍽️ Restaurant & Café' },
  { value: 'saas', label: '🚀 SaaS & Tech' },
  { value: 'fitness', label: '💪 Fitness & Wellness' },
  { value: 'dental', label: '🦷 Dental & Medical' },
  { value: 'law', label: '⚖️ Law Firm' },
  { value: 'beauty', label: '💅 Beauty & Salon' },
  { value: 'construction', label: '🏗️ Construction' },
  { value: 'education', label: '📚 Education & Courses' },
  { value: 'ecommerce', label: '🛒 E-commerce' },
];

const DEMO_LINKS: Record<string, string> = {
  'real-estate': 'https://ts-real-estate-model.pages.dev/',
  'restaurant': 'https://ts-restaurant-cafe.pages.dev/',
  'saas': 'https://ts-saas-tech.pages.dev/',
  'fitness': 'https://ts-fitness-wellness.pages.dev/',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function renderMarkdown(text: string) {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '')
    .split('\n').map(line =>
      line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<li') ? line : `<p>${line}</p>`
    ).join('');
}

const SYSTEM_PROMPT = `You are Apex, the TechSites AI assistant specialized in building professional websites.
When given a brief, you generate a complete, detailed site structure including:
- Hero section with compelling headline and subheadline
- Key sections (About, Services, Portfolio, Testimonials, CTA, Contact)
- Color palette and typography recommendations
- SEO meta title and description
- Conversion-focused copy for each section
- Call-to-action buttons text
Format your response in clear Markdown with sections. Be specific, professional, and conversion-focused.
After the site structure, always add a "⚡ Next Steps" section explaining that TechSites AI will build this live site in 24 hours.`;

async function callAI(messages: Message[], apiKey: string): Promise<string> {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-3-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.8,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.json() as any;
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json() as any;
  return data?.choices?.[0]?.message?.content || 'No response generated.';
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [niche, setNiche] = useState('');
  const [url, setUrl] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [apiKey] = useState(() => (import.meta.env.VITE_GROK_KEY as string) || '');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildInitialPrompt = () => {
    const nicheLabel = NICHES.find(n => n.value === niche)?.label || niche;
    let p = `Build a complete professional website for the following:\n\nNiche: ${nicheLabel}\n`;
    if (prompt) p += `\nDescription: ${prompt}`;
    if (url) p += `\n\nReference/existing URL: ${url}\n(Analyze the brand/business at this URL and incorporate the identity into the new site)`;
    p += '\n\nGenerate the full site structure with compelling copy for each section.';
    return p;
  };

  const handleBuild = async () => {
    if (!niche && !prompt) return;
    if (!apiKey) {
      alert('API key not configured. Set VITE_GEMINI_KEY in Cloudflare Pages environment variables.');
      return;
    }
    const userMsg = buildInitialPrompt();
    const newMessages: Message[] = [{ role: 'user', content: userMsg }];
    setMessages(newMessages);
    setStarted(true);
    setLoading(true);
    try {
      const reply = await callAI(newMessages, apiKey);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || loading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const reply = await callAI(newMessages, apiKey);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setStarted(false);
    setPrompt('');
    setNiche('');
    setUrl('');
    setChatInput('');
  };

  const demoLink = DEMO_LINKS[niche];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18 }}>TechSites <span style={{ color: '#3b82f6' }}>AI Builder</span></span>
        </div>
        {started && (
          <button onClick={handleReset} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 8,
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>
            <RefreshCw size={14} /> New Site
          </button>
        )}
      </header>

      <main style={{ flex: 1, maxWidth: 820, margin: '0 auto', width: '100%', padding: '32px 20px' }}>
        {!started ? (
          /* ── Build Form ── */
          <div>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 20,
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                color: '#60a5fa', fontSize: 12, fontWeight: 700, letterSpacing: 1,
                marginBottom: 20, textTransform: 'uppercase',
              }}>
                <Sparkles size={12} /> AI SITE BUILDER · DEMO AO VIVO
              </div>
              <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}>
                Build a site<br /><span style={{ color: '#3b82f6' }}>in real time.</span>
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
                Choose a niche, describe your business, and watch Apex generate your complete professional site in seconds.
              </p>
            </div>

            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '32px', display: 'flex', flexDirection: 'column', gap: 20,
            }}>
              {/* Niche Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#94a3b8' }}>
                  NICHE / SEGMENT *
                </label>
                <select
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    background: '#0d1525', border: `1px solid ${niche ? '#3b82f6' : 'var(--border)'}`,
                    color: niche ? 'var(--fg)' : 'var(--muted)', fontSize: 15, outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">Select a niche…</option>
                  {NICHES.map(n => (
                    <option key={n.value} value={n.value}>{n.label}</option>
                  ))}
                </select>
              </div>

              {/* Prompt */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#94a3b8' }}>
                  DESCRIBE YOUR BUSINESS
                </label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. A boutique real estate agency in Miami specializing in luxury waterfront properties. Target clients are high-net-worth individuals. Brand colors: navy and gold."
                  rows={4}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    background: '#0d1525', border: '1px solid var(--border)',
                    color: 'var(--fg)', fontSize: 15, outline: 'none', resize: 'vertical',
                    fontFamily: 'inherit', lineHeight: 1.6,
                  }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {/* URL */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#94a3b8' }}>
                  <Globe size={13} /> EXISTING SITE URL <span style={{ fontWeight: 400, color: '#475569' }}>(optional)</span>
                </label>
                <p style={{ fontSize: 12, color: '#475569', marginBottom: 8, lineHeight: 1.5 }}>
                  Paste the client's current website. Apex will read the brand, services and tone from that URL and use them as the foundation for the new site — preserving the identity while upgrading everything else.
                </p>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://yourdomain.com"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    background: '#0d1525', border: '1px solid var(--border)',
                    color: 'var(--fg)', fontSize: 15, outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleBuild}
                disabled={!niche && !prompt}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '14px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: (!niche && !prompt) ? '#1e2a3a' : 'linear-gradient(135deg,#3b82f6,#6366f1)',
                  color: (!niche && !prompt) ? 'var(--muted)' : '#fff',
                  fontWeight: 800, fontSize: 16, transition: 'all 0.2s',
                }}
              >
                <Sparkles size={18} />
                Build My Site with AI →
              </button>

              {niche && demoLink && (
                <a href={demoLink} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 8, border: '1px solid var(--border)',
                  color: '#60a5fa', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  background: 'transparent', transition: 'all 0.2s',
                }}>
                  <ExternalLink size={13} /> See live demo for this niche
                </a>
              )}
            </div>
          </div>
        ) : (
          /* ── Chat / Results ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', borderRadius: 10,
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            }}>
              <Sparkles size={14} color="#60a5fa" />
              <span style={{ fontSize: 13, color: '#60a5fa', fontWeight: 600 }}>
                Apex is generating your site structure…
              </span>
              {niche && demoLink && (
                <a href={demoLink} target="_blank" rel="noopener noreferrer" style={{
                  marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 12, color: '#3b82f6', fontWeight: 700, textDecoration: 'none',
                }}>
                  <ExternalLink size={12} /> Live Demo
                </a>
              )}
            </div>

            {/* Messages */}
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                {msg.role === 'user' ? (
                  <div style={{
                    maxWidth: '75%', padding: '10px 16px', borderRadius: '12px 12px 4px 12px',
                    background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                    color: '#fff', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content.replace(/Build a complete professional website[\s\S]*?niche, describe your business[\s\S]*?/, '').trim() ||
                      `🏗️ Building site for: ${NICHES.find(n => n.value === niche)?.label || niche}`}
                  </div>
                ) : (
                  <div style={{
                    width: '100%', padding: '20px 24px', borderRadius: 12,
                    background: 'var(--card)', border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Sparkles size={13} color="#fff" />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>Apex</span>
                    </div>
                    <div
                      className="prose-ai"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{
                padding: '20px 24px', borderRadius: 12,
                background: 'var(--card)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={13} color="#fff" className="animate-spin" />
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#3b82f6',
                      animation: `bounce 1.2s ${i * 0.2}s infinite`,
                    }} />
                  ))}
                  <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 14 }}>Apex is writing your site…</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />

            {/* Chat input */}
            {!loading && messages.length > 0 && (
              <div style={{
                position: 'sticky', bottom: 16,
                display: 'flex', gap: 10, alignItems: 'flex-end',
                background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(12px)',
                padding: '12px', borderRadius: 12, border: '1px solid var(--border)',
              }}>
                <textarea
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                  placeholder="Ask Apex to change anything — colors, copy, sections, tone…"
                  rows={2}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 8,
                    background: '#0d1525', border: '1px solid var(--border)',
                    color: 'var(--fg)', fontSize: 14, outline: 'none', resize: 'none',
                    fontFamily: 'inherit', lineHeight: 1.5,
                  }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <button
                  onClick={handleChat}
                  disabled={!chatInput.trim()}
                  style={{
                    width: 44, height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: chatInput.trim() ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : '#1e2a3a',
                    color: chatInput.trim() ? '#fff' : 'var(--muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{
        padding: '16px 24px', borderTop: '1px solid var(--border)',
        textAlign: 'center', color: 'var(--muted)', fontSize: 12,
      }}>
        Powered by <strong style={{ color: '#60a5fa' }}>TechSites AI</strong> · Apex AI Engine · Grok 3
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
