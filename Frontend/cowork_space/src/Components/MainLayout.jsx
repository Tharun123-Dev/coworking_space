import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FooterCarousel from "../Pages/FooterCarousel";

function Layout() {
  const location = useLocation();

  // ❗ hide footer for MyOrders page
  const hideFooter = location.pathname === "/my-orders";

  return (
    <>
      <Navbar />
      <Outlet />

      {!hideFooter && (
        <>
          <FooterCarousel />
          <Footer />
        </>
      )}
    </>
  );
}

export default Layout;