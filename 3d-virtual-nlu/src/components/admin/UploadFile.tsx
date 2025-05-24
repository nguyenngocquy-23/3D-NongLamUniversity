import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDeleteForever, MdFileDownloadDone } from "react-icons/md";
import styles from "../../styles/uploadFile.module.css";
import axios, { AxiosError } from "axios";
import { clearPanorama, setPanoramas } from "../../redux/slices/PanoramaSlice";
import { useDispatch } from "react-redux";
import { FaFile } from "react-icons/fa6";
import Swal from "sweetalert2";
import { RiLoader2Fill } from "react-icons/ri";
import { nextStep } from "../../redux/slices/StepSlice";

/**
 * UploadFile sẽ nhận vào các kiểu props:
 * className để xác định loại dùng UploadFile:
 * upload_panos/upload_image/upload_video/upload_model
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

type FileUploadStatus = {
  file: File;
  status: "idle" | "uploading" | "success" | "error" | "waiting";
  error?: string;
  uploadedUrl?: string;
};

const UploadFile: React.FC<UploadFileProps> = ({
  className,
  index,
  onUploaded,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const [progress, setProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
    "select" | "uploading" | "done"
  >("select"); //select | uploading | done

  /**
   * Sử dụng để cập nhật trạng thái cho từng file khi được tải lên Cloudinary.
   * "idle" : Khi mới được gửi lên.
   * "uploading": Ngay khi click "Tải lên"
   * "success" : So sánh file name với originalFileName gửi về từ api & url.
   * "error" : lỗi trả về từ server.
   */
  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus[]>([]);
  const maxFiles = className === "upload_panos" ? 5 : 1; //Ngoài upload panos, các trường hợp còn lại chỉ cần 1 file.

  useEffect(() => {
    if (
      maxFiles === 1 &&
      uploadStatus === "select" &&
      fileStatuses.length > 0
    ) {
      handleUpload();
    }
  }, [fileStatuses]);

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
    const validFiles: FileUploadStatus[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      if (className === "upload_panos") {
        const isValid = await isValidAspectRatio(file);

        if (!isValid) {
          Swal.fire({
            icon: "warning",
            title: "Vui lòng tải lên ảnh 360 đúng định dạng để tiếp tục",
            text: `Ảnh thứ ${i + 1} (${
              file.name
            }) không có tỉ lệ 2:1 và sẽ bị loại.`,
            confirmButtonText: "Đồng ý",
          });

          return;
        }
      }

      /**
       * Xử lý vấn đề về trùng file.
       */

      const isDuplicate = fileStatuses.some(
        (existing) =>
          existing.file.name === file.name && existing.file.size === file.size
      );

      if (isDuplicate) {
        Swal.fire({
          icon: "warning",
          title: "Trùng tệp ảnh đã tồn tại.",
          text: `Tệp ảnh ${file.name} đã tồn tại, chúng tôi sẽ bỏ qua.`,
          confirmButtonText: "Đồng ý",
        });
        continue; // không thêm file này
      }

      validFiles.push({
        file,
        status: "idle",
      });
    }

    const combinedFiles = [...fileStatuses, ...validFiles];

    if (combinedFiles.length > 5) {
      Swal.fire({
        icon: "warning",
        title: "Vượt số lượng ảnh cho phép.",
        text: `Vui lòng chọn tối đa 5 ảnh 360 độ`,
        confirmButtonText: "Đồng ý",
      });
      return;
    }

    setFileStatuses(combinedFiles);
    setUploadStatus("select");
  };

  const onChooseFile = () => {
    inputRef.current?.click();
  };

  const clearFileInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setFileStatuses([]);
    setProgress(0);
    setUploadStatus("select");

    dispatch(clearPanorama());
  };

  const removeFile = (file: File) => {
    const updatedStatuses = fileStatuses.filter(
      (f) => !(f.file.name === file.name && f.file.size === file.size)
    );
    setFileStatuses(updatedStatuses);
  };

  const handleUpload = async (): Promise<void> => {
    if (uploadStatus === "done") {
      Swal.fire({
        title: "Bạn có chắc chắn?",
        text: "Thao tác này sẽ loại bỏ toàn bộ tiến trình trước đây của bạn!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#655cc9",
        cancelButtonColor: "#d33",
        cancelButtonText: "Trở lại",
        confirmButtonText: "Xác nhận !",
      }).then((result) => {
        if (result.isConfirmed) {
          clearFileInput();
          Swal.fire({
            title: "Đã xoá!",
            text: "Các tệp hình ảnh đã được xoá.",
            icon: "success",
          });
        }
      });

      return;
    }

    if (fileStatuses.length === 0) {
      alert("Vui lòng chọn ít nhất 1 files.");
      return;
    }

    setUploadStatus("uploading");

    const formattedData: { originalFileName: string; url: string }[] = [];

    for (const fileStatus of fileStatuses) {
      const file = fileStatus.file;

      // Skip file đã thành công
      if (fileStatus.status === "success") continue;

      // Đánh dấu file hiện tại đang upload
      setFileStatuses((prev) =>
        prev.map((item) =>
          item.file.name === file.name
            ? { ...item, status: "uploading", error: undefined }
            : item
        )
      );

      try {
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

            // Đánh dấu thành công
            setFileStatuses((prev) =>
              prev.map((f) =>
                f.file.name === item.originalFileName
                  ? {
                      ...f,
                      status: "success",
                      uploadedUrl: item.url,
                      error: undefined,
                    }
                  : f
              )
            );
          }
        } else {
          // Đánh dấu lỗi nếu server trả về lỗi
          setFileStatuses((prev) =>
            prev.map((f) =>
              f.file.name === file.name
                ? { ...f, status: "error", error: resp.data.message }
                : f
            )
          );
        }
      } catch (error: unknown) {
        const err = error as AxiosError<ApiResponse<null>>;
        const message = err.response?.data?.message || err.message;

        // Đánh dấu lỗi nếu request bị lỗi
        setFileStatuses((prev) =>
          prev.map((f) =>
            f.file.name === file.name
              ? { ...f, status: "error", error: message }
              : f
          )
        );

        console.error("[UploadFile Error:]", message);
      }
    }

    // Sau khi xử lý xong tất cả
    const successFiles = formattedData.length;
    if (successFiles > 0) {
      setUploadStatus("done");
      if (onUploaded) {
        onUploaded(formattedData[0].url, index ?? 0);
      }
    } else {
      setUploadStatus("select"); // Không có file nào thành công
    }
  };
  function formatFileSize(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Chuyển sang step mới:
   * 1. Đưa các panorama success vào redux.
   * 2. set nextStep để chuyển bước mới.
   */
  const nextStep2 = () => {
    const allSuccessful = fileStatuses
      .filter((f) => f.status === "success" && f.uploadedUrl)
      .map((f) => ({
        originalFileName: f.file.name,
        url: f.uploadedUrl!,
      }));

    dispatch(setPanoramas(allSuccessful));
    dispatch(nextStep());
  };

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
            : className == "upload_panos"
            ? ".jpg , .jpeg, .avif, .webp, .png"
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

      {fileStatuses.length < maxFiles && (
        <button
          className={`${className ? styles[className] : ""} ${styles.fileBtn}`}
          onClick={onChooseFile}
        >
          <span className={styles.uploadIcon}>
            <FaFile />
          </span>
          <span>Chọn tệp</span>
          {className === "upload_panos" && (
            <span className={styles.upload_tip}>
              Chỉ nhận tối đa 5 ảnh 360 độ có tỷ lệ 2:1{" "}
            </span>
          )}
        </button>
      )}

      {fileStatuses.length > 0 && (
        <div className={styles.file_preview_container}>
          <div className={styles.fileCardsWrapper}>
            {fileStatuses.map(({ file, status, error }, index) => (
              <div key={index} className={styles.file}>
                <div
                  className={styles.file_cards}
                  style={{
                    border: status === "error" ? "1px solid red" : "",
                  }}
                >
                  {status === "uploading" && (
                    <div className={styles.loaderWrapper}>
                      <div className={styles.loader}></div>
                    </div>
                  )}

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

                      <span className={styles.process_label}>
                        {status === "success" ? (
                          <MdFileDownloadDone
                            className={styles.success_label}
                          />
                        ) : uploadStatus === "uploading" ? (
                          <RiLoader2Fill className={styles.waiting_label} />
                        ) : (
                          <MdDeleteForever onClick={() => removeFile(file)} />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {error && <span className={styles.file_error}>{error}</span>}
              </div>
            ))}

            {className === "upload_panos" && (
              <div className={styles.container_btn}>
                <span className={styles.upload_btn} onClick={handleUpload}>
                  {uploadStatus === "done" ? (
                    <span>Tạo lại</span>
                  ) : (
                    <span>Tải lên ({fileStatuses.length}/5)</span>
                  )}
                  <FaCloudUploadAlt />
                </span>

                {fileStatuses.length > 0 &&
                  fileStatuses.every((f) => f.status === "success") && (
                    <span className={styles.next_btn} onClick={nextStep2}>
                      Tiếp tục
                    </span>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(UploadFile);
