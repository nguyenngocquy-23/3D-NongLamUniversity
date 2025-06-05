import { useNavigate } from "react-router-dom";
import styles from "../../styles/visitor/tours.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchNodeOfUser } from "../../redux/slices/DataSlice";
import { AppDispatch, RootState } from "../../redux/Store";

const VisitorTours = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    dispatch(fetchNodeOfUser(user.id));
  }, [dispatch]);

  const nodes = useSelector((state: RootState) => state.data.nodeOfUser);
  if (!nodes) {
    return null;
  }

  const handleDetail = (nodeId: number) => {
    navigate(`/manage/tour/${nodeId}`);
  };

  return (
    <div className={styles.container}>
      {nodes.map((node) => (
        <div
          key={node.id}
          className={styles.tour}
          onClick={() => handleDetail(node.id)}
          style={{background: `url(${node.url})`}}
        >
          <div className={styles.blur}/>
          <span className={styles.name}>{node.name}</span>
        </div>
      ))}
    </div>
  );
};

export default VisitorTours;
