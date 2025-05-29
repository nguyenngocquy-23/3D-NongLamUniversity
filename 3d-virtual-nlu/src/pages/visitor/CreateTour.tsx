import React from 'react'
import CreateNode from '../../features/CreateTour'
import styles from '../../styles/visitor/createTour.module.css';
import { FaAngleLeft } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

const VisitorCreateTour = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => {navigate(-1)}}>
        <FaAngleLeft />
      </button>
      <CreateNode/>
    </div>
  )
}

export default VisitorCreateTour;
