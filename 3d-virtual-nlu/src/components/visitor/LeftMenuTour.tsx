import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/leftMenuTour.module.css";
import { FaSearch } from "react-icons/fa";
import { AppDispatch, RootState } from "../../redux/Store";
import { RefObject, useEffect, useRef, useState } from "react";
import {
  fetchMasterNodes,
  resetNodes,
  setDefaultNode,
} from "../../redux/slices/DataSlice";
import { transformUrlToThumbnail } from "../../utils/getCloudinaryURL";
import { GoPin } from "react-icons/go";
import { BiPin, BiSolidPin } from "react-icons/bi";
import { FaCheck } from "react-icons/fa6";

interface LeftMenuProps {
  imageRef: React.RefObject<
    Record<string, { img: HTMLImageElement; objectUrl: string }>
  >;
  setIsMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuVisible: boolean;
  setIsMenuPin: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuPin: boolean;
  nodeId: number;
}

const LeftMenuTour = ({
  imageRef,
  setIsMenuVisible,
  isMenuVisible,
  isMenuPin,
  setIsMenuPin,
  nodeId,
}: LeftMenuProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const listMasterNode = useSelector(
    (state: RootState) => state.data.masterNodes
  );

  const [searchTerm, setSearchTerm] = useState("");
  const filteredNodes = listMasterNode.filter((node) =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const limit = 7;

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
    } else {
      setPage(-1);
    }
  }, [isMenuVisible]);

  useEffect(() => {
    // if (isMenuVisible) {
    console.log("Fetching nodes for page:", page);
    loadNodes();
    // }
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

  const viewHistory = sessionStorage.getItem("view-history");
  const viewHistoryList = viewHistory ? JSON.parse(viewHistory) : [];

  return (
    <div className={`${styles.left_menu}`}>
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

        <div
          className={styles.pin_header}
          onClick={() => setIsMenuPin((prev) => !prev)}
        >
          {isMenuPin ? <BiSolidPin /> : <BiPin />}
        </div>
      </div>
      <ul
        ref={scrollRef}
        onScroll={handleScroll}
        className={styles.master_container}
      >
        {filteredNodes.map((node) => {
          const imgUrl = transformUrlToThumbnail(node.url);

          return (
            <li
              key={node.id}
              className={styles.node}
              style={{
                backgroundImage: `url(${
                  imageRef.current[node.id]?.objectUrl || imgUrl
                })`,
                filter:
                  node.id === nodeId ? "brightness(1.3)" : "brightness(0.6)",
                pointerEvents: node.id === nodeId ? "none" : "auto",
              }}
              onClick={() => handleSelectNode(node.id)}
            >
              <span className={styles.nodeName}>{node.name}</span>
              {viewHistoryList.includes(node.id) && (
                <span className={styles.visited}>
                  <FaCheck />
                </span>
              )}
            </li>
          );
        })}
        {loading && <li className={styles.loading}>Đang tải...</li>}
      </ul>
    </div>
  );
};

export default LeftMenuTour;
