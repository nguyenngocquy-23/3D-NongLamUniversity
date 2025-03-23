import React, { use, useState } from "react";
import styles from "./tourmanager.module.css";
import Header from "../HomePage/homeBanner/Header";
import CreateTour from "./CreateTour/CreateTour";
import EditTour from "./EditTour/EditTour";
import CreateNode from "../Admin/CreateNode/CreateNode";
const TourManager = () => {
  const [activeTab, setActiveTab] = useState("create"); //Mặc định sẽ là tạo tour mới.

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.tablist}>
        <button
          className={`${styles.subTab} ${
            activeTab === "create" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("create")}
        >
          Thêm tour mới
        </button>

        <button
          className={`${styles.subTab} ${
            activeTab === "edit" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("edit")}
        >
          Thêm tour mới
        </button>
      </div>

      {/* Nội dung tab */}
      <div className={styles.content}>
        {activeTab === "create" ? <CreateNode /> : <EditTour />}
      </div>
    </div>
  );
};

export default TourManager;
