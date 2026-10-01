// src/App.js
// import React, { useEffect } from "react";
import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { initAnalytics } from "./utils/analytics";
import MobileExperiencePopup from "./components/MobileExperiencePopup";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { useAudio } from "./context/AudioContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import GuestRestrictedRoute from "./components/GuestRestrictedRoute";
import OfflineBanner from "./components/OfflineBanner";
import useNetworkSync from "./hooks/useNetworkSync";

const CollectionPage = lazy(() => import("./components/CollectionPage"));
const MiniPlayer = lazy(() => import("./components/MiniPlayer"));
const SongDetailPage = lazy(() => import("./components/SongDetailPage"));
const MoviesPage = lazy(() => import("./components/MoviesPage"));
const MovieSongsPage = lazy(() => import("./components/MovieSongsPage"));
const PlaylistsPage = lazy(() => import("./components/PlaylistsPage"));
const LikedSongsPage = lazy(() => import("./components/LikedSongsPage"));
const PlaylistDetailPage = lazy(() => import("./components/PlaylistSongsPage"));
const QueuePage = lazy(() => import("./pages/QueuePage"));
const BottomNav = lazy(() => import("./components/BottomNav"));
const AllSongsPage = lazy(() => import("./pages/AllSongsPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const LoginPasswordPage = lazy(() => import("./pages/LoginPasswordPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const LoginEmailPage = lazy(() => import("./pages/LoginEmailPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const EditProfilePage = lazy(() => import("./components/EditProfilePage"));
const OfflineSongsPage = lazy(() => import("./components/OfflineSongsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));

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

  const isHomePage = location.pathname === "/";

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

  return (
    <>
      <OfflineBanner />
      {isHomePage && <MobileExperiencePopup />}

      {/* <div className={`app-content ${fullScreenPage ? "no-footer" : ""}`}> */}
      <div className={`app-content ${noFooterSpacing ? "no-footer" : ""}`}>
        {/* <OfflineTest/> */}

        <Suspense fallback={null}>
          <Routes>
            {/* Public Route */}
            {/* <Route path="/login" element={<LoginPage />} /> */}
            <Route path="/login/password" element={<LoginPasswordPage />} />
            <Route path="/login" element={<LoginEmailPage />} />
            <Route path="/signup" element={<SignupPage />} />

      
            <Route path="/" element={<CollectionPage />} />

            {/* Protected Routes */}
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
                //    <ProtectedRoute>
                <QueuePage />
                // </ProtectedRoute>
              }
            />
            <Route
              path="/overall"
              element={
                //  <ProtectedRoute>
                <AllSongsPage />
                // </ProtectedRoute>
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
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

            <Route path="/terms-of-service" element={<TermsOfServicePage />} />

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
                //  <ProtectedRoute>
                <SearchPage />
                //  </ProtectedRoute>
              }
            />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </Suspense>
      </div>

      {/* Hide global UI on login page OR track page */}
      {/* {!hideGlobalUI && !isLoginPage && user && <MiniPlayer />}
      {!hideGlobalUI && !isLoginPage && user && <BottomNav />} */}
      {/* {!hideGlobalUI && !isLoginPage && (user || isGuest) && <MiniPlayer />} */}
      {/* {!hideGlobalUI && !isLoginPage && (user || isGuest) && <BottomNav />} */}
      {!hideGlobalUI && !isLoginPage && <MiniPlayer />}
      {!hideGlobalUI && !isLoginPage && <BottomNav />}
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
