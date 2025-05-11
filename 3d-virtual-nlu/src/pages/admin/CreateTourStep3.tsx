import React, { useEffect, useState } from "react";
import styles from "../../styles/createTour.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";

interface NodeCreateRequest {
  spaceId: number;
  userId: number;
  url: string;
  name: string;
  description: string;
  autoRotate: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  lightIntensity: number;
  speedRotate: number;
}

// Chuẩn hoá Redux sang API Backend:
const mapPanoramaToNodePayload = (
  panorama: any,
  spaceId: string,
  userId: number
): NodeCreateRequest => ({
  spaceId: parseInt(spaceId, 10),
  userId,

  url: panorama.url,
  name: panorama.config.name,
  description: panorama.config.description,
  autoRotate: panorama.config.autoRotate,
  positionX: panorama.config.positionX,
  positionY: panorama.config.positionY,
  positionZ: panorama.config.positionZ,
  lightIntensity: panorama.config.lightIntensity,
  speedRotate: panorama.config.speedRotate,
});

const CreateTourStep3: React.FC = () => {
  const panoramas = useSelector((state: RootState) => state.panoramas);
  const hotspots = useSelector((state: RootState) => state.hotspots);
  const userId = useSelector((state: RootState) => state.auth.user.id);

  const handlePublish = async () => {
    const { panoramaList, spaceId } = panoramas;

    try {

      if(spaceId === null) return;
      for(const panorama of panoramaList)  {
        const nodePayload = mapPanoramaToNodePayload(panorama, spaceId, userId);



      }




    }

  };

  return (
    <div>
      <button>Xuất bản</button>
    </div>
  );
};

export default CreateTourStep3;
