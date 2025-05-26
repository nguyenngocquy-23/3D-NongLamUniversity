import React, { useEffect, useRef, useState } from "react";
import styles from "../../styles/createTourStepper.module.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { nextStep } from "../../redux/slices/StepSlice";
import Swal from "sweetalert2";
import Waiting from "../Waiting";
import { clearHotspot, removeHotspot } from "../../redux/slices/HotspotSlice";
import { clearPanorama } from "../../redux/slices/PanoramaSlice";

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

// nằm trong create tour component
const CreateTourStepper: React.FC<CreateTourStepperProps> = ({
  stepsConfig,
}) => {
  //const [currentStep, setCurrentStep] = useState(1); // 1 -> 2 -> 3 -> 4, Complete.
  const currentStep = useSelector((state: RootState) => state.step.currentStep);
  const [isComplete, setIsComplete] = useState(false);

  const spaceId = useSelector((state: RootState) => state.panoramas.spaceId);
  const panoramaList = useSelector(
    (state: RootState) => state.panoramas.panoramaList
  );

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const ActiveComponent = stepsConfig[currentStep - 1]?.Component;

  useEffect(() => {
    if (currentStep == stepsConfig.length) {
      setIsComplete(true);
    } 
    if(currentStep == 1) {
      dispatch(clearHotspot())
      dispatch(clearPanorama())
      setIsComplete(false);
    }
    if (currentStep != 1) setIsLoading(true);
    const timeout = setTimeout(() => {
      setIsLoading(false); // ẩn trang chờ
    }, 3000);

    return () => clearTimeout(timeout);
  }, [currentStep]);

  return (
    <>
      <div className={styles.stepper}>
        {stepsConfig.map((step, index) => {
          const isActive = currentStep > index + 1 || isComplete;
          return (
            <div key={step.name} className={styles.stepWrapper}>
              <div className={styles.step}>
                <div
                  className={`${styles.stepNumber} ${
                    isActive ? styles.stepActive : ""
                  }`}
                >
                  {isActive ? <span>&#10003;</span> : index + 1}
                </div>
                <div className={styles.stepName}>{step.name}</div>
              </div>
              {index !== stepsConfig.length - 1 && (
                <div
                  className={`${styles.stepLine} ${
                    isActive ? styles.stepActive : ""
                  }`}
                ></div>
              )}
            </div>
          );
        })}
        <div className={styles.progressBar}>
          <div className={styles.progress}></div>
        </div>
      </div>

      <div className={styles.stepContent}>
        <ActiveComponent />
        {isLoading ? <Waiting /> : ""}
      </div>
    </>
  );
};

export default CreateTourStepper;
