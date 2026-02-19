import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../header/Header';
import Sidebar from '../sidebar/Sidebar';
import MessagesList from '../messages/MessagesList';
import MessageChat from '../messages/MessageChat';
import EventsList from '../messages/EventsList';
import { messageService } from '../../services/messageService';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE_URL } from '../../services/config';

function Messages() {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'events'
    const [searchParams] = useSearchParams();
    const { isDarkMode } = useTheme();

    // Get current user identifier (same logic as in your components)
    const getCurrentUserIdentifier = () => {
        try {
            const userString = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (userString) {
                const user = JSON.parse(userString);
                const userId = user._id || user.id || user.userId || user.user_id || user.username;
                if (userId) return String(userId);
            }

            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const tokenIdentifier = payload.userId || payload.id || payload._id || payload.user_id || payload.sub || payload.username;
                    if (tokenIdentifier) return String(tokenIdentifier);
                } catch (e) {}
            }

            const altKeys = ['userId', 'user_id', 'currentUserId', 'authUserId', 'username'];
            for (const key of altKeys) {
                const altId = localStorage.getItem(key);
                if (altId) return String(altId);
            }

            return null;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    // Handle URL parameter for direct conversation access
    useEffect(() => {
        const conversationId = searchParams.get('conversation');
        console.log('Conversation ID from URL:', conversationId);
        
        if (conversationId && conversations.length > 0) {
            // Find the conversation in the current list
            const conversation = conversations.find(conv => conv._id === conversationId);
            if (conversation) {
                setSelectedConversation(conversation);
            } else {
                // If not found, try to fetch it specifically
                fetchSpecificConversation(conversationId);
            }
        }
    }, [searchParams, conversations]);

    const fetchConversations = async () => {
        try {
            console.log('Fetching conversations from MongoDB...');
            const token = localStorage.getItem('token');
            const currentUserId = getCurrentUserIdentifier();
            
            // Fetch from MongoDB like before
            const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Conversations response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('MongoDB conversations data:', data);
                const mongoConversations = data.conversations || [];
                
                // Sync each conversation to Supabase in the background
                if (currentUserId && mongoConversations.length > 0) {
                    console.log('Syncing conversations to Supabase...');
                    for (const conversation of mongoConversations) {
                        try {
                            await messageService.ensureConversationExists(conversation._id, currentUserId);
                        } catch (syncError) {
                            console.warn('Failed to sync conversation to Supabase:', conversation._id, syncError);
                        }
                    }
                }
                
                setConversations(mongoConversations);
            } else {
                console.error('Failed to fetch conversations:', response.status);
                const errorData = await response.json();
                console.error('Error data:', errorData);
                setConversations([]);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSpecificConversation = async (conversationId) => {
        try {
            console.log('Fetching specific conversation:', conversationId);
            const token = localStorage.getItem('token');
            const currentUserId = getCurrentUserIdentifier();
            
            const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Specific conversation response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Specific conversation data:', data);
                
                if (data.success && data.conversation) {
                    // Sync to Supabase
                    if (currentUserId) {
                        try {
                            await messageService.ensureConversationExists(conversationId, currentUserId);
                        } catch (syncError) {
                            console.warn('Failed to sync specific conversation to Supabase:', syncError);
                        }
                    }
                    
                    setSelectedConversation(data.conversation);
                    
                    // Also refresh conversations list to include this one if it's not there
                    fetchConversations();
                } else {
                    console.error('No conversation in response:', data);
                }
            } else {
                console.error('Failed to fetch specific conversation:', response.status);
                const errorData = await response.json();
                console.error('Error data:', errorData);
                
                // If specific conversation fails, still try to fetch all conversations
                fetchConversations();
            }
        } catch (error) {
            console.error('Error fetching specific conversation:', error);
            // Fallback to fetching all conversations
            fetchConversations();
        }
    };

    const handleConversationSelect = (conversation) => {
        console.log('🎯 handleConversationSelect called');
        console.log('Selecting conversation:', conversation);
        console.log('Setting selectedConversation to:', conversation._id);
        setSelectedConversation(conversation);
        // Update URL without causing a page reload
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('conversation', conversation._id);
        window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams}`);
        console.log('✅ Conversation selected, URL updated');
    };

    const handleNewMessage = (conversationId, message) => {
        console.log('New message received:', message);
        // Update conversations list with new message
        setConversations(prev => 
            prev.map(conv => 
                conv._id === conversationId 
                ? { ...conv, last_message: message, last_message_at: message.created_at }
                : conv
            )
        );
    };

    // Set up real-time subscription for new messages across all conversations
    useEffect(() => {
        const currentUserId = getCurrentUserIdentifier();
        if (!currentUserId || conversations.length === 0) return;

        console.log('Setting up real-time subscriptions for all conversations...');
        const subscriptions = [];

        // Subscribe to each conversation for real-time updates
        conversations.forEach(conversation => {
            try {
                const subscription = messageService.subscribeToMessages(
                    conversation._id,
                    (newMessage) => {
                        console.log('Real-time message received:', newMessage);
                        handleNewMessage(conversation._id, newMessage);
                    }
                );
                subscriptions.push(subscription);
            } catch (error) {
                console.warn('Failed to subscribe to conversation:', conversation._id, error);
            }
        });

        return () => {
            console.log('Cleaning up message subscriptions');
            subscriptions.forEach(subscription => {
                try {
                    subscription.unsubscribe();
                } catch (error) {
                    console.warn('Error unsubscribing:', error);
                }
            });
        };
    }, [conversations]);

    // Debug logging
    useEffect(() => {
        console.log('Current state:');
        console.log('- Loading:', loading);
        console.log('- Conversations count:', conversations.length);
        console.log('- Selected conversation:', selectedConversation ? selectedConversation._id : 'none');
        console.log('- URL conversation param:', searchParams.get('conversation'));
    }, [loading, conversations, selectedConversation, searchParams]);

    // On mobile, when a conversation is selected, show the chat; otherwise show the list
    const showMobileChat = selectedConversation !== null;
    
    useEffect(() => {
        console.log('📱 Mobile view state:', {
            selectedConversation: selectedConversation?._id || 'none',
            showMobileChat,
            isMobile: window.innerWidth < 768
        });
    }, [selectedConversation, showMobileChat]);

    return (
        <div className="font-bold" style={{
            backgroundColor: isDarkMode ? '#121212' : '#ffffff', 
            fontFamily: 'Albert Sans',
            height: '100dvh',
            minHeight: '-webkit-fill-available',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Header />
            <div className="flex flex-1" style={{ overflow: 'hidden' }}>
                <Sidebar />
                <div className="flex flex-1 md:ml-64" style={{ overflow: 'hidden' }}>
                    {/* Left side - Conversations/Events list */}
                    <div className={`${
                        showMobileChat ? 'hidden md:flex' : 'flex'
                    } w-full md:w-80 border-r flex-col ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`} style={{
                        backgroundColor: isDarkMode ? '#121212' : '#ffffff',
                        height: '100%',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {/* Tab Navigation */}
                        <div className={`flex items-center justify-center gap-4 p-4 border-b ${
                            isDarkMode ? 'border-gray-600' : 'border-gray-300'
                        }`} style={{
                            position: 'relative',
                            zIndex: 2
                        }}>
                            <button
                                onClick={() => setActiveTab('messages')}
                                className={`transition-colors font-semibold touch-manipulation ${
                                    activeTab === 'messages'
                                        ? 'text-orange-500'
                                        : isDarkMode
                                            ? 'text-gray-400 hover:text-gray-200'
                                            : 'text-gray-500 hover:text-gray-700'
                                }`}
                                style={{
                                    WebkitTapHighlightColor: 'transparent',
                                    touchAction: 'manipulation'
                                }}
                            >
                                Messages
                            </button>
                            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>|</span>
                            <button
                                onClick={() => setActiveTab('events')}
                                className={`transition-colors font-semibold touch-manipulation ${
                                    activeTab === 'events'
                                        ? 'text-orange-500'
                                        : isDarkMode
                                            ? 'text-gray-400 hover:text-gray-200'
                                            : 'text-gray-500 hover:text-gray-700'
                                }`}
                                style={{
                                    WebkitTapHighlightColor: 'transparent',
                                    touchAction: 'manipulation'
                                }}
                            >
                                Events
                            </button>
                        </div>

                        {/* Content based on active tab */}
                        {activeTab === 'messages' ? (
                            <MessagesList
                                conversations={conversations}
                                selectedConversation={selectedConversation}
                                onConversationSelect={handleConversationSelect}
                                loading={loading}
                            />
                        ) : (
                            <EventsList loading={false} />
                        )}
                    </div>
                    
                    {/* Right side - Chat interface or Events placeholder */}
                    <div className={`${
                        showMobileChat ? 'flex' : 'hidden md:flex'
                    } flex-1 flex-col`} style={{
                        backgroundColor: isDarkMode ? '#121212' : '#ffffff',
                        height: '100%',
                        overflow: 'hidden'
                    }}>
                        {activeTab === 'messages' ? (
                            selectedConversation ? (
                                <div className="flex flex-col h-full">
                                    {/* Mobile back button */}
                                    <div className="md:hidden flex items-center px-3 py-2 border-b"
                                        style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}
                                    >
                                        <button
                                            onClick={() => setSelectedConversation(null)}
                                            className={`flex items-center gap-2 text-sm font-semibold ${
                                                isDarkMode ? 'text-orange-400' : 'text-orange-500'
                                            }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M15 18l-6-6 6-6" />
                                            </svg>
                                            Back
                                        </button>
                                    </div>
                                    <MessageChat
                                        conversation={selectedConversation}
                                        onNewMessage={handleNewMessage}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <div className="rounded-lg p-8 mb-6" style={{
                                        backgroundColor: isDarkMode ? '#171717' : '#f8f9fa',
                                        border: isDarkMode ? 'none' : '1px solid #e5e7eb'
                                    }}>
                                        <div className="mb-6">
                                            <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500 mx-auto">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                <path d="M9 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                <path d="M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                        </div>
                                        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your messages</h2>
                                        <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Send a message to a user to start a chat.</p>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <div className="rounded-lg p-8 mb-6" style={{
                                    backgroundColor: isDarkMode ? '#171717' : '#f8f9fa',
                                    border: isDarkMode ? 'none' : '1px solid #e5e7eb'
                                }}>
                                    <div className="mb-6">
                                        <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500 mx-auto">
                                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                                            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                                            <rect x="7" y="14" width="4" height="4" rx="1" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Event Discussions</h2>
                                    <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select an event to view its discussion thread.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Messages;