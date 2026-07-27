import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AudioProvider } from "./context/AudioContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { SyncProvider } from "./context/SyncContext";
import { register } from "./serviceWorkerRegistration";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
 
    {/* <ToastProvider>
      <SyncProvider>
        <AuthProvider>
          <AudioProvider>
            <App />
          </AudioProvider>
        </AuthProvider>
      </SyncProvider>
    </ToastProvider> */}
    <ThemeProvider>
        <ToastProvider>
      <SyncProvider>
        <AuthProvider>
          <AudioProvider>
            <App />
          </AudioProvider>
        </AuthProvider>
      </SyncProvider>
    </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
register();