import { createContext, useContext, useEffect, useState } from "react";

/**
 *  Mobile + Ram 4GB : 2k.
 * Laptom Ram 8GB + CPU 4 cores: 4K
 * Ram 16GB, CPU > 8cores, pixelRatio cao : 8K.
 *
 *
 *
 */

type DeviceInfo = {
  pixelRatio: number;
  isMobile: boolean;
  ram: number;
  cpuCores: number;
  userLang: string;
};

const DeviceInfoContext = createContext<DeviceInfo | null>(null);

export const DeviceInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [info, setInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    const gatherDeviceInfo = async () => {
      const deviceInfo: DeviceInfo = {
        pixelRatio: window.devicePixelRatio || 1,
        isMobile:
          window.innerWidth <= 768 ||
          /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
        ram: (navigator as any).deviceMemory || 4,
        cpuCores: navigator.hardwareConcurrency || 2,
        userLang: navigator.language,
      };
      setInfo(deviceInfo);
    };
    gatherDeviceInfo();
  }, []);

  if (!info) return null;

  return (
    <DeviceInfoContext.Provider value={info}>
      {children}
    </DeviceInfoContext.Provider>
  );
};

export const useDeviceInfo = () => {
  const context = useContext(DeviceInfoContext);
  if (!context) {
    throw new Error("useDeviceInfo must be used within a DeviceInfoProvier");
  }
  return context;
};
