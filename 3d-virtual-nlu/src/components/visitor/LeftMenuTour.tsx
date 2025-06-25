import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/leftMenuTour.module.css";
import { FaSearch } from "react-icons/fa";
import { AppDispatch, RootState } from "../../redux/Store";
import { fetchMasterNodes, setDefaultNode } from "../../redux/slices/DataSlice";
import { useEffect, useState } from "react";

interface LeftMenuProps {
  isMenuVisible: boolean;
}

const LeftMenuTour = ({ isMenuVisible }: LeftMenuProps) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const listMasterNode = useSelector(
    (state: RootState) => state.data.masterNodes
  );

  const [searchTerm, setSearchTerm] = useState("");
  const filteredNodes = listMasterNode.filter((node) =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (listMasterNode.length > 0) {
      setLoading(false);
    }
  }, [listMasterNode.length]);

  const handleSelectNode = (id: number) => {
    const activeNode = listMasterNode.find((h) => h.id === id);
    console.log("Selected Node:", activeNode);
    dispatch(setDefaultNode(activeNode));
  };

  // Trong render:
  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <div className={`${styles.left_menu} ${isMenuVisible ? styles.show : ""}`}>
      <div className={styles.header}>
        <h2>NLU Tour</h2>
        <div className={styles.search_box}>
          <input
            type="text"
            className={styles.input_seach}
            placeholder="Tên không gian.."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className={styles.searchBtn} />
        </div>
      </div>
      <ul className={styles.master_container}>
        {filteredNodes.map((node) => (
          <li
            key={node.id}
            className={styles.node}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${node.url})`,
            }}
            onClick={() => handleSelectNode(node.id)}
          >
            <span className={styles.nodeName}>{node.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftMenuTour;
