import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import ContentHub from "@/pages/ContentHub";
import ContentStrategyPlanner from "@/pages/ContentStrategyPlanner";
import Integrations from "@/pages/Integrations";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/content-hub" component={ContentHub} />
        <Route path="/content-strategy-planner" component={ContentStrategyPlanner} />
        <Route path="/integrations" component={Integrations} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
