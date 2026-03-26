import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AudioProvider } from "./context/AudioContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
   <ToastProvider>
    <AuthProvider>
      <AudioProvider>
        <App />
      </AudioProvider>
    </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
