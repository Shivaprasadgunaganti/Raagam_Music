import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import "./auth1.css";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

export default function LoginEmailPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");

  function handleNext(e) {
    e.preventDefault();

    const trimmedEmail = email.trim();

    // check browser validity
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

    localStorage.setItem("login_email", trimmedEmail);
    navigate("/login/password");
  }

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  async function handleGoogleLogin() {
    // await supabase.auth.signInWithOAuth({
    //   provider: "google",
    // });
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

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

        <h2 className="auth-heading">Welcome back</h2>
        <p className="auth-subheading">Enter your email to continue</p>

        <form onSubmit={handleNext} noValidate>
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              // onChange={(e) => setEmail(e.target.value)}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg("");
              }}
              autoComplete="email"
              required
            />
          </div>
          {errorMsg && <p className="auth-error">{errorMsg}</p>}

          <button
            className="auth-btn-primary"
            type="submit"
            disabled={!email.trim()}
          >
            Continue
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">OR</span>
          <div className="auth-divider-line" />
        </div>

        <p className="auth-footer">
          Don't have an account?{" "}
          <span
            className="auth-footer-link"
            onClick={() => navigate("/signup")}
          >
            Sign up free
          </span>
        </p>
        {/* <button onClick={handleGoogleLogin}>Continue with Google</button> */}
        <button className="auth-btn-google" onClick={handleGoogleLogin}>
  <img
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    alt="Google"
  />
  Continue with Google
</button>
      </div>
    </div>
  );
}

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { IoArrowBack } from "react-icons/io5";
// import "./auth.css";

// export default function LoginEmailPage() {
//   const [email, setEmail] = useState("");
//   const navigate = useNavigate();

//   function handleNext() {
//     if (!email) {
//       alert("Please enter email");
//       return;
//     }
//     localStorage.setItem("login_email", email);
//     navigate("/login/password");
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

//         <h2 className="auth-heading">Welcome back</h2>
//         <p className="auth-subheading">Enter your email to continue</p>

//         <div className="auth-input-group">
//           <label className="auth-label">Email</label>
//           <input
//             className="auth-input"
//             placeholder="you@example.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleNext()}
//             type="email"
//             autoComplete="email"
//           />
//         </div>

//         <button className="auth-btn-primary" onClick={handleNext}>
//           Continue
//         </button>

//         <div className="auth-divider">
//           <div className="auth-divider-line" />
//           <span className="auth-divider-text">OR</span>
//           <div className="auth-divider-line" />
//         </div>

//         <p className="auth-footer">
//           Don't have an account?{" "}
//           <span
//             className="auth-footer-link"
//             onClick={() => navigate("/signup")}
//           >
//             Sign up free
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function LoginEmailPage() {
//   const [email, setEmail] = useState("");
//   const navigate = useNavigate();

//   function handleNext() {
//     if (!email) {
//       alert("Please enter email");
//       return;
//     }

//     localStorage.setItem("login_email", email);

//     navigate("/login/password");
//   }

//   return (
//     <div style={{ padding: 40 }}>
//       <h2>Login</h2>

//       <input
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />

//       <button onClick={handleNext}>Next</button>

//       <p style={{ marginTop: 20 }}>
//         Don't have an account?{" "}
//         <span
//           style={{ color: "blue", cursor: "pointer" }}
//           onClick={() => navigate("/signup")}
//         >
//           Sign up
//         </span>
//       </p>
//     </div>
//   );
// }
