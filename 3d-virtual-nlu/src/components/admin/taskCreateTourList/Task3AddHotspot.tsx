import { useState } from "react";
import styles from "../../../styles/tasklistCT/task3.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/Store";
import TypeNavigation from "./HotspotNavigation";
import { HotspotType } from "../../../redux/slices/HotspotSlice";
import TypeInfomation from "./HotspotInformation";
import TypeModel, { HotspotModelCreateRequest } from "./HotspotModel";
import TypeMedia, {
  CornerPoint,
  HotspotMediaCreateRequest,
} from "./HotspotMedia";
import ConfigIcon from "../ConfigIcon";

interface Task3Props {
  assignable: boolean;
  setAssignable: (value: boolean) => void;
  hotspotModels: HotspotModelCreateRequest[];
  // setHotspotModels: (value: HotspotModelCreateRequest[]) => void;
  chooseCornerMediaPoint: boolean;
  setChooseCornerMediaPoint: (value: boolean) => void;
  currentPoints: [number, number, number][]; // mesh đang chọn
  setCurrentPoints: (val: any) => void;
  // videoMeshes: HotspotMediaCreateRequest[]; // danh sách mesh đã xong
  // setVideoMeshes: (val: any) => void;
  // cornerPointes: CornerPoint[]; // danh sách mesh đã xong
  // setCornerPointes: (val: any) => void;
  currentHotspotType: HotspotType | null;
  setCurrentHotspotType: (value: HotspotType) => void;
}

// Component cho Task3
const Task3 = ({
  assignable,
  setAssignable,
  hotspotModels,
  // setHotspotModels,
  chooseCornerMediaPoint,
  setChooseCornerMediaPoint,
  currentPoints,
  setCurrentPoints,
  // setVideoMeshes,
  setCurrentHotspotType,
}: Task3Props) => {
  const [openTypeIndex, setOpenTypeIndex] = useState<number | null>(1); // State để lưu index của type đang mở
  const hotspotType = useSelector(
    (state: RootState) => state.data.hotspotTypes
  );

  const handleChooseType = (typeIndex: number) => {
    setOpenTypeIndex((prevIndex) =>
      prevIndex === typeIndex ? null : typeIndex
    );
  };

  return (
    <div className={styles.task3}>
      <div className={styles.select_header}>
        <select
          className={styles.select_type}
          onChange={(e) => handleChooseType(Number(e.target.value))}
        >
          {hotspotType.map((type) => (
            <option value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>
      {/* // setup icon */}
      <ConfigIcon currenHotspotType={openTypeIndex} />
      <TypeNavigation
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
      />
      <TypeModel
        isOpenTypeModel={openTypeIndex == 4}
        hotspotModels={hotspotModels}
        assignable={assignable}
        setAssignable={setAssignable}
        setCurrentHotspotType={setCurrentHotspotType}
      />
    </div>
  );
};

export default Task3;
