import { useState } from "react";
import styles from "../Styles/SearchBar.module.css";

function SearchBar({ onSearch }) {
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    onSearch(value, query);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(city, value);
  };

  return (
    <div className={`${styles['search-container']} ${query ? styles.focused : ''}`}>
      {/* <select
        className={styles['search-select']}
        value={city}
        onChange={handleCityChange}
      >
        <option value="">All Cities</option>
        <option value="Hyderabad">Hyderabad</option>
        <option value="Bangalore">Bangalore</option>
        <option value="Mumbai">Mumbai</option>
        <option value="Chennai">Chennai</option>
        <option value="Pune">Pune</option>
      </select> */}

      <input
        type="text"
        placeholder="Search location (e.g. Madhapur, Hitech City...)"
        className={styles['search-input']}
        value={query}
        onChange={handleInputChange}
      />
    </div>
  );
}

export default SearchBar;
