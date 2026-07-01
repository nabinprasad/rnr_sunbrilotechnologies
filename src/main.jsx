import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import { EventProvider } from "./components/context/EventContext.jsx";
import AuthProvider from "./components/context/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
     <AuthProvider>
    <EventProvider>
      <App />
      <Toaster position="top-right" />
    </EventProvider>
    </AuthProvider>
  </BrowserRouter>
);