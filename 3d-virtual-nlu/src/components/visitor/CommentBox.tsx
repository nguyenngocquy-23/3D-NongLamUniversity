import React, { useState, useEffect } from "react";
import styles from "../../styles/visitor/commentBox.module.css";
import { IoMdSend } from "react-icons/io";
import { FaUserPen, FaX } from "react-icons/fa6";
import axios from "axios";
import { formatTimeAgo } from "../../utils/formatDateTime";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { fetchCommentOfNode } from "../../redux/slices/DataSlice";
import Swal from "sweetalert2";
import { FaCheckCircle } from "react-icons/fa";

interface CommentProp {
  userId: number;
  nodeId: number;
  setIsComment: (val: boolean) => void;
}

const CommentBox = ({ setIsComment, userId, nodeId }: CommentProp) => {
  const comments = useSelector((state: RootState) => state.data.commentOfNode);
  const [content, setContent] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [parentId, setParentId] = useState(null);
  const dispatch = useDispatch<AppDispatch>();
  const [node, setNode] = useState<any>();

  const [editedCommentId, setEdittedCommentId] = useState(0);

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

  const handleSendComment = async () => {
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

  const handleUpdateComment = async (commentId: number) => {
    if (!updateContent.trim()) return;

    try {
      const response = await axios.post(
        "http://localhost:8080/api/comment/update",
        {
          commentId: commentId,
          content: updateContent,
        }
      );
      if (response.data.data) {
        setEdittedCommentId(0);
        setUpdateContent("");
        dispatch(fetchCommentOfNode(nodeId));
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật bình luận:", error);
    }
  };

  const handleRemoveComment = async (commentId: number) => {
    Swal.fire({
      title: "Gỡ bình luận",
      text: "Bạn có chắc chắn muốn gỡ bình luận này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Gỡ",
      cancelButtonText: "Hủy",
      showLoaderOnConfirm: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(
            "http://localhost:8080/api/comment/remove",
            {
              commentId: commentId,
            }
          );
          if (response.data.data) {
            dispatch(fetchCommentOfNode(nodeId));
          }
        } catch (error) {
          console.error("Lỗi khi cập nhật bình luận:", error);
        }
      } else {
        return;
      }
    });
  };

  useEffect(() => {
    dispatch(fetchCommentOfNode(nodeId));
  }, [dispatch]);

  const handleClose = () => {
    setIsComment(false);
  };

  if (!comments || !node) {
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
          {comments.map((comment) => {
            return (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.info}>
                  <div className={styles.sub_info}>
                    <div
                      className={styles.avatar}
                      style={{
                        background: `url(${comment.avatar})`,
                      }}
                    />
                    <b className={styles.name}>
                      {comment.username}
                      {comment.userId == node.userId ? (
                        <i className={styles.author}>
                          {" "}
                          <FaUserPen /> Tác giả
                        </i>
                      ) : (
                        ""
                      )}
                    </b>
                    <small className={styles.time}>
                      {formatTimeAgo(comment.updatedAt)}
                    </small>
                  </div>
                  <div>
                    {comment.userId == userId ||
                    formatTimeAgo(comment.updatedAt) == "Bây giờ" ||
                    formatTimeAgo(comment.updatedAt).includes("phút") ? (
                      <>
                        <button
                          className={styles.reply_btn}
                          onClick={() => setEdittedCommentId(comment.id)}
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          className={styles.reply_btn}
                          onClick={() => handleRemoveComment(comment.id)}
                        >
                          Gỡ
                        </button>
                      </>
                    ) : (
                      <button className={styles.reply_btn}>Trả lời</button>
                    )}
                  </div>
                </div>
                {editedCommentId == comment.id ? (
                  <div className={styles.update_box}>
                    <input
                      className={styles.update_content}
                      value={
                        updateContent == "" ? comment.content : updateContent
                      }
                      onChange={(e) => setUpdateContent(e.target.value)}
                    />
                    <FaCheckCircle
                      className={styles.update_icon}
                      onClick={() => handleUpdateComment(comment.id)}
                    />
                  </div>
                ) : (
                  <div className={styles.content}>{comment.content}</div>
                )}
              </div>
            );
          })}
        </div>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            placeholder="Nhập bình luận..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className={styles.button} onClick={handleSendComment}>
            <IoMdSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentBox;
