import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import RegistrationPage from '@/pages/registration';
import DashboardPage from '@/pages/dashboard';
import SetupPage from '@/pages/setup';
import AdminPage from '@/pages/admin';
import ContentGeneratorPage from '@/pages/tools/content';
import BrandColorsPage from '@/pages/tools/colors';
import MenuBuilderPage from '@/pages/tools/menu';
import PopulateDirectoryPage from '@/pages/tools/populate';
import PageFromUrlPage from '@/pages/tools/page-from-url';
import ArticleWithImagesPage from '@/pages/tools/article';
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

function Router() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  
  return (
    <Switch>
      <Route path="/">
        {() => {
          const apiKey = getApiKey();
          if (apiKey) {
            return <DashboardPage />;
          }
          return <RegistrationPage />;
        }}
      </Route>
      
      <Route path="/dashboard">
        <AuthGuard>
          <DashboardPage />
        </AuthGuard>
      </Route>
      
      <Route path="/setup">
        <AuthGuard>
          <SetupPage />
        </AuthGuard>
      </Route>
      
      <Route path="/tools/content">
        <AuthGuard>
          <ContentGeneratorPage />
        </AuthGuard>
      </Route>
      
      <Route path="/tools/colors">
        <AuthGuard>
          <BrandColorsPage />
        </AuthGuard>
      </Route>
      
      <Route path="/tools/menu">
        <AuthGuard>
          <MenuBuilderPage />
        </AuthGuard>
      </Route>

      <Route path="/tools/populate">
        <AuthGuard>
          <PopulateDirectoryPage />
        </AuthGuard>
      </Route>

      <Route path="/tools/page-from-url">
        <AuthGuard>
          <PageFromUrlPage />
        </AuthGuard>
      </Route>

      <Route path="/tools/article">
        <AuthGuard>
          <ArticleWithImagesPage />
        </AuthGuard>
      </Route>

      {/* Admin panel — no AuthGuard, uses its own admin token */}
      <Route path="/admin">
        <AdminPage />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
