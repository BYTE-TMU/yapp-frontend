import { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/authentication/LoginForm.jsx';
import Signup from './components/authentication/RegisterForm.jsx';
import ForgotPassword from './components/authentication/ForgotPasswordForm.jsx';
import ResetPassword from './components/authentication/ResetPasswordForm.jsx';
import LandingPage from './components/pages/LandingPage.jsx';
import PrivacyPolicy from './components/pages/PrivacyPolicy.jsx';
import TermsAndConditions from './components/pages/TermsAndConditions.jsx';
import Home from './components/pages/home/Home.jsx';
import Create from './components/pages/create/Create.jsx';
import Users from './components/pages/Users.jsx';
import Messages from './components/pages/Messages.jsx';
import Likes from './components/pages/profile/Likes.jsx';
import Profile from './components/pages/profile/Profile.jsx';
import Settings from './components/pages/settings/Settings.jsx';
import Feedback from './components/pages/Feedback.jsx';
import CommentsPage from './components/pages/CommentsPage.jsx';
import Waypoint from './components/pages/waypoint/Waypoint.jsx';
import EventThread from './components/pages/home/events/EventThread.jsx';
import Onboarding from './components/onboarding/Onboarding.jsx';
import PageTransition from './components/common/PageTransition.jsx';
import LoadingDots from './components/common/LoadingDots.jsx';
import { API_BASE_URL } from './services/config.js';

import AuthRoutesLayout from './components/layout/AuthRoutesLayout.jsx';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('no token');
    return <Navigate to="/login" />;
  }

  return children;
};

const OnboardingRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.profile?.onboarding_completed) {
            setNeedsOnboarding(false);
          }
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      } finally {
        setChecking(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingDots size={14} />
      </div>
    );
  }

  if (!needsOnboarding) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

function AuthRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PageTransition>
            <LandingPage />
          </PageTransition>
        }
      />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route
        path="/login"
        element={
          <PageTransition>
            <Login />
          </PageTransition>
        }
      />
      <Route
        path="/signup"
        element={
          <PageTransition>
            <Signup />
          </PageTransition>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PageTransition>
            <ForgotPassword />
          </PageTransition>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PageTransition>
            <ResetPassword />
          </PageTransition>
        }
      />
      <Route
        path="/onboarding"
        element={
          <PrivateRoute>
            <OnboardingRoute>
              <PageTransition>
                <Onboarding />
              </PageTransition>
            </OnboardingRoute>
          </PrivateRoute>
        }
      />
      <Route element={<AuthRoutesLayout />}>
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <PageTransition>
                <Home />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <PageTransition>
                <Create />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <PageTransition>
                <Users />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <PageTransition>
                <Messages />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/waypoint"
          element={
            <PrivateRoute>
              <PageTransition>
                <Waypoint />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/likes"
          element={
            <PrivateRoute>
              <PageTransition>
                <Likes />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <PageTransition>
                <Profile />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <PrivateRoute>
              <PageTransition>
                <Profile />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <PageTransition>
                <Settings />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <PrivateRoute>
              <PageTransition>
                <Feedback />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/post/:postId/comments"
          element={
            <PrivateRoute>
              <PageTransition>
                <CommentsPage />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/events/:eventId/thread"
          element={
            <PrivateRoute>
              <PageTransition>
                <EventThread />
              </PageTransition>
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default AuthRoutes;
