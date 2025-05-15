import { useState } from "react";
import styles from "../../../styles/tasklistCT/task3.module.css";
import styleCTs from "../../../styles/taskcontainerct.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/Store";
import TypeNavigation from "./HotspotNavigation";
import { BaseHotspot, HotspotType } from "../../../redux/slices/HotspotSlice";
import TypeInfomation from "./HotspotInformation";
import TypeModel, { HotspotModelCreateRequest } from "./HotspotModel";
import ConfigIcon from "../ConfigIcon";
import { FaAngleLeft, FaRightLeft } from "react-icons/fa6";

interface UpdateHotspotProps {
  hotspotId: string | null;
  setHotspotId: (value: string | null) => void;
  onPropsChange: (value: BaseHotspot) => void;
}

// Component cho Task3
const UpdateHotspot = ({
  hotspotId,
  setHotspotId,
  onPropsChange,
}: UpdateHotspotProps) => {
  const propHotspot = useSelector(
    (state: RootState) => state.hotspots.hotspotList
  ).find((h) => h.id == hotspotId);
  const currentType = propHotspot?.type; // State để lưu index của type đang mở
  const [isUpdate, setIsUpdate] = useState(true);

  return (
    <div className={styleCTs.task_container}>
      <div className={styleCTs.task_content}>
        <div className={styles.select_header}>
          <FaAngleLeft
            onClick={() => {
              setHotspotId(null);
            }}
          />
        </div>
        <div className={styles.task3}>
          <ConfigIcon
            propHotspot={propHotspot}
            isUpdate={isUpdate}
            onPropsChange={onPropsChange}
            currentHotspotType={currentType ?? null}
          />
          {/* <TypeNavigation
        isOpenTypeNavigation={openTypeIndex == 1}
        setAssignable={setAssignable}
        setCurrentHotspotType={setCurrentHotspotType}
      />
      <TypeInfomation
        isOpenTypeInfomation={openTypeIndex == 2}
        setAssignable={setAssignable}
        setCurrentHotspotType={setCurrentHotspotType}
      />
      <TypeMedia
        isOpenTypeMedia={openTypeIndex == 3}
        currentPoints={currentPoints}
        setCurrentPoints={setCurrentPoints}
        chooseCornerMediaPoint={chooseCornerMediaPoint}
        setChooseCornerMediaPoint={setChooseCornerMediaPoint}
        setAssignable={setAssignable}
        setCurrentHotspotType={setCurrentHotspotType}
      /> */}
          <TypeModel />
        </div>
      </div>
    </div>
  );
};

export default UpdateHotspot;
