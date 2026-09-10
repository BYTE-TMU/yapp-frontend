import { ExternalLink } from 'lucide-react';
import ByteAttribution from './ByteAttribution';
import ByteIcon from './ByteIcon';
import { REGISTRATION_URL, DISCOUNT_PERCENT, DISCOUNTED_PRICE } from './constants';

function CyberSummitBanner({ eligible }) {
  if (!eligible) return null;

  return (
    <div className="mb-8 rounded-lg p-4 sm:p-5 bg-primary/10 border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <ByteIcon className="w-7 h-7 shrink-0 mt-0.5" />
        <div>
          <p className="text-foreground font-bold">
            Cyber Summit — TMU Exclusive
          </p>
          <p className="text-muted-foreground text-sm">
            Verified TMU students get {DISCOUNT_PERCENT}% off.  Exclusive access ends Oct 1.
          </p>
          <ByteAttribution className="mt-1.5" />
        </div>
      </div>
      <a
        href={REGISTRATION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold text-sm transition-colors"
      >
        Register Now
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

export default CyberSummitBanner;
