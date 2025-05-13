import React, { useEffect, useState } from "react";
import styles from "../../styles/createTour.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { useNavigate } from "react-router-dom";
import { TourNodeRequestMapper } from "../../utils/TourNodeRequestMapper";
import axios from "axios";

const CreateTourStep3: React.FC = () => {
  const panoramas = useSelector((state: RootState) => state.panoramas);
  const hotspots = useSelector((state: RootState) => state.hotspots);
  const userId = useSelector((state: RootState) => state.auth.user.id);
  const navigate = useNavigate();

  const handlePublishTour = async () => {
    const { panoramaList, spaceId } = panoramas;

    if (!spaceId || panoramaList.length === 0) {
      alert("spaceId bị null hay panorama không chứa giá trị..");
      return;
    }
    try {
      //Step1: Mapping dữ liệu Redux với Request bên backend.
      const payload = TourNodeRequestMapper.mapOneNodeCreateRequest(
        panoramaList,
        hotspots.hotspotList,
        userId
      );

      // Step2: Gửi lên backend
      const response = await axios.post(
        "http://localhost:8080/api/v1/admin/node/insert",
        payload
      );
      if (response.data?.statusCode === 1000) {
        alert("Xuất bản thành công");
      } else {
        alert("Xuất bản thất bại:" + response.data?.message);
      }
    } catch (error) {
      console.log("Lỗi khi xuất bản: ", error);
    }
  };

  return (
    <div>
      <button onClick={handlePublishTour}>Xuất bản</button>
    </div>
  );
};

export default CreateTourStep3;
