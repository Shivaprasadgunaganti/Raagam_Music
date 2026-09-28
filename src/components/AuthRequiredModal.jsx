import "./authRequiredModal.css";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";

export default function AuthRequiredModal({
  isOpen,
  onClose,
  title = "Unlock your music experience",
  description = "Save your favorites and listen offline.",
  // description = "Save your favorite songs and playlists.",
}) {
  const { signInWithGoogle } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h3>{title}</h3>

        <p>{description}</p>

        <button className="auth-modal-google" onClick={signInWithGoogle}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
          />
          Continue with Google
        </button>

        <div className="auth-modal-footer">
          Already have an account?
          <NavLink to="/login">Sign in</NavLink>
        </div>
      </div>
    </div>
  );
}
