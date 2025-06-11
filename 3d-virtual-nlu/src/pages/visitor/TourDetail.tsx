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
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { fetchCommentOfNode } from "../../redux/slices/DataSlice";
import { formatTimeAgo } from "../../utils/formatDateTime";
import Swal from "sweetalert2";
import { API_URLS } from "../../env";

const TourDetail = () => {
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const { nodeId } = useParams<{ nodeId: string }>();
  const [node, setNode] = useState<any>();
  const comments = useSelector((state: RootState) => state.data.commentOfNode);
  const dispatch = useDispatch<AppDispatch>();
  const [isOpenComment, setIsOpenComment] = useState(false);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [content, setContent] = useState("");
  const [parentId, setParentId] = useState(null);
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const navigate = useNavigate();

  const handleFetchNode = async () => {
    if (!nodeId) {
      console.warn("Missing nodeId from URL");
      return;
    }
    try {
      const response = await axios.post(API_URLS.NODE_BY_ID, {
        nodeId: nodeId,
      });
      if (response.data) {
        setNode(response.data.data);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSendComment = async () => {
    if (!content.trim()) return;

    try {
      const response = await axios.post(API_URLS.SEND_COMMENT, {
        userId: user.id,
        nodeId: nodeId,
        parentId: parentId,
        content: content,
      });
      if (response.data.data) {
        setContent("");
        dispatch(fetchCommentOfNode(node.id));
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
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
    if (node.status == 2) {
      const result = await Swal.fire({
        title: "Bạn có chắc chắn",
        text: "Việc ngưng hoạt động có thể ảnh hưởng tới các node khác",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
      });
      if (!result.isConfirmed) {
        return;
      }
    }

    const response = await axios.post(API_URLS.CHANGE_NODE_STATUS, {
      id: node.id,
      status: node.status,
    });
    if (response.data.data) {
      Swal.fire({
        title: "Thành công",
        text: `${
          node.status == 0 ? "Mở hoạt động" : "Ngưng hoạt động"
        } thành công`,
        icon: "success",
        position: "top-end",
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      handleFetchNode();
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

  const handleRemove = async (node: any) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn",
      text: "Việc xóa node sẽ không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) {
      return;
    }

    const response = await axios.post(API_URLS.REMOVE_NODE, {
      nodeId: node.id,
    });
    if (response.data.data) {
      Swal.fire({
        title: "Thành công",
        text: "Node đã được xóa thành công",
        icon: "success",
        position: "top-end",
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      navigate("/manage/tours");
    } else {
      Swal.fire({
        title: "Thất bại",
        text: "Xóa node thất bại. Vui lòng thử lại sau.",
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
        {node.status == 3 ? (
          ""
        ) : isFullPreview ? (
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
                <li onClick={() => handleRemove(node)}>Xóa tour</li>
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
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <button className={styles.sendBtn} onClick={handleSendComment}>
                  Gửi
                </button>
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
