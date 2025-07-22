// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      {" "}
      {/* AuthProvider en premier */}
      {/* <SocketProvider> */}
      <App />
      {/* </SocketProvider> */}
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
