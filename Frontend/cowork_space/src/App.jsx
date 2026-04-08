import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./Components/MainLayout";
import HomeLayout from "./Components/HomeLayout";

import Auth from "./Pages/Auth";
import Cart from "./Pages/Cart";
import Booking from "./Pages/Booking";
import AdminDashboard from "./Pages/AdminDashboard";
import Details from "./Pages/Details";
import Contact from "./Pages/Contact";
import Amenities from "./Pages/Amenities";
import WorkspaceGallery from "./Pages/WorkspaceGallery";
import View from "./Pages/View";

import AdminLeads from "./Pages/Leads";
import AdminUsers from "./Pages/AdminUsers";
import AdminLeadss from "./Improved/AdminLeadss";
import Enterprise from "./Improved/Enterprise";
import AdminEnterprise from "./Improved/AdminEnterprise";

import CreateOwner from "./Pages/CreateOwner";
import OwnerDashboard from "./Pages/OwnerDashboard";
import OwnerBookings from "./Pages/OwnerBookings";
import AdminBookings from "./Pages/AdminBookings";
import MyOrders from "./Pages/MyOrders";
import ScrollToTop from "./Pages/ScrollToTop";
import SpecialContact from "./Pages/SpecialContact";
import OwnerLeads from "./Pages/OwnerLeads";
import AdminSpecialLeads from "./Pages/AdminSpecialLeads";


function App() {
  return (
    <BrowserRouter>
    <ScrollToTop/>

      <Routes>

        <Route element={<MainLayout />}>

          <Route path="/" element={<HomeLayout />} />

          <Route path="/contact" element={<Contact />} />
          <Route path="/view" element={<View />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/booking" element={<Booking />} />

          <Route path="/details/:id" element={<Details />} />


          <Route path="/amenities" element={<Amenities />} />
          <Route path="/Enterprise" element={<Enterprise />} />
          
          <Route path="/workspaces/:type" element={<WorkspaceGallery />} />

          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-leads" element={<AdminLeads />} />
          <Route path="/admin-leadss" element={<AdminLeadss />} />
          <Route path="/admin-Enterprise" element={<AdminEnterprise />} />
          <Route path="/admin-users" element={<AdminUsers />} />
          <Route path="/admin-bookings" element={<AdminBookings />} />

          <Route path="/create-owner" element={<CreateOwner />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/owner-bookings" element={<OwnerBookings />} />

          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/special-contact/:id" element={<SpecialContact />} />
          <Route path="/owner-leads" element={<OwnerLeads/>} />
            <Route path="/owner-special-leads" element={<AdminSpecialLeads/>} />

           
        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;