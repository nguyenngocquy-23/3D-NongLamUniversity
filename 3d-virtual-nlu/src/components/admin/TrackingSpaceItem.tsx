import { PanoramaItem } from "../../redux/slices/PanoramaSlice";
import styles from "../../styles/trackingSpaceItem.module.css";
type TrackingSpaceItemProps = {
  data: { img: string; name: string };
};

const TrackingSpaceItem: React.FC<TrackingSpaceItemProps> = ({ data }) => {
  return (
    <div className={styles.tracking_item_container}>
      <img src={data.img} alt="" className={styles.item_img} />
      <span className={styles.item_name}>{data.name}</span>
    </div>
  );
};

export default TrackingSpaceItem;
