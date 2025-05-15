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

interface UpdateHotspotProps {
  hotspotId: string | null;
  onPropsChange: (value: BaseHotspot) => void;
}

// Component cho Task3
const UpdateHotspot = ({ hotspotId, onPropsChange }: UpdateHotspotProps) => {
  const [openTypeIndex, setOpenTypeIndex] = useState<number>(1); // State để lưu index của type đang mở
  const hotspotType = useSelector(
    (state: RootState) => state.data.hotspotTypes
  );
  console.log("mount update hotspot.........");
  const [isUpdate, setIsUpdate] = useState(true);

  return (
    <div className={styleCTs.task_container}>
      <div className={styleCTs.task_content}>
        <div className={styles.task3}>
          <ConfigIcon
            isUpdate={isUpdate}
            onPropsChange={onPropsChange}
            currenHotspotType={openTypeIndex}
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
