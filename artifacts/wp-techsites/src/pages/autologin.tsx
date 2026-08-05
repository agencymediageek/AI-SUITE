import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { saveApiKey } from '@/lib/api-headers';

/**
 * /autologin?key=<api_key>
 *
 * Called from the WordPress plugin sidebar button.
 * Saves the API key to localStorage and redirects to the dashboard.
 * If no key is provided, redirects to registration.
 */
export default function AutoLoginPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('key');

    if (key && key.length > 8) {
      saveApiKey(key);
      setLocation('/dashboard');
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Entrando no dashboard…</p>
      </div>
    </div>
  );
}
