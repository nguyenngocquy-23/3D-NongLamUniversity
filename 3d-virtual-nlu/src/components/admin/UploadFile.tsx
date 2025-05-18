import React, { useState, useRef, ChangeEvent } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import styles from "../../styles/uploadFile.module.css";
import axios, { AxiosError } from "axios";
import { setPanoramas } from "../../redux/slices/PanoramaSlice";
import { useDispatch } from "react-redux";
import { FaFile } from "react-icons/fa6";
import Swal from "sweetalert2";

/**
 * typeUpload: kiểu upload:
 * 1. Upload ảnh 360 độ.
 * 2. Upload video.
 * 3. Upload mô hình 360 độ
 */
type UploadFileProps = {
  className?: string;
  hotspotId?: string;
  onUploaded?: (urls: string, index: number) => void;
  index?: number;
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

/**
 * Free Plan Cloudinary:
 * 10 MB cho ảnh.
 * 100 MB cho video.
 */
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const UploadFile: React.FC<UploadFileProps> = ({
  className,
  index,
  onUploaded,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const [fileStatuses, setFileStatuses] = useState<
    ("uploading" | "success" | "error")[]
  >([]);

  //Biến state để theo dõi thông tin của 1 file
  const [selectedFile, setSelectFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
    "select" | "uploading" | "done"
  >("select"); //select | uploading | done
  /**
   * Kiểm tra ratio của ảnh (Đúng tỷ lệ 2:1)
   */
  const isValidAspectRatio = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const ratio = img.width / img.height;
          resolve(Math.abs(ratio - 2) < 0.01);
        };
      };

      reader.readAsDataURL(file);
    });
  };

  /**
   * Danh sách ảnh (nhiều ảnh) tối đa là 5.
   */

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const validFiles: File[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const isValid = await isValidAspectRatio(file);

      if (isValid) {
        validFiles.push(file);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Vui lòng tải lên ảnh 360 đúng định dạng để tiếp tục",
          text: `Ảnh thứ ${i + 1} (${
            file.name
          }) không có tỉ lệ 2:1 và sẽ bị loại.`,
          confirmButtonText: "OK",
        });
        return;
      }
    }

    const combinedFiles = [...selectedFile, ...validFiles];

    if (combinedFiles.length > 5) {
      alert("Tối đa 5 ảnh!.");
      return;
    }

    setSelectFiles(combinedFiles);
    setFileStatuses(new Array(combinedFiles.length).fill("uploading"));
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
    if (uploadStatus === "done") {
      clearFileInput();
      return;
    }

    if (selectedFile.length === 0) {
      alert("Vui lòng chọn ít nhất 1 files.");
      return;
    }

    setUploadStatus("uploading");

    //Tính tổng size của các file
    const totalSize = selectedFile.reduce((acc, file) => (acc += file.size), 0);

    try {
      //Case 1: Upload multi node trong trường hợp list ảnh bé hơn 10MB.

      if (totalSize <= MAX_SIZE_BYTES) {
        alert("Thông báo: Upload theo kiểu 1");
        const formData = new FormData();
        selectedFile.map((file) => {
          formData.append("file", file);
        });
        const resp = await axios.post<ApiResponse<CloudinaryUploadResp[]>>(
          "http://localhost:8080/api/v1/admin/cloud/uploadMulti",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            //Cập nhật tiến trình upload.
            // onUploadProgress: (progressEvent) => {
            //   if (progressEvent.total) {
            //     const percentCompleted = Math.round(
            //       (progressEvent.loaded * 100) / progressEvent.total
            //     );
            //     setProgress(percentCompleted);
            //   }
            // },
          }
        );

        if (resp.data.statusCode === 200) {
          setUploadStatus("done");
          const data = resp.data.data;

          const formattedData = data
            .filter((item) => item.originalFileName && item.url) // nếu không đủ => bỏ.
            .map((item) => ({
              originalFileName: item.originalFileName!,
              url: item.url!,
            }));

          if (onUploaded) {
            const url = formattedData[0].url;
            onUploaded(url, index ?? 0);
          } else {
            console.log("Không sử dụng onUploaded.");
            dispatch(setPanoramas(formattedData));
          }
        } else {
          console.log("upload error: ", resp.data.message);
          setUploadStatus("select");
        }
      } else {
        // Case 2: Số lượng file ảnh lớn hơn 10 MB.
        alert("Thông báo: Upload theo kiểu 2");
        const formattedData: { originalFileName: string; url: string }[] = [];

        for (let i = 0; i < selectedFile.length; i++) {
          const file = selectedFile[i];
          const formData = new FormData();
          formData.append("file", file);

          const resp = await axios.post<ApiResponse<CloudinaryUploadResp>>(
            "http://localhost:8080/api/v1/admin/cloud/upload",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          if (resp.data.statusCode === 200) {
            const item = resp.data.data!;
            if (item.originalFileName && item.url) {
              formattedData.push({
                originalFileName: item.originalFileName,
                url: item.url,
              });
              // Cập nhật trạng thái file i thành success
              setFileStatuses((prev) => {
                const copy = [...prev];
                copy[i] = "success";
                return copy;
              });
            }
          } else {
            console.log("Upload filed case 2 error: ", resp.data.message);
          }
        }

        setUploadStatus("done");
        if (onUploaded) {
          onUploaded(formattedData[0].url, index ?? 0);
        } else {
          dispatch(setPanoramas(formattedData));
        }
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      console.error(
        "[UploadFile: ]",
        err.response?.data?.message || err.message
      );
      setUploadStatus("select");
    }
  };

  function formatFileSize(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  return (
    <div className={`${styles.uploadWrapper}`}>
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        accept={
          className == "upload_model"
            ? ".glb, .gltf"
            : className == "upload_video"
            ? "video/*"
            : className == "upload_image"
            ? "image/*"
            : className == "upload_icon"
            ? ".svg"
            : ""
        }
        multiple={
          className == "upload_model" ||
          className == "upload_video" ||
          className == "upload_image" ||
          className == "upload_icon"
            ? false
            : true
        }
        style={{ display: "none" }}
      />

      {selectedFile.length < 5 && (
        <button
          className={`${className ? styles[className] : ""} ${styles.fileBtn}`}
          onClick={onChooseFile}
        >
          <span className={styles.uploadIcon}>
            <FaFile />
          </span>
          <span>Chọn tệp</span>
          {className === "upload_image" && (
            <span className={styles.upload_tip}>
              Chỉ nhận tối đa 5 ảnh 360 độ có tỷ lệ 2:1{" "}
            </span>
          )}
        </button>
      )}
      {/* Thông tin file và tiến trình khi tải lên */}
      {selectedFile.length > 0 && (
        <div className={styles.file_preview_container}>
          <div className={styles.fileCardsWrapper}>
            {selectedFile.map((file, index) => (
              <div
                key={index}
                className={styles.file}
                style={{
                  border:
                    fileStatuses[index] === "success"
                      ? "3px solid green"
                      : fileStatuses[index] === "error"
                      ? "3px solid red"
                      : "1px solid #ccc",
                }}
              >
                <div className={styles.file_cards}>
                  <div
                    className={styles.file_preview}
                    style={{
                      backgroundImage: `url(${URL.createObjectURL(file)})`,
                    }}
                  />

                  <div className={styles.file_info}>
                    <div className={styles.file_content} title={file.name}>
                      <h5>{file.name}</h5>
                    </div>
                    <div className={styles.file_footer}>
                      <span className={styles.file_size}>
                        {formatFileSize(file.size)}{" "}
                      </span>
                      <span
                        className={styles.delete_file_btn}
                        onClick={() => removeFile(index)}
                      >
                        <MdDeleteForever />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* <div className={styles.progressBg}>
              <div
                className={styles.progress}
                style={{ width: `${progress}%` }}
              ></div>
            </div> */}
          </div>
          {/* Button: Thực hiện việc gửi file lên Cloudinary */}
          <span className={styles.upload_btn} onClick={handleUpload}>
            {uploadStatus === "done" ? (
              <span>Xoá tất cả</span>
            ) : (
              <span>Tải lên ({selectedFile.length}/5)</span>
            )}
            <FaCloudUploadAlt />
          </span>
        </div>
      )}
    </div>
  );
};

export default UploadFile;
