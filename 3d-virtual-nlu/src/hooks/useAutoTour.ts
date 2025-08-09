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
    let nextValidIndex = index;
    while (
      nextValidIndex < panoramaList.length &&
      (panoramaList[nextValidIndex].status === 0 ||
        panoramaList[nextValidIndex].status === -1||
        panoramaList[nextValidIndex].status === undefined)
    ) {
      nextValidIndex++;
    }

    if (nextValidIndex >= panoramaList.length) return;

    const currentNode = panoramaList[nextValidIndex];
    if (!currentNode) return;

    handleHotspotNavigate(currentNode.id, [
      currentNode.positionX,
      currentNode.positionY,
      currentNode.positionZ,
    ]);

    tourIndexRef.current = nextValidIndex;

    clearAutoTimer();

    timeoutRef.current = setTimeout(() => {
      runTourStep(nextValidIndex + 1); // tiếp tục với node sau
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
