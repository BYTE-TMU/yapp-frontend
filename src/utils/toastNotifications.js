import { toast } from 'sonner';

/**
 * Centralized toast notification utilities
 * All toast messages in the application are defined here for easy management
 * Each toast has its own named function for consistency and editability
 */

// ===== SUCCESS TOASTS =====
export const showPostDeletedSuccess = () => {
    toast.success('Post deleted successfully');
};

export const showEventDeletedSuccess = () => {
    toast.success('Event cancelled successfully');
};

export const showPasswordChangedSuccess = () => {
    toast.success('Password changed successfully');
};

export const showEventJoinedSuccess = () => {
    toast.success('Successfully joined the event! 🎉', {
        description: 'You can now see the "✅ Joined" status on the waypoint.'
    });
};

export const showEventLeftSuccess = () => {
    toast.success('You have left the event', {
        description: 'The waypoint will now show "🎫 Join Event" again.'
    });
};

export const showWaypointDeletedSuccess = () => {
    toast.success('Waypoint deleted successfully');
};

// ===== ERROR TOASTS =====

// Authentication & Login
export const showLoginRequired = (action = 'perform this action') => {
    toast.error('Login Required', {
        description: `Please log in to ${action}`
    });
};

// Posts
export const showPostDeleteError = (errorMessage) => {
    toast.error('Failed to delete post', {
        description: errorMessage || 'An error occurred while deleting the post'
    });
};

export const showPostLikeError = () => {
    toast.error('Failed to like post', {
        description: 'Please try again'
    });
};

// Events
export const showEventDeleteError = (errorMessage) => {
    toast.error('Failed to cancel event', {
        description: errorMessage || 'An error occurred while cancelling the event'
    });
};

export const showAttendanceUpdateError = () => {
    toast.error('Failed to update attendance', {
        description: 'Please try again'
    });
};

export const showEventLikeError = () => {
    toast.error('Failed to update like', {
        description: 'Please try again'
    });
};

export const showLocationNotAvailableError = () => {
    toast.error('Location not available', {
        description: 'Location coordinates not available for this event'
    });
};

export const showLeaveEventError = () => {
    toast.error('Failed to leave event', {
        description: 'Error leaving event. Please try again.'
    });
};

export const showPostMessageError = () => {
    toast.error('Failed to post message', {
        description: 'Please try again'
    });
};

// Waypoints
export const showEventNotFoundError = () => {
    toast.error('Event not found', {
        description: 'Could not find the corresponding event. It may have been cancelled or expired.'
    });
};

export const showWaypointError = (message) => {
    toast.error('Waypoint Error', {
        description: message
    });
};

export const showCancelEventPermissionError = () => {
    toast.error('Permission denied', {
        description: 'You can only cancel your own events'
    });
};

export const showJoinEventError = () => {
    toast.error('Failed to join event', {
        description: 'Please try again'
    });
};

export const showCancelEventError = () => {
    toast.error('Failed to cancel event', {
        description: 'Please try again'
    });
};

// File Upload
export const showMaxImagesError = () => {
    toast.error('Too many images', {
        description: 'You can only upload up to 4 images per post.'
    });
};

export const showInvalidFileTypeError = (filename) => {
    toast.error('Invalid file type', {
        description: `${filename} is not a valid image file. Only PNG, JPG, JPEG, GIF, and WEBP are allowed.`
    });
};

export const showFileSizeError = (filename, maxSize = '10MB') => {
    toast.error('File too large', {
        description: `${filename} is too large. Maximum size is ${maxSize} per image.`
    });
};

export const showImageUploadError = () => {
    toast.error('Failed to upload image', {
        description: 'Please try again'
    });
};

// Messages
export const showOfflineError = () => {
    toast.error('You are offline', {
        description: 'Please check your connection and try again.'
    });
};

export const showSendMessageError = () => {
    toast.error('Failed to send message', {
        description: 'Please try again.'
    });
};

export const showMessageImageFileTypeError = () => {
    toast.error('Invalid file type', {
        description: 'Please select a valid image file (PNG, JPG, JPEG, GIF, WEBP)'
    });
};

export const showMessageImageSizeError = () => {
    toast.error('File too large', {
        description: 'File size must be less than 5MB'
    });
};

// Network
export const showNetworkError = () => {
    toast.error('Network Error', {
        description: 'Please check your connection and try again'
    });
};

// ===== WARNING TOASTS =====
export const showNoSavedWaypoints = () => {
    toast.warning('No saved waypoints found');
};

export const showNotEventWaypoint = () => {
    toast.warning('This is not an event waypoint');
};

// ===== CONFIRMATION DIALOGS =====
/**
 * Show a confirmation dialog using toast
 * Returns a promise that resolves to true if confirmed, false if cancelled
 */
export const showDeleteConfirmation = (itemType = 'item') => {
    return new Promise((resolve) => {
        toast.warning(`Delete ${itemType}?`, {
            description: `Are you sure you want to delete this ${itemType}? This action cannot be undone.`,
            duration: Infinity,
            action: {
                label: 'Delete',
                onClick: () => resolve(true)
            },
            cancel: {
                label: 'Cancel',
                onClick: () => resolve(false)
            },
            onDismiss: () => resolve(false),
            onAutoClose: () => resolve(false)
        });
    });
};

export const showEventLeaveConfirmation = () => {
    return new Promise((resolve) => {
        toast.warning('Leave Event?', {
            description: 'Are you sure you want to leave this event?',
            duration: Infinity,
            action: {
                label: 'Leave',
                onClick: () => resolve(true)
            },
            cancel: {
                label: 'Cancel',
                onClick: () => resolve(false)
            },
            onDismiss: () => resolve(false),
            onAutoClose: () => resolve(false)
        });
    });
};

export const showEventMatchConfirmation = (eventTitle) => {
    return new Promise((resolve) => {
        toast.info('Event Match Found', {
            description: `Found a potential match: "${eventTitle}"\n\nIs this the event you want to join?`,
            duration: Infinity,
            action: {
                label: 'Yes',
                onClick: () => resolve(true)
            },
            cancel: {
                label: 'No',
                onClick: () => resolve(false)
            },
            onDismiss: () => resolve(false),
            onAutoClose: () => resolve(false)
        });
    });
};

// ===== CUSTOM TOASTS =====
export const showCustomToast = (type, message, options = {}) => {
    const toastTypes = {
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info,
        default: toast
    };

    const toastFunction = toastTypes[type] || toast;
    toastFunction(message, options);
};
