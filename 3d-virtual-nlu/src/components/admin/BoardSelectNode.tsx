import { useEffect, useState } from "react";
import styles from "../../styles/boardSelectNode.module.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store.ts";
import { fetchNodes } from "../../redux/slices/DataSlice.ts";
import axios from "axios";
import { API_URLS } from "../../env.ts";
import { FaSortAmountDown } from "react-icons/fa";
import { FaAngleLeft, FaMicrophone } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { TiFilter } from "react-icons/ti";
import { nextStep } from "../../redux/slices/StepSlice.ts";
import { useDebounce } from "../../hooks/useDebounce.ts";
import {
  addAutoPanorama,
  removeAutoPanorama,
} from "../../redux/slices/PanoramaSlice.ts";
import Swal from "sweetalert2";
import { perPage } from "../../utils/Constants.ts";
import { useNavigate } from "react-router-dom";
import { transformUrlToThumbnailBig } from "../../utils/getCloudinaryURL.ts";

const BoardSelectNode = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(fetchNodes({ limit: perPage, page: 0 }));
  }, [dispatch]);
  const nodes = useSelector((state: RootState) => state.data.nodes);
  const autoPanoramaList = useSelector(
    (state: RootState) => state.panoramas.autoPanoramaList
  );
  const dashboard = useSelector((state: RootState) => state.data.dashboard);

  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [nodeList, setNodeList] = useState<any[]>(nodes || []);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500); // custom hook

  const [currentPage, setCurrentPage] = useState(-1);

  // For example
  const [totalNode, setTotalNode] = useState(0);
  const totalPages = Math.ceil(totalNode / perPage);

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearch) return;
      const response = await axios.post(API_URLS.SEARCH_NODES, {
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
      if (currentPage == -1) return;
      const response = await axios.post(API_URLS.ADMIN_GET_NODES_BY_PAGE, {
        page: currentPage,
        limit: perPage,
      });
      setNodeList(response.data.data);
    };
    handleChangePage();
  }, [currentPage]);

  const nextStep2 = () => {
    if (selectedNodes.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Chưa chọn node",
        text: "Vui lòng chọn node trước khi tiếp tục",
        confirmButtonText: "OK",
      });
      return;
    }

    dispatch(nextStep());
  };

  const handleToggleSelect = (nodeId: string) => {
    const node = nodeList.find((n) => n.id === nodeId);
    if (!node) return;

    setSelectedNodes((prevSelected) => {
      const isSelected = prevSelected.includes(nodeId);

      if (isSelected) {
        dispatch(removeAutoPanorama(nodeId));
        return prevSelected.filter((id) => id !== nodeId);
      } else {
        dispatch(addAutoPanorama({ node: node }));
        return [...prevSelected, nodeId];
      }
    });
  };

  return (
    <div className={styles.select_node_container}>
      <div className={styles.features}>
        <button className={styles.back_btn} onClick={() => navigate(-1)}>
          <FaAngleLeft />
        </button>
        <div className={`${styles.search_box} ${styles.box}`}>
          <input
            type="text"
            name="field"
            id="input"
            placeholder="Tìm kiếm tour..."
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search_input}
          />
          <label htmlFor="input" className={styles.label_for_search}>
            <IoSearch className={styles.search_icon} />
          </label>
          <div className={styles.border}></div>
          <button className={styles.mic_search}>
            <FaMicrophone className={styles.mic_icon} />
          </button>
        </div>

        <div className={`${styles.filter_box} ${styles.box}`}>
          <TiFilter className={styles.filter_icon} />
          <button className={styles.filter_popup}>Lọc</button>
        </div>

        <div className={`${styles.sort_box} ${styles.box}`}>
          <FaSortAmountDown className={styles.sort_icon} />
          <button className={styles.filter_popup}>Tên</button>
        </div>
        <button className={styles.next_btn} onClick={nextStep2}>
          Tiếp tục
        </button>
      </div>

      {/* display */}
      <div className={styles.selected_node}>
        <div className={styles.quantity}>
          <span className={styles.quantity_value}>{selectedNodes.length}</span>
        </div>
        <div className={styles.node_list}>
          {selectedNodes.map((select) => {
            const node = autoPanoramaList.find((node) => node.id === select);
            return (
              <div
                key={node.id}
                className={styles.display_tour}
                onClick={() => handleToggleSelect(node.id)}
                style={{
                  backgroundImage: `url(${transformUrlToThumbnailBig(
                    node.url
                  )})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
                title={node.name}
              >
                <div className={styles.remove_blur} />
              </div>
            );
          })}
        </div>
      </div>
      {/* list node */}
      <div className={styles.node_container}>
        {nodeList.length > 0 ? (
          nodeList.map((node) => {
            const isSelected = selectedNodes.includes(node.id);
            return (
              <div
                key={node.id}
                className={`${styles.tour} ${
                  isSelected ? styles.selected : ""
                }`}
                onClick={() => handleToggleSelect(node.id)}
                style={{
                  backgroundImage: `url(${transformUrlToThumbnailBig(
                    node.url
                  )})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              >
                <div className={styles.blur} />
                <span className={styles.name}>{node.name}</span>
              </div>
            );
          })
        ) : (
          <div style={{ color: "black" }}>Đang tải...</div>
        )}
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
  );
};

export default BoardSelectNode;
