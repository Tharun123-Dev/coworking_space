import SearchBar from "../Components/SearchBar";
import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/Home.module.css";
import Reveal from "../Pages/Reveal"
// import emailjs from "@emailjs/browser";

function Home() {
  const [workspaces, setWorkspaces] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

//email purpose
const [form, setForm] = useState({
  name: "",
  email: "",
  phone: "",
  city: "",
  message:""
});

const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};
console.log(form);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.name || !form.email) {
    alert("Name & Email required");
    return;
  }

  try {
    await axiosInstance.post("leads/add/", form);

    alert("Request submitted 🎉");

    setForm({
      name: "",
      email: "",
      phone: "",
      city: "",
      message: ""
    });

  } catch (err) {
    if(console.log(err.response?.data)){
    alert(err.response.data.error)}
        else if(err.response.data.email) {
    alert("Email already exists");
  }
    else {
    alert("some thing went wrong");
  }
};
};
  //  Fetch backend data
  useEffect(() => {
    axiosInstance.get("workspaces/")
      .then((res) => {
        setWorkspaces(res.data);
        setFilteredData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  // Cart data
  const handleAddToCart = (workspaceId) => {
    axiosInstance.post("cart/add/", {
      workspace_id: workspaceId,
      duration: 1
    })
    .then(() => {
      alert("Added to cart ");
    })
    .catch(() => {
      alert("Please login first ");
    });
  };

  // Filter logic
  const handleSearch = (city, query) => {
    let data = workspaces;

    if (city) {
      data = data.filter(item =>
        item.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (query) {
      data = data.filter(item =>
        item.location.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredData(data);
  };

  const handleBookNow = (item) => {
    const token = localStorage.getItem("access");
    if (!token) {
      alert("Please login first ");
      window.location.href = "/auth";
    } else {
      handleAddToCart(item.id);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading workspaces...</div>;
  }

  return (
    <div className={styles.home}>
      {/*  HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <Reveal>
            <h1 className={styles.heroTitle}>
              Explore India's Finest <span>Coworking Spaces</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Flexible offices for startups, teams & enterprises
            </p>
            </Reveal>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span>500+</span>
                <small>Spaces</small>
              </div>
              <div className={styles.stat}>
                <span>10+</span>
                <small>Cities</small>
              </div>
              <div className={styles.stat}>
                <span>50K+</span>
                <small>Happy Users</small>
              </div>
            </div>
 
          </div>
           <Reveal>
<form onSubmit={handleSubmit}>

  <div className={styles.heroForm}>
   

    <h3>Get in Touch</h3>

    <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
    <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
    <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />

    <select name="city" value={form.city} onChange={handleChange}>
      <option value="">Select City</option>
      <option>Hyderabad</option>
      <option>Bangalore</option>
      <option>Delhi</option>
    </select>
   <textarea
  name="message"
  value={form.message}
  placeholder="Your message"
  onChange={handleChange}
  style={{
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "12px",
    fontFamily: "Arial, sans-serif",
    resize: "none",
    minHeight: "80px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease"
  }}
></textarea>

    <button type="submit">
      Request a Callback
    </button>
    
  </div>
  
</form>
  </Reveal>
        </div>
      </section>
      

      {/* SEARCH BAR */}
      <section className={styles.searchSection}>
        <SearchBar onSearch={handleSearch} />
      </section>

      {/* WORKSPACE CARDS */}
      <section className={styles.workspacesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Discover Workspaces by City</h2>
          <div className={styles.grid}>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <div 
                  key={item.id} 
                  className={styles.card}
                  onClick={() => console.log('View details', item.id)}
                >
                  <div className={styles.cardImageContainer}>
                    <Reveal>
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400"} 
                      alt={item.name}
                      className={styles.cardImage}
                    />
                    </Reveal>
                    <div className={styles.rating}>
                      ★ {item.rating || 4.8} (120)
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <Reveal>
                    <h3 className={styles.cardTitle}>{item.name}</h3>
                    </Reveal>
                    <Reveal>
                    <p className={styles.cardLocation}>{item.location}</p>
                    </Reveal>
                    <Reveal>
                    <p className={styles.cardCity}>{item.city}</p>
                    </Reveal>
                    
                    <div className={styles.cardPrice}>
                      <span className={styles.price}>₹{item.price}</span>
                      <span className={styles.duration}>/day</span>
                    </div>

                    <div className={styles.cardActions}>
                    


    <div className={styles.container}>
      
      {/* BUTTON */}
      <Reveal>
      <button
        className={styles.btnSecondary}
        onClick={() => setShowInfo(true)}
      >
        Know More
      </button>
      </Reveal>

      {/* POPUP */}
      {showInfo && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            
            {/* BACK BUTTON */}
            <Reveal>
            <button
              className={styles.backBtn}
              onClick={() => setShowInfo(false)}
            >
              ← Back
            </button>
            </Reveal>

            {/* CONTENT */}
            <Reveal>
            <h2>Workspace Details</h2>
            </Reveal>
            <p>
              Discover premium coworking spaces designed for productivity,
              collaboration, and comfort. Enjoy high-speed internet, modern
              interiors, meeting rooms, and flexible pricing options.
            </p>

            <ul>
              <li>✔ High-speed WiFi</li>
              <li>✔ Meeting Rooms</li>
              <li>✔ 24/7 Access</li>
              <li>✔ Comfortable Seating</li>
              <li>✔ Prime Locations</li>
            </ul>

          </div>
        </div>
      )}
    </div>




                    
                      <button 
                        className={styles.btnPrimary}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(item);
                        }}
                      >
                        Book Now
                      </button>
                    
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noData}>
                <Reveal>
                <h2>No Workspaces Found(Wait a Minute..! Its Loading Sometimes....)</h2>
                </Reveal>
                <p>Try different search terms</p>
              </div>
            )}
          </div>
        </div>

      </section>
    </div>
    
  );
}

export default Home;
