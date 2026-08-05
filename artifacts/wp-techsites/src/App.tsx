import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import RegistrationPage from '@/pages/registration';
import DashboardPage from '@/pages/dashboard';
import SetupPage from '@/pages/setup';
import AdminPage from '@/pages/admin';
// Existing tools
import ContentGeneratorPage from '@/pages/tools/content';
import BrandColorsPage from '@/pages/tools/colors';
import MenuBuilderPage from '@/pages/tools/menu';
import PopulateDirectoryPage from '@/pages/tools/populate';
import PageFromUrlPage from '@/pages/tools/page-from-url';
import ArticleWithImagesPage from '@/pages/tools/article';
// New tools
import ScrapingPage from '@/pages/tools/scraping';
import WysiwygPage from '@/pages/tools/wysiwyg';
import PageBuilderPage from '@/pages/tools/page-builder';
import SeoArticlesPage from '@/pages/tools/seo-articles';
import ChatbotPage from '@/pages/tools/chatbot';
import SeoAuditPage from '@/pages/tools/seo-audit';
import LogoAiPage from '@/pages/tools/logo-ai';
import SettingsPage from '@/pages/tools/settings';
import ApiKeysPage from '@/pages/api-keys';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { getApiKey } from '@/lib/api-headers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Redirects unauthenticated users to `/`. */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setLocation('/');
    }
    setIsChecking(false);
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** On root `/`: redirect to dashboard if already authenticated, else show registration. */
function RootRedirect() {
  const [, setLocation] = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const apiKey = getApiKey();
    if (apiKey) {
      setLocation('/dashboard');
    } else {
      setReady(true);
    }
  }, [setLocation]);

  if (!ready) return null;
  return <RegistrationPage />;
}

function AppRouter() {
  // When accessed via a custom domain (e.g. wp.techsites.ai), the pathname does NOT
  // include the Replit sub-path prefix (/wp-techsites). Wouter needs base='' in that case.
  const configuredBase = import.meta.env.BASE_URL.replace(/\/$/, ''); // e.g. "/wp-techsites"
  const base = window.location.pathname.startsWith(configuredBase) ? configuredBase : '';

  return (
    <WouterRouter base={base}>
      <Switch>
        <Route path="/" component={RootRedirect} />
        <Route path="/dashboard">
          <AuthGuard><DashboardPage /></AuthGuard>
        </Route>
        <Route path="/setup">
          <AuthGuard><SetupPage /></AuthGuard>
        </Route>
        <Route path="/admin" component={AdminPage} />
        {/* Existing tools */}
        <Route path="/tools/content">
          <AuthGuard><ContentGeneratorPage /></AuthGuard>
        </Route>
        <Route path="/tools/colors">
          <AuthGuard><BrandColorsPage /></AuthGuard>
        </Route>
        <Route path="/tools/menu">
          <AuthGuard><MenuBuilderPage /></AuthGuard>
        </Route>
        <Route path="/tools/populate">
          <AuthGuard><PopulateDirectoryPage /></AuthGuard>
        </Route>
        <Route path="/tools/page-from-url">
          <AuthGuard><PageFromUrlPage /></AuthGuard>
        </Route>
        <Route path="/tools/article">
          <AuthGuard><ArticleWithImagesPage /></AuthGuard>
        </Route>
        {/* New tools */}
        <Route path="/tools/scraping">
          <AuthGuard><ScrapingPage /></AuthGuard>
        </Route>
        <Route path="/tools/wysiwyg">
          <AuthGuard><WysiwygPage /></AuthGuard>
        </Route>
        <Route path="/tools/page-builder">
          <AuthGuard><PageBuilderPage /></AuthGuard>
        </Route>
        <Route path="/tools/seo-articles">
          <AuthGuard><SeoArticlesPage /></AuthGuard>
        </Route>
        <Route path="/tools/chatbot">
          <AuthGuard><ChatbotPage /></AuthGuard>
        </Route>
        <Route path="/tools/seo-audit">
          <AuthGuard><SeoAuditPage /></AuthGuard>
        </Route>
        <Route path="/tools/logo-ai">
          <AuthGuard><LogoAiPage /></AuthGuard>
        </Route>
        <Route path="/tools/settings">
          <AuthGuard><SettingsPage /></AuthGuard>
        </Route>
        <Route path="/api-keys">
          <ApiKeysPage />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppRouter />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
