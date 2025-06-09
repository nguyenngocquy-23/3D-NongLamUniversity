import { useNavigate } from "react-router-dom";
import styles from "../../styles/visitor/tours.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchNodeOfUser } from "../../redux/slices/DataSlice";
import { AppDispatch, RootState } from "../../redux/Store";
import { IoSearch } from "react-icons/io5";

const VisitorTours = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    dispatch(fetchNodeOfUser(user.id));
  }, [dispatch]);

  const nodes = useSelector((state: RootState) => state.data.nodeOfUser);
  const [searchData, setSearchData] = useState(nodes);
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      setSearchData(nodes);
    }
  }, [nodes]);

  const handleDetail = (nodeId: number) => {
    navigate(`/manage/tour/${nodeId}`);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    console.log(searchTerm);
    const newData = nodes.filter((row) => {
      return row.name.toLowerCase().includes(searchTerm);
    });
    setSearchData(newData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.task}>
        <div className={styles.search_box}>
          <label htmlFor="input" className={styles.label}>
            <IoSearch className={styles.search_icon} />
          </label>
          <input
            type="text"
            name="field"
            id="input"
            placeholder="Tìm kiếm không gian..."
            className={styles.search_input}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className={styles.node_container}>
        {searchData.map((node) => (
          <div
            key={node.id}
            className={styles.tour}
            onClick={() => handleDetail(node.id)}
            style={{ background: `url(${node.url})` }}
          >
            <div className={styles.blur} />
            <span className={styles.name}>{node.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitorTours;
