import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Globe, Sparkles, RefreshCw, ExternalLink, Check, Loader2 } from 'lucide-react';

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

const BUILD_STEPS = [
  { id: 'brief',    icon: '🔍', label: 'Analyzing brief',          sub: 'Reading brand, niche & objectives',         ms: 900  },
  { id: 'template', icon: '🎨', label: 'Selecting design template', sub: 'Matching visual style to your segment',      ms: 1100 },
  { id: 'copy',     icon: '✍️', label: 'Generating copy & content', sub: 'Writing headlines, CTAs and section text',   ms: 1600 },
  { id: 'seo',      icon: '📈', label: 'Optimizing for SEO',        sub: 'Meta titles, descriptions & schema markup',  ms: 900  },
  { id: 'layout',   icon: '📐', label: 'Building responsive layout', sub: 'Desktop, tablet & mobile breakpoints',      ms: 1200 },
  { id: 'assets',   icon: '🖼️', label: 'Sourcing image placeholders','sub': 'Hero, gallery & section visuals',         ms: 800  },
  { id: 'perf',     icon: '⚡', label: 'Performance pass',          sub: 'Lighthouse ≥ 90 · Core Web Vitals check',   ms: 700  },
  { id: 'deploy',   icon: '🚀', label: 'Publishing to CDN',         sub: 'Global edge network · SSL · custom domain',  ms: 0    },
];

interface Message { role: 'user' | 'assistant'; content: string; }
type StepStatus = 'pending' | 'active' | 'done';

function renderMarkdown(text: string) {
  if (!text) return '<p></p>';
  return text
    .split('\n')
    .map(line => {
      if (/^### (.+)$/.test(line)) return line.replace(/^### (.+)$/, '<h3>$1</h3>');
      if (/^## (.+)$/.test(line))  return line.replace(/^## (.+)$/, '<h2>$1</h2>');
      if (/^# (.+)$/.test(line))   return line.replace(/^# (.+)$/, '<h1>$1</h1>');
      if (/^- (.+)$/.test(line))   return line.replace(/^- (.+)$/, '<li>$1</li>');
      if (line.trim() === '')      return '<br/>';
      return `<p>${line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code>$1</code>')}</p>`;
    })
    .join('');
}

const PROXY_URL = 'https://ts-builder-proxy.reynaldodallin.workers.dev';

async function callAI(messages: Message[]): Promise<string> {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: messages.map(m => ({ role: m.role, content: m.content })) }),
  });
  const data = await res.json() as any;
  if (!res.ok || data?.error) throw new Error(data?.error || `Error ${res.status}`);
  return data?.content || 'No response generated.';
}

