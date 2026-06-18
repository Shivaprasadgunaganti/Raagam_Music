import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, isGuest } = useAuth();

<<<<<<< HEAD
  

=======
>>>>>>> 366ac19e0f540c59651a558daf59182898b65349
  if (loading) return null;

  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
