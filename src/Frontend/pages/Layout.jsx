import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";
import { Login } from "../components/Login.jsx";
import { Signup } from "../components/Signup.jsx";
import MessageToast from "../components/MessageToast.jsx"; // Importar el componente de notificación

export const Layout = () => {
  return (
    <>
      <Navbar />
      <Login loginModal="loginModal" />
      <Signup signupModal="signupModal" />
      <main>
        {/* Mostrar el mensaje global de manera persistente sobre todo el contenido */}
        <MessageToast />
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
