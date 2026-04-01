import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/Details.css"

function Details({openModal}) {
  const { id } = useParams();
  const [data, setData] = useState(null);

  const navigate = useNavigate();
  

  useEffect(() => {
    axiosInstance.get("workspaces/categories/")
      .then(res => {
        const item = res.data.find(i => i.id == id);
        setData(item);
      });
  }, []);

const handleBook = () => {
  const token = localStorage.getItem("access");

  // CHECK AVAILABILITY
  if (!data.is_available) {
    alert("Not Available Now");
    return;
  }

  // LOGIN CHECK
  if (!token) {
    alert("Please login first");
    navigate("/auth");
    return;
  }

  // OPEN CONTACT MODAL (NEW)
  openModal(data.name);
};

  if (!data) return <h2>Loading...</h2>;

  return (
<div className="details-container">

  <img src={data.image} className="details-image" />
  <h4>A coworking space platform is designed to provide flexible, modern, and fully equipped work environments for freelancers, startups, remote workers, and enterprises.
It allows users to choose different workspace types based on their needs, duration, and budget.
The platform offers seamless booking, real-time availability, and premium amenities to ensure productivity and comfort.
Day Pass is a perfect solution for professionals who need a workspace for a short duration.
It allows users to access coworking spaces on a daily basis without long-term commitments.
This option is ideal for freelancers, travelers, and remote workers.
Users can choose any available seat and start working instantly.
It provides flexibility in location and timing.
Day Pass eliminates the need for monthly subscriptions.
It is cost-effective for occasional users.
Users get access to high-speed internet.
Comfortable seating and modern interiors enhance productivity.
Networking opportunities are available with other professionals.
Day Pass users can use common areas and lounges.
Refreshments like tea and coffee are included.
Printing and scanning facilities are available.
Security and surveillance ensure a safe environment.
Users can switch locations easily.
It is suitable for students and independent professionals.
Day Pass helps maintain work-life balance.
No long-term contracts are required.
Easy booking through website or app.
Real-time availability ensures convenience.
</h4>

  <h1 className="details-title">{data.name}</h1>
  <p className="details-description">{data.description}</p>

  <div className="pricing">
    <p>Hourly: ₹{data.hourly_price}</p>
    <p>Daily: ₹{data.daily_price}</p>
    <p>Monthly: ₹{data.monthly_price}</p>
  </div>

  <button className="book-btn" onClick={handleBook}
  disabled={!data?.is_available}
  >
    {data?.is_available ? "Book" :"Not Available"}
  </button>

</div>
  );
}

export default Details;