import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import "./auth1.css";
import "./signuppage.css";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleSignup(e) {
    // ⭐ UPDATED: added event
    e.preventDefault(); // ⭐ ADDED: prevent page refresh

    const trimmedEmail = email.trim(); // ⭐ ADDED
    const trimmedPassword = password.trim(); // ⭐ ADDED

    // if (!e.target.checkValidity()) {
    //   e.target.reportValidity();
    //   return;
    // }

    if (!trimmedEmail) {
      setErrorMsg("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setErrorMsg("Enter a valid email");
      return;
    }

    if (trimmedPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail, // ⭐ UPDATED
      password: trimmedPassword, // ⭐ UPDATED
    });

    // if (error) alert(error.message);
    if (error) {
      setErrorMsg(error.message);
    } else {
      // alert("Account created. Please log in.");
      setErrorMsg("Account created. Please log in.");

      localStorage.setItem("login_email", trimmedEmail);

      navigate("/login/password");
    }
    // else {
    //   alert("Account created");
    //   navigate("/");
    // }
  }

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="auth-logo-icon">♪</div>
        <span className="auth-logo-text">Raagam</span>
      </div>

      <div className="auth-card">
        <button className="auth-back-btn" onClick={() => navigate(-1)}>
          <IoArrowBack />
        </button>
        <h2 className="auth-heading">Create account</h2>
        <p className="auth-subheading">Free forever. No credit card needed.</p>
        {/* ⭐ ADDED: form wrapper */}
        <form onSubmit={handleSignup} noValidate>
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="email">
              {" "}
              {/* ⭐ UPDATED */}
              Email
            </label>

            <input
              id="email" // ⭐ ADDED
              name="email" // ⭐ ADDED
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              // onChange={(e) => setEmail(e.target.value)}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg("");
              }}
              type="email"
              autoComplete="email"
              required // ⭐ ADDED
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-label" htmlFor="password">
              {" "}
              {/* ⭐ UPDATED */}
              Password
            </label>

            <input
              id="password" // ⭐ ADDED
              name="password" // ⭐ ADDED
              className="auth-input"
              type="password"
              placeholder="Create a strong password"
              value={password}
              // onChange={(e) => setPassword(e.target.value)}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg("");
              }}
              autoComplete="new-password"
              required // ⭐ ADDED
            />
            {errorMsg && <p className="auth-error">{errorMsg}</p>}
          </div>

          <button
            className="auth-btn-primary"
            type="submit" // ⭐ UPDATED
            disabled={!email.trim() || !password.trim()} // ⭐ ADDED
          >
            Create Account
          </button>
        </form>{" "}
        {/* ⭐ ADDED closing form */}
        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">OR</span>
          <div className="auth-divider-line" />
        </div>
        <p className="auth-footer">
          Already have an account?{" "}
          <span className="auth-footer-link" onClick={() => navigate("/login")}>
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}

// import { useState } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";
// import { IoArrowBack } from "react-icons/io5";
// import "./auth.css";

// export default function SignupPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   async function handleSignup() {
//     const { error } = await supabase.auth.signUp({ email, password });

//     if (error) alert(error.message);
//     else {
//       alert("Account created");
//       navigate("/");
//     }
//   }

//   return (
//     <div className="auth-page">
//       <div className="auth-logo">
//         <div className="auth-logo-icon">♪</div>
//         <span className="auth-logo-text">Raagam</span>
//       </div>

//       <div className="auth-card">
//         <button className="auth-back-btn" onClick={() => navigate(-1)}>
//           <IoArrowBack />
//         </button>

//         <h2 className="auth-heading">Create account</h2>
//         <p className="auth-subheading">Free forever. No credit card needed.</p>

//         <div className="auth-input-group">
//           <label className="auth-label">Email</label>
//           <input
//             className="auth-input"
//             placeholder="you@example.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             type="email"
//             autoComplete="email"
//           />
//         </div>

//         <div className="auth-input-group">
//           <label className="auth-label">Password</label>
//           <input
//             className="auth-input"
//             type="password"
//             placeholder="Create a strong password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleSignup()}
//             autoComplete="new-password"
//           />
//         </div>

//         <button className="auth-btn-primary" onClick={handleSignup}>
//           Create Account
//         </button>

//         <div className="auth-divider">
//           <div className="auth-divider-line" />
//           <span className="auth-divider-text">OR</span>
//           <div className="auth-divider-line" />
//         </div>

//         <p className="auth-footer">
//           Already have an account?{" "}
//           <span className="auth-footer-link" onClick={() => navigate("/login")}>
//             Log in
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// }
