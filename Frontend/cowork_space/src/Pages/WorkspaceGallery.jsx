import React from "react";
import { useParams } from "react-router-dom";
import styles from "../Styles/Gallery.module.css";

const generateData = (type) => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `${type} Space ${i + 1}`,
    location: ["Hyderabad", "Bangalore", "Delhi"][i % 3],
    price: `₹${500 + i * 10}/day`,
    image: `https://picsum.photos/300/200?random=${i + 1}`,
  }));
};

function WorkspaceGallery() {
  const { type } = useParams();
  const data = generateData(type);

  return (
    <div className={styles.container}>
      <h1>{type.toUpperCase()} SPACES</h1>

      <div className={styles.grid}>
        {data.map((item) => (
          <div key={item.id} className={styles.card}>
            <img src={item.image} alt={item.name} />

            <div className={styles.info}>
              <h3>{item.name}</h3>
              <p>{item.location}</p>
              <span>{item.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkspaceGallery;