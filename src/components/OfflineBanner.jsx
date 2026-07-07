import { useNavigate } from "react-router-dom";
import useOnlineStatus from "../hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const nav = useNavigate();

  if (isOnline) return null;

  return (
    // <div
    //   style={{
    //     background: "#ff9800",
    //     color: "#000",
    //     textAlign: "center",
    //     padding: "8px",
    //     fontSize: "14px",
    //     fontWeight: "600",
    //     position: "sticky",
    //     top: 0,
    //     zIndex: 9999,
    //   }}
    // >
    //   ✨ Offline Mode — Your music stays with you.
    //   {/* 📶 Offline Mode - Cached songs are available */}
    // </div>

//     <nav>
//   <div
//     style={{
//       background: "#ff9800",
//       color: "#000",
//       textAlign: "center",
//       padding: "8px",
//       fontSize: "14px",
//       fontWeight: "600",
//       position: "sticky",
//       top: 0,
//       zIndex: 9999,
//     }}
//   >
//     ✨ Offline Mode — Your music stays with you{" "}
//     <button
//       onClick={() => nav("/offline")}
//       style={{
//         marginLeft: "8px",
//         padding: "4px 10px",
//         border: "none",
//         borderRadius: "4px",
//         background: "#000",
//         color: "#fff",
//         cursor: "pointer",
//       }}
//     >
//       Click
//     </button>

//     {/* 📶 Offline Mode - Cached songs are available */}
//   </div>
// </nav>
<nav
  style={{
    position: "sticky",
    top: 0,
    zIndex: 9999,
  }}
>
  <div
    style={{
      background: "#ff9800",
      color: "#000",
      textAlign: "center",
      padding: "8px",
      fontSize: "14px",
      fontWeight: "600",
    }}
  >
    ✨ Offline Mode — Your music stays with you{" "}
    <button
      onClick={() => nav("/offline")}
      style={{
        marginLeft: "8px",
        padding: "4px 10px",
        border: "none",
        borderRadius: "4px",
        background: "#000",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      Click
    </button>
  </div>
</nav>
  );
}