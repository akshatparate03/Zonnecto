import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// StrictMode hataya - WebSocket double connect prevent karne ke liye
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
