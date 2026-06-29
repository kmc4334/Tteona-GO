// ─────────────────────────────────────────────────────────────────────────────
// jeju_nodes.ts  –  제주도 주요 장소 노드 데이터
// ─────────────────────────────────────────────────────────────────────────────
import { GeoNode } from '../utils/dijkstra';

export const JEJU_NODES: GeoNode[] = [
  // ── 자연 명소
  { id: 'hallasan',      name: '한라산 국립공원',   lat: 33.3617, lng: 126.5292, category: '자연' },
  { id: 'seongsan',      name: '성산일출봉',         lat: 33.4580, lng: 126.9425, category: '자연' },
  { id: 'jeju_olle1',   name: '제주 올레 1코스',    lat: 33.4568, lng: 126.9302, category: '자연' },
  { id: 'cheonjiyeon',  name: '천지연폭포',          lat: 33.2466, lng: 126.5636, category: '자연' },
  { id: 'jeongbang',    name: '정방폭포',             lat: 33.2459, lng: 126.5677, category: '자연' },
  { id: 'manjanggul',   name: '만장굴',               lat: 33.5268, lng: 126.7712, category: '자연' },
  { id: 'udo',          name: '우도',                  lat: 33.5062, lng: 126.9517, category: '자연' },
  { id: 'hyeopjae',     name: '협재해수욕장',         lat: 33.3945, lng: 126.2389, category: '자연' },
  { id: 'hamdeok',      name: '함덕해수욕장',         lat: 33.5434, lng: 126.6697, category: '자연' },
  { id: 'sanbangsan',   name: '산방산',               lat: 33.2368, lng: 126.3090, category: '자연' },
  { id: 'yongduam',     name: '용두암',               lat: 33.5161, lng: 126.5063, category: '자연' },

  // ── 문화/관광
  { id: 'jeju_airport', name: '제주국제공항',        lat: 33.5110, lng: 126.4928, category: '교통' },
  { id: 'jeju_city',    name: '제주시청',             lat: 33.4996, lng: 126.5312, category: '도심' },
  { id: 'dongmun',      name: '동문시장',             lat: 33.5131, lng: 126.5287, category: '쇼핑' },
  { id: 'seogwipo',     name: '서귀포시청',           lat: 33.2534, lng: 126.5600, category: '도심' },
  { id: 'teddy_bear',   name: '테디베어 뮤지엄',     lat: 33.2463, lng: 126.4118, category: '문화' },
  { id: 'jeju_folk',    name: '제주민속촌',            lat: 33.3597, lng: 126.8458, category: '문화' },
  { id: 'gimnyeong',    name: '김녕미로공원',         lat: 33.5570, lng: 126.7548, category: '체험' },
  { id: 'loveland',     name: '러브랜드',              lat: 33.4734, lng: 126.4500, category: '문화' },
  { id: 'hallim_park',  name: '한림공원',              lat: 33.4121, lng: 126.2393, category: '문화' },

  // ── 숙소
  { id: 'hotel_shilla',    name: '제주 신라호텔',    lat: 33.2450, lng: 126.4117, category: '숙소' },
  { id: 'hotel_maison',    name: '메종 글래드 제주', lat: 33.4813, lng: 126.4893, category: '숙소' },
  { id: 'hotel_ramada',    name: '라마다 서귀포',    lat: 33.2548, lng: 126.5622, category: '숙소' },
];

export const CATEGORY_COLOR: Record<string, string> = {
  '자연': '#52C41A',
  '교통': '#9F7AEA',
  '도심': '#2B6CB0',
  '쇼핑': '#F6AD55',
  '문화': '#F687B3',
  '체험': '#4FD1C5',
  '숙소': '#FC8181',
};
