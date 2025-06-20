import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../styles/spaceDetail.module.css";
import { IoChevronBack } from "react-icons/io5";
import axios from "axios";
import { API_URLS } from "../../env";
import { TourNodeRequestMapper } from "../../utils/TourNodeRequestMapper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { addPanoramasFromResponse } from "../../redux/slices/PanoramaSlice";
import { addHotspotsFromResponse } from "../../redux/slices/HotspotSlice";
const SpaceDetail = () => {
  const navigate = useNavigate();

  const { spaceId } = useParams(); //Id từ url
  const dispatch = useDispatch<AppDispatch>();
  const { panoramaList, currentSelectId } = useSelector(
    (state: RootState) => state.panoramas
  );
  useEffect(() => {
    if (!spaceId) return;

    axios
      .post(API_URLS.ADMIN_GET_MASTER_NODES_OF_SPACE, {
        spaceId: Number(spaceId),
      })
      .then((res) => {
        const nodes = res.data.data;
        const { panoramaList, hotspotList } =
          TourNodeRequestMapper.mapToPanoramaAndHotspots(nodes);
        dispatch(addPanoramasFromResponse(panoramaList));
        dispatch(addHotspotsFromResponse(hotspotList));
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách node:", err);
      });
  }, [spaceId, dispatch]);

  const handleSelect = async (spaceId: number, masterNodeId: number) => {
    if (!masterNodeId || masterNodeId === 0) return;

    try {
      const payload = {
        id: spaceId,
        masterNodeId: masterNodeId,
      };

      const response = await axios.post(
        API_URLS.ADMIN_CHANGE_MASTER_NODE_BY_ID,
        payload
      );

      console.log("Cập nhật thành công:", response.data.message);
      // Thêm toast hoặc cập nhật UI nếu cần
    } catch (error) {
      console.error("Lỗi khi cập nhật master node:", error);
    }
  };

  return (
    <>
      <div className={styles.space_container}>
        <div className={styles.space_header}>
          <IoChevronBack
            className={styles.space_icon_back}
            onClick={() => navigate(-1)}
          />
          <h5 className={styles.space_title}></h5>
        </div>

        <div className={styles.space_choose_master}>
          <span>Trung tâm</span>
          <select
            className={styles.custom_select}
            onChange={(e) =>
              handleSelect(Number(spaceId), parseInt(e.target.value, 10))
            }
          >
            <option value="0">-- Chọn tour--</option>
            {panoramaList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.config.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default SpaceDetail;
