// import { IoChevronBack } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";

// export default function SettingsPage() {
//   const nav = useNavigate();

//   return (
//     <main className="settings-page page-safe">
//       <header className="settings-header">
//         <button onClick={() => nav(-1)}>
//           <IoChevronBack />
//         </button>

//         <h1>Settings</h1>
//       </header>
//     </main>
//   );
// }

import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import SettingsList from "../components/settings/SettingsList";
import "../styles/settings.css";
import SEO from "../components/SEO";

export default function SettingsPage() {
  const nav = useNavigate();

  return (
    <main className="settings-page page-safe">
      {/* seo */}
        <SEO
      title="Settings | MyRaagam"
      description="Manage your MyRaagam settings."
      robots="noindex, nofollow"
    />
      <header className="settings-header">
        <button
          className="settings-back-btn"
          onClick={() => nav(-1)}
        >
          <IoChevronBack />
        </button>

        <h1>Settings</h1>
      </header>

      <SettingsList />
    </main>
  );
}