import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Tarot from "@/pages/Tarot";
import FortuneBall from "@/pages/FortuneBall";
import Kundali from "@/pages/Kundali";
import Numerology from "@/pages/Numerology";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/tarot" component={Tarot} />
        <Route path="/fortune-ball" component={FortuneBall} />
        <Route path="/kundali" component={Kundali} />
        <Route path="/numerology" component={Numerology} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
    </QueryClientProvider>
  );
}

export default App;
