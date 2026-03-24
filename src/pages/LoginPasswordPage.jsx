import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { IoArrowBack } from "react-icons/io5";
import "./auth1.css";
import "./loginpasswordpage.css";
import { useAuth } from "../context/AuthContext";

export default function LoginPasswordPage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("login_email");
  const [password, setPassword] = useState("");
  const { user } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    if (!email) navigate("/login");
  }, [email, navigate]);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  async function handleLogin(e) {
    // ⭐ UPDATED: added event parameter
    e.preventDefault(); // ⭐ ADDED: prevent page refresh

    const trimmedPassword = password.trim(); // ⭐ ADDED

    if (!e.target.checkValidity()) {
      // ⭐ ADDED
      e.target.reportValidity(); // ⭐ ADDED
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: trimmedPassword, // ⭐ UPDATED
    });

    // if (error) {
    //   alert(error.message);
    if (error) {
      setErrorMsg("Invalid email or password");
    } else {
      localStorage.removeItem("login_email");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate("/");
      }
    }
  }

  // async function handleForgotPassword() {
  //   const email = localStorage.getItem("login_email");

  //   const { error } =
  //     await supabase.auth.resetPasswordForEmail(email, {
  //       redirectTo: window.location.origin + "/reset-password",
  //     });

  //   if (error) {
  //     alert(error.message);
  //   } else {
  //     alert("Password reset email sent. Check your inbox.");
  //   }
  // }

  async function handleForgotPassword() {
    const email = localStorage.getItem("login_email");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password reset email sent");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="auth-logo-icon">♪</div>
        <span className="auth-logo-text">Raagam</span>
      </div>

      <div className="auth-card">
        <button className="auth-back-btn" onClick={() => navigate("/login")}>
          <IoArrowBack />
        </button>
        <h2 className="auth-heading">Enter password</h2>
        <p className="auth-subheading">Logging in as</p>
        <div className="auth-email-display">
          <div className="auth-email-dot" />
          <span>{email}</span>
        </div>
        {/* ⭐ ADDED: form wrapper */}
        <form onSubmit={handleLogin} noValidate>
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="password">
              {" "}
              {/* ⭐ UPDATED */}
              Password
            </label>

            {/* <input
              id="password" // ⭐ ADDED
              name="password" // ⭐ ADDED
              className="auth-input"
              type="password"
              placeholder="Your password"
              value={password}
              // onChange={(e) => setPassword(e.target.value)}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg("");
              }}
              autoComplete="current-password"
              required // ⭐ ADDED
            /> */}

            <div className="password-wrapper">
    <input
      id="password"
      name="password"
      className="auth-input"
      type={showPassword ? "text" : "password"}
      placeholder="Your password"
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
        setErrorMsg("");
      }}
      autoComplete="current-password"
      required
    />

    <span
      className="toggle-password"
      onClick={() => setShowPassword((prev) => !prev)}
    >
      {showPassword ? "Hide" : "Show"}
    </span>
  </div>
            {errorMsg && <p className="auth-error">{errorMsg}</p>}
          </div>

          <p
            style={{ cursor: "pointer", color: "#1db954" }}
            onClick={handleForgotPassword}
          >
            Forgot password?
          </p>

          <button
            className="auth-btn-primary"
            type="submit" // ⭐ UPDATED
            disabled={!password.trim()} // ⭐ ADDED
          >
            Log in
          </button>
        </form>{" "}
        {/* ⭐ ADDED closing form */}
      </div>
    </div>
  );
}

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient";
// import { IoArrowBack } from "react-icons/io5";
// import "./auth.css";

// export default function LoginPasswordPage() {
//   const navigate = useNavigate();
//   const email = localStorage.getItem("login_email");
//   const [password, setPassword] = useState("");

//   useEffect(() => {
//     if (!email) navigate("/login");
//   }, [email, navigate]);

//   async function handleLogin() {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       alert(error.message);
//     } else {
//       localStorage.removeItem("login_email");

//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       if (session) {
//         navigate("/");
//       }
//     }
//   }

//   return (
//     <div className="auth-page">
//       <div className="auth-logo">
//         <div className="auth-logo-icon">♪</div>
//         <span className="auth-logo-text">Raagam</span>
//       </div>

//       <div className="auth-card">
//         <button className="auth-back-btn" onClick={() => navigate("/login")}>
//           <IoArrowBack />
//         </button>

//         <h2 className="auth-heading">Enter password</h2>
//         <p className="auth-subheading">Logging in as</p>

//         {/* Email badge */}
//         <div className="auth-email-display">
//           <div className="auth-email-dot" />
//           <span>{email}</span>
//         </div>

//         <div className="auth-input-group">
//           <label className="auth-label">Password</label>
//           <input
//             className="auth-input"
//             type="password"
//             placeholder="Your password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleLogin()}
//             autoComplete="current-password"
//           />
//         </div>

//         <button className="auth-btn-primary" onClick={handleLogin}>
//           Log in
//         </button>
//       </div>
//     </div>
//   );
// }
