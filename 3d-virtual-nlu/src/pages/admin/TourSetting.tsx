import VirtualTour from "../visitor/VirtualTour";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";

const TourSetting = () => {
  const { panoramaList, currentSelectPosition } = useSelector(
    (state: RootState) => ({
      panoramaList: state.panoramas.panoramaList,
      currentSelectPosition: state.panoramas.currentSelectedPosition,
    })
  );
  const currentPanoramaUrl = panoramaList[currentSelectPosition]?.url;
  return (
    <div>
      <VirtualTour textureUrl={currentPanoramaUrl} />
    </div>
  );
};

export default TourSetting;
