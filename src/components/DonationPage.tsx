/**
 * Donation Page
 *
 * Links to the Throne wishlist page.
 * 
 * Customization:
 *  - Throne URL: change THRONE_URL below
 *  - Card background: change bg-card
 *  - Button color: uses primary token from design system
 */
import { Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const THRONE_URL = 'https://throne.com/silentslayer425';

export function DonationPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <Heart className="w-16 h-16 text-primary mb-6 opacity-80" />
      <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
        Support the Project
      </h2>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        If you enjoy using this app and want to help support its development,
        consider donating through my Throne wishlist. Every contribution helps
        keep this project alive and growing!
      </p>
      <Button
        asChild
        size="lg"
        className="rounded-xl px-8 gap-2 font-semibold"
      >
        <a href={THRONE_URL} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="w-4 h-4" />
          Donate on Throne
        </a>
      </Button>
      <p className="text-xs text-muted-foreground mt-6 opacity-60">
        Opens throne.com in a new tab
      </p>
    </div>
  );
}
