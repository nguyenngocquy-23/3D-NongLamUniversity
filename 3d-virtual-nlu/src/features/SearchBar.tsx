import React from "react";
import styles from '../styles/common/navigateBar.module.css'

interface SearchBarProps {
  placeholder?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Tìm kiếm...", searchTerm, onSearchChange }) => {
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder={placeholder}
      className={styles.search_input}
    />
  );
};

export default SearchBar;
