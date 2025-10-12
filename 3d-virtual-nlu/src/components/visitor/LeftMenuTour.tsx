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
import { IoSearch } from "react-icons/io5";
import { useDebounce } from "../../hooks/useDebounce";
import { API_URLS } from "../../env";
import axios from "axios";

interface LeftMenuProps {
  imageRef: React.RefObject<
    Record<string, { img: HTMLImageElement; objectUrl: string }>
  >;
  setIsMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuVisible: boolean;
  setIsMenuPin: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuPin: boolean;
  nodeId: number;
  isMobile?: boolean;
}

const LeftMenuTour = ({
  imageRef,
  setIsMenuVisible,
  isMenuVisible,
  isMenuPin,
  setIsMenuPin,
  nodeId,
  isMobile,
}: LeftMenuProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const listMasterNode = useSelector(
    (state: RootState) => state.data.masterNodes
  );

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const limit = 7;

  const [nodeList, setNodeList] = useState<any[]>(listMasterNode);

  const scrollRef = useRef<HTMLUListElement>(null);
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    if (search.trim() === "" && isMobile === undefined) {
      setNodeList(listMasterNode);
    }else{
      setNodeList([])
    }
  }, [search]);

  useEffect(() => {
    if (listMasterNode && listMasterNode.length > 0) {
      setNodeList(listMasterNode);
    }
  }, [listMasterNode]);

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearch || debouncedSearch.trim() === "") return;
      const response = await axios.post(API_URLS.SEARCH_NODES, {
        searchKey: debouncedSearch,
      });
      setNodeList(response.data.data);
    };
    handleSearch();
  }, [debouncedSearch]);

  const loadNodes = async () => {
    if (isMobile || loading || !hasMore) return;

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
    loadNodes();
  }, [page]);

  const handleScroll = () => {
    const list = scrollRef.current;
    if (!list || !hasMore || loading) return;

    scrollPositionRef.current = list.scrollTop;

    const { scrollTop, scrollHeight, clientHeight } = list;
    if (scrollTop + clientHeight >= scrollHeight) {
      setPage((prev) => prev + 1);
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
    const activeNode = nodeList.find((h) => h.id === id);
    dispatch(setDefaultNode(activeNode));
  };

  const viewHistory = sessionStorage.getItem("view-history");
  const viewHistoryList = viewHistory ? JSON.parse(viewHistory) : [];

  return (
    <div className={`${styles.left_menu} ${isMobile ? styles.mobile : ""}`}>
      <div className={styles.header} style={{height: isMobile ? "auto" : "15vh"}}> 
        {isMobile ? (
          ""
        ) : (
          <h2 style={{ marginBottom: "0.5rem" }}>Danh sách Tour</h2>
        )}
        <div className={styles.search_box}>
          <label htmlFor="input" className={styles.label}>
            <IoSearch className={styles.search_icon} />
          </label>
          <input
            type="text"
            className={styles.input_seach}
            placeholder="Nhập tên tour.."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isMobile ? (
          ""
        ) : (
          <div
            className={styles.pin_header}
            onClick={() => setIsMenuPin((prev) => !prev)}
          >
            {isMenuPin ? <BiSolidPin /> : <BiPin />}
          </div>
        )}
      </div>
      <ul
        ref={scrollRef}
        onScroll={handleScroll}
        className={`${styles.master_container} ${isMobile ? styles.mobile : ""}`}
      >
        {nodeList.map((node) => {
          const imgUrl = transformUrlToThumbnail(node.url);

          return (
            <li
              key={node.id}
              className={`${styles.node} ${isMobile ? styles.mobile : ""}`}
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
                <span className={styles.visited} title="Đã xem">
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
