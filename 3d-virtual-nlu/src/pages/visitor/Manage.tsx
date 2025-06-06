import styles from '../../styles/visitor/createTour.module.css';
import { Outlet } from 'react-router-dom';
import NavTour from '../../components/visitor/NavTour';
import { useState } from 'react';

const VisitorManage = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className={styles.container}>
      <NavTour setIsOpenNav={setIsOpen}/>
      {/* <CreateNode/> */}
      <div
        style={{ height: isOpen ? "80%" : "95%", transition: "all .5s ease" }}
      >
        <Outlet /> {/* Nội dung page */}
      </div>
    </div>
  )
}

export default VisitorManage;
