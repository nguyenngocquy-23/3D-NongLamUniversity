import {
  MdHideImage,
  MdErrorOutline,
  MdHourglassEmpty,
  MdHelpOutline,
  MdSearchOff,
} from "react-icons/md";
import styles from "../styles/visitor/tours.module.css";

type EmptyProps = {
  typeIllustrator: string;
  title: string;
  content: string;
};

const Empty: React.FC<EmptyProps> = ({ typeIllustrator, title, content }) => {
  const renderIcon = () => {
    switch (typeIllustrator) {
      case "empty_node":
        return <MdHideImage className={styles.empty_icon} />;
      case "empty_search":
        return <MdSearchOff className={styles.empty_icon} />;
      case "error":
        return <MdErrorOutline className={styles.empty_icon} />;
      case "loading":
        return <MdHourglassEmpty className={styles.empty_icon} />;
      default:
        return <MdHelpOutline className={styles.empty_icon} />;
    }
  };

  return (
    <div className={styles.empty_center}>
      {renderIcon()}
      <div className={styles.empty_content}>
        <h3 className={styles.empty_titles}>{title}</h3>
        <span>{content}</span>
      </div>
    </div>
  );
};

export default Empty;
