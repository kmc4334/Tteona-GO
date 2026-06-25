/**
 * MapScreen.tsx
 * 떠나GO Google Maps 지도 화면
 * - Google Maps JavaScript API (WebView 임베드)
 * - AdvancedMarkerElement + Places API 장소 검색
 * - 현재 위치 기반 지도 표시
 * - AI 추천 여행지 마커 (카테고리별 색상/이모지)
 * - 일정별 경로 폴리라인 시각화
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator, Platform, ScrollView, Dimensions, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, RefreshCw, MapPin, Navigation, List, Map } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { buildGoogleMapHTML, Place, DAY_COLORS } from '../services/googleMapService';
import { searchPlaces, getNearbyPlaces, qdrantToPlace } from '../services/placesService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// WebView 동적 import (모바일 전용)
let WebView: any = null;
try { WebView = require('react-native-webview').WebView; } catch (_) {}

// ── 카테고리 필터 ─────────────────────────────────────────────────────────────
const CATEGORY_FILTERS = [
  { key: '전체', emoji: '🌍', color: '#4A90E2' },
  { key: '관광지', emoji: '🎡', color: '#4A90E2' },
  { key: '맛집', emoji: '🍜', color: '#FF6B6B' },
  { key: '숙소', emoji: '🏨', color: '#52C41A' },
  { key: '카페', emoji: '☕', color: '#F39C12' },
];

// ── 검색바 컴포넌트 ───────────────────────────────────────────────────────────
const SearchBar: React.FC<{ onSearch: (q: string) => void; loading: boolean }> = ({ onSearch, loading }) => {
  const [text, setText] = useState('');
  return (
    <View style={searchStyles.wrap}>
      <TextInput
        style={searchStyles.input}
        placeholder="장소, 지역, 카테고리 검색..."
        placeholderTextColor="#aaa"
        value={text}
        onChangeText={setText}
        onSubmitEditing={() => onSearch(text)}
        returnKeyType="search"
        editable={!loading}
      />
      <TouchableOpacity
        style={[searchStyles.btn, loading && { opacity: 0.5 }]}
        onPress={() => onSearch(text)}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={searchStyles.btnText}>검색</Text>}
      </TouchableOpacity>
    </View>
  );
};

const searchStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 8,
  },
  input: {
    flex: 1, height: 38, borderRadius: 20,
    backgroundColor: '#f5f5f5', paddingHorizontal: 14,
    fontSize: 14, color: '#333',
  },
  btn: {
    backgroundColor: '#4A90E2', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
    minWidth: 52, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});

// ── Google Maps 웹뷰 컴포넌트 ─────────────────────────────────────────────────
const GoogleMapView: React.FC<{
  apiKey: string;
  center: { lat: number; lng: number };
  places: Place[];
  currentLoc?: { lat: number; lng: number } | null;
}> = ({ apiKey, center, places, currentLoc }) => {
  const html = buildGoogleMapHTML({ apiKey, center, places, currentLoc });

  if (Platform.OS === 'web') {
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    return (
      <View style={mapStyles.container}>
        {/* @ts-ignore */}
        <iframe
          src={blobUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="google-map"
          allow="geolocation"
        />
      </View>
    );
  }

  if (!WebView) {
    return (
      <View style={[mapStyles.container, mapStyles.fallback]}>
        <Text style={{ fontSize: 40 }}>🗺️</Text>
        <Text style={mapStyles.fallbackText}>
          지도를 표시하려면{'\n'}react-native-webview가 필요합니다
        </Text>
      </View>
    );
  }

  return (
    <View style={mapStyles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
        startInLoadingState
        mixedContentMode="always"
        renderLoading={() => (
          <ActivityIndicator
            color={Colors.primary}
            style={StyleSheet.absoluteFill}
            size="large"
          />
        )}
      />
    </View>
  );
};

const mapStyles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  fallback: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff' },
  fallbackText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 12 },
});

