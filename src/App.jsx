import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Process from './pages/Process';
import Pricing from './pages/Pricing';
import WhyChooseUs from './pages/WhyChooseUs';
import Reviews from './pages/Reviews';
import Blog from './pages/Blog';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';

import AdminLogin from './pages/AdminLogin';
import QuotationLogin from './pages/QuotationLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProjects from './pages/admin/AdminProjects';
import AdminServices from './pages/admin/AdminServices';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminBlog from './pages/admin/AdminBlog';
import AdminPricing from './pages/admin/AdminPricing';
import AdminLeads from './pages/admin/AdminLeads';
import AdminAbout from './pages/admin/AdminAbout';
import AdminPageEditor from './pages/admin/AdminPageEditor';
import AdminClientProjects from './pages/admin/AdminClientProjects';
import AdminOffers from './pages/admin/AdminOffers';
import AdminQuotations from './pages/admin/AdminQuotations';
import AdminRateMaster from './pages/admin/AdminRateMaster';
import QuotationRoute from '@/components/QuotationRoute';
import QuotationLayout from '@/components/quotation/QuotationLayout';
import QuotationPasscodeSettings from './pages/quotation/QuotationPasscodeSettings';
import ProjectTrack from './pages/ProjectTrack';
import QuotationView from './pages/QuotationView';
import Offers from './pages/Offers';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/process" element={<Process />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/why-choose-us" element={<WhyChooseUs />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/offers" element={<Offers />} />
      <Route path="/project-track/:token" element={<ProjectTrack />} />
      <Route path="/quotation-view/:id" element={<QuotationView />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/quotation-login" element={<QuotationLogin />} />
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="pricing" element={<AdminPricing />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="page-editor" element={<AdminPageEditor />} />
          <Route path="clients" element={<AdminClientProjects />} />
          <Route path="offers" element={<AdminOffers />} />
        </Route>
      </Route>
      <Route element={<QuotationRoute />}>
        <Route path="/quotation-domain" element={<QuotationLayout />}>
          <Route index element={<AdminQuotations />} />
          <Route path="rate-master" element={<AdminRateMaster />} />
          <Route path="passcode-settings" element={<QuotationPasscodeSettings />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App