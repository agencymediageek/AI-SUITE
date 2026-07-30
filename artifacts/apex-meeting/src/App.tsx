import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { I18nProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';

// Pages
import Landing from '@/pages/landing';
import Login from '@/pages/login';
import Register from '@/pages/register';
import Dashboard from '@/pages/dashboard';
import NewMeeting from '@/pages/meetings/new';
import MeetingDetail from '@/pages/meetings/[id]';
import LiveMeeting from '@/pages/meetings/live';
import Settings from '@/pages/settings';
import Pricing from '@/pages/pricing';
import Admin from '@/pages/admin';
import NotFound from '@/pages/not-found';
import Sobre from '@/pages/sobre';
import Contato from '@/pages/contato';
import Faq from '@/pages/faq';

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
      <Route path="/meetings/new" component={NewMeeting} />
      <Route path="/meetings/:id/live" component={LiveMeeting} />
      <Route path="/meetings/:id" component={MeetingDetail} />
      <Route path="/settings" component={Settings} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/admin" component={Admin} />
      <Route path="/sobre" component={Sobre} />
      <Route path="/contato" component={Contato} />
      <Route path="/faq" component={Faq} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
