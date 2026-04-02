/**
 * Google Authentication Hook
 * 
 * Uses Google Identity Services (GIS) for client-side OAuth.
 * No backend needed — tokens are managed in the browser.
 * 
 * Setup: Set your Client ID in src/config.ts → GOOGLE_CLIENT_ID
 */
import { useState, useEffect, useCallback } from 'react';
import { GOOGLE_CLIENT_ID } from '@/config';

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  accessToken: string;
}

const AUTH_KEY = 'google-user';

// Load Google Identity Services script
function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('gsi-script')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google auth'));
    document.head.appendChild(script);
  });
}

export function useGoogleAuth() {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadGsiScript().then(() => setReady(true)).catch(console.error);
  }, []);

  const signIn = useCallback(() => {
    if (!ready || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      alert('Please set your Google Client ID in src/config.ts');
      return;
    }

    setLoading(true);

    // Use the token client for Drive API access
    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      // Scopes: profile info + full Drive file access
      // Change scope to 'drive.file' to only access files created by this app
      scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
      callback: async (response: any) => {
        if (response.error) {
          setLoading(false);
          return;
        }

        // Fetch user profile info
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` },
          });
          const profile = await res.json();
          const googleUser: GoogleUser = {
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
            accessToken: response.access_token,
          };
          setUser(googleUser);
          localStorage.setItem(AUTH_KEY, JSON.stringify(googleUser));
        } catch (err) {
          console.error('Failed to get profile:', err);
        }
        setLoading(false);
      },
    });

    client.requestAccessToken();
  }, [ready]);

  const signOut = useCallback(() => {
    if (user?.accessToken) {
      (window as any).google?.accounts?.oauth2?.revoke?.(user.accessToken);
    }
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }, [user]);

  return { user, loading, ready, signIn, signOut };
}
