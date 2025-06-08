// components/AddressAutoComplete.jsx
import { AutoComplete } from "antd";
import { useState } from "react";

export default function AddressAutoComplete({ value, onChange, placeholder }) {
  const [options, setOptions] = useState([]);

  const handleSearch = async (text) => {
    if (!text) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          text
        )}`
      );
      const data = await res.json();

      setOptions(
        data.map((item) => ({
          value: item.display_name,
        }))
      );
    } catch (err) {
      console.error("Erreur lors de la récupération d'adresse", err);
    }
  };

  return (
    <AutoComplete
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      options={options}
      placeholder={placeholder}
      style={{ width: "100%" }}
    />
  );
}
