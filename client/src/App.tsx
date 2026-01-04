import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/contexts/DataContext";
import { Navigation } from "@/components/Navigation";
import Dashboard from "@/pages/Dashboard";
import InputFormPage from "@/pages/InputForm";
import History from "@/pages/History";
import Budget from "@/pages/Budget";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/input" component={InputFormPage} />
      <Route path="/history" component={History} />
      <Route path="/budget" component={Budget} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="pb-16 md:pb-0">
              <Router />
            </main>
          </div>
          <Toaster />
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
