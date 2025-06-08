import React from 'react'
import styles from '../../styles/visitor/manage.module.css'
import CreateNode from '../../features/CreateTour'
import { FaBook} from 'react-icons/fa6'

const VisitorCreateTour = () => {
  return (
    <div className={styles.container}>
     <CreateNode/>
     <button className={styles.guide_button} title='Hướng dẫn'>
      <FaBook/>
     </button>
    </div>
  )
}

export default VisitorCreateTour;
