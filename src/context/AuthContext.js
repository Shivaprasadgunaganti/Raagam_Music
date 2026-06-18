import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(
    localStorage.getItem("raagam_guest") === "true",
  );

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
      // setUser(session?.user ?? null);
      const loggedUser = session?.user ?? null;

      setUser(loggedUser);

      if (loggedUser) {
        localStorage.removeItem("raagam_guest");
        setIsGuest(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // continue as guest
  function continueAsGuest() {
    localStorage.setItem("raagam_guest", "true");
    setIsGuest(true);
  }

  function exitGuestMode() {
    localStorage.removeItem("raagam_guest");
    setIsGuest(false);
  }

  // 
  async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
}

  return (
    // <AuthContext.Provider value={{ user, loading }}>
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        continueAsGuest,
        exitGuestMode,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
