import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Auth from "./Pages/Auth";
import Navbar from "./Components/Navbar";
import Cart from "./Pages/Cart";
import Booking from "./Pages/Booking";
import AdminDashboard from "./Pages/AdminDashboard";
import Footer from "./Components/Footer";
import Details from "./Pages/Details"
import WorkspaceTabs from "./Components/WorkspaceTabs";

import Feature from "./Pages/Features";
import Discount from "./Pages/Discount";
import WorkspaceFeature from "./Pages/WorkspaceFeature";
import Contact from "./Pages/Contact";
import Cities from "./Pages/Cities";
import { useState } from "react";

import Amenities from "./Pages/Amenities";
import WorkspaceGallery from "./Pages/WorkspaceGallery"
import FooterCarousel from "./Pages/FooterCarousel";

import AISeats from "./Components/AISeats";
import View from "./Pages/View";
import Reviews from "./Pages/Reviews";
import AddReview from "./Pages/AddReview"
import ScrollToTop from "./Pages/ScrollToTop";
import AdminLeads from "./Pages/Leads";
import AdminUsers from "./Pages/AdminUsers";
import BusinessSection from "./Improved/BusinessSection";
import ContactModal from "./Improved/ContactModal";
import AdminLeadss from "./Improved/AdminLeadss";
import RightSpace from "./Improved/RightSpace";


function App() {
  const [selected, setSelected] = useState(null);
  return (
    <BrowserRouter>
      <Navbar /> 
      <Discount/>
      <Routes>
        
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/view" element={<View/>} /> 
        <Route path="/auth" element={<Auth />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/details/:id" element={<Details openModal={setSelected} />} />

        <Route path="/amenities" element={<Amenities />} />
        <Route path="/workspaces/:type" element={<WorkspaceGallery />} />
        <Route path="/recommend" element={<AISeats/>} />
          <Route path="/admin-leads" element={<AdminLeads/>} />
          
          <Route path="/admin-leadss" element={<AdminLeadss/>} />
                    <Route path="/admin-users" element={<AdminUsers/>} />

      </Routes>
      <Feature/>
      <WorkspaceTabs/>
      <BusinessSection openModal={setSelected} />
      <ContactModal selected={selected} setSelected={setSelected} />
        <RightSpace openModal={setSelected} />

      <WorkspaceFeature/>
      <Cities/>
       <AISeats/>
        <ScrollToTop/>
          <Reviews/>
          <AddReview/>
          <FooterCarousel/>
      <Footer/>
  
    </BrowserRouter>
  );
}

export default App;