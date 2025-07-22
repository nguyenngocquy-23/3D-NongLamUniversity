import { useNavigate } from "react-router-dom";
import styles from "../../styles/visitor/autoTour.module.css";
import stylesPagination from "../../styles/managerSpace.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  fetchAutoNode,
  fetchNodeOfUser,
  fetchPrivateNodeOfUser,
} from "../../redux/slices/DataSlice";
import { AppDispatch, RootState } from "../../redux/Store";
import { IoSearch } from "react-icons/io5";
import { FaAngleLeft } from "react-icons/fa6";
import axios from "axios";
import { API_URLS } from "../../env";
import { addAutoPanorama } from "../../redux/slices/PanoramaSlice";
import { useDebounce } from "../../hooks/useDebounce";

const ManageAutoTour = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500); // custom hook

  const [currentPage, setCurrentPage] = useState(-1);

  // For example
  const [totalNode, setTotalNode] = useState(0);
  const perPage = 6;
  const totalPages = Math.ceil(totalNode / perPage);

  useEffect(() => {
    dispatch(fetchAutoNode({ limit: perPage, page: 0 }));
  }, [dispatch]);

  const autoNodes = useSelector((state: RootState) => state.data.autoNodes);
  const [autoNodeList, setAutoNodeList] = useState<any[]>(autoNodes || []);
  const [searchData, setSearchData] = useState(autoNodes);

  useEffect(() => {
    if (autoNodes && autoNodes.length > 0) {
      setSearchData(autoNodes);
    }
  }, [autoNodes]);

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
    const handleChangePage = async () => {
      if (currentPage === -1) return;
      const response = await axios.post(API_URLS.ADMIN_GET_AUTO_TOURS, {
        page: currentPage,
        limit: perPage,
      });
      setAutoNodeList(response.data.data);
    };
    handleChangePage();
  }, [currentPage]);

  const handleDetail = async (nodeId: number) => {
    const node = autoNodes.find((node) => node.id === nodeId);
    if (!node) {
      console.error("Node not found");
      return;
    }
    const indexNode = JSON.parse(node.indexNode) as {
      nodeId: number;
      duration: number;
    }[];
    console.log("indexNode", indexNode);
    for (const item of indexNode) {
      const node = await axios.post(API_URLS.NODE_BY_ID, {
        nodeId: item.nodeId,
      });
      dispatch(
        addAutoPanorama({
          node: {
            ...node.data.data,
          },
          duration: item.duration, // ghi đè duration từ indexNode
        })
      );
    }
    navigate(`/autoTourDetail/${nodeId}`);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    const newData = autoNodes.filter((row) => {
      return row.name.toLowerCase().includes(searchTerm);
    });
    setSearchData(newData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span
          className={styles.back_btn}
          onClick={() => {
            navigate("/");
          }}
        >
          <FaAngleLeft />
        </span>
        <div className={styles.search_box}>
          <label htmlFor="input" className={styles.label}>
            <IoSearch className={styles.search_icon} />
          </label>
          <input
            type="text"
            name="field"
            id="input"
            placeholder="Tìm kiếm tour..."
            className={styles.search_input}
            onChange={handleSearch}
          />
        </div>
        <span className={styles.title}>TOUR TỰ ĐỘNG</span>
      </div>
      <div className={styles.tour_container}>
        <div className={styles.content}>
          {searchData.length > 0 ? (
            searchData.map((node) => (
              <div
                key={node.id}
                className={styles.tour}
                onClick={() => handleDetail(node.id)}
                title={node.name}
                style={{ background: `url(${node.thumbNail})` }}
              >
                <div className={styles.blur} />
                <span className={styles.name}>{node.name}</span>
              </div>
            ))
          ) : (
            <div style={{ color: "black" }}>Danh sách trống...</div>
          )}
          {search.length === 0 && (
            <div className={stylesPagination.pagination}>
              {[...Array(totalPages)].map((_, index) => {
                return (
                  <button
                    key={index}
                    className={`${stylesPagination.page_btn} ${
                      currentPage === index || (index == 0 && currentPage == -1)
                        ? stylesPagination.active
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
    </div>
  );
};

export default ManageAutoTour;
