import { NavLink, useNavigate } from "react-router-dom";
import { useAudio } from "../context/AudioContext";
import "./bottomnav.css";
import { GrHomeRounded } from "react-icons/gr";
import { BiMoviePlay } from "react-icons/bi";
import { FiSearch } from "react-icons/fi";
import { MdOutlineAccountCircle } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";

export default function BottomNav() {
  const { currentTrack } = useAudio();
  const nav = useNavigate();

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className="nav-item">
        <GrHomeRounded />
        <span>Home</span>
      </NavLink>

      <NavLink to="/search" className="nav-item">
        <FiSearch />
        <span>Search</span>
      </NavLink>

      <NavLink to="/liked" className="nav-item">
        <FaRegHeart />
        <span>Liked</span>
      </NavLink>

      {/* <button
        className="nav-item"
        disabled={!currentTrack}
        onClick={() => currentTrack && nav(`/track/${currentTrack.id}`)}
      >
        <MdOutlineAccountCircle />

        <span>Account</span>
      </button> */}

       <NavLink to="/account" className="nav-item">
        <MdOutlineAccountCircle />
        <span>Library</span>
      </NavLink>

      {/* <NavLink to="/account" className="nav-item">
        <MdOutlineAccountCircle />
        <span>Account</span>
      </NavLink> */}
    </nav>
  );
}
