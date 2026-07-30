import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Terminal } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-black text-foreground flex items-center justify-center px-4">
      <div className="text-center">
        <Terminal className="w-20 h-20 text-primary mx-auto mb-6 opacity-50" />
        <h1 className="text-6xl font-bold matrix-text mb-4">404</h1>
        <p className="text-2xl text-muted-foreground mb-8">System not found</p>
        <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto font-mono">
          The requested resource does not exist in the APEX CORE database.
        </p>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow">
          <Link href="/" data-testid="link-home">Return to Base</Link>
        </Button>
      </div>
    </div>
  );
}
