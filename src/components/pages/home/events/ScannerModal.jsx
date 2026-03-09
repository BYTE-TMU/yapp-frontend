import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Camera, List, RefreshCw, Maximize2, Square } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { API_BASE_URL } from '@/services/config';
import {
    showCheckInSuccess,
    showAlreadyCheckedIn,
    showCheckInError,
    showCameraDenied,
} from '@/utils/toastNotifications';
import {
    getProfilePictureUrl,
    getDefaultProfilePicture,
} from '@/utils/profileUtils';

const ScannerModal = ({ isOpen, onClose, eventId, onSwitchToList }) => {
    const [scanning, setScanning] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const [resultFading, setResultFading] = useState(false);
    const [freeScanMode, setFreeScanMode] = useState(false);
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);
    const processingRef = useRef(false);
    const startingRef = useRef(false);
    const freeScanModeRef = useRef(false);

    // Keep ref in sync so startScanner always reads the latest value without
    // needing freeScanMode in its dependency array.
    useEffect(() => {
        freeScanModeRef.current = freeScanMode;
    }, [freeScanMode]);

    const stopScanner = useCallback(async () => {
        if (html5QrCodeRef.current) {
            try {
                const state = html5QrCodeRef.current.getState();
                if (state === 2) {
                    await html5QrCodeRef.current.stop();
                }
                html5QrCodeRef.current.clear();
            } catch (err) {
                console.warn('Scanner stop warning:', err);
            }
            html5QrCodeRef.current = null;
        }

        // Belt-and-suspenders: explicitly stop every video track in the DOM.
        // This guarantees the camera indicator light goes off even on browsers
        // that don't fully release the stream when the library stops.
        try {
            document.querySelectorAll('video').forEach((video) => {
                if (video.srcObject) {
                    video.srcObject.getTracks().forEach((track) => track.stop());
                    video.srcObject = null;
                }
            });
        } catch (err) {
            console.warn('Track cleanup warning:', err);
        }

        setScanning(false);
        startingRef.current = false;
    }, []);

    const startScanner = useCallback(async () => {
        // Prevent concurrent starts
        if (startingRef.current || html5QrCodeRef.current) return;
        startingRef.current = true;
        setCameraError(null);

        // Responsive qrbox: fit the container width with padding, clamped 260–380 px.
        const containerWidth = scannerRef.current?.offsetWidth ?? 320;
        const boxSize = Math.min(Math.max(containerWidth - 60, 260), 380);
        const isFreeScan = freeScanModeRef.current;

        const scanConfig = {
            fps: 24,
            // Free-scan mode omits qrbox so the entire camera frame is decoded,
            // which is much more forgiving of angle, distance, and off-centre codes.
            ...(isFreeScan ? {} : { qrbox: { width: boxSize, height: boxSize } }),
            disableFlip: false,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true,
            },
        };

        // Use relaxed facingMode (not 'exact') so devices without a camera explicitly
        // labelled "environment" still work and gracefully fall back.
        const videoConstraints = {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
        };

        const onScanSuccess = async (decodedText) => {
            if (processingRef.current) return;
            processingRef.current = true;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/events/${eventId}/checkin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: 'include',
                    body: JSON.stringify({ token: decodedText }),
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.already_checked_in) {
                        showAlreadyCheckedIn(data.username);
                        setLastResult({ type: 'warning', username: data.username, profile_picture: data.profile_picture, message: 'Ticket already scanned' });
                    } else {
                        showCheckInSuccess(data.username);
                        setLastResult({ type: 'success', username: data.username, profile_picture: data.profile_picture, message: 'Checked in!' });
                    }
                } else {
                    showCheckInError(data.error);
                    setLastResult({ type: 'error', message: data.error || 'Check-in failed' });
                }

                setResultFading(false);
                setTimeout(() => setResultFading(true), 2500);
                setTimeout(() => { setLastResult(null); setResultFading(false); }, 3000);
            } catch (err) {
                console.error('Check-in error:', err);
                showCheckInError('Network error');
            } finally {
                setTimeout(() => { processingRef.current = false; }, 2000);
            }
        };

        try {
            const html5QrCode = new Html5Qrcode('qr-scanner-region');
            html5QrCodeRef.current = html5QrCode;

            // Try rear camera first (phones), fall back to front camera (laptops)
            try {
                await html5QrCode.start(
                    videoConstraints,
                    scanConfig,
                    onScanSuccess,
                    () => { }
                );
            } catch (envError) {
                console.warn('Rear camera unavailable, trying front camera:', envError);
                try { html5QrCode.clear(); } catch { }
                html5QrCodeRef.current = null;

                const html5QrCode2 = new Html5Qrcode('qr-scanner-region');
                html5QrCodeRef.current = html5QrCode2;

                await html5QrCode2.start(
                    { facingMode: 'user' },
                    scanConfig,
                    onScanSuccess,
                    () => { }
                );
            }

            setScanning(true);
        } catch (error) {
            console.error('Camera start error:', error);
            html5QrCodeRef.current = null;

            const isDenied =
                error.name === 'NotAllowedError' ||
                error.name === 'PermissionDeniedError' ||
                (typeof error === 'string' && error.toLowerCase().includes('permission'));

            if (isDenied) {
                showCameraDenied();
                onSwitchToList?.();
            } else {
                setCameraError(error?.message || 'Could not start camera');
            }
        } finally {
            startingRef.current = false;
        }
    }, [eventId, onSwitchToList]);

    const handleRetry = useCallback(async () => {
        await stopScanner();
        startScanner();
    }, [stopScanner, startScanner]);

    const handleToggleFreeScan = useCallback(async () => {
        const next = !freeScanModeRef.current;
        setFreeScanMode(next);
        freeScanModeRef.current = next;
        await stopScanner();
        setTimeout(() => startScanner(), 150);
    }, [stopScanner, startScanner]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(startScanner, 300);
            return () => clearTimeout(timer);
        } else {
            stopScanner();
            setLastResult(null);
            setCameraError(null);
        }
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        return () => { stopScanner(); };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(18, 18, 18, 0.95)' }}
            onClick={onClose}
        >
            <div
                className="bg-card rounded-2xl w-full max-w-md shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Camera className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground">Scan Check-In</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleToggleFreeScan}
                            className={`p-1.5 rounded-full transition-colors ${
                                freeScanMode
                                    ? 'bg-primary/20 text-primary'
                                    : 'hover:bg-muted text-muted-foreground'
                            }`}
                            title={freeScanMode ? 'Switch to guided scan' : 'Switch to full-frame scan'}
                        >
                            {freeScanMode
                                ? <Square className="w-5 h-5" />
                                : <Maximize2 className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => { stopScanner(); onSwitchToList?.(); }}
                            className="p-1.5 hover:bg-muted rounded-full transition-colors"
                            title="Switch to list view"
                        >
                            <List className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Scanner area */}
                <div className="relative bg-black" style={{ minHeight: '320px' }}>
                    {/* html5-qrcode mounts the <video> inside this div by ID */}
                    <div
                        id="qr-scanner-region"
                        ref={scannerRef}
                        className="w-full"
                        style={{ minHeight: '320px' }}
                    />

                    {/* Reticle overlay — changes based on scan mode */}
                    {scanning && !lastResult && (
                        freeScanMode ? (
                            // Full-frame dashed border for free-scan mode
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-4 border-2 border-dashed border-primary/60 rounded-lg" />
                                <span className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-primary/80 bg-black/50 px-2 py-0.5 rounded-full">
                                    Full Frame
                                </span>
                            </div>
                        ) : (
                            // Corner-bracket targeting reticle for guided mode
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="relative w-56 h-56">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/60 animate-bounce" style={{ animationDuration: '2s' }} />
                                </div>
                            </div>
                        )
                    )}

                    {/* Error state */}
                    {cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-black/80 p-6 text-center">
                            <Camera className="w-10 h-10 text-muted-foreground" />
                            <p className="text-white/70 text-sm">{cameraError}</p>
                        </div>
                    )}

                    {/* Scan result overlay */}
                    {lastResult && (
                        <div
                            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${resultFading ? 'opacity-0' : 'opacity-100'}`}
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.78)' }}
                        >
                            <div className="text-center space-y-3">
                                {lastResult.type === 'success' ? (
                                    <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                        <span className="text-3xl text-white font-bold">✓</span>
                                    </div>
                                ) : lastResult.type === 'warning' ? (
                                    <div className="w-16 h-16 mx-auto bg-amber-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                        <span className="text-2xl text-white">⚠</span>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 mx-auto bg-destructive rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                        <span className="text-3xl text-white font-bold">✕</span>
                                    </div>
                                )}
                                {lastResult.profile_picture && (
                                    <img
                                        src={getProfilePictureUrl(lastResult.profile_picture)}
                                        onError={(e) => { e.target.src = getDefaultProfilePicture(); }}
                                        alt=""
                                        className="w-12 h-12 rounded-full mx-auto border-2 border-white object-cover"
                                    />
                                )}
                                {lastResult.username && (
                                    <p className="text-white font-bold text-lg">{lastResult.username}</p>
                                )}
                                <p className="text-white/80 text-sm">{lastResult.message}</p>
                            </div>
                        </div>
                    )}

                    {/* Spinner while camera is starting */}
                    {!scanning && !cameraError && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {cameraError
                                ? 'Camera unavailable'
                                : scanning
                                    ? freeScanMode
                                        ? 'Full frame active — point at QR code anywhere in view'
                                        : 'Hold steady — adjust angle or distance if needed'
                                    : 'Starting camera…'}
                        </p>
                        {(cameraError || !scanning) && (
                            <button
                                onClick={handleRetry}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors hover:bg-primary/90"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Retry</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScannerModal;
