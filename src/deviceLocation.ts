import { useCallback, useEffect, useState } from "react";

export type DeviceCoordinates = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

const LOCATION_CACHE_KEY = "foundphone.device-location.v1";
const LOCATION_ATTEMPTED_KEY = "foundphone.location-requested.v1";
function readCachedPosition(): DeviceCoordinates | null {
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as DeviceCoordinates & { savedAt?: number };
    if (!Number.isFinite(value.latitude) || !Number.isFinite(value.longitude)) return null;
    if (value.savedAt && Date.now() - value.savedAt > 24 * 60 * 60 * 1000) return null;
    return value;
  } catch {
    return null;
  }
}
export function useDeviceLocation() {
  const [position, setPosition] = useState<DeviceCoordinates | null>(() => readCachedPosition());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const request = useCallback(() => {
    try { localStorage.removeItem(LOCATION_ATTEMPTED_KEY); } catch {}
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("此浏览器不支持定位，请允许浏览器使用位置信息。");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const next = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        };
        setPosition(next);
        try {
          localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ ...next, savedAt: Date.now() }));
          localStorage.setItem(LOCATION_ATTEMPTED_KEY, "granted");
        } catch {
          // Keep the live position in memory if browser storage is unavailable.
        }
        setLoading(false);
      },
      (reason) => {
        setLoading(false);
        try { localStorage.setItem(LOCATION_ATTEMPTED_KEY, "denied"); } catch {}
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
    if (!position) {
      let alreadyAsked = false;
      try { alreadyAsked = localStorage.getItem(LOCATION_ATTEMPTED_KEY) === "denied"; } catch {}
      if (!alreadyAsked) request();
    }
  }, [position, request]);

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
