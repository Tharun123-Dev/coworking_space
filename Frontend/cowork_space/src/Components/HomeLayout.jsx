import Home from "../Pages/Home";
import Feature from "../Pages/Features";
import WorkspaceTabs from "../Components/WorkspaceTabs";
import BusinessSection from "../Improved/BusinessSection";
import ContactModal from "../Improved/ContactModal";
import RightSpace from "../Improved/RightSpace";
import WorkspaceFeature from "../Pages/WorkspaceFeature";
import Cities from "../Pages/Cities";
import AISeats from "../Components/AISeats";
import Reviews from "../Pages/Reviews";
import AddReview from "../Pages/AddReview";

import { useState } from "react";
import Testimonials from "../Pages/Testimonials";
import HydCards from "../Pages/HyderabadWorkspaces.jsx";
import Compaines from "../Pages/Companies.jsx"

function HomeLayout() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <Home />
      <Compaines/>
      <HydCards/>
      <Feature />
      <WorkspaceTabs />
      <BusinessSection openModal={setSelected} />
      <ContactModal selected={selected} setSelected={setSelected} />
      <RightSpace openModal={setSelected} />
      <WorkspaceFeature />
      {/* <Cities /> */}
      {/* <AISeats /> */}
      <Reviews />
      <Testimonials/>
      <AddReview />
      
    </>
  );
}

export default HomeLayout;