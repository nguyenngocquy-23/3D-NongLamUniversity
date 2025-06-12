import { useCallback, useEffect, useState } from "react";
import { FaHome } from "react-icons/fa";
import { FaClock } from "react-icons/fa6";
import {
  HotspotType,
  updateHotspotMedia,
} from "../../../redux/slices/HotspotSlice";
import styles from "../../../styles/tasklistCT/task3.module.css";
import UploadFile from "../UploadFile";
import { useDispatch } from "react-redux";

interface TypeMediaProps {
  isOpenTypeMedia?: boolean;
  setChangeCorner: (value: boolean) => void;
  hotspotMedia: any;
}

// Component cho Type media
const TypeMedia = ({
  hotspotMedia,
  isOpenTypeMedia,
  setChangeCorner,
}: TypeMediaProps) => {
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState("PICTURE");
  const dispatch = useDispatch();

  useEffect(() => {
    setMediaUrl(hotspotMedia.mediaUrl || "");
    setCaption(hotspotMedia.caption || "");
    setMediaType(hotspotMedia.mediaType || "PICTURE");
  }, [hotspotMedia]);

  const handleUploadedFile = useCallback((url: string) => {
    setMediaUrl(url);
  }, []);

  const handleUpdateMedia = () => {
    dispatch(
      updateHotspotMedia({
        hotspotId: hotspotMedia.id,
        mediaUrl,
        mediaType,
        caption,
        // positionX: hotspotModel.positionX,
        // positionY: hotspotModel.positionY,
        // positionZ: hotspotModel.positionZ,
      })
    );
  };

  return (
    <div
      className={`${styles.type_media} ${
        isOpenTypeMedia ? styles.open_type_media : ""
      }`}
    >
      <>
        <div style={{ display: "inline-flex" }}>
          <label className={styles.label}>Điều chỉnh góc:</label>
          <div>
            <button
              onClick={() => {
                setChangeCorner(true);
              }}
              style={{
                padding: "0.5rem 1rem",
              }}
            >
              Điều chỉnh góc
            </button>
          </div>
        </div>
        <div style={{ display: "inline-flex" }}>
          <label className={styles.label}>Thể loại:</label>
          <div>
            <button
              onClick={() => {
                setMediaType("PICTURE");
              }}
              className={`${styles.chooseMediaType} ${
                mediaType == "PICTURE" ? styles.choosed : ""
              }`}
            >
              Ảnh
            </button>
          </div>
          <div>
            <button
              onClick={() => {
                setMediaType("VIDEO");
              }}
              className={`${styles.chooseMediaType} ${
                mediaType == "VIDEO" ? styles.choosed : ""
              }`}
            >
              Video
            </button>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <label className={styles.label}>Tải lên:</label>
          <div
            style={{
              position: "relative",
              display: "flex",
              flex: "1 1",
              minHeight: "80px",
            }}
          >
            <UploadFile
              className={
                mediaType == "PICTURE" ? "upload_image" : "upload_video"
              }
              hotspotId={hotspotMedia?.id}
              onUploaded={handleUploadedFile}
            />
          </div>
        </div>
        <div style={{ display: "inline-flex" }}>
          <label className={styles.label}>Tiêu đề:</label>
          <textarea
            name=""
            id=""
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
        <button
          onClick={() => handleUpdateMedia()}
          style={{
            padding: "0.5rem 1rem",
          }}
        >
          Cập nhật
        </button>
      </>
    </div>
  );
};

export default TypeMedia;
