import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import NewHomePage from "@/pages/NewHomePage";
import AboutPage from "@/pages/AboutPage";
import ResumePage from "@/pages/ResumePage";
import PortfolioPage from "@/pages/PortfolioPage";
import BlogPage from "@/pages/BlogPage";
import TopFiveListsPage from "@/pages/TopFiveListsPage";
import ContactPage from "@/pages/ContactPage";
import Layout from "./components/Layout";
import { BlogDetail } from "./sections/BlogDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={NewHomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/resume" component={ResumePage} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:id" component={BlogDetail} />
      <Route path="/top5" component={TopFiveListsPage} />
      <Route path="/contact" component={ContactPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout>
          <Toaster />
          <Router />
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
