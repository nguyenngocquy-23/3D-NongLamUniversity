import { RxUpdate } from "react-icons/rx";
import styles from "../../styles/spaceCard.module.css";
import Space from "../../pages/admin/ManagerSpace";
import { format } from "date-fns";
import { MdCloudUpload, MdNotStarted } from "react-icons/md";
import { FaPlayCircle } from "react-icons/fa";
import { ChangeEvent, useRef, useState } from "react";
import {
  ApiResponse,
  CloudinaryUploadResp,
  FileUploadStatus,
} from "./UploadFile";
import { API_URLS } from "../../env";
import Swal from "sweetalert2";
import axios, { AxiosError } from "axios";
import { buildImageUrlWithQuality } from "../../utils/getCloudinaryURL";

type SpaceCardProps = {
  space: Space;
  setSelectedSpace?: (space: Space) => void;
};
const SpaceCard: React.FC<SpaceCardProps> = ({ space, setSelectedSpace }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus | null>(
    null
  );

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0];
    if (!newFile) return;

    setFileStatuses({
      file: newFile,
      status: "uploading",
    });

    await handleUpload(newFile);
  };

  const handleUpload = async (file: File): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const resp = await axios.post<ApiResponse<CloudinaryUploadResp>>(
        API_URLS.UPLOAD_CLOUD,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (resp.data.statusCode === 200) {
        const item = resp.data.data!;
        if (item.originalFileName && item.url) {
          Swal.fire({
            icon: "success",
            title: "Tải ảnh thành công!!",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
          });
          // Đánh dấu thành công
          setFileStatuses({
            file,
            status: "success",
            uploadedUrl: item.url,
          });

          if (setSelectedSpace) {
            setSelectedSpace({ ...space, url: item.url });
          }
        }
      } else {
        // Đánh dấu lỗi nếu server trả về lỗi

        setFileStatuses({
          file,
          status: "error",
          error: resp.data.message,
        });
        Swal.fire({
          icon: "error",
          title: `Tải ảnh thất bại ${fileStatuses?.error}`,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
        });
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ApiResponse<null>>;
      const message = err.response?.data?.message || err.message;

      // Đánh dấu lỗi nếu request bị lỗi
      setFileStatuses({
        file,
        status: "error",
        error: message,
      });

      Swal.fire({
        icon: "error",
        title: `Tải ảnh thất bại ${fileStatuses?.error}`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
    }
  };

  return (
    <div className={styles.space_wrapper}>
      <div
        className={styles.space_card}
        style={{
          backgroundImage: `url(${
            space.url ? space.url : "https://placehold.co/600x400"
          })`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <div className={styles.space_content}>
        <span className={styles.space_id}>#{space.id}</span>
        <span className={styles.space_field_label}>{space.fieldName}</span>
        <span
          className={
            space.status === 2 ? styles.space_title_master : styles.space_title
          }
        >
          {space.name}
        </span>
        {space.id === 0 ? (
          <span
            className={styles.space_upload_thumbnail}
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            <input
              ref={inputRef}
              type="file"
              onChange={handleFileChange}
              accept={".jpg , .jpeg, .avif, .webp, .png"}
              style={{ display: "none" }}
            />
            <MdCloudUpload />
          </span>
        ) : (
          <span className={styles.space_start_node}>
            <FaPlayCircle />
            {space.masterNodeName}
          </span>
        )}

        {space.id !== 0 && (
          <div className={styles.space_bottom}>
            {space.status > 0 ? (
              <div
                className={styles.status}
                style={{
                  backgroundColor: "#0e9013",
                }}
              >
                <span>Hoạt động</span>
              </div>
            ) : (
              <div
                className={styles.status}
                style={{
                  backgroundColor: "#f9a620",
                }}
              >
                <span>Tạm ngưng</span>
              </div>
            )}

            <span className={styles.space_updated_at}>
              <RxUpdate />{" "}
              {space.updatedAt !== null &&
                format(new Date(space.updatedAt), "dd/MM/yyyy ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceCard;
