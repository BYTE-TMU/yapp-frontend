import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '@/services/config';
import { Button } from '@/components/ui/button';
import ByteAttribution from './ByteAttribution';
import ByteIcon from './ByteIcon';
import {
  REGISTRATION_URL,
  ORIGINAL_PRICE,
  DISCOUNT_PERCENT,
  DISCOUNTED_PRICE,
  isCyberSummitWindowOpen,
} from './constants';

function CyberSummitExclusive() {
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIsVerified(data.profile?.is_verified === true);
      } catch (err) {
        console.error('Failed to check TMU verification status:', err);
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) return null;

  const eligible = isVerified && isCyberSummitWindowOpen();
  if (!eligible) return <Navigate to="/" replace />;

  return (
    <div className="page-container flex justify-center">
      <div className="max-w-2xl w-full text-center py-16 px-4">
        <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
          <ByteIcon className="w-5 h-5" />
          Exclusive access ends Oct 1
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Cyber Summit — TMU Exclusive
        </h1>
        <p className="text-muted-foreground text-lg mb-2">
          As a verified TMU student, get{' '}
          <span className="font-semibold text-foreground">
            {DISCOUNT_PERCENT}% off
          </span>{' '}
          your ticket.
        </p>
        <p className="text-2xl font-bold mb-8">
          <span className="line-through text-muted-foreground mr-2">
            ${ORIGINAL_PRICE}
          </span>
          <span className="text-primary">${DISCOUNTED_PRICE}</span>
        </p>
        <Button asChild size="lg">
          <a href={REGISTRATION_URL} target="_blank" rel="noopener noreferrer">
            Register Now
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
        <ByteAttribution className="justify-center mt-6" />
      </div>
    </div>
  );
}

export default CyberSummitExclusive;
