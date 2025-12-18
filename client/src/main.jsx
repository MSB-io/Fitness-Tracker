import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {" "}
    {/*StrictMode helps identify potential problems in an application*/}
    <BrowserRouter>
      {" "}
      {/*Enables client-side routing*/}
      <AuthProvider>
        {" "}
        {/*Provides authentication context to the app*/}
        <App /> {/*Main application component*/}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
