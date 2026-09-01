// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { initAnalytics } from "./utils/analytics";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { useAudio } from "./context/AudioContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";

import CollectionPage from "./components/CollectionPage";
import MiniPlayer from "./components/MiniPlayer";
import SongDetailPage from "./components/SongDetailPage";
import MoviesPage from "./components/MoviesPage";
import MovieSongsPage from "./components/MovieSongsPage";
import PlaylistsPage from "./components/PlaylistsPage";
import LikedSongsPage from "./components/LikedSongsPage";
import PlaylistDetailPage from "./components/PlaylistSongsPage";
import QueuePage from "./pages/QueuePage";
import BottomNav from "./components/BottomNav";
import AllSongsPage from "./pages/AllSongsPage";
import SearchPage from "./pages/SearchPage";
import "./styles.css";
import ProfilePage from "./components/ProfilePage";
import LoginPasswordPage from "./pages/LoginPasswordPage";
import SignupPage from "./pages/SignupPage";
import LoginEmailPage from "./pages/LoginEmailPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { useNavigate } from "react-router-dom";
import EditProfilePage from "./components/EditProfilePage";
import GuestRestrictedRoute from "./components/GuestRestrictedRoute";
import OfflineTest from "./components/OfflineTest";
import OfflineBanner from "./components/OfflineBanner";
import OfflineSongsPage from "./components/OfflineSongsPage";
import useNetworkSync from "./hooks/useNetworkSync";
import SettingsPage from "./pages/SettingsPage";
import FeedbackPage from "./pages/FeedbackPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
// import { ThemeProvider } from "./context/ThemeContext";

/* ---------------- PROTECTED APP CONTENT ---------------- */

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, isGuest } = useAuth();

  useEffect(() => {
    initAnalytics();
  }, []);
  const { clearQueue } = useAudio();

  const hideGlobalUI = location.pathname.startsWith("/track/");
  const isLoginPage =
    location.pathname.startsWith("/login") || location.pathname === "/signup";
  const isPlaylistPage = location.pathname.startsWith("/playlist/");
  const isMovietPage = location.pathname.startsWith("/movie/");

  // const fullScreenPage =
  // hideGlobalUI ||
  // isLoginPage ||
  // isPlaylistPage ||
  // isMovietPage ||
  // location.pathname === "/liked" ||
  // location.pathname === "/account";

  const fullScreenPage = hideGlobalUI || isLoginPage;

  const noFooterSpacing =
    fullScreenPage ||
    location.pathname === "/settings" ||
    location.pathname === "/feedback" ||
    location.pathname === "/edit" ||
  location.pathname === "/account";

  useNetworkSync();

  useEffect(() => {
    if (!loading && !user && !isGuest) {
      clearQueue();
      localStorage.removeItem("audio_state_v1");
    }
  }, [user, loading, isGuest]);

  useEffect(() => {
    const hash = window.location.hash;

    if (hash && hash.includes("type=recovery")) {
      navigate(`/reset-password${hash}`, { replace: true });
    }
  }, []);

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-logo-icon">♪</div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <OfflineBanner />

      {/* <div className={`app-content ${fullScreenPage ? "no-footer" : ""}`}> */}
      <div className={`app-content ${noFooterSpacing ? "no-footer" : ""}`}>
        {/* <OfflineTest/> */}
        <Routes>
          {/* Public Route */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
          <Route path="/login/password" element={<LoginPasswordPage />} />
          <Route path="/login" element={<LoginEmailPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CollectionPage />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/" element={<CollectionPage />} /> */}
          {/* <Route
            path="/track/:id"
            element={
              <ProtectedRoute>
                <SongDetailPage />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/track/:id" element={<SongDetailPage />} />

          {/* <Route
            path="/movies"
            element={
              <ProtectedRoute>
                <MoviesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movie/:movieId"
            element={
              <ProtectedRoute>
                <MovieSongsPage />
              </ProtectedRoute>
            }
          /> */}

          <Route path="/movies" element={<MoviesPage />} />

          <Route path="/movie/:movieId" element={<MovieSongsPage />} />

          <Route
            path="/playlist/:playlistId"
            element={
              <GuestRestrictedRoute>
                <PlaylistDetailPage />
              </GuestRestrictedRoute>
            }
          />

          <Route
            path="/playlists"
            element={
              <GuestRestrictedRoute>
                <PlaylistsPage />
              </GuestRestrictedRoute>
            }
          />

          <Route
            path="/liked"
            element={
              <GuestRestrictedRoute>
                <LikedSongsPage />
              </GuestRestrictedRoute>
            }
          />
          <Route
            path="/queue"
            element={
              <ProtectedRoute>
                <QueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overall"
            element={
              <ProtectedRoute>
                <AllSongsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account"
            element={
              <GuestRestrictedRoute>
                <ProfilePage />
              </GuestRestrictedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <GuestRestrictedRoute>
                <SettingsPage />
              </GuestRestrictedRoute>
            }
          />
<Route
  path="/feedback"
  element={
    <GuestRestrictedRoute>
      <FeedbackPage />
    </GuestRestrictedRoute>
  }
/>
  <Route
  path="/privacy-policy"
  element={
    <PrivacyPolicyPage />
  }
/>

<Route
  path="/terms-of-service"
  element={
    <TermsOfServicePage />
  }
/>        

          <Route
            path="/edit"
            element={
              <GuestRestrictedRoute>
                <EditProfilePage />
              </GuestRestrictedRoute>
            }
          />

          <Route
            path="/offline"
            element={
              <ProtectedRoute>
                <OfflineSongsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </div>

      {/* Hide global UI on login page OR track page */}
      {/* {!hideGlobalUI && !isLoginPage && user && <MiniPlayer />}
      {!hideGlobalUI && !isLoginPage && user && <BottomNav />} */}
      {!hideGlobalUI && !isLoginPage && (user || isGuest) && <MiniPlayer />}
      {!hideGlobalUI && !isLoginPage && (user || isGuest) && <BottomNav />}
    </>
  );
}

/* ---------------- MAIN APP ---------------- */

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

import { saveTrack } from "./utils/offlineCache";

async function testOffline(track) {
  try {
    const response = await fetch(track.external_url);
    const blob = await response.blob();

    await saveTrack(track.id, blob);

    console.log("Saved:", track.title);
  } catch (err) {
    console.error(err);
  }
}
