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
  const [selectedFile, setSelectFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
    "select" | "uploading" | "done"
  >("select"); //select | uploading | done

  // Xử lý sự kiện thêm file (nhiều file 1 lần.)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const combinedFiles = [...selectedFile, ...newFiles];

    if (combinedFiles.length > 5) {
      alert("upload tối đa 5 ảnh.");
      return;
    }

    setSelectFiles(combinedFiles);
  };

  const onChooseFile = () => {
    inputRef.current?.click();
  };

  const clearFileInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setSelectFiles([]);
    setProgress(0);
    setUploadStatus("select");
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFile];
    newFiles.splice(index, 1);
    setSelectFiles(newFiles);
  };

  const handleUpload = async (): Promise<void> => {
    //if upload done, clear và return.
    if (uploadStatus === "done") {
      clearFileInput();
      return;
    }

    if (selectedFile.length === 0) {
      alert("Vui lòng chọn ít nhất 1 files.");
      return;
    }

    try {
      // Post file to Server.
      setUploadStatus("uploading");

      const formData = new FormData();
      selectedFile.forEach((file) => {
        formData.append("file", file);
      });

      const resp = await axios.post<ApiResponse<CloudinaryUploadResp[]>>(
        "http://localhost:8080/api/admin/node/uploadMulti",
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
        multiple
        style={{ display: "none" }}
      />

      {selectedFile.length === 0 && (
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
      {selectedFile.length > 0 && (
        <>
          <div className={styles.fileCardsWrapper}>
            {selectedFile.map((file, index) => (
              <div className={styles.fileCards} key={index}>
                <span>
                  <FaRegFileImage />
                </span>

                <div className={styles.fileInfo}>
                  <div className={styles.fileContent}>
                    <h6>{file.name}</h6>
                  </div>

                  <button
                    className={styles.deleteBtn}
                    onClick={() => removeFile(index)}
                  >
                    <MdDeleteForever />
                  </button>
                </div>
              </div>
            ))}

            <div className={styles.progressBg}>
              <div
                className={styles.progress}
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Button: Thực hiện việc gửi file lên Cloudinary */}
            <button className={styles.uploadBtn} onClick={handleUpload}>
              {uploadStatus === "done" ? "Xoá tất cả" : "Tải lên"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadFile;
