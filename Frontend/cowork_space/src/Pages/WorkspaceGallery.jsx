import React from "react";
import { useParams } from "react-router-dom";
import styles from "../Styles/Gallery.module.css";

//  Manually define image paths (from public folder)
const images = [
  "/g1.webp",
  "/g2.webp",
  "/g3.jpg",
  "/g4.avif",
  "/g5.webp",
  "/g6.jpg",
  "/g7.jpg",
  "/g8.jpg",
  "/g9.avif",
  "/g10.jpg",
  "/g11.jpg",
  "/g12.jpeg",
  "/g13.jpg",
  "/g14.webp",
  "/g15.jpg",
  "/g16.jpg",
  "/g17.jpg",
  "/g18.jpeg",
  "/g19.webp",
  "/g20.webp",
  "/g21.webp",
  "/g22.avif",
  "/g23.jpg",
  "/g24.webp",
  "/g25.avif",
  "/g26.webp",
  "/main.jpg",
  "/vie6.jpg",
  "/view1.jpg",
  "/view2.jpg",
];

//  Generate Data
const generateData = (type) => {
  return images.map((img, i) => ({
    id: i + 1,
    name: `${type} Space ${i + 1}`,
    location: ["Hyderabad", "Bangalore", "Delhi"][i % 3],
    price: `₹${500 + i * 20}/day`,
    image: img,
  }));
};

function WorkspaceGallery() {
  const { type } = useParams();
  const data = generateData(type);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>{type.toUpperCase()} SPACES</h1>

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