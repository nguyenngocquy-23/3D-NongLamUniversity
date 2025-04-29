import React, { useEffect, useState } from "react";
import styles from "../../styles/createTour.module.css";
import { useDispatch, useSelector } from "react-redux";
import { setSpaceId } from "../../redux/slices/PanoramaSlice.ts";
import { AppDispatch, RootState } from "../../redux/Store.tsx";
import { fetchFields } from "../../redux/slices/DataSlice.tsx";
import axios from "axios";
import UploadFile from "./UploadFile.tsx";

interface BoardUploadProps {
  onSelectSpace: (spaceId: string) => void;
  onSelectFiles: (files: File[]) => void;
}

const BoardUploader: React.FC<BoardUploadProps> = ({ onSelectSpace }) => {
  const [listSpace, setListSpace] = useState<{ id: number; name: string }[]>(
    []
  );
  const dispatch = useDispatch<AppDispatch>();

  // Lấy danh sách fields từ Redux
  const fields = useSelector((state: RootState) => state.data.fields);

  useEffect(() => {
    dispatch(fetchFields());
  }, [dispatch]);

  // Lấy danh sách space theo field
  const handleSelectField = async (event: any) => {
    const fieldId = event?.target.value;

    if (!fieldId) {
      setListSpace([]); // Nếu chọn "-- Chọn lĩnh vực --", reset danh sách spaces
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/admin/space/byField",
        { fieldId: fieldId }
      );
      const listSpace = response.data.data;
      setListSpace(listSpace);
    } catch {
      console.log("call api choose field error");
    }
  };

  // Chon space
  const handleSelectSpace = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onSelectSpace(event.target.value);
    dispatch(setSpaceId(event.target.value));
  };

  return (
    <section className={styles.upPanosSection}>
      <div className={styles.leftForm}>
        <div className={styles.item}>
          <label className={styles.label}>Lĩnh vực:</label>
          <select
            className={styles.custom_select}
            name="field"
            id="field"
            onChange={handleSelectField}
          >
            <option value="">Chọn lĩnh vực</option>
            {fields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.item}>
          <label className={styles.label}>Không gian:</label>
          <select
            className={styles.custom_select}
            name="space"
            id="space"
            onChange={handleSelectSpace}
          >
            <option value="">-- Chọn không gian --</option>
            {listSpace.map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
              </option>
            ))}
          </select>
        </div>
        {/* 
          Custom Form Upload file.
      */}
        <div className={styles.panosCard}>
          <UploadFile className={styles.uploadForm} />
        </div>
      </div>
    </section>
  );
};

export default BoardUploader;
