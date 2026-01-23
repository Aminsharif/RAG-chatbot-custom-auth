import { useEffect, useState } from "react";

type DeviceInfo = {
  isMobile: boolean;
  isDesktop: boolean;
  platform: string;
};

export const useDeviceInfo = (): DeviceInfo => {
  const [info] = useState<DeviceInfo>(() => {
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isDesktop: true,
        platform: "unknown",
      };
    }
    const userAgent = window.navigator.userAgent || "";
    const platform = window.navigator.platform || "unknown";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    );
    return {
      isMobile,
      isDesktop: !isMobile,
      platform,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
  }, []);

  return info;
};
