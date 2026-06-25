/**
 * useCurrentLocation.ts
 * 현재 위치를 가져오는 커스텀 훅
 * - 웹: navigator.geolocation 직접 사용
 * - 모바일: expo-location 사용
 * - 실패 시 서울 시청 좌표로 폴백
 */
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export interface Coords {
  lat: number;
  lng: number;
}

// 기본 위치: 서울 시청
const DEFAULT_LOCATION: Coords = { lat: 37.5663, lng: 126.9779 };

interface UseCurrentLocationResult {
  location: Coords;
  currentLoc: Coords | null; // 실제 GPS 위치 (null이면 권한 거부/실패)
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCurrentLocation(): UseCurrentLocationResult {
  const [location, setLocation] = useState<Coords>(DEFAULT_LOCATION);
  const [currentLoc, setCurrentLoc] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = () => {
    setLoading(true);
    setError(null);

    if (Platform.OS === 'web') {
      // 웹 환경
      if (!navigator?.geolocation) {
        setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
        setLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: Coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setCurrentLoc(coords);
          setLocation(coords);
          setLoading(false);
        },
        (err) => {
          // 권한 거부 또는 실패 시 서울 시청으로 폴백
          if (err.code === 1) {
            setError('위치 권한이 거부되었습니다. 서울 시청을 기본 위치로 사용합니다.');
          } else {
            setError('위치를 가져올 수 없습니다. 서울 시청을 기본 위치로 사용합니다.');
          }
          setLocation(DEFAULT_LOCATION);
          setCurrentLoc(null);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
      );
    } else {
      // 모바일 환경 (동적 import로 expo-location 사용)
      (async () => {
        try {
          const Location = await import('expo-location');
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setError('위치 권한이 거부되었습니다. 서울 시청을 기본 위치로 사용합니다.');
            setLocation(DEFAULT_LOCATION);
            setLoading(false);
            return;
          }
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const coords: Coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setCurrentLoc(coords);
          setLocation(coords);
        } catch {
          setError('위치를 가져올 수 없습니다. 서울 시청을 기본 위치로 사용합니다.');
          setLocation(DEFAULT_LOCATION);
          setCurrentLoc(null);
        } finally {
          setLoading(false);
        }
      })();
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { location, currentLoc, loading, error, refresh: fetchLocation };
}
