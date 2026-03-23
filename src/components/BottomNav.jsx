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
      {/* <NavLink to="/" end className="nav-item">
        🏠
        <span>Home</span>
      </NavLink> */}
      <NavLink to="/" end className="nav-item">
        <GrHomeRounded />
        <span>Home</span>
      </NavLink>

      {/* <NavLink to="/movies" className="nav-item">
        🎬
        <span>Movies</span>
      </NavLink> */}
      {/* <NavLink to="/movies" className="nav-item">
        <BiMoviePlay />
        <span>Movies</span>
      </NavLink> */}
      <NavLink to="/search" className="nav-item">
        <FiSearch />
        <span>Search</span>
      </NavLink>

      <NavLink to="/liked" className="nav-item">
        <FaRegHeart />
        <span>Liked</span>
      </NavLink>

      {/* <FiSearch /> */}

      {/* <NavLink to="/playlists" className="nav-item">
        📂
        <span>Playlists</span>
      </NavLink> */}

      {/* <button
        className="nav-item"
        disabled={!currentTrack}
        onClick={() => currentTrack && nav(`/track/${currentTrack.id}`)}
      >
        ▶️
        <span>Playing</span>
      </button> */}
      <button
        className="nav-item"
        disabled={!currentTrack}
        onClick={() => currentTrack && nav(`/track/${currentTrack.id}`)}
      >
        <MdOutlineAccountCircle />

        <span>Account</span>
      </button>
    </nav>
  );
}
