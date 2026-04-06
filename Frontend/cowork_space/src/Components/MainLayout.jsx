
import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer";
import FooterCarousel from "../Pages/FooterCarousel";
function Layout(){
    return(
        <>
        <Navbar/>
        <Outlet/>
        <FooterCarousel/>
        <Footer/>

        </>
    );
}
export default Layout;