import React, { useState, useEffect } from "react";
import styles from "../../styles/visitor/commentBox.module.css";
import { IoMdSend } from "react-icons/io";
import { FaX } from "react-icons/fa6";
import axios from "axios";
import { formatTimeAgo } from "../../utils/formatDateTime";

interface CommentProp {
  userId: number;
  nodeId: number;
  setIsComment: (val: boolean) => void;
}

const CommentBox = ({ setIsComment, userId, nodeId }: CommentProp) => {
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [parentId, setParentId] = useState(null);

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
        handleGetComment();
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
    }
  };

  const handleGetComment = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/comment/getOfNode",
        {
          nodeId: nodeId
        }
      );
      if (response.data.data) {
        setComments(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
    }
  };

  useEffect(() => {
    handleGetComment();
  }, [nodeId]);

  const handleClose = () => {
    setIsComment(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <div className={styles.header}>
          <h3 className={styles.title}>{comments.length} Bình luận</h3>
          <button className={styles.button} onClick={handleClose}>
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
