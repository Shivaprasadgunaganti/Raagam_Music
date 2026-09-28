import { MdPalette, MdOfflinePin, MdInfoOutline } from "react-icons/md";

import { IoChevronForward } from "react-icons/io5";

import { useEffect, useState } from "react";
import ConfirmModal from "../ConfirmModal";
import { useToast } from "../../context/ToastContext";

import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

import { getCacheStats, clearCache } from "../../utils/offlineCache";

// export default function SettingsList() {
//   const { theme, toggleTheme } = useTheme();
//   const navigate = useNavigate();

export default function SettingsList() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [offlineStats, setOfflineStats] = useState({
    count: 0,
    bytes: 0,
  });

  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    loadOfflineStats();
  }, []);

  async function loadOfflineStats() {
    try {
      const stats = await getCacheStats();
      setOfflineStats(stats);
    } catch (error) {
      console.error("Failed to load offline storage:", error);
    }
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 MB";

    const mb = bytes / (1024 * 1024);

    if (mb < 1) {
      return `${Math.round(bytes / 1024)} KB`;
    }

    return `${mb.toFixed(1)} MB`;
  }

  async function handleClearOfflineCache() {
    try {
      await clearCache();

      setOfflineStats({
        count: 0,
        bytes: 0,
      });

      setShowClearModal(false);

      showToast("Offline songs cleared");
    } catch (error) {
      console.error("Failed to clear offline cache:", error);
      showToast("Couldn't clear offline songs");
    }
  }

  return (
    <>
      {/* Appearance */}

      <section className="settings-section">
        <h3>Appearance</h3>

        <div className="settings-row" onClick={toggleTheme}>
          <div className="settings-left">
            <MdPalette />
            <span>Theme</span>
          </div>

          <div className="settings-right">
            <span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>

            <IoChevronForward />
          </div>
        </div>
      </section>

      {/* Offline */}

      <section className="settings-section">
        <h3>Offline</h3>

        <div className="settings-row" onClick={() => navigate("/offline")}>
          <div className="settings-left">
            <MdOfflinePin />
            <span>Offline Storage</span>
          </div>

          <div className="settings-right">
            <span>
              {/* {offlineStats.count}{" "}
        {offlineStats.count === 1 ? "song" : "songs"} ·{" "} */}
              {formatBytes(offlineStats.bytes)}
            </span>

            <IoChevronForward />
          </div>
        </div>

        {/* <div className="settings-row" onClick={handleClearOfflineCache}> */}
        <div className="settings-row" onClick={() => setShowClearModal(true)}>
          <div className="settings-left">
            <MdOfflinePin />
            <span>Clear Offline Cache</span>
          </div>

          <IoChevronForward />
        </div>
      </section>

      {/* About */}

      <section className="settings-section">
        <h3>About</h3>

        <div className="settings-row">
          <div className="settings-left">
            <MdInfoOutline />
            <span>Version</span>
          </div>

          <span>1.0.0</span>
        </div>

        <div
          className="settings-row"
          onClick={() => navigate("/privacy-policy")}
        >
          <div className="settings-left">
            <MdInfoOutline />
            <span>Privacy Policy</span>
          </div>

          <IoChevronForward />
        </div>

        <div
          className="settings-row"
          onClick={() => navigate("/terms-of-service")}
        >
          <div className="settings-left">
            <MdInfoOutline />
            <span>Terms of Service</span>
            {/* <span>Terms & Conditions</span> */}
          </div>

          <IoChevronForward />
        </div>

        <div className="settings-row" onClick={() => navigate("/feedback")}>
          <div className="settings-left">
            <MdInfoOutline />
            <span>Help & Feedback</span>
          </div>

          <IoChevronForward />
        </div>
      </section>
      <ConfirmModal
        open={showClearModal}
        title="Clear Offline Songs?"
        message="This will remove all downloaded audio from this device. Your liked songs and playlists will not be affected."
        cancelText="Cancel"
        confirmText="Clear"
        onCancel={() => setShowClearModal(false)}
        onConfirm={handleClearOfflineCache}
      />
    </>
  );
}
