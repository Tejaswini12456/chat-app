import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "../context/Authcontext.jsx";
import { Chatprovider } from "../context/Chatcontext.jsx";




createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <Chatprovider>
        <App />
     </Chatprovider>
    </AuthProvider>
  </BrowserRouter>
);
