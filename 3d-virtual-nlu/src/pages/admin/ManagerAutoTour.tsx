import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaMicrophone, FaAngleLeft } from "react-icons/fa6";
import styles from "../../styles/managerTour.module.css";
import { IoSearch } from "react-icons/io5";
import { TiFilter } from "react-icons/ti";
import { FaSortAmountDown } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { useEffect, useState } from "react";
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
import { AutoNodeItem } from "../../components/admin/AutoNodeItem";
import { fetchAutoNode } from "../../redux/slices/DataSlice";
import { addAutoPanorama } from "../../redux/slices/PanoramaSlice";
import { goToStep } from "../../redux/slices/StepSlice";

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

const ManagerAutoTour = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const autoNodes = useSelector((state: RootState) => state.data.autoNodes);

  const dashboard = useSelector((state: RootState) => state.data.dashboard);
  const [autoNodeList, setAutoNodeList] = useState<any[]>(autoNodes || []);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500); // custom hook

  const [currentPage, setCurrentPage] = useState(-1);

  const [totalAutoTour, setTotalAutoTour] = useState(0);
  const totalPages = Math.ceil(totalAutoTour / perPage);

  useEffect(() => {
    dispatch(fetchAutoNode({ limit: perPage, page: 0 }));
  }, [dispatch]);

  const handleDetail = async (nodeId: number) => {
    const autoNode = autoNodes.find((node) => node.id === nodeId);
    if (!autoNode) {
      console.error("Node not found");
      return;
    }
    const indexNode = JSON.parse(autoNode.indexNode) as {
      nodeId: number;
      duration: number;
    }[];
    for (const item of indexNode) {
      const subNode = await axios.post(API_URLS.NODE_BY_ID, {
        nodeId: item.nodeId,
      });
      dispatch(
        addAutoPanorama({
          node: {
            ...subNode.data.data,
          },
          duration: item.duration, // ghi đè duration từ indexNode
          soundBackground: autoNode.soundBackground || "",
        })
      );
    }
    dispatch(goToStep(2));
    navigate(`${location.pathname}/${nodeId}`);
  };

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearch) return;
      const response = await axios.post(`${API_URLS.SEARCH_AUTO_NODES}`, {
        searchKey: debouncedSearch,
      });
      setAutoNodeList(response.data.data);
    };
    handleSearch();
  }, [debouncedSearch]);

  useEffect(() => {
    if (autoNodes && autoNodes.length > 0) {
      setAutoNodeList(autoNodes);
    }
  }, [autoNodes]);

  useEffect(() => {
    if (dashboard) {
      setTotalAutoTour(dashboard.numAutoTour);
    }
  }, [dashboard]);

  useEffect(() => {
    if (search === "") {
      setAutoNodeList(autoNodes);
    }
  }, [search]);

  useEffect(() => {
    const handleChangePage = async () => {
      if (currentPage === 0) return;
      const response = await axios.post(API_URLS.ADMIN_GET_AUTO_TOURS, {
        page: currentPage,
        limit: perPage,
      });
      setAutoNodeList(response.data.data);
    };
    handleChangePage();
  }, [currentPage]);

  // const handleSelectAutoNode = (node: any) => {
  //   navigate(`${location.pathname}/${node.id}`, { state: node });
  // };

  return (
    <div className={styles.container}>
      <div className={styles.tour_features}>
        <button
          className={styles.back_btn}
          onClick={() => navigate("/admin/tours")}
        >
          <FaAngleLeft />
        </button>
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
            to="/admin/createAutoTour"
            className={`${styles.tour_add} ${styles.tour_box}`}
          >
            Thêm tour tự động
          </Link>
        </div>
      </div>
      <div
        className={
          autoNodeList && autoNodeList.length < 5
            ? styles.tour_list_small
            : styles.tour_list
        }
      >
        {autoNodeList &&
          autoNodeList.map((node) => (
            <AutoNodeItem
              key={node.id}
              node={node}
              onclick={() => handleDetail(node.id)}
            />
          ))}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className={styles.tour_quantity}>
          Kết quả: {search == "" ? totalAutoTour : autoNodeList.length} tour.
        </div>
        {search.length === 0 && (
          <div className={styles.pagination}>
            {[...Array(totalPages)].map((_, index) => {
              return (
                <button
                  key={index}
                  className={`${styles.page_btn} ${
                    currentPage === index || (index == 0 && currentPage == -1)
                      ? styles.active
                      : ""
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

export default ManagerAutoTour;
