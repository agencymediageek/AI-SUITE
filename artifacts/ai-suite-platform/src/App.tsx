import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster theme="dark" position="top-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
