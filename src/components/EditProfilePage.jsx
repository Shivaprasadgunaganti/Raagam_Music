// EditProfilePage.jsx

import "./editProfile.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../supabaseClient";

import { useAuth } from "../context/AuthContext";
import { useAudio } from "../context/AudioContext";
import SEO from "./SEO";

import {
  IoArrowBack,
  IoMailOutline,
  IoLockClosedOutline,
  IoPersonOutline,
  IoCreateOutline,
  IoLogOutOutline,
  IoTrashOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";

const avatarGradients = [
  "linear-gradient(135deg,#1db954,#0f8a43)",

  "linear-gradient(135deg,#8b5cf6,#6d28d9)",

  "linear-gradient(135deg,#3b82f6,#1d4ed8)",

  "linear-gradient(135deg,#ec4899,#be185d)",

  "linear-gradient(135deg,#f59e0b,#d97706)",

  "linear-gradient(135deg,#06b6d4,#0891b2)",
];

export default function EditProfilePage() {
  const nav = useNavigate();

  const { user } = useAuth();

  const { clearQueue } = useAudio();

  /* ---------------- STATES ---------------- */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [displayName, setDisplayName] =
    useState("");

  const [bio, setBio] = useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  /* ---------------- PROVIDER ---------------- */

  const isGoogleUser = useMemo(() => {
    return (
      user?.app_metadata?.provider ===
      "google"
    );
  }, [user]);

  const avatarGradient =
  avatarGradients[
    displayName.length %
      avatarGradients.length
  ];

  /* ---------------- LOAD PROFILE ---------------- */

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      const { data, error } =
        await supabase
          .from("profiles_data")
          .select("*")
          .eq("id", user.id)
          .single();

      if (!error && data) {
        setDisplayName(
          data.display_name || ""
        );

        setBio(data.bio || "");
      } else {
        setDisplayName(
          user?.email?.split("@")[0] || ""
        );
      }

      setLoading(false);
    }

    loadProfile();
  }, [user]);

  /* ---------------- SAVE ---------------- */

  async function handleSave() {
    try {
      setSaving(true);

      /* SAVE PROFILE */

      const { error } = await supabase
        .from("profiles_data")
        .upsert({
          id: user.id,

          display_name: displayName,

          bio: bio,
        });

      if (error) {
        console.log(error);
        alert("Failed to save profile");
        return;
      }

      /* PASSWORD UPDATE */

      if (
        !isGoogleUser &&
        password &&
        confirmPassword
      ) {
        if (
          password !== confirmPassword
        ) {
          alert(
            "Passwords do not match"
          );

          return;
        }

        const {
          error: passwordError,
        } =
          await supabase.auth.updateUser(
            {
              password,
            }
          );

        if (passwordError) {
          alert(
            passwordError.message
          );

          return;
        }
      }

      alert("Profile updated ✅");

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- CLEAR HISTORY ---------------- */

  function clearHistory() {
    localStorage.removeItem(
      "recent_tracks"
    );

    alert("History cleared ✅");
  }

  /* ---------------- CLEAR QUEUE ---------------- */

  function handleClearQueue() {
    clearQueue();

    alert("Queue cleared ✅");
  }

  /* ---------------- LOGOUT ---------------- */

  async function handleLogout() {
    await supabase.auth.signOut();

    clearQueue();

    Object.keys(localStorage).forEach(
      (key) => {
        if (
          key.startsWith("audio_state_")
        ) {
          localStorage.removeItem(key);
        }
      }
    );

    window.location.href = "/login";
  }

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="profile-loading">
        Loading profile...
      </div>
    );
  }

  return (
    <main className="edit-profile-page">
{/* seo */}
  <SEO
      title="Edit Profile | MyRaagam"
      description="Edit your MyRaagam profile."
      robots="noindex, nofollow"
    />

      {/* TOPBAR */}
      <header className="edit-topbar">
        <button
          className="top-icon-btn"
          onClick={() => nav(-1)}
        >
          <IoArrowBack />
        </button>

        <h1>Edit Profile</h1>

        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </header>

      {/* AVATAR */}
      <section className="avatar-section">
        <div className="avatar-wrapper">
          {/* <div className="profile-avatar"> */}
          <div
  className="profile-avatar"
  style={{
    background: avatarGradient,
  }}
>
            {displayName
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          {/* <button className="avatar-edit-btn">
            <IoCreateOutline />
          </button> */}
        </div>

        {/* <button className="change-photo-btn">
          Change Photo
        </button> */}
      </section>

      {/* PERSONAL */}
      <section className="settings-section">
        <p className="section-label">
          PERSONAL
        </p>

        <div className="settings-card">
          {/* DISPLAY NAME */}
          <div className="settings-row">
            <div className="row-icon green">
              <IoPersonOutline />
            </div>

            <div className="row-content">
              <span>Display Name</span>

              <input
                type="text"
                value={displayName}
                onChange={(e) =>
                  setDisplayName(
                    e.target.value
                  )
                }
                placeholder="Your name"
              />
            </div>
          </div>

          {/* BIO */}
      
        </div>
      </section>

      {/* ACCOUNT */}
      <section className="settings-section">
        <p className="section-label">
          ACCOUNT
        </p>

        <div className="settings-card">
          {/* EMAIL */}
          <div className="settings-row">
            <div className="row-icon cyan">
              <IoMailOutline />
            </div>

            <div className="row-content">
              <span>Email</span>

              <input
                type="email"
                value={user?.email || ""}
                disabled
              />
            </div>

            <div className="verified-badge">
              <IoCheckmarkCircle />

              Verified
            </div>
          </div>

          {/* PASSWORD */}
          {!isGoogleUser && (
            <>
              <div className="settings-row">
                <div className="row-icon purple">
                  <IoLockClosedOutline />
                </div>

                <div className="row-content">
                  <span>Password</span>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="New password"
                  />
                </div>
              </div>

              <div className="settings-row">
                <div className="row-icon orange">
                  <IoLockClosedOutline />
                </div>

                <div className="row-content">
                  <span>
                    Confirm Password
                  </span>

                  <input
                    type="password"
                    value={
                      confirmPassword
                    }
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* APP ACTIONS */}
      <section className="settings-section">
        <p className="section-label">
          APP ACTIONS
        </p>

        <div className="settings-card">
          <button
            className="action-row"
            onClick={
              handleClearQueue
            }
          >
            Clear Queue
          </button>

          <button
            className="action-row"
            onClick={clearHistory}
          >
            Clear History
          </button>
        </div>
      </section>

      {/* DANGER */}
      <section className="settings-section">
        <p className="section-label danger">
          DANGER ZONE
        </p>

        <div className="danger-card">
          <button
            className="danger-row"
            onClick={handleLogout}
          >
            <IoLogOutOutline />

            Logout
          </button>

          <button className="danger-row delete">
            <IoTrashOutline />

            Delete Account
          </button>
        </div>
      </section>
    </main>
  );
}