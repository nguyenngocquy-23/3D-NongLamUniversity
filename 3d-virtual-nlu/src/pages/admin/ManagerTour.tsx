import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUpload, FaPlus, FaMicrophone } from "react-icons/fa6";
import styles from "../../styles/managerTour.module.css";
import { IoSearch } from "react-icons/io5";
import { TiFilter } from "react-icons/ti";
import { FaSortAmountDown } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { useEffect, useMemo, useState } from "react";
import { NodeItem } from "../../components/admin/NodeItem";
import {
  HotspotInformation,
  HotspotMedia,
  HotspotModel,
  HotspotNavigation,
} from "../../redux/slices/HotspotSlice";
import { useDebounce } from "../../hooks/useDebounce";
import { perPage } from "../../utils/Constants";
import axios from "axios";
import { API_URLS } from "../../env";

export interface NodeObject {
  id: number;
  spaceId: number;
  fieldId: number;
  userId: number;
  url: string;
  name: string;
  description: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  yawOffset: number;
  status: number;
  autoRotate: number;
  speedRotate: number;
  lightIntensity: number;
  updatedAt: number;
  navHotspots: HotspotNavigation[];
  infoHotspots: HotspotInformation[];
  mediaHotspots: HotspotMedia[];
  modelHotspots: HotspotModel[];
}

const ManagerTour = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const nodes = useSelector((state: RootState) => state.data.nodes);

  const dashboard = useSelector((state: RootState) => state.data.dashboard);
  const [nodeList, setNodeList] = useState<any[]>(nodes || []);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500); // custom hook

  const [currentPage, setCurrentPage] = useState(0);

  const [totalNode, setTotalNode] = useState(0);
  const totalPages = Math.ceil(totalNode / perPage);

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearch) return;
      const response = await axios.post(`${API_URLS.SEARCH_NODES}`, {
        searchKey: debouncedSearch,
      });
      setNodeList(response.data.data);
    };
    handleSearch();
  }, [debouncedSearch]);

  useEffect(() => {
    if (nodes && nodes.length > 0) {
      setNodeList(nodes);
    }
  }, [nodes]);

  useEffect(() => {
    if (dashboard) {
      setTotalNode(dashboard.numTour);
    }
  }, [dashboard]);

  useEffect(() => {
    if (search === "") {
      setNodeList(nodes);
    }
  }, [search]);

  useEffect(() => {
    const handleChangePage = async () => {
      const response = await axios.post(API_URLS.ADMIN_GET_NODES_BY_PAGE, {
        page: currentPage,
        limit: perPage,
      });
      setNodeList(response.data.data);
    };
    handleChangePage();
  }, [currentPage]);

  // Chon space
  const handleSelectNode = (node: any) => {
    navigate(`${location.pathname}/${node.id}`, { state: node });
  };

  return (
    <div className={styles.container}>
      <div className={styles.tour_features}>
        <div className={`${styles.tour_search_box} ${styles.tour_box}`}>
          <input
            type="text"
            name="field"
            id="input"
            placeholder="Tìm kiếm tour..."
            className={styles.tour_search_input}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label htmlFor="input" className={styles.label_for_search}>
            <IoSearch className={styles.search_icon} />
          </label>
          <div className={styles.border}></div>
          <button className={styles.mic_search}>
            <FaMicrophone className={styles.mic_icon} />
          </button>
        </div>

        <div className={`${styles.tour_filter_box} ${styles.tour_box}`}>
          <TiFilter className={styles.filter_icon} />
          <button className={styles.filter_popup}>Lọc</button>
        </div>

        <div className={`${styles.tour_sort_box} ${styles.tour_box}`}>
          <FaSortAmountDown className={styles.sort_icon} />
          <button className={styles.filter_popup}>Tên</button>
        </div>

        <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
          <Link
            to="/admin/manageAutoTour"
            className={`${styles.tour_add} ${styles.tour_box}`}
          >
            Tour tự động
          </Link>
          <Link
            to="/admin/createTour"
            className={`${styles.tour_add} ${styles.tour_box}`}
          >
            Thêm tour mới
          </Link>
        </div>
      </div>
      <div className={styles.tour_list}>
        {nodeList.map((node) => (
          <NodeItem
            key={node.id}
            node={node}
            onclick={() => handleSelectNode(node)}
          />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className={styles.tour_quantity}>
          Kết quả: {search == "" ? totalNode : nodeList.length} tour.
        </div>
        {search.length === 0 && (
          <div className={styles.pagination}>
            {[...Array(totalPages)].map((_, index) => {
              return (
                <button
                  key={index}
                  className={`${styles.page_btn} ${
                    currentPage === index ? styles.active : ""
                  }`}
                  onClick={() => setCurrentPage(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerTour;
