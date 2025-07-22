import { useNavigate } from "react-router-dom";
import styles from "../../styles/visitor/manageModel.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  fetchAutoNode,
  fetchModel,
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
import { formatTimestampToDate } from "../../utils/formatTimestamp";
import { perPage } from "../../utils/Constants";

const ManageModel = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500); // custom hook

  const [currentPage, setCurrentPage] = useState(0);

  // For example
  const [totalModel, setTotalModel] = useState(0);
  const totalPages = Math.ceil(totalModel / perPage);

  useEffect(() => {
    dispatch(fetchModel({ limit: perPage, page: 0 }));
  }, [dispatch]);

  const models = useSelector((state: RootState) => state.data.models);
  const [modelList, setModelList] = useState<any[]>(models || []);

  useEffect(() => {
    if (models && models.length > 0) {
      setModelList(models);
    }
    const handleFetchTotalModel = async () => {
      try {
        const response = await axios.post(API_URLS.GET_NUM_TOTAL_MODEL);
        if (response.data.data) {
          setTotalModel(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching total models:", error);
      }
    };
    handleFetchTotalModel();
  }, [models]);

  useEffect(() => {
    if (search === "") {
      setModelList(models);
    }
  }, [search]);

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearch) return;
      const response = await axios.post(
        `${API_URLS.BASE}/v1/admin/hotspot/searchModel`,
        {
          searchKey: debouncedSearch,
        }
      );
      setModelList(response.data.data);
    };
    handleSearch();
  }, [debouncedSearch]);

  useEffect(() => {
    const handleChangePage = async () => {
      if(currentPage === 0) return;
      const response = await axios.post(API_URLS.GET_ALL_MODEL, {
        page: currentPage,
        limit: perPage,
      });
      setModelList(response.data.data);
    };
    handleChangePage();
  }, [currentPage]);

  const handleDetail = (modelId: number) => {
    navigate(`/model/${modelId}`);
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
            placeholder="Tìm kiếm mô hình..."
            className={styles.search_input}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <span className={styles.title}>MÔ HÌNH 3D</span>
      </div>
      <div className={styles.model_container}>
        <div className={styles.content}>
          {modelList.length > 0 ? (
            modelList.map((model) => (
              <div
                key={model.id}
                className={styles.model}
                onClick={() => handleDetail(model.id)}
                title={model.name}
                style={{ background: `url(${model.thumbnailUrl})` }}
              >
                <div className={styles.blur} />
                <span className={styles.name}>{model.name}</span>
                <div className={styles.info}>
                  <p>🕒 {formatTimestampToDate(model.updatedAt)}</p>
                  <p>⬇ {model.numDownload} lượt tải</p>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: "black" }}>Danh sách trống...</div>
          )}
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

export default ManageModel;
