import { OrbitControls } from "@react-three/drei";
import UpdateCameraOnResize from "../../components/UpdateCameraOnResize";
import TourScene from "../../components/visitor/TourScene";
import styles from "../../styles/visitor/tourDetail.module.css";
import { RADIUS_SPHERE } from "../../utils/Constants";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FaChartBar } from "react-icons/fa";
import { FaAngleUp, FaComment, FaEye } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { fetchCommentOfNode } from "../../redux/slices/DataSlice";
import { formatTimeAgo } from "../../utils/formatDateTime";
import Swal from "sweetalert2";

const TourDetail = () => {
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const { nodeId } = useParams<{ nodeId: string }>();
  const [node, setNode] = useState<any>();
  const comments = useSelector((state: RootState) => state.data.commentOfNode);
  const dispatch = useDispatch<AppDispatch>();
  const [isOpenComment, setIsOpenComment] = useState(false);
  const [isFullPreview, setIsFullPreview] = useState(false);

  const handleFetchNode = async () => {
    if (!nodeId) {
      console.warn("Missing nodeId from URL");
      return;
    }
    try {
      const response = await axios.post("http://localhost:8080/api/node/byId", {
        nodeId: nodeId,
      });
      if (response.data) {
        setNode(response.data.data);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleFetchNode();
  }, [nodeId]);

  useEffect(() => {
    dispatch(fetchCommentOfNode(parseInt(nodeId || "", 10)));
  }, [dispatch]);

  if (!node || !comments) {
    return null;
  }

  const handleChangeStatus = async (node: any) => {
    const response = await axios.post(
      "http://localhost:8080/api/node/changeStatus",
      { id: node.id, status: node.status }
    );
    if (response.data.data) {
      Swal.fire({
        title: "Thành công",
        text: `${node.status == 0 ? "Mở hoạt động" : "Ngưng hoạt động" } thành công`,
        icon: "success",
        position: "top-end",
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      handleFetchNode();
      console.log('node...', node)
    } else {
      Swal.fire({
        title: "Thất bại",
        text: "Đổi trạng thái thất bại",
        icon: "error",
        position: "top-end",
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
  };

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
        {isFullPreview ? (
          <FaAngleUp
            className={styles.toggle}
            title={"Mở tính năng"}
            onClick={() => setIsFullPreview(false)}
          />
        ) : (
          <div>
            <div className={styles.info}>
              <div className={styles.sub_info}>
                <span className={styles.name}>Cập nhật</span>
                <span className={styles.des}>
                  {formatTimeAgo(node.updatedAt)}
                </span>
              </div>
              <div className={styles.sub_info}>
                <span className={styles.name}>Trạng thái</span>
                <span className={styles.des}>
                  {node.status == 2 ? "Đang hoạt động" : "Ngưng hoạt động"}
                </span>
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
                <li onClick={() => handleChangeStatus(node)}>
                  {node.status == 2 ? "Ngưng hoạt động" : "Mở hoạt động"}
                </li>
                <li>Xóa tour</li>
                <li>Cập nhật tour</li>
                <li onClick={() => setIsFullPreview((pre) => !pre)}>
                  Chế độ xem toàn cảnh
                </li>
                <li onClick={() => setIsOpenComment((pre) => !pre)}>
                  Xem bình luận
                </li>
              </ul>
            </div>
          </div>
        )}
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
