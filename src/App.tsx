/**
 * App Root
 * 
 * Handles routing, auth state, dark mode, and Vercel Analytics.
 *
 * Customization:
 *  - To skip Google login during dev, hardcode a user object
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useDarkMode } from '@/hooks/useDarkMode';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { DonationPage } from "@/components/DonationPage";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading, signIn, signOut } = useGoogleAuth();
  const { darkMode, setDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes - accessible without authentication */}
            <Route path="/" element={<Home user={user} onSignIn={signIn} onSignOut={signOut} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/donate" element={<DonationPage />} />
            
            {/* Auth routes */}
            <Route path="/login" element={
              !user ? (
                <Login onSignIn={signIn} loading={loading} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              ) : (
                <Navigate to="/app" replace />
              )
            } />
            
            {/* Protected app route */}
            <Route path="/app" element={
              user ? (
                <Index user={user} onSignOut={signOut} darkMode={darkMode} setDarkMode={setDarkMode} toggleDarkMode={toggleDarkMode} />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        {/* Vercel Web Analytics — collects anonymous page views, device info, country */}
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
