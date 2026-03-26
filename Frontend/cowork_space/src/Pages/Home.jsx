import SearchBar from "../Components/SearchBar";
import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/Home.module.css";

function Home() {
  const [workspaces, setWorkspaces] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

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
      alert("Please login first ❌");
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
            <h1 className={styles.heroTitle}>
              Explore India's Finest <span>Coworking Spaces</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Flexible offices for startups, teams & enterprises
            </p>
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

          <div className={styles.heroForm}>
            <h3>Get in Touch</h3>
            <input placeholder="Name" />
            <input placeholder="Email" />
            <input placeholder="Phone" />
            <select>
              <option>Select City</option>
              <option>Hyderabad</option>
              <option>Bangalore</option>
              <option>Delhi</option>
            </select>
            <button>Submit</button>
          </div>
        </div>
      </section>

      {/* SEARCH BAR */}
      <section className={styles.searchSection}>
        <SearchBar onSearch={handleSearch} />
      </section>

      {/* WORKSPACE CARDS */}
      <section className={styles.workspacesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Featured Workspaces</h2>
          <div className={styles.grid}>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <div 
                  key={item.id} 
                  className={styles.card}
                  onClick={() => console.log('View details', item.id)}
                >
                  <div className={styles.cardImageContainer}>
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400"} 
                      alt={item.name}
                      className={styles.cardImage}
                    />
                    <div className={styles.rating}>
                      ★ {item.rating || 4.8} (120)
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{item.name}</h3>
                    <p className={styles.cardLocation}>{item.location}</p>
                    <p className={styles.cardCity}>{item.city}</p>
                    
                    <div className={styles.cardPrice}>
                      <span className={styles.price}>₹{item.price}</span>
                      <span className={styles.duration}>/day</span>
                    </div>

                    <div className={styles.cardActions}>
                      <button className={styles.btnSecondary}>Know More</button>
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
                <h2>No Workspaces Found</h2>
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
