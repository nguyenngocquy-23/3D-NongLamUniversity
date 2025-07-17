import React, { useEffect, useRef } from "react";
import styles from "../styles/lightDial.module.css";
import { FaSun } from "react-icons/fa6";

interface LightDialProps {
  theta: number; // góc hiện tại
  onChange: (theta: number) => void;
  autoRotate?: boolean; // tự động xoay
}

const LightDial: React.FC<LightDialProps> = ({
  theta,
  onChange,
  autoRotate,
}) => {
  const dialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      const newTheta = (theta + 1) % 360;
      onChange(newTheta);
    }, 30);

    return () => clearInterval(interval);
  }, [autoRotate, theta, onChange]);

  const startDrag = (e: React.MouseEvent) => {
    const rect = dialRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const onMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - centerX;
      const dy = moveEvent.clientY - centerY;
      const angle = Math.atan2(dy, dx); // radians
      const deg = (angle * 180) / Math.PI;
      const normalized = (deg + 90 + 360) % 360;
      onChange(normalized);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div className={styles.wrapper}>
      <div
        ref={dialRef}
        className={styles.dial}
        onMouseDown={startDrag}
        style={{ transform: `rotate(${theta}deg)` }}
      >
        <div className={styles.handle}>
          <FaSun style={{ color: "black" }} />
        </div>
      </div>
    </div>
  );
};

export default LightDial;
