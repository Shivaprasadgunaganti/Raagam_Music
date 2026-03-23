import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  function validatePassword() {
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    return "";
  }

  async function handleReset() {
    const validationError = validatePassword();

    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate("/login");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Reset Password</h2>

        <div className="auth-input-group">
          <label className="auth-label">New Password</label>

          <div style={{ position: "relative" }}>
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg("");
              }}
            />

            <span
              style={{
                position: "absolute",
                right: 10,
                top: 10,
                cursor: "pointer",
                fontSize: 14,
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>
        </div>

        <div className="auth-input-group">
          <label className="auth-label">Confirm Password</label>

          <input
            className="auth-input"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrorMsg("");
            }}
          />
        </div>

        {errorMsg && <p className="auth-error">{errorMsg}</p>}

        <div style={{ fontSize: 13, color: "#9aa4b2", marginBottom: 10 }}>
          Password must contain:
          <ul style={{ marginTop: 6 }}>
            <li>At least 6 characters</li>
            <li>One uppercase letter</li>
            <li>One number</li>
          </ul>
        </div>

        <button className="auth-btn-primary" onClick={handleReset}>
          Update Password
        </button>
      </div>
    </div>
  );
}

// functionality with claude UI
// import { useState, useEffect } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";
// import { IoArrowBack } from "react-icons/io5";
// import "./auth.css";

// export default function ResetPasswordPage() {
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     supabase.auth.getSession();
//   }, []);

//   async function handleReset() {
//     const { error } = await supabase.auth.updateUser({
//       password,
//     });

//     if (error) {
//       alert(error.message);
//     } else {
//       alert("Password updated successfully");
//       navigate("/login");
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

//         <h2 className="auth-heading">New password</h2>
//         <p className="auth-subheading">
//           Choose a strong password for your account
//         </p>

//         <div className="auth-input-group">
//           <label className="auth-label">New Password</label>
//           <input
//             className="auth-input"
//             type="password"
//             placeholder="Enter new password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleReset()}
//           />
//         </div>

//         <button className="auth-btn-primary" onClick={handleReset}>
//           Update Password
//         </button>
//       </div>
//     </div>
//   );
// }
// basic functionality

// import { useState, useEffect } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";

// export default function ResetPasswordPage() {
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     supabase.auth.getSession();
//   }, []);

//   async function handleReset() {
//     const { error } = await supabase.auth.updateUser({
//       password,
//     });

//     if (error) {
//       alert(error.message);
//     } else {
//       alert("Password updated successfully");
//       navigate("/login");
//     }
//   }

//   return (
//     <div className="auth-page">
//       <div className="auth-card">
//         <h2>Reset Password</h2>

//         <input
//           type="password"
//           placeholder="New password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button onClick={handleReset}>Update Password</button>
//       </div>
//     </div>
//   );
// }
