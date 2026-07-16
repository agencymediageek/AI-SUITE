import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { I18nProvider } from '@/lib/i18n';
import { ChatbotWidget } from '@/components/chatbot-widget';

import Landing from '@/pages/landing';
import Login from '@/pages/login';
import Register from '@/pages/register';
import Dashboard from '@/pages/dashboard';
import Tools from '@/pages/tools';
import ToolDetail from '@/pages/tool-detail';
import History from '@/pages/history';
import Pricing from '@/pages/pricing';
import Account from '@/pages/account';
import AdminPanel from '@/pages/admin';

// Feature / Tool landing pages
import AiInfluencer from '@/pages/features/ai-influencer';
import ViralReels from '@/pages/features/viral-reels';
import ThumbnailMaker from '@/pages/features/thumbnail-maker';
import MusicCreator from '@/pages/features/music-creator';
import WebsiteBuilder from '@/pages/features/website-builder';
import MangaStudio from '@/pages/features/manga-studio';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/tools" component={Tools} />
      <Route path="/tools/:toolId" component={ToolDetail} />
      <Route path="/history" component={History} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/account" component={Account} />
      <Route path="/admin" component={AdminPanel} />
      {/* Feature landing pages */}
      <Route path="/features/ai-influencer" component={AiInfluencer} />
      <Route path="/features/viral-reels" component={ViralReels} />
      <Route path="/features/thumbnail-maker" component={ThumbnailMaker} />
      <Route path="/features/music-creator" component={MusicCreator} />
      <Route path="/features/website-builder" component={WebsiteBuilder} />
      <Route path="/features/manga-studio" component={MangaStudio} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
            <ChatbotWidget />
          </WouterRouter>
          <Toaster theme="dark" position="top-right" />
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
