/**
 * Privacy Policy Page
 * 
 * Accessible without authentication at /privacy
 */
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>

        <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we handle your information when you use our digital closet application (Outfit Closet).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We collect and process the following information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Google Account Information:</strong> Your name, email address, and profile picture from your Google account when you sign in</li>
              <li><strong>Clothing Data:</strong> Images and descriptions of clothing items you upload</li>
              <li><strong>Outfit Data:</strong> Saved outfits and combinations you create</li>
              <li><strong>Preferences:</strong> App settings like dark mode preference and weather location</li>
              <li><strong>Usage Analytics:</strong> Aggregated, non-identifiable usage analytics via Vercel Analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use your information solely to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Provide and maintain the Service</li>
              <li>Authenticate your account via Google</li>
              <li>Store your closet data in your personal Google Drive</li>
              <li>Sync your data across devices</li>
              <li>Remember your preferences (like dark mode)</li>
              <li>Improve the Service through anonymous analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">4. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your data only while your account is active or until you delete your data. You may remove your data at any time through the application or your Google Drive settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">5. Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              All your closet data (items, outfits, preferences) is stored exclusively in your personal Google Drive account. We do not store your closet data on our servers. Authentication tokens and temporary session data may be processed in memory to enable the Service. The Service only accesses files it creates in your Google Drive and does not read or modify any other files. Your Google account credentials are never stored by us—authentication is handled entirely by Google.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">6. Data Sharing and Third Parties</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use trusted third-party service providers (“subprocessors”) to operate the Service:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Google OAuth and Google Drive API:</strong> Authentication and data storage in your personal Google Drive</li>
              <li><strong>Vercel Analytics:</strong> Aggregated, non-identifiable usage analytics</li>
              <li><strong>These providers may process limited data necessary for their functionality but do not receive access to your full closet data.</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">7. Data Sharing and Third Parties</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We do not sell, trade, or otherwise transfer your personal information to third parties. We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Google Drive API:</strong> To store and sync your closet data in your own Google Drive</li>
              <li><strong>Google OAuth:</strong> To authenticate your account securely. Our use of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.</li>
              <li><strong>Vercel Analytics:</strong> To collect anonymous usage statistics (no personal data)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">8. Your Data Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You have complete control over your data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li><strong>Access:</strong> All your data is accessible in your Google Drive</li>
              <li><strong>Delete:</strong> Use the "Delete All Data" option in the app, or delete the files from your Google Drive</li>
              <li><strong>Export:</strong> Download your data directly from your Google Drive</li>
              <li><strong>Revoke Access:</strong> You can revoke the app's access to your Google Drive at any time through your Google Account settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">9. Cookies and Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use browser local storage to temporarily cache your data for faster loading and to remember your preferences (like dark mode). This data stays on your device and is not transmitted to our servers. We do not use tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">11. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or how we handle your data, please contact us through the Support tab in the application.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            By using this Service, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
