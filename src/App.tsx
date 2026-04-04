/**
 * App Root
 * 
 * Handles routing, auth state, and Vercel Analytics.
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
import Login from "./pages/Login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading, signIn, signOut } = useGoogleAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {!user ? (
            <Login onSignIn={signIn} loading={loading} />
          ) : (
            <Routes>
              <Route path="/" element={<Index user={user} onSignOut={signOut} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </BrowserRouter>
        {/* Vercel Web Analytics — collects anonymous page views, device info, country */}
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
