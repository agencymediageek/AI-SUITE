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

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS });
    }

    try {
      const { messages } = await request.json();

      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GROK_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-3-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
          ],
          temperature: 0.8,
          max_tokens: 2048,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return new Response(JSON.stringify({ error: data?.error?.message || 'API error' }), {
          status: res.status,
          headers: { 'Content-Type': 'application/json', ...CORS },
        });
      }

      const content = data?.choices?.[0]?.message?.content || '';
      return new Response(JSON.stringify({ content }), {
        headers: { 'Content-Type': 'application/json', ...CORS },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }
  },
};