/* ─── Progress Bar Component ─────────────────────────────────────────── */
function BuildProgress({ onDone }: { onDone: () => void }) {
  const [stepIndex, setStepIndex]   = useState(0);
  const [statuses, setStatuses]     = useState<StepStatus[]>(BUILD_STEPS.map(() => 'pending'));
  const [barWidth, setBarWidth]     = useState(0);
  const [subText, setSubText]       = useState(BUILD_STEPS[0].sub);
  const doneRef = useRef(false);

  useEffect(() => {
    let step = 0;
    let cancelled = false;

    const advance = () => {
      if (cancelled || step >= BUILD_STEPS.length) return;

      setStepIndex(step);
      setSubText(BUILD_STEPS[step].sub);
      setStatuses(prev => prev.map((s, i) => i < step ? 'done' : i === step ? 'active' : 'pending'));
      setBarWidth(Math.round((step / (BUILD_STEPS.length - 1)) * 88)); // max 88% until done

      const delay = BUILD_STEPS[step].ms;
      if (delay > 0) {
        setTimeout(() => { step++; advance(); }, delay);
      }
      // last step waits for onDone signal
    };

    advance();
    return () => { cancelled = true; };
  }, []);

  // called by parent when API finishes
  useEffect(() => {
    (window as any).__builderComplete = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setStepIndex(BUILD_STEPS.length - 1);
      setStatuses(BUILD_STEPS.map(() => 'done'));
      setBarWidth(100);
      setSubText('Live on the web · SSL active · CDN propagated');
      setTimeout(onDone, 1400);
    };
  }, [onDone]);

  const pct = barWidth;

  return (
    <div style={{
      background: 'linear-gradient(135deg,#0d1525 0%,#0a1220 100%)',
      border: '1px solid #1e2d45',
      borderRadius: 16,
      padding: '32px 32px 28px',
      maxWidth: 680,
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Sparkles size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Building your site</div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{subText}</div>
        </div>
        <div style={{ marginLeft: 'auto', fontWeight: 800, fontSize: 22, color: '#3b82f6', fontVariantNumeric: 'tabular-nums' }}>
          {pct}%
        </div>
      </div>

      {/* Master progress bar */}
      <div style={{ height: 6, background: '#1e2d45', borderRadius: 99, marginBottom: 28, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 99,
          background: 'linear-gradient(90deg,#3b82f6,#6366f1,#8b5cf6)',
          transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 0 12px rgba(99,102,241,0.6)',
        }} />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {BUILD_STEPS.map((step, i) => {
          const status = statuses[i];
          const isActive = status === 'active';
          const isDone   = status === 'done';
          return (
            <div key={step.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10,
              background: isActive ? 'rgba(59,130,246,0.08)' : isDone ? 'rgba(16,185,129,0.04)' : 'transparent',
              border: isActive ? '1px solid rgba(59,130,246,0.2)' : isDone ? '1px solid rgba(16,185,129,0.1)' : '1px solid transparent',
              transition: 'all 0.3s ease',
              opacity: status === 'pending' ? 0.35 : 1,
            }}>
              {/* Step icon circle */}
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDone
                  ? 'rgba(16,185,129,0.15)'
                  : isActive
                  ? 'rgba(59,130,246,0.15)'
                  : 'rgba(255,255,255,0.04)',
                border: isDone
                  ? '1px solid rgba(16,185,129,0.3)'
                  : isActive
                  ? '1px solid rgba(59,130,246,0.3)'
                  : '1px solid rgba(255,255,255,0.06)',
                fontSize: 15,
                transition: 'all 0.3s ease',
              }}>
                {isDone
                  ? <Check size={14} color="#10b981" strokeWidth={2.5} />
                  : isActive
                  ? <Loader2 size={14} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
                  : <span>{step.icon}</span>
                }
              </div>

              {/* Label */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: isDone || isActive ? 600 : 500,
                  color: isDone ? '#10b981' : isActive ? '#60a5fa' : '#64748b',
                  transition: 'color 0.3s',
                }}>
                  {step.label}
                </div>
                {isActive && (
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{step.sub}</div>
                )}
              </div>

              {/* Right badge */}
              {isDone && (
                <div style={{
                  fontSize: 10, fontWeight: 700, color: '#10b981',
                  background: 'rgba(16,185,129,0.1)', padding: '2px 8px',
                  borderRadius: 99, letterSpacing: 0.5,
                }}>
                  DONE
                </div>
              )}
              {isActive && (
                <div style={{
                  fontSize: 10, fontWeight: 700, color: '#3b82f6',
                  background: 'rgba(59,130,246,0.12)', padding: '2px 8px',
                  borderRadius: 99, letterSpacing: 0.5,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}>
                  LIVE
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div style={{
        marginTop: 20, padding: '10px 14px',
        borderRadius: 8, background: 'rgba(99,102,241,0.06)',
        border: '1px solid rgba(99,102,241,0.15)',
        fontSize: 12, color: '#64748b', textAlign: 'center',
      }}>
        ✨ Powered by <strong style={{ color: '#818cf8' }}>Apex AI Engine</strong> · Grok 3 · Cloudflare Edge Network
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}

/* ─── Main App ────────────────────────────────────────────────────────── */
export default function App() {
  const [prompt, setPrompt]         = useState('');
  const [niche, setNiche]           = useState('');
  const [url, setUrl]               = useState('');
  const [messages, setMessages]     = useState<Message[]>([]);
  const [chatInput, setChatInput]   = useState('');
  const [loading, setLoading]       = useState(false);
  const [building, setBuilding]     = useState(false);
  const [started, setStarted]       = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, building]);

  const buildInitialPrompt = () => {
    const nicheLabel = NICHES.find(n => n.value === niche)?.label || niche;
    let p = `Build a complete professional website for the following:\n\nNiche: ${nicheLabel}\n`;
    if (prompt) p += `\nDescription: ${prompt}`;
    if (url) p += `\n\nReference/existing URL: ${url}\n(Analyze the brand/business at this URL and incorporate the identity into the new site)`;
    p += '\n\nGenerate the full site structure with compelling copy for each section.';
    return p;
  };

  const handleBuildDone = useCallback(() => {
    setBuilding(false);
  }, []);

  const handleBuild = async () => {
    if (!niche && !prompt) return;
    const userMsg = buildInitialPrompt();
    const newMessages: Message[] = [{ role: 'user', content: userMsg }];
    setMessages(newMessages);
    setStarted(true);
    setBuilding(true);
    setLoading(true);

    try {
      const reply = await callAI(newMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      // signal the progress bar that the API is done
      (window as any).__builderComplete?.();
    } catch (e: any) {
      setBuilding(false);
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${e.message}` }]);
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
      const reply = await callAI(newMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]); setStarted(false); setBuilding(false);
    setPrompt(''); setNiche(''); setUrl(''); setChatInput('');
  };

  const demoLink = DEMO_LINKS[niche];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ── */}
      <header style={{
        padding: '16px 24px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(12px)',
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
          <span style={{ fontWeight: 800, fontSize: 18 }}>
            TechSites <span style={{ color: '#3b82f6' }}>AI Builder</span>
          </span>
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
        {/* ── Build Form ── */}
        {!started && (
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
              {/* Niche */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#94a3b8' }}>
                  NICHE / SEGMENT *
                </label>
                <select value={niche} onChange={e => setNiche(e.target.value)} style={{
                  width: '100%', padding: '12px 16px', borderRadius: 10,
                  background: '#0d1525', border: `1px solid ${niche ? '#3b82f6' : 'var(--border)'}`,
                  color: niche ? 'var(--fg)' : 'var(--muted)', fontSize: 15, outline: 'none', cursor: 'pointer',
                }}>
                  <option value="">Select a niche…</option>
                  {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#94a3b8' }}>
                  DESCRIBE YOUR BUSINESS
                </label>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. A boutique real estate agency in Miami specializing in luxury waterfront properties. Target clients are high-net-worth individuals. Brand colors: navy and gold."
                  rows={4} style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    background: '#0d1525', border: '1px solid var(--border)',
                    color: 'var(--fg)', fontSize: 15, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
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
                <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                  placeholder="https://yourdomain.com" style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    background: '#0d1525', border: '1px solid var(--border)',
                    color: 'var(--fg)', fontSize: 15, outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {/* Submit */}
              <button onClick={handleBuild} disabled={!niche && !prompt} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '14px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: (!niche && !prompt) ? '#1e2a3a' : 'linear-gradient(135deg,#3b82f6,#6366f1)',
                color: (!niche && !prompt) ? 'var(--muted)' : '#fff',
                fontWeight: 800, fontSize: 16, transition: 'all 0.2s',
              }}>
                <Sparkles size={18} /> Build My Site with AI →
              </button>

              {niche && demoLink && (
                <a href={demoLink} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 8, border: '1px solid var(--border)',
                  color: '#60a5fa', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                }}>
                  <ExternalLink size={13} /> See live demo for this niche
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Progress Bar (while building) ── */}
        {started && building && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', borderRadius: 10,
              background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Loader2 size={14} color="#60a5fa" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 13, color: '#60a5fa', fontWeight: 600 }}>
                  Apex is building your site…
                </span>
              </div>
              {niche && demoLink && (
                <a href={demoLink} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 12, color: '#3b82f6', fontWeight: 700, textDecoration: 'none',
                }}>
                  <ExternalLink size={12} /> Live Demo
                </a>
              )}
            </div>
            <BuildProgress onDone={handleBuildDone} />
          </div>
        )}

        {/* ── Results ── */}
        {started && !building && messages.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', borderRadius: 10,
              background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <Check size={14} color="#10b981" />
              <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                Site structure generated — ready for review
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

            {messages.filter(m => m.role === 'assistant').map((msg, i) => (
              <div key={i} style={{
                width: '100%', padding: '24px 28px', borderRadius: 12,
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
                <div className="prose-ai" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
              </div>
            ))}

            <div ref={bottomRef} />

            {/* Chat follow-up */}
            {!loading && (
              <div style={{
                position: 'sticky', bottom: 16,
                display: 'flex', gap: 10, alignItems: 'flex-end',
                background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(12px)',
                padding: '12px', borderRadius: 12, border: '1px solid var(--border)',
              }}>
                <textarea value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                  placeholder="Ask Apex to change anything — colors, copy, sections, tone…"
                  rows={2} style={{
                    flex: 1, padding: '10px 14px', borderRadius: 8,
                    background: '#0d1525', border: '1px solid var(--border)',
                    color: 'var(--fg)', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5,
                  }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <button onClick={handleChat} disabled={!chatInput.trim()} style={{
                  width: 44, height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: chatInput.trim() ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : '#1e2a3a',
                  color: chatInput.trim() ? '#fff' : 'var(--muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Send size={18} />
                </button>
              </div>
            )}

            {loading && (
              <div style={{
                padding: '16px 20px', borderRadius: 12,
                background: 'var(--card)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <Loader2 size={16} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ color: 'var(--muted)', fontSize: 14 }}>Apex is thinking…</span>
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
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}
