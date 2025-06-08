import React from "react";
import styles from "../../styles/createTour.module.css";

interface ProcessBarProps {
  activeStep: number;
  totalSteps?: number;
}

const ProcessBar: React.FC<ProcessBarProps> = ({ activeStep, totalSteps = 5 }) => {
  return (
    <div className={styles.processBar}>
      {[...Array(totalSteps)].map((_, index) => {
        const step = index + 1;
        return (
          <div
            key={step}
            className={`${styles.step} ${activeStep >= step ? styles.active : ""}`}
          >
            {activeStep > step ? "✔" : step}
          </div>
        );
      })}
    </div>
  );
};

export default ProcessBar;