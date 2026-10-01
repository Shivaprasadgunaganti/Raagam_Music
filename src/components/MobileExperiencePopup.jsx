import React, { useEffect, useState } from "react";
import "./MobileExperiencePopup.css";

const STORAGE_KEY = "mobile_experience_notice_dismissed";

export default function MobileExperiencePopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const isLargeScreen = window.innerWidth > 425;
      const alreadyDismissed = localStorage.getItem(STORAGE_KEY) === "true";

      setShowPopup(isLargeScreen && !alreadyDismissed);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShowPopup(false);
  };

  if (!showPopup) {
    return null;
  }

  return (
    <div className="mobile-experience-overlay">
      <div
        className="mobile-experience-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-experience-title"
      >
        <div className="mobile-experience-icon" aria-hidden="true">
          📱
        </div>

        <h2 id="mobile-experience-title">Better on Mobile</h2>

        <p>
          MyRaagam is designed for mobile devices. For the best experience,
          please use MyRaagam on a smaller screen.
        </p>

        <button
          type="button"
          className="mobile-experience-button"
          onClick={handleDismiss}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
