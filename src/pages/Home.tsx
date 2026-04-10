/**
 * Landing Page / Home Page
 * 
 * Public-facing home page showcasing the app features
 * Includes dark mode, sign in, and links to all pages
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shirt, 
  Palette, 
  Cloud, 
  Sparkles, 
  Heart,
  Sun,
  Moon,
  Gift,
  LogIn,
  ArrowRight,
  Trash2,
  CheckCircle,
  RefreshCw,
  LogOut,
  FileText,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GoogleUser } from '@/hooks/useGoogleAuth';

interface HomeProps {
  user?: GoogleUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Home({ user, onSignIn, onSignOut, darkMode, toggleDarkMode }: HomeProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // If user is logged in and on home page, they might want to go to app
  // But we don't auto-redirect - let them explore the home page
  // Show "Open App" button instead of "Sign In"

  const features = [
    {
      icon: <Shirt className="w-8 h-8" />,
      title: "Digital Closet",
      description: "Upload and organize all your clothing items in one beautiful, searchable space. Never forget what you own again."
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Outfit Builder",
      description: "Mix and match items visually to create perfect outfits. Save your favorite combinations for quick access."
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "Cloud Sync",
      description: "Your closet syncs automatically to Google Drive. Access your wardrobe from any device, anywhere."
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Smart Organization",
      description: "Tag, categorize, and filter your items. Find exactly what you need in seconds."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Shirt className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-heading font-bold text-foreground">Outfit</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Link to="/terms">
              <Button variant="ghost" size="sm">Terms</Button>
            </Link>
            <Link to="/privacy">
              <Button variant="ghost" size="sm">Privacy</Button>
            </Link>
            <Link to="/donate">
              <Button variant="ghost" size="sm" className="gap-2">
                <Gift className="w-4 h-4" /> Support
              </Button>
            </Link>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )}
            </button>

            {/* User Profile or Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen((p) => !p)}
                  className="flex items-center gap-1 rounded-full p-1 transition-colors hover:bg-muted"
                  title="Account menu"
                >
                  <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-full" />
                </button>
                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl bg-card border border-border shadow-float overflow-hidden">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Link to="/app" onClick={() => setProfileMenuOpen(false)}>
                        <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                          <Shirt className="w-4 h-4" /> Open My Closet
                        </button>
                      </Link>
                      <Link to="/terms" onClick={() => setProfileMenuOpen(false)}>
                        <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                          <FileText className="w-4 h-4" /> Terms of Service
                        </button>
                      </Link>
                      <Link to="/privacy" onClick={() => setProfileMenuOpen(false)}>
                        <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                          <Shield className="w-4 h-4" /> Privacy Policy
                        </button>
                      </Link>
                      <button
                        onClick={() => { setProfileMenuOpen(false); onSignOut(); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors border-t border-border"
                      >
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button onClick={onSignIn} className="gap-2 rounded-xl">
                <LogIn className="w-4 h-4" /> Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Your personal closet, organized
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
              Never Wonder
              <br />
              <span className="text-primary">What to Wear</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
              Organize your wardrobe digitally, create outfits visually, and access your closet from anywhere. 
              All your clothes, perfectly organized, always with you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link to="/app" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="gap-2 rounded-xl px-8 py-6 text-base font-semibold w-full"
                  >
                    <Shirt className="w-5 h-5" /> Open My Closet
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={onSignIn}
                  size="lg"
                  className="gap-2 rounded-xl px-8 py-6 text-base font-semibold w-full sm:w-auto"
                >
                  Get Started<ArrowRight className="w-5 h-5" />
                </Button>
              )}
              <Link to="/donate" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 rounded-xl px-8 py-6 text-base font-semibold w-full"
                >
                  <Gift className="w-5 h-5" /> Support This Project
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete digital wardrobe system designed to make getting dressed effortless and fun.
            </p>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-8 hover:shadow-card transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Simple to Get Started
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three easy steps to your organized digital closet
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Sign In with Google",
                description: "Quick and secure authentication. Your data is stored in your own Google Drive."
              },
              {
                step: "2",
                title: "Upload Your Clothes",
                description: "Take photos of your wardrobe items and organize them with tags and categories."
              },
              {
                step: "3",
                title: "Create Outfits",
                description: "Mix and match your clothes visually. Save favorite combinations for later."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-heading font-bold mb-5 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Data Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-2xl p-8 md:p-12"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold text-foreground mb-3">
                  Your Data, Your Control
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  We take privacy seriously. Your closet data is stored exclusively in your personal Google Drive. 
                  We never share your information with third parties. You can delete all your data at any time.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/privacy">
                    <Button variant="outline" className="gap-2 rounded-xl w-full sm:w-auto">
                      Read Privacy Policy
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                    className="gap-2 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                  >
                    <Trash2 className="w-4 h-4" /> Delete My Data
                  </Button>
                </div>
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
                  >
                    {user ? (
                      <p className="text-sm text-foreground">
                        To delete your data, go to your closet app and use the "Delete All Data" option in your account menu.
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-foreground mb-3">
                          To delete your data, please sign in first. You'll find the "Delete All Data" option in your account menu.
                        </p>
                        <Button onClick={onSignIn} size="sm" className="gap-2 rounded-lg">
                          <LogIn className="w-4 h-4" /> Sign In to Delete Data
                        </Button>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-12 md:p-16 border border-primary/20"
          >
            <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {user ? "Welcome Back!" : "Ready to Organize Your Closet?"}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {user 
                ? "Your digital closet is ready. Access all your clothes and outfits anytime, anywhere."
                : "Join us and experience a smarter way to manage your wardrobe. It's free, secure, and syncs across all your devices."
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link to="/app">
                  <Button
                    size="lg"
                    className="gap-2 rounded-xl px-8 py-6 text-base font-semibold"
                  >
                    <Shirt className="w-5 h-5" /> Open My Closet
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={onSignIn}
                  size="lg"
                  className="gap-2 rounded-xl px-8 py-6 text-base font-semibold w-full sm:w-auto"
                >
                  <LogIn className="w-5 h-5" /> Sign In with Google
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shirt className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xl font-heading font-bold text-foreground">Outfit</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your personal closet, organized and accessible from anywhere.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Legal</h4>
              <div className="flex flex-col gap-2">
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Support</h4>
              <div className="flex flex-col gap-3">
                <Link to="/donate">
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl w-full justify-start">
                    <Gift className="w-4 h-4" /> Support This Project
                  </Button>
                </Link>
                {user ? (
                  <Link to="/app">
                    <Button variant="ghost" size="sm" className="gap-2 rounded-xl w-full justify-start">
                      <Shirt className="w-4 h-4" /> Open App
                    </Button>
                  </Link>
                ) : (
                  <Button onClick={onSignIn} variant="ghost" size="sm" className="gap-2 rounded-xl w-full justify-start">
                    <LogIn className="w-4 h-4" /> Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Outfit. Your data is stored in your Google Drive.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
