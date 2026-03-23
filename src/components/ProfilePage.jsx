import { supabase } from "../supabaseClient";
import { useAudio } from "../context/AudioContext";

export default function ProfilePage() {
  const { clearQueue } = useAudio();

  async function handleLogout() {
    await supabase.auth.signOut();

    clearQueue();
    localStorage.removeItem("audio_state_v1");

    window.location.href = "/login";
  }

  return (
    <div>
      <h2>Profile</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
