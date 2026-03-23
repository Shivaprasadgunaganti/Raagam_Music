import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAudio } from "../context/AudioContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { clearQueue } = useAudio();

  useEffect(() => {
    clearQueue();
    // localStorage.removeItem("audio_state_v1");
  }, []);

  // async function handleLogin() {
  //   const { data, error } = await supabase.auth.signInWithPassword({
  //     email,
  //     password,
  //   });

  //   if (error) {
  //     alert(error.message);
  //   } else {
  //     navigate("/");
  //   }
  // }
  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      navigate("/");
    }
  }

  async function handleSignup() {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    console.log("SIGNUP:", data, error);

    if (error) alert(error.message);
    else alert("Account created successfully!");
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup}>Sign Up</button>
      <button onClick={handleGoogleLogin}>Continue with Google</button>
    </div>
  );
}

// import { useState } from "react";
// import { supabase } from "../supabaseClient";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   async function handleLogin() {
//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) alert(error.message);
//   }

//   async function handleSignup() {
//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (error) alert(error.message);
//   }

//   return (
//     <div style={{ padding: 40 }}>
//       <h2>Login</h2>
//       <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
//       <input
//         type="password"
//         placeholder="Password"
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <button onClick={handleLogin}>Login</button>
//       <button onClick={handleSignup}>Sign Up</button>
//     </div>
//   );
// }
