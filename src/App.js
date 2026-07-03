// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

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

/* ---------------- PROTECTED APP CONTENT ---------------- */

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, isGuest } = useAuth();
  const { clearQueue } = useAudio();

  const hideGlobalUI = location.pathname.startsWith("/track/");
  const isLoginPage =
    location.pathname.startsWith("/login") || location.pathname === "/signup";
  const isPlaylistPage = location.pathname.startsWith("/playlist/");
  const isMovietPage = location.pathname.startsWith("/movie/");

  // useEffect(() => {
  //   if (!loading && !user) {
  //     clearQueue();
  //     localStorage.removeItem("audio_state_v1");
  //   }
  // }, [user, loading]);

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
      {/* <div className={`app-content ${hideGlobalUI ? "no-footer" : ""}`}> */}
      <OfflineBanner/>
      <div
        className={`app-content ${
          // hideGlobalUI || isLoginPage || isPlaylistPage || isMovietPage ? "no-footer" : ""
          hideGlobalUI || isLoginPage ? "no-footer" : ""
        }`}
      >
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
          <Route
            path="/track/:id"
            element={
              <ProtectedRoute>
                <SongDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
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
          />
          {/* <Route
            path="/playlist/:playlistId"
            element={
              <ProtectedRoute>
                <PlaylistDetailPage />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/playlist/:playlistId"
            element={
              <GuestRestrictedRoute>
                <PlaylistDetailPage />
              </GuestRestrictedRoute>
            }
          />

          {/* <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <PlaylistsPage />
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/playlists"
            element={
              <GuestRestrictedRoute>
                <PlaylistsPage />
              </GuestRestrictedRoute>
            }
          />
          {/* <Route
            path="/liked"
            element={
              <ProtectedRoute>
                <LikedSongsPage />
              </ProtectedRoute>
            }
          /> */}
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
          {/* <Route
            path="/Logout"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/account"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/account"
            element={
              <GuestRestrictedRoute>
                <ProfilePage />
              </GuestRestrictedRoute>
            }
          />

          {/* <Route
            path="/edit-info"
            element={
              <ProtectedRoute>
               <EditProfilePage/>
              </ProtectedRoute>
            }
          /> */}

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