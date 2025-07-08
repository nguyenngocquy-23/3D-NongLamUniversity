import { useEffect } from "react";

const useTrackTourView = (tourId: string | number) => {
  useEffect(() => {
    const timer = setTimeout(() => {
    const storedRaw = sessionStorage.getItem("tour-views");
    const storedList = storedRaw ? JSON.parse(storedRaw) : [];

    // Tìm xem tourId đã có trong list chưa
    const existing = storedList.find((item: any) => item.nodeId === tourId);

    if (existing) {
        existing.numView += 1;
    } else {
        storedList.push({ nodeId: tourId, numView: 1 });
    }

    sessionStorage.setItem("tour-views", JSON.stringify(storedList));
    }, 10000); // sau 10s ở lại mới đếm

    return () => clearTimeout(timer);
  }, [tourId]);
};

export default useTrackTourView;
