/**
 * placesService.ts
 * Qdrant 실시간 장소 조회 API 클라이언트
 */

import { Place } from './googleMapService';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// ── API 응답 타입 ────────────────────────────────────────────────────────────
interface PlacesResponse {
  success: boolean;
  count: number;
  places: QdrantPlace[];
  message?: string;
}

export interface QdrantPlace {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  category: string;
  address: string;
  description: string;
  detail: string;
  status: string;
  rooms: number;
  distance?: number; // getNearbyPlaces 응답에만 포함
}

// ── Qdrant 카테고리 → Place 카테고리 매핑 ──────────────────────────────────
function toPlaceCategory(category: string): Place['category'] {
  switch (category) {
    case '숙소':   return '숙소';
    case '관광지': return '관광지';
    case '맛집':   return '맛집';
    case '카페':   return '카페';
    default:       return '기타';
  }
}

// ── QdrantPlace → Place 변환 ─────────────────────────────────────────────────
export function qdrantToPlace(p: QdrantPlace, dayIndex?: number, orderIndex?: number): Place {
  return {
    id: p.id,
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    category: toPlaceCategory(p.category),
    address: p.address,
    description: p.description,
    day: dayIndex,
    order: orderIndex,
  };
}

// ── 텍스트 검색 (벡터 유사도) ────────────────────────────────────────────────
export async function searchPlaces(params: {
  query: string;
  category?: string;
  limit?: number;
}): Promise<QdrantPlace[]> {
  const { query, category, limit = 20 } = params;

  const qs = new URLSearchParams({
    query,
    ...(category && category !== '전체' ? { category } : {}),
    limit: String(limit),
  });

  const res = await fetch(`${API_BASE}/places/search?${qs}`);
  if (!res.ok) throw new Error(`장소 검색 실패: ${res.status}`);
  const json: PlacesResponse = await res.json();
  if (!json.success) throw new Error(json.message || '검색 오류');
  return json.places;
}

// ── 주변 장소 조회 ───────────────────────────────────────────────────────────
export async function getNearbyPlaces(params: {
  lat: number;
  lng: number;
  radius?: number;
  category?: string;
  limit?: number;
}): Promise<QdrantPlace[]> {
  const { lat, lng, radius = 10, category, limit = 20 } = params;

  const qs = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
    ...(category && category !== '전체' ? { category } : {}),
    limit: String(limit),
  });

  const res = await fetch(`${API_BASE}/places/nearby?${qs}`);
  if (!res.ok) throw new Error(`주변 장소 조회 실패: ${res.status}`);
  const json: PlacesResponse = await res.json();
  if (!json.success) throw new Error(json.message || '조회 오류');
  return json.places;
}

// ── AI 추천 ──────────────────────────────────────────────────────────────────
export async function getRecommendedPlaces(params: {
  preferences?: string[];
  location: { lat: number; lng: number };
  limit?: number;
}): Promise<QdrantPlace[]> {
  const { preferences = [], location, limit = 20 } = params;

  const res = await fetch(`${API_BASE}/places/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences, location, limit }),
  });
  if (!res.ok) throw new Error(`AI 추천 실패: ${res.status}`);
  const json: PlacesResponse = await res.json();
  if (!json.success) throw new Error(json.message || '추천 오류');
  return json.places;
}
