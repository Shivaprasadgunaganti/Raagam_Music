// import "./authRequiredModal.css";
// import { useAuth } from "../context/AuthContext";
// import { NavLink } from "react-router-dom";

// export default function AuthRequiredModal({
//   isOpen,
//   onClose,
//   title = "Sign in to continue",
//   description = "Save your favorite songs, create playlists, and continue listening across devices.",
// }) {
//   const { signInWithGoogle } = useAuth();
// //   console.log("AuthRequiredModal", isOpen);

//   if (!isOpen) return null;

//   async function handleLogin() {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (error) {
//         alert(error.message);
//       } else {
//         navigate("/");
//       }
//     }

//   return (
//     <div className="auth-modal-overlay">
//       <div className="auth-modal">
//         <h3>{title}</h3>

//         <p>{description}</p>

//         <button
//           className="auth-modal-google"
//           onClick={signInWithGoogle}
//         >
//             <img
//             src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
//             alt="Google"
//           />
//             Continue with Google
//         </button>

//              <NavLink to="/login" className="auth-modal-google">Login</NavLink>

//              <button
//           className="auth-modal-cancel"
//           onClick={onClose}
//         >
//           Cancel
//         </button>

//       </div>
//     </div>
//   );
// }

import "./authRequiredModal.css";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";

export default function AuthRequiredModal({
  isOpen,
  onClose,
  title = "Unlock your music experience",
  description = "Save favorites, build playlists, and continue listening seamlessly across all your devices.",
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
