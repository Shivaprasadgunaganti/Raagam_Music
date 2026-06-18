import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// export default function ProtectedRoute({ children }) {
//   const { user, loading, isGuest  } = useAuth();

//   if (loading) return null;

//   // if (!user) {
//   //   return <Navigate to="/login" replace />;
//   // }

//   if (!user && !isGuest) {
//   return <Navigate to="/login" replace />;
// }

//   return children;
// }


export default function ProtectedRoute({ children }) {
  const { user, loading, isGuest } = useAuth();

  // console.log("ProtectedRoute", {
  //   user,
  //   loading,
  //   isGuest,
  // });

  if (loading) return null;

  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return children;
}