import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import NewHomePage from "@/pages/NewHomePage";
import AboutPage from "@/pages/AboutPage";

import PortfolioPage from "@/pages/PortfolioPage";
import BlogPage from "@/pages/BlogPage";
import TopFiveListsPage from "@/pages/TopFiveListsPage";
import ContactPage from "@/pages/ContactPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminProjectsPage from "@/pages/AdminProjectsPage";
import AdminNewProjectPage from "@/pages/AdminNewProjectPage";
import AdminBlogPage from "@/pages/AdminBlogPage";
import AdminNewBlogPage from "@/pages/AdminNewBlogPage";
import AdminResumePage from "@/pages/AdminResumePage";
import AdminResumeUploadPage from "@/pages/AdminResumeUploadPage";
import Layout from "./components/Layout";
import { BlogDetail } from "./sections/BlogDetail";
import { ProjectDetail } from "./sections/ProjectDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AboutPage} />

      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/portfolio/:slug" component={ProjectDetail} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogDetail} />
      <Route path="/blog/category/:category" component={BlogPage} />
      <Route path="/top5" component={TopFiveListsPage} />
      <Route path="/contact" component={ContactPage} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/admin/projects" component={AdminProjectsPage} />
      <Route path="/admin/projects/new" component={AdminNewProjectPage} />
      <Route path="/admin/blog" component={AdminBlogPage} />
      <Route path="/admin/blog/new" component={AdminNewBlogPage} />
      <Route path="/admin/blog/edit/:id" component={AdminNewBlogPage} />
      <Route path="/admin/resume" component={AdminResumePage} />
      <Route path="/admin/resume/upload" component={AdminResumeUploadPage} />
      
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
