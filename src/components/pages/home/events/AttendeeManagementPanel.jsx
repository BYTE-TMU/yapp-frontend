import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Search, Check, Clock, ListFilter, Camera, Users, UserCheck, UserX } from 'lucide-react';
import { API_BASE_URL } from '@/services/config';
import {
    showCheckInSuccess,
    showAlreadyCheckedIn,
    showCheckInError,
    showAttendeeApproved,
    showAttendeeWaitlisted,
    showNetworkError,
} from '@/utils/toastNotifications';
import {
    getProfilePictureUrl,
    getDefaultProfilePicture,
} from '@/utils/profileUtils';

const AttendeeManagementPanel = ({ isOpen, onClose, eventId, onSwitchToScanner }) => {
    const [attendees, setAttendees] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('approved');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState({});
    const [hasCamera, setHasCamera] = useState(false);

    // Detect if camera is available
    useEffect(() => {
        const checkCamera = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(d => d.kind === 'videoinput');
                setHasCamera(videoDevices.length > 0);
            } catch {
                setHasCamera(false);
            }
        };
        if (isOpen) checkCamera();
    }, [isOpen]);

    const fetchAttendees = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_BASE_URL}/events/${eventId}/attendees-by-status`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: 'include',
                }
            );

            if (response.ok) {
                const data = await response.json();
                setAttendees(data.attendees || []);
                setStats(data.stats || null);
            }
        } catch (error) {
            console.error('Error fetching attendees:', error);
            showNetworkError();
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        if (isOpen && eventId) {
            fetchAttendees();
        }
        return () => {
            setAttendees([]);
            setStats(null);
            setSearchTerm('');
            setActiveTab('approved');
        };
    }, [isOpen, eventId, fetchAttendees]);

    // Filter attendees by tab and search
    const filteredAttendees = useMemo(() => {
        let filtered = attendees;

        // Filter by tab status
        if (activeTab === 'approved') {
            // Include both explicitly "approved" and legacy records without status field
            filtered = filtered.filter(a => a.status === 'approved' || !a.status);
        } else {
            filtered = filtered.filter(a => a.status === activeTab);
        }

        // Filter by search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                a =>
                    a.username?.toLowerCase().includes(term) ||
                    a.full_name?.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [attendees, activeTab, searchTerm]);

    const handleCheckIn = async (userId, username) => {
        setActionLoading(prev => ({ ...prev, [userId]: 'checkin' }));
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/events/${eventId}/checkin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
                body: JSON.stringify({ user_id: userId }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.already_checked_in) {
                    showAlreadyCheckedIn(username);
                } else {
                    showCheckInSuccess(username);
                }
                // Update local state
                setAttendees(prev =>
                    prev.map(a =>
                        a._id === userId ? { ...a, checked_in: true, checked_in_at: new Date().toISOString() } : a
                    )
                );
                // Update stats
                if (stats && !data.already_checked_in) {
                    setStats(prev => ({ ...prev, checked_in: (prev?.checked_in || 0) + 1 }));
                }
            } else {
                showCheckInError(data.error);
            }
        } catch (error) {
            console.error('Check-in error:', error);
            showNetworkError();
        } finally {
            setActionLoading(prev => {
                const next = { ...prev };
                delete next[userId];
                return next;
            });
        }
    };

    const handleStatusChange = async (userId, username, newStatus) => {
        setActionLoading(prev => ({ ...prev, [userId]: newStatus }));
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_BASE_URL}/events/${eventId}/attendees/${userId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: 'include',
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                if (newStatus === 'approved') {
                    showAttendeeApproved(username);
                } else {
                    showAttendeeWaitlisted(username);
                }
                // Refresh the full list
                await fetchAttendees();
            } else {
                showCheckInError(data.error);
            }
        } catch (error) {
            console.error('Status change error:', error);
            showNetworkError();
        } finally {
            setActionLoading(prev => {
                const next = { ...prev };
                delete next[userId];
                return next;
            });
        }
    };

    const tabs = [
        { id: 'approved', label: 'Approved', icon: UserCheck, count: stats?.approved || 0 },
        { id: 'pending', label: 'Pending', icon: Clock, count: stats?.pending || 0 },
        { id: 'waitlisted', label: 'Waitlist', icon: UserX, count: stats?.waitlisted || 0 },
    ];

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)' }}
            onClick={onClose}
        >
            <div
                className="bg-card rounded-2xl w-full max-w-lg max-h-[85vh] shadow-2xl border border-border overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-border flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <ListFilter className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-bold text-foreground">Manage Attendees</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                            {hasCamera && onSwitchToScanner && (
                                <button
                                    onClick={() => {
                                        onClose();
                                        onSwitchToScanner();
                                    }}
                                    className="p-1.5 hover:bg-muted rounded-full transition-colors"
                                    title="Switch to scanner"
                                >
                                    <Camera className="w-5 h-5 text-muted-foreground" />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                    </div>

                    {/* Stats bar */}
                    {stats && (
                        <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-1 text-sm">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-foreground font-semibold">{stats.total_rsvp}</span>
                                <span className="text-muted-foreground">total</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-foreground font-semibold">{stats.checked_in}</span>
                                <span className="text-muted-foreground">checked in</span>
                            </div>
                        </div>
                    )}

                    {/* Search bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors text-sm"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex mt-3 space-x-1 bg-muted rounded-lg p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted-foreground/10 text-muted-foreground'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Attendee List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredAttendees.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="w-10 h-10 text-muted-foreground/50 mb-2" />
                            <p className="text-muted-foreground text-sm">
                                {searchTerm
                                    ? 'No attendees match your search'
                                    : `No ${activeTab} attendees`}
                            </p>
                        </div>
                    ) : (
                        filteredAttendees.map((attendee) => (
                            <div
                                key={attendee._id}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${attendee.checked_in
                                        ? 'bg-green-500/5 border-green-500/20'
                                        : 'bg-card border-border hover:border-primary/20'
                                    }`}
                            >
                                {/* Attendee Info */}
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={getProfilePictureUrl(attendee.profile_picture)}
                                            onError={(e) => { e.target.src = getDefaultProfilePicture(); }}
                                            alt={attendee.username}
                                            className="w-10 h-10 rounded-full object-cover border border-border"
                                        />
                                        {attendee.checked_in && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-card">
                                                <Check className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">
                                            {attendee.full_name || attendee.username}
                                        </p>
                                        {attendee.checked_in && attendee.checked_in_at && (
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                Checked in {new Date(attendee.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        )}
                                        {!attendee.checked_in && attendee.full_name && (
                                            <p className="text-xs text-muted-foreground">@{attendee.username}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                                    {activeTab === 'approved' && !attendee.checked_in && (
                                        <button
                                            onClick={() => handleCheckIn(attendee._id, attendee.username)}
                                            disabled={!!actionLoading[attendee._id]}
                                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading[attendee._id] === 'checkin' ? (
                                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Check className="w-3.5 h-3.5" />
                                            )}
                                            <span>Check In</span>
                                        </button>
                                    )}

                                    {activeTab === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(attendee._id, attendee.username, 'approved')}
                                                disabled={!!actionLoading[attendee._id]}
                                                className="flex items-center space-x-1 px-2.5 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading[attendee._id] === 'approved' ? (
                                                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Check className="w-3.5 h-3.5" />
                                                )}
                                                <span>Approve</span>
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(attendee._id, attendee.username, 'waitlisted')}
                                                disabled={!!actionLoading[attendee._id]}
                                                className="flex items-center space-x-1 px-2.5 py-1.5 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading[attendee._id] === 'waitlisted' ? (
                                                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Clock className="w-3.5 h-3.5" />
                                                )}
                                                <span>Waitlist</span>
                                            </button>
                                        </>
                                    )}

                                    {activeTab === 'waitlisted' && (
                                        <button
                                            onClick={() => handleStatusChange(attendee._id, attendee.username, 'approved')}
                                            disabled={!!actionLoading[attendee._id]}
                                            className="flex items-center space-x-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading[attendee._id] === 'approved' ? (
                                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <UserCheck className="w-3.5 h-3.5" />
                                            )}
                                            <span>Approve</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendeeManagementPanel;
