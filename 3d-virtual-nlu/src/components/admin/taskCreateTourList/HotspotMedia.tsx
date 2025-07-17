import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaAngleDown,
  FaAngleLeft,
  FaAngleRight,
  FaAngleUp,
  FaClock,
} from "react-icons/fa6";
import {
  HotspotType,
  updateCornerPoint,
  updateHotspotMedia,
} from "../../../redux/slices/HotspotSlice";
import styles from "../../../styles/tasklistCT/task3.module.css";
import UploadFile from "../UploadFile";
import { useDispatch } from "react-redux";
import { RADIUS_MINIMAP_TOUR } from "../../../utils/Constants";

interface TypeMediaProps {
  isOpenTypeMedia?: boolean;
  hotspotMedia: any;
}

// Component cho Type media
const TypeMedia = ({ hotspotMedia, isOpenTypeMedia }: TypeMediaProps) => {
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState("PICTURE");
  const [isEmbed, setIsEmbed] = useState(false);
  const [scale, setScale] = useState(1);
  const [embedUrl, setEmbedUrl] = useState(
    hotspotMedia.mediaUrl.includes("youtube") ||
      hotspotMedia.mediaUrl.includes("giphy")
      ? hotspotMedia.mediaUrl
      : ""
  );
  const cornerPointList = JSON.parse(hotspotMedia.cornerPointList || "[]") as [
    number,
    number,
    number
  ][];
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
        mediaUrl: !isEmbed ? mediaUrl : embedUrl,
        mediaType,
        caption,
        // positionX: hotspotModel.positionX,
        // positionY: hotspotModel.positionY,
        // positionZ: hotspotModel.positionZ,
      })
    );
  };

  const handleChange = (index: number, axis: "x" | "y", delta: number) => {
    const [x, y, z] = cornerPointList[index];
    let newX = x,
      newY = y;

    if (axis === "x") newX += delta;
    if (axis === "y") newY += delta;

    // const newZ = computeZ(newX, newY);
    dispatch(
      updateCornerPoint({
        hotspotId: hotspotMedia.id,
        index,
        point: [newX, newY, z],
      })
    );
  };

  const triggerLimit = (index: number) => {
    const [x, y, z] = cornerPointList[index];
    if (
      x * x + y * y + z * z + rangeChange >
      RADIUS_MINIMAP_TOUR * RADIUS_MINIMAP_TOUR
    ) {
      console.log("Vượt quá giới hạn cho phép, không thể thay đổi góc này!");
      return true;
    }
    return false;
  };

  const originalCornerPoints = useRef<number[][]>([]);

  useEffect(() => {
    if (cornerPointList.length === 4) {
      originalCornerPoints.current = [...cornerPointList];
    }
  }, [hotspotMedia.id, cornerPointList]);

  const handleScale = (scale: number) => {
    const pointsToScale = originalCornerPoints.current || cornerPointList;
    const scaledPoints = pointsToScale.map(([x, y, z]) => {
      const dx = x - hotspotMedia.positionX;
      const dy = y - hotspotMedia.positionY;
      const dz = z - hotspotMedia.positionZ;

      const newX = hotspotMedia.positionX + dx * scale;
      const newY = hotspotMedia.positionY + dy * scale;
      const newZ = hotspotMedia.positionZ + dz * scale;

      const distanceSq = newX * newX + newY * newY + newZ * newZ;
      if (distanceSq > RADIUS_MINIMAP_TOUR * RADIUS_MINIMAP_TOUR) {
        console.log("Vượt quá giới hạn cho phép, không thể thay đổi góc này!");
        return null;
      }

      return [newX, newY, newZ];
    });

    if (scaledPoints.some((p) => p === null)) return;

    scaledPoints.forEach((point, index) => {
      dispatch(
        updateCornerPoint({
          hotspotId: hotspotMedia.id,
          index,
          point: point as [number, number, number],
        })
      );
    });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    setScale(newScale);
    handleScale(newScale);
  };

  const displayOrder = [0, 1, 3, 2]; // vị trí gốc của các đỉnh
  const rangeChange = 0.5; // khoảng thay đổi góc
  return (
    <div
      className={`${styles.type_media} ${
        isOpenTypeMedia ? styles.open_type_media : ""
      }`}
    >
      <>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label className={styles.label}>Điều chỉnh góc:</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.5rem",
              width: "94%",
              margin: "1rem 0",
            }}
          >
            {displayOrder.map((originalIndex) => {
              const point = cornerPointList[originalIndex];
              return (
                <div
                  key={point[0] + point[1] + point[2] + originalIndex}
                  className={styles.config_corner}
                >
                  <div className={styles.config_corner_side}>
                    <FaAngleLeft
                      className={styles.corner_button}
                      onClick={() =>
                        handleChange(originalIndex, "x", -rangeChange)
                      }
                    />
                  </div>

                  <div className={styles.config_corner_center}>
                    <FaAngleUp
                      className={`${styles.corner_button}`}
                      onClick={() =>
                        handleChange(originalIndex, "y", rangeChange)
                      }
                    />
                    <div className={styles.corner_value_display}>
                      <span className={styles.x}>{point[0].toFixed(2)}</span>
                      <span className={styles.y}>{point[1].toFixed(2)}</span>
                      <span className={styles.z}>{point[2].toFixed(2)}</span>
                    </div>
                    <FaAngleDown
                      className={styles.corner_button}
                      onClick={() =>
                        handleChange(originalIndex, "y", -rangeChange)
                      }
                    />
                  </div>

                  <div className={styles.config_corner_side}>
                    <FaAngleRight
                      className={styles.corner_button}
                      onClick={() =>
                        handleChange(originalIndex, "x", rangeChange)
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.row_container}>
          <label className={styles.label}>Độ to:</label>
          <div
            className={styles.scale_icon_content}
            style={{ display: "flex", alignItems: "center" }}
          >
            <div className={styles.label_scale}>{scale}</div>
            <div className={styles.edit_icon_scale}>
              <input
                type="range"
                min={0.6}
                max={2}
                step={0.05}
                value={scale}
                onChange={onChange}
              />
              <progress max="2" value={scale}></progress>
            </div>
          </div>
        </div>
        <div className={styles.row_container}>
          <label className={styles.label}>Thể loại:</label>
          <div>
            <button
              onClick={() => {
                setMediaType("PICTURE");
              }}
              className={`${styles.choose_media_type} ${
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
              className={`${styles.choose_media_type} ${
                mediaType == "VIDEO" ? styles.choosed : ""
              }`}
            >
              Video
            </button>
          </div>
        </div>
        <div className={styles.row_container}>
          <div className={styles.label_container}>
            <button
              className={`${styles.label_upload} ${
                isEmbed ? "" : styles.choosed
              }`}
              onClick={() => setIsEmbed(false)}
            >
              Tải lên
            </button>
            <button
              className={`${styles.label_upload} ${
                isEmbed ? styles.choosed : ""
              }`}
              onClick={() => setIsEmbed(true)}
            >
              Nhúng
            </button>
          </div>
          <div
            style={{
              position: "relative",
              display: "flex",
              flex: "1 1",
              minHeight: "80px",
            }}
          >
            {!isEmbed ? (
              <UploadFile
                className={
                  mediaType == "PICTURE" ? "upload_image" : "upload_video"
                }
                hotspotId={hotspotMedia?.id}
                onUploaded={handleUploadedFile}
              />
            ) : (
              <input
                type="text"
                placeholder="Nhập URL nhúng (embed URL)..."
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                className={styles.embed_input}
              />
            )}
          </div>
        </div>
        <div className={styles.row_container}>
          <label className={styles.label}>Tiêu đề:</label>
          <textarea
            className={styles.title_input}
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
