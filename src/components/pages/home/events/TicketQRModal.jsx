import { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, Ticket } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { API_BASE_URL } from '@/services/config';
import { showTicketError } from '@/utils/toastNotifications';

const TicketQRModal = ({ isOpen, onClose, eventId, eventTitle }) => {
    const [ticketToken, setTicketToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expiresAt, setExpiresAt] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    const fetchTicket = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/events/${eventId}/my-ticket`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setTicketToken(data.ticket_token);
                setExpiresAt(Date.now() + data.expires_in * 1000);
            } else {
                showTicketError();
            }
        } catch (error) {
            console.error('Error fetching ticket:', error);
            showTicketError();
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    // Fetch ticket when modal opens
    useEffect(() => {
        if (isOpen && eventId) {
            fetchTicket();
        }
        return () => {
            setTicketToken(null);
            setExpiresAt(null);
        };
    }, [isOpen, eventId, fetchTicket]);

    // Countdown timer
    useEffect(() => {
        if (!expiresAt) return;

        const interval = setInterval(() => {
            const remaining = Math.max(0, expiresAt - Date.now());
            setTimeLeft(Math.ceil(remaining / 1000));

            // Auto-refresh when 60 seconds left
            if (remaining <= 60000 && remaining > 59000) {
                fetchTicket();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, fetchTicket]);

    const formatTimeLeft = (seconds) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)' }}
            onClick={onClose}
        >
            <div
                className="bg-card rounded-2xl w-full max-w-sm shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Ticket className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground">My Ticket</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* QR Code Display */}
                <div className="p-6 flex flex-col items-center space-y-4">
                    <p className="text-sm text-muted-foreground text-center font-medium">
                        {eventTitle}
                    </p>

                    {loading ? (
                        <div className="w-56 h-56 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : ticketToken ? (
                        <div className="bg-white p-4 rounded-xl shadow-inner">
                            <QRCodeSVG
                                value={ticketToken}
                                size={240}
                                level="H"
                                includeMargin={true}
                                bgColor="#ffffff"
                                fgColor="#000000"
                            />
                        </div>
                    ) : (
                        <div className="w-56 h-56 flex items-center justify-center bg-muted rounded-xl">
                            <p className="text-muted-foreground text-sm">
                                Failed to generate QR
                            </p>
                        </div>
                    )}

                    {/* Timer & Refresh */}
                    <div className="flex items-center space-x-3">
                        <div className={`text-sm font-mono ${timeLeft && timeLeft < 120 ? 'text-destructive' : 'text-muted-foreground'
                            }`}>
                            Expires in {formatTimeLeft(timeLeft)}
                        </div>
                        <button
                            onClick={fetchTicket}
                            disabled={loading}
                            className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                            title="Refresh ticket"
                        >
                            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                        Show this QR code to the event host for check-in
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TicketQRModal;
