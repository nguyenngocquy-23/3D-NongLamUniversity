import React, { useRef, useState } from "react";
import styles from "../../styles/createTourStepper.module.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import { nextStep } from "../../redux/slices/StepSlice";
import Swal from "sweetalert2";

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
  //const [currentStep, setCurrentStep] = useState(1); // 1 -> 2 -> 3 -> 4, Complete.
  const currentStep = useSelector((state: RootState) => state.step.currentStep);
  const [isComplete, setIsComplete] = useState(false);

  const spaceId = useSelector((state: RootState) => state.panoramas.spaceId);
  const panoramaList = useSelector(
    (state: RootState) => state.panoramas.panoramaList
  );

  const dispatch = useDispatch();

  const ActiveComponent = stepsConfig[currentStep - 1]?.Component;

  const handleNextStep = () => {
    // setCurrentStep((prevStep) => {
    //   if (prevStep === stepsConfig.length) {
    //     setIsComplete(true); // Trường hợp xuất bản => Insert vô database.
    //     return prevStep;
    //   } else {
    //     return prevStep + 1;
    //   }
    // });
    /**
     * validate cho step1
     */
    if (currentStep === 1) {
      if (spaceId == "0") {
        Swal.fire({
          icon: "warning",
          title: "Chưa chọn không gian",
          text: "Vui lòng chọn không gian trước khi tiếp tục",
          confirmButtonText: "OK",
        });
        return;
      } else if (panoramaList.length == 0) {
        Swal.fire({
          icon: "warning",
          title: "Chưa có ảnh 360",
          text: "Vui lòng tải lên ảnh 360 để tiếp tục",
          confirmButtonText: "OK",
        });
        return;
      }
    }
    dispatch(nextStep());
  };

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
