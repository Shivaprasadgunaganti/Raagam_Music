import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");

  const showToast = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {message && (
        <div className="global-toast">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}