import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '../../services/config';
import Program from '../pages/profile/Program';
import {
  User,
  Camera,
  ArrowRight,
  ArrowLeft,
  Check,
  MessageCircle,
  Calendar,
  MapPin,
  Users,
  Heart,
  Sparkles,
} from 'lucide-react';

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'profile', title: 'Profile' },
  { id: 'picture', title: 'Photo' },
  { id: 'features', title: 'Features' },
  { id: 'complete', title: 'Done' },
];

function Onboarding() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: '',
    program: '',
    location: '',
  });

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Get current user info from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser(payload);
      // Pre-fill username if available
      if (payload.username) {
        setProfileForm((prev) => ({
          ...prev,
          full_name: payload.full_name || '',
        }));
      }
    } catch (e) {
      console.error('Error decoding token:', e);
      navigate('/login');
    }
  }, [navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError('');
    setProfilePicture(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadProfilePicture = async () => {
    if (!profilePicture) return true; // Skip if no picture selected

    setUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('profile_picture', profilePicture);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/me/picture/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload picture');
      }

      return true;
    } catch (err) {
      console.error('Error uploading picture:', err);
      setError('Failed to upload profile picture');
      return false;
    } finally {
      setUploadingPicture(false);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return true;
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setError('');

    // Handle step-specific actions
    if (currentStep === 1) {
      // Profile step - save profile data
      const saved = await saveProfile();
      if (!saved) return;
    } else if (currentStep === 2) {
      // Picture step - upload if selected
      const uploaded = await uploadProfilePicture();
      if (!uploaded) return;
    }

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    // Mark onboarding as complete
    localStorage.setItem('onboarding_complete', 'true');
    navigate('/home');
  };

  const handleSkip = () => {
    // Allow skipping but still mark as complete
    localStorage.setItem('onboarding_complete', 'true');
    navigate('/home');
  };

  const getDefaultAvatar = () => {
    return "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23374151'/%3E%3Ccircle cx='50' cy='35' r='18' fill='%236B7280'/%3E%3Cellipse cx='50' cy='85' rx='30' ry='25' fill='%236B7280'/%3E%3C/svg%3E";
  };

  // Render step content
  const renderStepContent = () => {
    switch (ONBOARDING_STEPS[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 mb-4">
              <Sparkles className="w-12 h-12 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome to Yapp!
            </h1>
            <p className="text-lg text-muted-foreground">
              {currentUser?.username ? `Hey @${currentUser.username}! ` : ''}
              Let's get your profile set up so you can connect with the TMU
              community.
            </p>
            <p className="text-sm text-muted-foreground text-opacity-80">
              This will only take a minute.
            </p>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Tell us about yourself
              </h2>
              <p className="mt-2 text-muted-foreground">
                Help others get to know you
              </p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) =>
                    handleProfileChange('full_name', e.target.value)
                  }
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs mt-1 text-right text-muted-foreground">
                  {profileForm.bio.length}/500
                </p>
              </div>

              {/* Program */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Program
                </label>
                <Program
                  value={profileForm.program}
                  onChange={(value) => handleProfileChange('program', value)}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Location
                </label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) =>
                    handleProfileChange('location', e.target.value)
                  }
                  placeholder="e.g., Toronto, ON"
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        );

      case 'picture':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Add a profile photo
              </h2>
              <p className="mt-2 text-muted-foreground">
                Help your friends recognize you
              </p>
            </div>

            <div className="flex flex-col items-center space-y-6">
              {/* Profile Picture Preview */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-muted">
                  <img
                    src={profilePicturePreview || getDefaultAvatar()}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 rounded-lg font-medium transition-colors bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              >
                {profilePicturePreview ? 'Change Photo' : 'Upload Photo'}
              </button>

              <p className="text-sm text-muted-foreground">
                JPG, PNG, GIF or WebP. Max 5MB.
              </p>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                What you can do on Yapp
              </h2>
              <p className="mt-2 text-muted-foreground">
                Explore everything TMU has to offer
              </p>
            </div>

            <div className="grid gap-4">
              {[
                {
                  icon: Users,
                  title: 'Connect with Students',
                  description:
                    'Find and follow other TMU students, build your network',
                  color: 'text-blue-500',
                },
                {
                  icon: MessageCircle,
                  title: 'Direct Messages',
                  description: 'Chat privately with friends and classmates',
                  color: 'text-green-500',
                },
                {
                  icon: Calendar,
                  title: 'Events & Discussions',
                  description:
                    'Join campus events and participate in group discussions',
                  color: 'text-purple-500',
                },
                {
                  icon: MapPin,
                  title: 'Campus Waypoint',
                  description: 'Navigate campus and discover event locations',
                  color: 'text-red-500',
                },
                {
                  icon: Heart,
                  title: 'Share & Engage',
                  description: 'Post updates, share moments, and like content',
                  color: 'text-pink-500',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-card"
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-background border border-border">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-4">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              You're all set!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your profile is ready. Time to explore Yapp and connect with the
              TMU community.
            </p>
            <div className="p-4 rounded-lg bg-secondary/20 border border-secondary/20">
              <p className="text-sm text-secondary-foreground">
                Tip: Check out the Events section to find what's happening on
                campus!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-background"
      style={{
        fontFamily: 'Albert Sans',
      }}
    >
      <div className="w-full max-w-lg rounded-2xl shadow-xl p-8 bg-card border border-border">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {ONBOARDING_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < ONBOARDING_STEPS.length - 1 && (
                <div
                  className={`w-8 h-1 mx-1 rounded ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px] flex flex-col">
          <div className="flex-1">{renderStepContent()}</div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            {currentStep > 0 && currentStep < ONBOARDING_STEPS.length - 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <div className="flex items-center space-x-3">
                {currentStep > 0 && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 rounded-lg font-medium transition-colors text-muted-foreground hover:text-foreground"
                  >
                    Skip for now
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={loading || uploadingPicture}
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors disabled:opacity-50"
                >
                  {loading || uploadingPicture ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{currentStep === 0 ? "Let's Go" : 'Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleComplete}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-linear-to-r from-primary to-primary/80 hover:to-primary text-primary-foreground font-semibold transition-all"
              >
                <span>Start Exploring</span>
                <Sparkles className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
