import { useNavigate } from "react-router-dom";
import useOnlineStatus from "../hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const nav = useNavigate();

  if (isOnline) return null;

  return (
    <div
      style={{
        background: "#ff9800",
        color: "#000",
        textAlign: "center",
        padding: "8px",
        fontSize: "14px",
        fontWeight: "600",
        position: "sticky",
        top: 0,
        zIndex: 9999,
      }}
    >
      ✨ Offline Mode — Your music stays with you{" "}
    </div>
  );
}
