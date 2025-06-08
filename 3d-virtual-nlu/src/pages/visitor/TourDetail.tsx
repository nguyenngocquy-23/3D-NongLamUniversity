import { OrbitControls } from "@react-three/drei";
import UpdateCameraOnResize from "../../components/UpdateCameraOnResize";
import TourScene from "../../components/visitor/TourScene";
import styles from "../../styles/visitor/tourDetail.module.css";
import { RADIUS_SPHERE } from "../../utils/Constants";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FaChartBar } from "react-icons/fa";
import { FaComment, FaEye } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { fetchCommentOfNode } from "../../redux/slices/DataSlice";
import { formatTimeAgo } from "../../utils/formatDateTime";

const TourDetail = () => {
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const { nodeId } = useParams<{ nodeId: string }>();
  const [node, setNode] = useState<any>();
  const comments = useSelector((state: RootState) => state.data.commentOfNode);
  const dispatch = useDispatch<AppDispatch>();
  const [isOpenComment, setIsOpenComment] = useState(false);

  useEffect(() => {
    const handleFetchNode = async () => {
      if (!nodeId) {
        console.warn("Missing nodeId from URL");
        return;
      }
      try {
        const response = await axios.post(
          "http://localhost:8080/api/node/byId",
          {
            nodeId: nodeId,
          }
        );
        if (response.data) {
          setNode(response.data.data);
        }
      } catch (err: any) {
        console.error(err);
      }
    };
    handleFetchNode();
  }, [nodeId]);

  useEffect(() => {
    dispatch(fetchCommentOfNode(parseInt(nodeId || "", 10)));
  }, [dispatch]);

  if (!node || !comments) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.canvas_container}>
        <Canvas
          camera={{
            fov: 75,
            // aspect: windowSize.width / windowSize.height,
            near: 0.1,
            far: 1000,
            position: [0, 0, 0.0000001],
          }}
          className={styles.tourCanvas}
          // style={{ cursor }}
        >
          <UpdateCameraOnResize />
          <TourScene
            radius={RADIUS_SPHERE}
            sphereRef={sphereRef}
            textureCurrent={node.url}
            lightIntensity={1}
          />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            rotateSpeed={0.2}
          />
        </Canvas>
        <div className={styles.info}>
          <div className={styles.sub_info}>
            <span className={styles.name}>10</span>
            <span className={styles.des}>Số bình luận</span>
          </div>
          <div className={styles.sub_info}>
            <span className={styles.name}>Trạng thái</span>
            <span className={styles.des}>Đang hoạt động</span>
          </div>
          <div className={styles.sub_info}>
            <span className={styles.name}>{comments.length}</span>
            <span className={styles.des}>Số bình luận</span>
          </div>
          <div className={styles.sub_info}>
            <span className={styles.name}>1000</span>
            <span className={styles.des}>Số lượt truy cập</span>
          </div>
        </div>
        <div className={styles.feature}>
          <span className={styles.title}>Tính năng</span>
          <ul className={styles.featureList}>
            <li>Ngưng hoạt động</li>
            <li>Xóa tour</li>
            <li>Cập nhật tour</li>
            <li>Chế độ xem toàn cảnh</li>
            <li onClick={() => setIsOpenComment((pre) => !pre)}>
              Xem bình luận
            </li>
          </ul>
        </div>
        <div
          className={`${styles.commentContainer} ${
            isOpenComment ? styles.show : ""
          }`}
        >
          {isOpenComment ? (
            <>
              <div className={styles.commentBox}>
                {comments.map((comment) => (
                  <div key={comment.id} className={styles.comment}>
                    <div className={styles.content}>
                      {comment.content}
                      <button className={styles.replyBtn}>Trả lời</button>
                    </div>
                    <div className={styles.meta}>
                      <small>{formatTimeAgo(comment.updatedAt)}</small>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.inputContainer}>
                <textarea
                  placeholder="Nhập bình luận..."
                  className={styles.textarea}
                ></textarea>
                <button className={styles.sendBtn}>Gửi</button>
              </div>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
