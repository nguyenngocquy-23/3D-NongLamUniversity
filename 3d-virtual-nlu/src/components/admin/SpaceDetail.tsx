import React from "react";
import { useParams } from "react-router-dom";
import styles from "../../styles/spaceDetail.module.css";
import { IoChevronBack } from "react-icons/io5";
const SpaceDetail = () => {
  const { id } = useParams(); //Id từ url
  // const [space, setSpace] = useState

  return (
    <>
      <div className={styles.space_container}>
        <div className={styles.space_header}>
          <IoChevronBack />
          <h5 className={styles.space_title}></h5>
        </div>
      </div>
    </>
  );
};

export default SpaceDetail;
