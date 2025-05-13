import React, { useRef, useState } from "react";
import styles from "../../styles/createTourStepper.module.css";

/**
 * Quy đổi: currentStep (1) = stepsConfig[0]
 */

interface StepConfig {
  name: string;
  Component: React.FC;
}

interface CreateTourStepperProps {
  stepsConfig: StepConfig[]; // Mảng các bước tạo Tour hoàn chỉnh.
}

const CreateTourStepper: React.FC<CreateTourStepperProps> = ({
  stepsConfig,
}) => {
  const [currentStep, setCurrentStep] = useState(1); // 1 -> 2 -> 3 -> 4, Complete.
  const [isComplete, setIsComplete] = useState(false);
  const [margins, setMargins] = useState({
    marginLeft: 0,
    marginRight: 0,
  });
  const stepRef = useRef([]);

  const ActiveComponent = stepsConfig[currentStep - 1]?.Component;

  const handleNextStep = () => {
    setCurrentStep((prevStep) => {
      if (prevStep === stepsConfig.length) {
        setIsComplete(true); // Trường hợp xuất bản => Insert vô database.
        return prevStep;
      } else {
        return prevStep + 1;
      }
    });
  };

  return (
    <>
      <div className={styles.stepper}>
        {stepsConfig.map((step, index) => {
          return (
            <div key={step.name} className={styles.step}>
              <div className={styles.stepNumber}>
                {currentStep > index + 1 || isComplete ? (
                  <span>&#10003;</span>
                ) : (
                  index + 1
                )}
              </div>
              <div className={styles.stepName}>{step.name}</div>
            </div>
          );
        })}
        <div className={styles.progressBar}>
          <div className={styles.progress}></div>
        </div>

        {!isComplete && (
          <button className={styles.btnNext} onClick={handleNextStep}>
            {currentStep === stepsConfig.length ? "Xuất bản" : "Tiếp tục"}
          </button>
        )}
      </div>
        
      <div className={styles.stepContent}>
        <ActiveComponent />
      </div>
    </>
  );
};

export default CreateTourStepper;
