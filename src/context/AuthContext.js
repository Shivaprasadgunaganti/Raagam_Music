import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  

  // useEffect(() => {
  //   async function initAuth() {
  //     try {
  //       const {
  //         data: { session },
  //       } = await supabase.auth.getSession();

  //       setUser(session?.user ?? null);
  //     } catch (err) {
  //       console.error("Auth session error:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   initAuth();

  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange(async (event, session) => {
  //     const user = session?.user ?? null;
  //     setUser(user);

  //     if (event === "SIGNED_IN" && user) {
  //       await supabase.from("profiles").upsert({
  //         id: user.id,
  //         email: user.email,
  //         username: user.email.split("@")[0],
  //       });
  //     }
  //   });

  //   return () => subscription.unsubscribe();
  // }, []);

  useEffect(() => {
  async function init() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // ⭐ ALWAYS STOP LOADING
    }
  }

  init();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);

  

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setUser(data.session?.user ?? null);
//       setLoading(false);
//     });

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         setUser(session?.user ?? null);
//       }
//     );

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }
