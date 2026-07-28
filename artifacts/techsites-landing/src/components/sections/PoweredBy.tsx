export function PoweredBy() {
  const partners = ['OpenAI', 'N8N', 'Cloudflare', 'Stripe', 'Envato', 'Gemini'];

  return (
    <section className="py-12 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            POWERED BY
          </span>
          {partners.map((partner, index) => (
            <span
              key={index}
              className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
