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

const ManageModel = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500); // custom hook

  const [currentPage, setCurrentPage] = useState(0);

  // For example
  const [totalModel, setTotalModel] = useState(0);
  const perPage = 10;
  const totalPages = Math.ceil(totalModel / perPage);

  useEffect(() => {
    dispatch(fetchModel({ limit: perPage, page: 0 }));
  }, [dispatch]);

  const models = useSelector((state: RootState) => state.data.models);
  const [autoNodeList, setAutoNodeList] = useState<any[]>(models || []);
  const [searchData, setSearchData] = useState(models);

  useEffect(() => {
    if (models && models.length > 0) {
      setSearchData(models);
    }
  }, [models]);

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearch) return;
      const response = await axios.post(
        `${API_URLS.BASE}/v1/admin/node/search`,
        {
          searchKey: debouncedSearch,
        }
      );
      setAutoNodeList(response.data.data);
    };
    handleSearch();
  }, [debouncedSearch]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    const newData = models.filter((row) => {
      return row.name.toLowerCase().includes(searchTerm);
    });
    setSearchData(newData);
  };

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
            onChange={handleSearch}
          />
        </div>
        <span className={styles.title}>MÔ HÌNH 3D</span>
      </div>
      <div className={styles.model_container}>
        {searchData.length > 0 ? (
          searchData.map((model) => (
            <div
              key={model.id}
              className={styles.tour}
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
