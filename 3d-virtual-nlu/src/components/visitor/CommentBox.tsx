import React, { useState, useEffect } from "react";
import styles from "../../styles/visitor/commentBox.module.css";
import { IoMdSend } from "react-icons/io";
import { FaX } from "react-icons/fa6";
import axios from "axios";
import { formatTimeAgo } from "../../utils/formatDateTime";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { fetchCommentOfNode } from "../../redux/slices/DataSlice";

interface CommentProp {
  userId: number;
  nodeId: number;
  setIsComment: (val: boolean) => void;
}

const CommentBox = ({ setIsComment, userId, nodeId }: CommentProp) => {
  const comments = useSelector((state: RootState) => state.data.commentOfNode);
  const [content, setContent] = useState("");
  const [parentId, setParentId] = useState(null);
  const dispatch = useDispatch<AppDispatch>();

  const handleSend = async () => {
    if (!content.trim()) return;

    try {
      const response = await axios.post(
        "http://localhost:8080/api/comment/send",
        {
          userId: userId,
          nodeId: nodeId,
          parentId: parentId,
          content: content,
        }
      );
      if (response.data.data) {
        setContent("");
        dispatch(fetchCommentOfNode(nodeId));
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
    }
  };
  
  useEffect(() => {
    dispatch(fetchCommentOfNode(nodeId));
  }, [dispatch]);

  const handleClose = () => {
    setIsComment(false);
  };

  if (!comments) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <div className={styles.header}>
          <h3 className={styles.title}>{comments.length} Bình luận</h3>
          <button className={styles.close_btn} onClick={handleClose}>
            <FaX />
          </button>
        </div>
        <div className={styles.container_content}>
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
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            placeholder="Nhập bình luận..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className={styles.button} onClick={handleSend}>
            <IoMdSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentBox;
