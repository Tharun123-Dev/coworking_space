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
import Payment from "./Pages/Payment";
import Feature from "./Pages/Features";
import Discount from "./Pages/Discount";
import WorkspaceFeature from "./Pages/WorkspaceFeature";
import Contact from "./Pages/Contact";
import Cities from "./Pages/Cities";
import View from "./Pages/View";
import Amenities from "./Pages/Amenities";
import WorkspaceGallery from "./Pages/WorkspaceGallery"

function App() {
  return (
    <BrowserRouter>
      <Navbar /> 
      <Discount/>
      <Routes>
        
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact/>} />
      <Route path="/view" element={<View />} /> 
        <Route path="/auth" element={<Auth />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/details/:id" element={<Details/>}/>
        <Route path="/payment/:id" element={<Payment/>} />
        <Route path="/amenities" element={<Amenities />} />
        <Route path="/workspaces/:type" element={<WorkspaceGallery />} />
      </Routes>
      <Feature/>
      <WorkspaceTabs/>
      <WorkspaceFeature/>
      <Cities/>
      <Footer/>
    </BrowserRouter>
  );
}

export default App;