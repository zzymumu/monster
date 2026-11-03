import { useCallback, useEffect, useState } from "react";

export type DeviceCoordinates = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export function useDeviceLocation() {
  const [position, setPosition] = useState<DeviceCoordinates | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("此浏览器不支持定位，请允许浏览器使用位置信息。");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        });
        setLoading(false);
      },
      (reason) => {
        setLoading(false);
        setError(
          reason.code === reason.PERMISSION_DENIED
            ? "定位权限未开启。请在浏览器地址栏的网站权限中允许位置访问，再点重新定位。"
            : reason.code === reason.TIMEOUT
              ? "定位超时，请再试一次。"
              : "暂时无法取得当前位置，请检查设备定位服务。",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 },
    );
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { position, error, loading, request };
}

export function openStreetMapEmbed(latitude: number, longitude: number, delta = 0.018) {
  const west = (longitude - delta).toFixed(6);
  const east = (longitude + delta).toFixed(6);
  const south = (latitude - delta).toFixed(6);
  const north = (latitude + delta).toFixed(6);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

export function openStreetMapLink(latitude: number, longitude: number) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
}
