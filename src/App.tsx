/**
 * App Root
 * 
 * Handles routing, auth state, dark mode, and Vercel Analytics.
 *
 * Customization:
 *  - To skip Google login during dev, hardcode a user object
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useDarkMode } from '@/hooks/useDarkMode';
import Login from "./pages/Login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

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
            {/* Public routes */}
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            {/* Protected routes */}
            {!user ? (
              <Route path="*" element={<Login onSignIn={signIn} loading={loading} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            ) : (
              <>
                <Route path="/" element={<Index user={user} onSignOut={signOut} darkMode={darkMode} setDarkMode={setDarkMode} toggleDarkMode={toggleDarkMode} />} />
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
        {/* Vercel Web Analytics — collects anonymous page views, device info, country */}
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
