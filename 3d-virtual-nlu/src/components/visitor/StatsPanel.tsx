import Stats from "three/examples/jsm/libs/stats.module.js";
import { useEffect } from "react";
import styles from "../../styles/virtualTour.module.css";

const StatsPanel: React.FC<{ className?: string }> = ({ className }) => {
  useEffect(() => {
    const stats = new Stats();
    document.body.appendChild(stats.dom);

    const updateStats = () => {
      stats.update();
      requestAnimationFrame(updateStats);
    };

    updateStats();

    return () => {
      document.body.removeChild(stats.dom);
    };
  }, []);

  return null;
};

export default StatsPanel;
