import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import styles from "../../styles/listIcon.module.css";

const ListIcon = () => {
  const icons = useSelector((state: RootState) => state.data.icons);

  return (
    <div className={styles.container}>
      <label>Biểu tượng</label>
      <div>
        <div>
          <input type="text" name="" id="" />
        </div>
        <div className={styles.icons_container}>
          {icons.map((icon, index) => (
            <div key={index} className={styles.icon_container}>
              <div
              className={styles.icon_image}
              style={{backgroundImage: `url(${icon.url})`}}
              />
              <span className={styles.icon_name}>{icon.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListIcon;
