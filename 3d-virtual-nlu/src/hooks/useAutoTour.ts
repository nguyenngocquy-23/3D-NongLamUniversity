import { useRef } from "react";

export const useAutoTour = (
  handleHotspotNavigate: Function,
  panoramaList: any[]
) => {
  const tourIndexRef = useRef(0); // Index hiện tại
  const timeoutRef = useRef<number | null>(null);

  const clearAutoTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const runTourStep = (index: number) => {
    if (index >= panoramaList.length) return;

    const currentNode = panoramaList[index];
    if (!currentNode) return;

    handleHotspotNavigate(currentNode.id, [
      currentNode.positionX,
      currentNode.positionY,
      currentNode.positionZ,
    ]);

    tourIndexRef.current = index;

    clearAutoTimer();
    timeoutRef.current = setTimeout(() => {
      runTourStep(index + 1);
    }, currentNode.duration * 1000);
  };

  const startAutoTour = () => {
    if (!panoramaList || panoramaList.length === 0) return;
    runTourStep(0); // Bắt đầu từ đầu
  };

  const stopAutoTour = () => {
    clearAutoTimer();
    tourIndexRef.current = 0;
  };

  // 👉 Đây là hàm bạn gọi khi bấm nút "Đi tiếp"
  const skipToNext = () => {
    const nextIndex = (tourIndexRef.current + 1) % panoramaList.length;
    runTourStep(nextIndex); // Điều hướng + khởi động lại timer
  };

  return { startAutoTour, stopAutoTour, skipToNext };
};
