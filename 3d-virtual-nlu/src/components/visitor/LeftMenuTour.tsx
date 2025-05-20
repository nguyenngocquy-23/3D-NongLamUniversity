import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/leftMenuTour.module.css";
import { FaSearch } from "react-icons/fa";
import { AppDispatch, RootState } from "../../redux/Store";
import { fetchMasterNodes } from "../../redux/slices/DataSlice";
import { useEffect, useState } from "react";

interface LeftMenuProps {
  isMenuVisible: boolean;
}

const LeftMenuTour = ({ isMenuVisible }: LeftMenuProps) => {
  {
    {
      /* Menu bên trái */
    }
  }
  const dispatch = useDispatch<AppDispatch>();
  const listMasterNode = useSelector(
    (state: RootState) => state.data.masterNodes
  );
  console.log("listMasterNode", listMasterNode);
  useEffect(() => {
    dispatch(fetchMasterNodes());
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState("");
  const filteredNodes = listMasterNode.filter((node) =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${styles.left_menu} ${isMenuVisible ? styles.show : ""}`}>
      <div className={styles.header}>
        <h2>NLU Tour</h2>
        <div className={styles.searchBox}>
          <input type="text" className={styles.inputSeach} placeholder="Tên không gian.." 
            onChange={(e) => setSearchTerm(e.target.value)}/>
          <FaSearch className={styles.searchBtn} />
        </div>
      </div>
      <ul>
        {filteredNodes.map((node) => (
          <li
            key={node.id}
            className={styles.node}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${node.url})`,
            }}
          >
            <span className={styles.nodeName}>{node.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftMenuTour;
