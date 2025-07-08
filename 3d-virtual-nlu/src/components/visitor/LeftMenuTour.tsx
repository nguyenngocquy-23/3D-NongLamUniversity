import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/leftMenuTour.module.css";
import { FaSearch } from "react-icons/fa";
import { AppDispatch, RootState } from "../../redux/Store";
import {
  fetchMasterNodes,
  resetNodes,
  setDefaultNode,
} from "../../redux/slices/DataSlice";
import { useEffect, useRef, useState } from "react";

interface LeftMenuProps {
  isMenuVisible: boolean;
}

const LeftMenuTour = ({ isMenuVisible }: LeftMenuProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const listMasterNode = useSelector(
    (state: RootState) => state.data.masterNodes
  );

  const [searchTerm, setSearchTerm] = useState("");
  const filteredNodes = listMasterNode.filter((node) =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [page, setPage] = useState(-1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const limit = 6;

  const scrollRef = useRef<HTMLUListElement>(null);
  const scrollPositionRef = useRef<number>(0);

  const loadNodes = async () => {
    console.log("Loading nodes for page:", page, loading, hasMore);
    if (loading || !hasMore) return;

    setLoading(true);
    const response = await dispatch(fetchMasterNodes({ page, limit })).unwrap();
    if (response.length < limit) setHasMore(false);
    setLoading(false);
  };

  useEffect(() => {
    if (isMenuVisible) {
      dispatch(resetNodes());
      setPage(0);
    }else{
      setPage(-1);
    }
  }, [isMenuVisible]);

  useEffect(() => {
    if (isMenuVisible) {
      console.log("Fetching nodes for page:", page);
      loadNodes();
    }
  }, [page]);

  const handleScroll = () => {
    const list = scrollRef.current;
    if (!list || !hasMore || loading) return;

    scrollPositionRef.current = list.scrollTop;

    const { scrollTop, scrollHeight, clientHeight } = list;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setPage((prev) => prev + 1); // tăng page sẽ gọi useEffect → loadNodes
    }
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    const timeout = setTimeout(() => {
      scrollRef.current!.scrollTop = scrollPositionRef.current;
    }, 50);
    return () => clearTimeout(timeout);
  }, [listMasterNode.length]);

  const handleSelectNode = (id: number) => {
    const activeNode = listMasterNode.find((h) => h.id === id);
    dispatch(setDefaultNode(activeNode));
  };

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
      <ul
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ height: "80vh", overflowY: "auto" }}
        className={styles.master_container}
      >
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
        {loading && <li className={styles.loading}>Đang tải...</li>}
        {/* {!hasMore && <li className={styles.end}>Đã hết dữ liệu</li>} */}
      </ul>
    </div>
  );
};

export default LeftMenuTour;
