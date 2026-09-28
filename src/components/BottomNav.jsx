import { NavLink, useNavigate } from "react-router-dom";
import { useAudio } from "../context/AudioContext";
import "./bottomnav.css";
import { GrHomeRounded } from "react-icons/gr";
import { BiMoviePlay } from "react-icons/bi";
import { FiSearch } from "react-icons/fi";
import {
  MdDownloadForOffline,
  MdOfflineBolt,
  MdOutlineAccountCircle,
  MdOutlineDownloadForOffline,
  MdOutlineFileDownload,
} from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthRequiredModal from "./AuthRequiredModal";
import OfflineGuidePopup from "./OfflineGuidePopup";

export default function BottomNav() {
  const { currentTrack } = useAudio();
  const nav = useNavigate();
  // const { isGuest } = useAuth();
  const { user } = useAuth();
  const [showOfflineGuide, setShowOfflineGuide] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <nav className="bottom-nav">
        <NavLink to="/" end className="nav-item">
          <GrHomeRounded size={15} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/search" className="nav-item">
          <FiSearch size={15} />
          <span>Search</span>
        </NavLink>

        {user ? (
          <NavLink to="/liked" className="nav-item">
            <FaRegHeart size={15} />
            <span>Liked</span>
          </NavLink>
        ) : (
          <button className="nav-item" onClick={() => setShowAuthModal(true)}>
            <FaRegHeart size={15} />
            <span>Liked</span>
          </button>
        )}

        {/* <NavLink to="/account" className="nav-item">
        <MdOutlineAccountCircle />
        <span>Library</span>
      </NavLink> */}

        <button
          // className="home-offline-btn"
          className="nav-item"
          onClick={() => setShowOfflineGuide(true)}
          aria-label="Offline Music"
          title="Offline Music"
        >
          {/* <MdOfflineBolt /> */}
          {/* <MdOutlineDownloadForOffline size={25}/> */}
          {/* <MdDownloadForOffline/> */}
          <MdOutlineFileDownload size={16} />
          <span>Offline</span>
        </button>
      </nav>
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {showOfflineGuide && (
        <OfflineGuidePopup onClose={() => setShowOfflineGuide(false)} />
      )}
    </>
  );
}
