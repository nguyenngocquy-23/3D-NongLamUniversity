import { useSelector } from "react-redux";
import { useRef, useEffect } from "react";
import { RootState } from "../redux/Store";

export const useAutoTour = (handleHotspotNavigate: Function, panoramaList:any[]) => {
  const tourIndexRef = useRef(0); // Theo dõi index hiện tại
  const timeoutRef = useRef<number | null>(null);

  const startAutoTour = () => {
    if (!panoramaList || panoramaList.length === 0) return;

    const runTourStep = (index: number) => {
      if (index >= panoramaList.length) return;

      const currentNode = panoramaList[index];
      if (!currentNode) return;

      handleHotspotNavigate(currentNode.id, [currentNode.positionX, currentNode.positionY, currentNode.positionZ]);

      // Sau duration giây → chuyển tiếp
      timeoutRef.current = setTimeout(() => {
        tourIndexRef.current = index + 1;
        runTourStep(index + 1);
      }, currentNode.duration * 1000);
    };

    runTourStep(0); // bắt đầu từ bước đầu
  };

  const stopAutoTour = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    tourIndexRef.current = 0;
  };

  return { startAutoTour, stopAutoTour };
};
