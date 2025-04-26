import React, { useState, useRef, ChangeEvent } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { FaRegFileImage } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import styles from "../../styles/uploadFile.module.css";
import axios, { AxiosError } from "axios";

type UploadFileProps = {
  className?: string;
};

interface CloudinaryUploadResp {
  originalFileName?: string;
  url?: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const UploadFile: React.FC<UploadFileProps> = ({ className }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  //Biến state để theo dõi thông tin của 1 file
  const [selectedFile, setSelectFiles] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
    "select" | "uploading" | "done"
  >("select"); //select | uploading | done

  // Xử lý sự kiện thêm file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0)
      setSelectFiles(e.target.files[0]);
  };

  const onChooseFile = () => {
    inputRef.current?.click();
  };

  const clearFileInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setSelectFiles(null);
    setProgress(0);
    setUploadStatus("select");
  };

  const handleUpload = async (): Promise<void> => {
    //if upload done, clear và return.
    if (uploadStatus === "done") {
      clearFileInput();
      return;
    }

    try {
      // Post file to Server.
      setUploadStatus("uploading");

      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const resp = await axios.post<ApiResponse<CloudinaryUploadResp>>(
        "http://localhost:8080/api/admin/node/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            }
          },
        }
      );
      if (resp.data.statusCode === 200) {
        console.log("Upload success", resp.data.data);
        setUploadStatus("done");
      } else {
        console.log("upload error: ", resp.data.message);
        setUploadStatus("select");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      console.error("Upload error", err.response?.data?.message || err.message);
      setUploadStatus("select");
    }
  };

  return (
    <div className={`${className} ${styles.uploadWrapper}`}>
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {!selectedFile && (
        <button
          className={`
        ${styles.fileBtn}`}
          onClick={onChooseFile}
        >
          <span className={styles.uploadIcon}>
            <FaCloudUploadAlt />
          </span>
          <span>Chọn tệp</span>
        </button>
      )}

      {/* Thông tin file và tiến trình khi tải lên */}
      {selectedFile && (
        <>
          <div className={styles.fileCards}>
            <span>
              <FaRegFileImage />
            </span>

            <div className={styles.fileInfo}>
              <div className={styles.fileContent}>
                <h6>{selectedFile.name}</h6>
                <div className={styles.progressBg}>
                  <div
                    className={styles.progress}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <button className={styles.deleteBtn} onClick={clearFileInput}>
                <MdDeleteForever />
              </button>
            </div>
          </div>
          {/* Button: Thực hiện việc gửi file lên Cloudinary */}
          <button className={styles.uploadBtn} onClick={handleUpload}>
            Tải lên
          </button>
        </>
      )}
    </div>
  );
};

export default UploadFile;
