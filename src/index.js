import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AudioProvider } from "./context/AudioContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { SyncProvider } from "./context/SyncContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <ToastProvider>
    <AuthProvider>
      <AudioProvider>
        <App />
      </AudioProvider>
    </AuthProvider>
    </ToastProvider> */}
    <ToastProvider>
      <SyncProvider>
        <AuthProvider>
          <AudioProvider>
            <App />
          </AudioProvider>
        </AuthProvider>
      </SyncProvider>
    </ToastProvider>
  </React.StrictMode>,
);
