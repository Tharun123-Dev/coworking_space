import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function AdminLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      {/* No Footer & No Carousel */}
    </>
  );
}

export default AdminLayout;