import React from 'react'
import styles from '../../styles/visitor/manage.module.css'
import CreateNode from '../../features/CreateTour'
import { FaBook} from 'react-icons/fa6'

const VisitorCreateTour = () => {
  return (
    <div className={styles.container}>
     <CreateNode/>
    </div>
  )
}

export default VisitorCreateTour;
