/**
 * App Root
 * 
 * Handles routing and authentication state.
 * If user is not signed in → show Login page.
 * If signed in → show main app.
 * 
 * Customization:
 *  - To skip Google login during development, replace the auth check
 *    with a hardcoded user object (see comments below)
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
          {/* 
            Auth gate: shows Login when not signed in.
            To skip auth during development, comment out the !user check:
            {false ? ( ... Login ... ) : ( ... Routes ... )}
          */}
          {!user ? (
            <Login onSignIn={signIn} loading={loading} />
          ) : (
            <Routes>
              <Route path="/" element={<Index user={user} onSignOut={signOut} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
