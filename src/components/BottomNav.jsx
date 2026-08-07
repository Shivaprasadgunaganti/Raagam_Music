import { NavLink, useNavigate } from "react-router-dom";
import { useAudio } from "../context/AudioContext";
import "./bottomnav.css";
import { GrHomeRounded } from "react-icons/gr";
import { BiMoviePlay } from "react-icons/bi";
import { FiSearch } from "react-icons/fi";
import { MdOutlineAccountCircle } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthRequiredModal from "./AuthRequiredModal";

export default function BottomNav() {
  const { currentTrack } = useAudio();
  const nav = useNavigate();
  const { isGuest } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <nav className="bottom-nav">
        <NavLink to="/" end className="nav-item">
          <GrHomeRounded  size={15}/>
          <span>Home</span>
        </NavLink>

        <NavLink to="/search" className="nav-item">
          <FiSearch size={15}/>
          <span>Search</span>
        </NavLink>

        {/* <NavLink to="/liked" className="nav-item">
        <FaRegHeart />
        <span>Liked</span>
      </NavLink> */}

        {isGuest ? (
          <button className="nav-item" onClick={() => setShowAuthModal(true)}>
            <FaRegHeart size={15}/>
            <span>Liked</span>
          </button>
        ) : (
          <NavLink to="/liked" className="nav-item">
            <FaRegHeart size={15}/>
            <span>Liked</span>
          </NavLink>
        )}

        {/* <NavLink to="/account" className="nav-item">
        <MdOutlineAccountCircle />
        <span>Library</span>
      </NavLink> */}

        {isGuest ? (
          <button className="nav-item" onClick={() => setShowAuthModal(true)}>
            <MdOutlineAccountCircle size={15}/>
            <span>Library</span>
          </button>
        ) : (
          <NavLink to="/account" className="nav-item">
            <MdOutlineAccountCircle size={17}/>
            <span>Library</span>
          </NavLink>
        )}
      </nav>
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
