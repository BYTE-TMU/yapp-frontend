import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';
import ByteIcon from './ByteIcon';
import { REGISTRATION_URL, ORIGINAL_PRICE, DISCOUNT_PERCENT, DISCOUNTED_PRICE } from './constants';

function CyberSummitPromoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 backdrop-blur-sm transition-all duration-300"
      style={{
        backgroundColor: 'rgba(18, 18, 18, 0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl bg-card border border-border p-8 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
          <ByteIcon className="w-5 h-5" />
          Exclusive access ends Oct 1
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Cyber Summit — TMU Exclusive
        </h2>
        <p className="text-muted-foreground mb-2">
          As a verified TMU student, get{' '}
          <span className="font-semibold text-foreground">
            {DISCOUNT_PERCENT}% off
          </span>{' '}
          your ticket.
        </p>
        <p className="text-2xl font-bold mb-6">
          <span className="line-through text-muted-foreground mr-2">
            ${ORIGINAL_PRICE}
          </span>
          <span className="text-primary">${DISCOUNTED_PRICE}</span>
        </p>
        <a
          href={REGISTRATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold transition-colors"
        >
          Register Now
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>,
    document.body,
  );
}

export default CyberSummitPromoModal;
