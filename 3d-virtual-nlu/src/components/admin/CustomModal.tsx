import React, { useState } from "react";
import styles from "../../styles/modelCreate.module.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFields,
  fetchIcons,
  fetchSpaces,
} from "../../redux/slices/DataSlice";
import { AppDispatch, RootState } from "../../redux/Store";
import UploadFile from "./UploadFile";

interface CustomModalProps {
  onClose: () => void;
  title: string;
  fields: { label: string; name: string; type: string }[]; // Danh sách các trường
  apiUrl: string; // URL để gọi API
}

const CustomModal: React.FC<CustomModalProps> = ({
  onClose,
  title,
  fields,
  apiUrl,
}) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const listFields = useSelector((state: RootState) => state.data.fields);

  const dispatch = useDispatch<AppDispatch>();

  const handleFadeOut = () => {
    setFadeOut(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleUpFileIcon = (url: string) => {
    setFormData((prev) => ({ ...prev, url: url }));
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Nếu trường đang nhập là "name", thì update luôn "code"
      // if (name === "name" && fields[0].name.includes("code")) {
      if (name === "name") {
        updated["code"] = removeVietnameseTones(value);
      }
      return updated;
    });
  };

  const removeVietnameseTones = (str: string): string => {
    const accents =
      "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
    const noAccents =
      "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";

    const map: { [key: string]: string } = {};
    for (let i = 0; i < accents.length; i++) {
      map[accents[i]] = noAccents[i];
    }

    return str
      .split("")
      .map((char) => map[char] || char)
      .join("")
      .toLowerCase();
  };

  const handleCreate = async () => {
    try {
      console.log("formData: ", formData);
      const response = await axios.post(apiUrl, formData);
      if (response.data.statusCode === 1000 || response.status === 200) {
        handleFadeOut();
        dispatch(fetchFields());
        dispatch(fetchSpaces());
        dispatch(fetchIcons());
      } else {
        Swal.fire({
          title: "Error",
          text: "Error creating model",
          icon: "error",
          showCancelButton: false,
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: "Error",
        text: "Server error",
        icon: "error",
        showCancelButton: false,
      });
    }
  };

  return (
    <div className={`${styles.container} ${fadeOut ? styles.fadeOut : ""}`}>
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        onClick={handleFadeOut}
      ></div>
      <div className={`${styles.monitor} ${fadeOut ? styles.fadeOut : ""}`}>
        <div className={styles.content}>
          <h1>{title}</h1>
          {fields.map((field, index) => (
            <div key={index}>
              <label>{field.label}: </label>

              {/* Hiển thị <b> nếu là "code" (readonly) */}
              {field.name === "code" ? (
                <b>{formData[field.name] || ""}</b>
              ) : field.type === "select" ? (
                <select
                  className={styles.input}
                  name={field.name}
                  value={formData[field.name] || ""}
                >
                  <option value="">-- Chọn lĩnh vực --</option>
                  {listFields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              ) : field.type === "area" ? (
                <textarea
                  className={styles.input}
                  name={field.name}
                  value={formData[field.name] || ""}
                  rows={4}
                />
              ) : field.name === "iconUrl" ? (
                <UploadFile
                  className={"upload_icon"}
                  onUploaded={handleUpFileIcon}
                />
              ) : field.name === "url" ? (
                <UploadFile
                  className={"upload_image"}
                  onUploaded={handleUpFileIcon}
                />
              ) : (
                <input
                  className={styles.input}
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChangeInput}
                />
              )}
              <br />
            </div>
          ))}
          <button onClick={handleCreate}>Lưu</button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
