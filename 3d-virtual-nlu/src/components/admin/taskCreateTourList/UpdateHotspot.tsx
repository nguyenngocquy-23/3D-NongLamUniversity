import { useState } from "react";
import styles from "../../../styles/tasklistCT/task3.module.css";
import styleCTs from "../../../styles/updateHotspot.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/Store";
import TypeNavigation from "./HotspotNavigation";
import { BaseHotspot } from "../../../redux/slices/HotspotSlice";
import TypeInfomation from "./HotspotInformation";
import TypeModel from "./HotspotModel";
import ConfigIcon from "../ConfigIcon";
import { FaAngleLeft } from "react-icons/fa6";
import TypeMedia from "./HotspotMedia";

interface UpdateHotspotProps {
  hotspotId: string | null;
  setHotspotId: (value: string | null) => void;
  onPropsChange: (value: BaseHotspot) => void;
  limitNav: boolean;
}

// Component cho Task3
const UpdateHotspot = ({
  hotspotId,
  setHotspotId,
  onPropsChange,
  limitNav,
}: UpdateHotspotProps) => {
  const propHotspot = useSelector(
    (state: RootState) => state.hotspots.hotspotList
  ).find((h) => h.id === hotspotId);

  const iconObj = useSelector((state: RootState) => state.data.icons).find(
    (i) => i.id === propHotspot?.iconId
  );

  const [isUpdate, setIsUpdate] = useState(true);
  /**
   * Vấn đề phải đợi select đủ dữ liệu mới render
   * Tránh truyền null/ underfine khi chưa có dữ liệu
   */
  if (!propHotspot) {
    return null;
  }
  const currentType = propHotspot?.type; // State để lưu index của type đang mở

  return (
    <div className={styleCTs.task_content}>
      <div className={styles.select_header}>
        <FaAngleLeft
          onClick={() => {
            setHotspotId(null);
          }}
        />
        <h3>Cập nhật</h3>
      </div>
      <div className={styles.task3}>
        {currentType != 3 ? (
          <>
            <ConfigIcon
              type={iconObj.type}
              propHotspot={propHotspot}
              isUpdate={isUpdate}
              onPropsChange={onPropsChange}
              currentHotspotType={currentType ?? null}
            />
            {(() => {
              switch (currentType) {
                case 1:
                  return (
                    <TypeNavigation
                      hotspotNav={propHotspot}
                      limitNav={limitNav}
                    />
                  );
                case 2:
                  return <TypeInfomation hotspotInfo={propHotspot} />;
                case 4:
                  return <TypeModel hotspotModel={propHotspot} />;
                default:
                  return null;
              }
            })()}
          </>
        ) : (
          <>
            <TypeMedia
              hotspotMedia={propHotspot}
            />
          </>
        )}
      </div>
      {/* </div> */}
    </div>
  );
};

export default UpdateHotspot;