// ── 장소 목록 아이템 ──────────────────────────────────────────────────────────
const PlaceItem: React.FC<{ place: Place; index: number }> = ({ place, index }) => {
  const dayColor = place.day
    ? DAY_COLORS[(place.day - 1) % DAY_COLORS.length]
    : Colors.primary;
  const emoji: Record<string, string> = { 관광지: '🎡', 맛집: '🍜', 숙소: '🏨', 카페: '☕', 기타: '📍' };

  return (
    <View style={listStyles.item}>
      <View style={[listStyles.badge, { backgroundColor: dayColor }]}>
        <Text style={listStyles.badgeText}>
          {place.day ? `D${place.day}-${place.order}` : index + 1}
        </Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={listStyles.name}>{emoji[place.category] || '📍'} {place.name}</Text>
        <Text style={listStyles.category}>{place.category}</Text>
        {place.address ? (
          <Text style={listStyles.address} numberOfLines={1}>{place.address}</Text>
        ) : null}
      </View>
    </View>
  );
};

const listStyles = StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  badge: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  name: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  category: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', marginBottom: 2 },
  address: { fontSize: 11, color: '#aaa' },
});

// ── 메인 화면 ─────────────────────────────────────────────────────────────────
export const MapScreen = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('전체');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { location, currentLoc, loading: locLoading, error: locError, refresh } = useCurrentLocation();

  // Google Maps API 키
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // ── 주변 장소 불러오기 (초기 로드) ───────────────────────────────────────
  React.useEffect(() => {
    if (currentLoc && places.length === 0) {
      loadNearbyPlaces();
    }
  }, [currentLoc]);

  const loadNearbyPlaces = async () => {
    if (!currentLoc) return;
    setLoading(true);
    setError(null);
    try {
      const qdrantPlaces = await getNearbyPlaces({
        lat: currentLoc.lat,
        lng: currentLoc.lng,
        radius: 15,
        limit: 30,
      });
      const converted = qdrantPlaces.map((p, idx) => qdrantToPlace(p));
      setPlaces(converted);
    } catch (err: any) {
      console.error('[MapScreen] 주변 장소 로드 실패:', err);
      setError(err.message || '장소를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  // ── 검색 ────────────────────────────────────────────────────────────────
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const qdrantPlaces = await searchPlaces({
        query,
        category: activeCategory !== '전체' ? activeCategory : undefined,
        limit: 30,
      });
      const converted = qdrantPlaces.map((p, idx) => qdrantToPlace(p));
      setPlaces(converted);
    } catch (err: any) {
      console.error('[MapScreen] 검색 실패:', err);
      setError(err.message || '검색 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaces = activeCategory === '전체'
    ? places
    : places.filter(p => p.category === activeCategory);

  const days = [...new Set(places.filter(p => p.day).map(p => p.day!))].sort();

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={Colors.text} size={22} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🗺️ 여행 지도</Text>
          <Text style={styles.headerSub}>Qdrant AI 실시간 장소 검색</Text>
        </View>
        <TouchableOpacity onPress={loadNearbyPlaces} style={styles.iconBtn} disabled={loading}>
          <Navigation color={loading || locLoading ? Colors.border : '#4A90E2'} size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode(v => v === 'map' ? 'list' : 'map')}
          style={styles.iconBtn}
        >
          {viewMode === 'map'
            ? <List color={Colors.text} size={20} />
            : <Map color={Colors.text} size={20} />}
        </TouchableOpacity>
      </View>

      {/* ── 검색바 ── */}
      <SearchBar onSearch={handleSearch} loading={loading} />

      {/* ── 위치 에러 배너 ── */}
      {locError && (
        <View style={styles.errorBanner}>
          <MapPin color="#fff" size={14} />
          <Text style={styles.errorBannerText}>{locError}</Text>
        </View>
      )}

      {/* ── API 키 미설정 경고 ── */}
      {!GOOGLE_MAPS_API_KEY && (
        <View style={styles.warnBanner}>
          <Text style={styles.warnText}>
            ⚠️ EXPO_PUBLIC_GOOGLE_MAPS_API_KEY가 설정되지 않았습니다.
            {'\n'}.env 파일에 키를 추가하세요.
          </Text>
        </View>
      )}

      {/* ── 카테고리 필터 ── */}
      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORY_FILTERS.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.filterChip,
                activeCategory === cat.key && { backgroundColor: cat.color },
              ]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Text style={{ fontSize: 13 }}>{cat.emoji}</Text>
              <Text style={[
                styles.filterText,
                activeCategory === cat.key && { color: '#fff' },
              ]}>
                {cat.key}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── 일차 범례 ── */}
      {days.length > 0 && viewMode === 'map' && (
        <View style={styles.dayLegend}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {days.map(day => (
              <View key={day} style={styles.dayChip}>
                <View style={[styles.dayDot, { backgroundColor: DAY_COLORS[(day - 1) % DAY_COLORS.length] }]} />
                <Text style={styles.dayText}>Day {day}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── 지도 / 목록 ── */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>장소를 불러오는 중...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={{ fontSize: 40 }}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadNearbyPlaces} style={styles.retryBtn}>
              <RefreshCw color="#fff" size={16} />
              <Text style={styles.retryText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : viewMode === 'map' ? (
          locLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={Colors.primary} size="large" />
              <Text style={styles.loadingText}>위치를 가져오는 중...</Text>
            </View>
          ) : (
            <GoogleMapView
              apiKey={GOOGLE_MAPS_API_KEY}
              center={location}
              places={filteredPlaces}
              currentLoc={currentLoc}
            />
          )
        ) : (
          <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
            {days.length > 0 ? days.map(day => (
              <View key={day}>
                <View style={[
                  styles.dayHeader,
                  { borderLeftColor: DAY_COLORS[(day - 1) % DAY_COLORS.length] },
                ]}>
                  <Text style={styles.dayHeaderText}>Day {day}</Text>
                </View>
                {filteredPlaces
                  .filter(p => p.day === day)
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((p, i) => <PlaceItem key={p.id} place={p} index={i} />)}
              </View>
            )) : (
              filteredPlaces.map((p, i) => <PlaceItem key={p.id} place={p} index={i} />)
            )}
            {filteredPlaces.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={{ fontSize: 40 }}>🗺️</Text>
                <Text style={styles.emptyText}>선택한 카테고리의 장소가 없습니다</Text>
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { padding: 8, marginRight: 4 },
  iconBtn: { padding: 8, marginLeft: 4 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: Colors.text },
  headerSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FF6B6B', padding: 8, paddingHorizontal: 16, gap: 6,
  },
  errorBannerText: { color: '#fff', fontSize: 11, fontWeight: '600', flex: 1 },

  warnBanner: {
    backgroundColor: '#FFF9C4', padding: 8, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#FFE082',
  },
  warnText: { fontSize: 11, color: '#795548', fontWeight: '600', lineHeight: 18 },

  filterWrap: {
    backgroundColor: '#fff', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, backgroundColor: '#f5f5f5',
    borderWidth: 1, borderColor: '#e8e8e8',
  },
  filterText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },

  dayLegend: {
    backgroundColor: '#fff', paddingVertical: 6, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dayChip: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  dayDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  dayText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },

  loadingBox: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff',
  },
  loadingText: { color: Colors.textSecondary, marginTop: 12, fontSize: 14 },

  dayHeader: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#f8f8f8', borderLeftWidth: 4, marginTop: 4,
  },
  dayHeaderText: { fontSize: 13, fontWeight: '800', color: Colors.text },

  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, marginTop: 12 },

  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  errorText: { color: '#FF6B6B', fontSize: 14, textAlign: 'center', marginTop: 12, marginBottom: 20 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#4A90E2', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
