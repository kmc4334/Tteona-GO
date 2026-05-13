import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Platform, ActivityIndicator, FlatList, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Navigation, MapPin, Plus, X, ChevronRight, Clock, Ruler, RefreshCw, Crosshair } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { JEJU_NODES, CATEGORY_COLOR } from '../data/jeju_nodes';
import {
  GeoNode, buildFullGraph, dijkstraMultiStop,
  formatDistance, estimateWalkTime, estimateDriveTime, haversineMeters,
} from '../utils/dijkstra';

// ── 지도 HTML (Leaflet, 경로 폴리라인 + 현재위치 표시) ───────────────────────
function buildRouteMapHTML(
  path: GeoNode[],
  currentLoc?: { lat: number; lng: number } | null,
): string {
  if (path.length === 0 && !currentLoc)
    return '<html><body style="background:#f8f9fa"></body></html>';

  const allLats = [...path.map(n => n.lat), ...(currentLoc ? [currentLoc.lat] : [])];
  const allLngs = [...path.map(n => n.lng), ...(currentLoc ? [currentLoc.lng] : [])];
  const centerLat = allLats.reduce((s, v) => s + v, 0) / allLats.length;
  const centerLng = allLngs.reduce((s, v) => s + v, 0) / allLngs.length;

  const markersJS = path.map((n, i) => {
    const color = i === 0 ? '#52C41A' : i === path.length - 1 ? '#FF4D4F' : '#2B6CB0';
    const label = i === 0 ? 'S' : i === path.length - 1 ? 'E' : String(i);
    return `var icon${i}=L.divIcon({className:'',html:'<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${label}</div>',iconSize:[28,28],iconAnchor:[14,14],popupAnchor:[0,-16]});L.marker([${n.lat},${n.lng}],{icon:icon${i}}).addTo(map).bindPopup('<b>${n.name}</b>');`;
  }).join('\n');

  const currentLocJS = currentLoc
    ? `var myIcon=L.divIcon({className:'',html:'<div style="width:18px;height:18px;border-radius:50%;background:#4A90E2;border:3px solid #fff;box-shadow:0 0 0 4px rgba(74,144,226,0.3)"></div>',iconSize:[18,18],iconAnchor:[9,9]});L.marker([${currentLoc.lat},${currentLoc.lng}],{icon:myIcon}).addTo(map).bindPopup('<b>📍 현재 위치</b>');`
    : '';

  const polyCoords = path.map(n => `[${n.lat},${n.lng}]`).join(',');
  const polyLine = path.length >= 2 ? `L.polyline([${polyCoords}],{color:'#2B6CB0',weight:4,opacity:0.85,dashArray:'8,4'}).addTo(map);` : '';

  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>body,html,#map{width:100%;height:100%;margin:0;padding:0;}.leaflet-control-attribution{display:none}</style>
</head><body>
  <div id="map"></div>
  <script>
    var map=L.map('map',{zoomControl:true,attributionControl:false}).setView([${centerLat},${centerLng}],11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
    ${polyLine}
    ${markersJS}
    ${currentLocJS}
    setTimeout(()=>map.invalidateSize(),100);
  </script>
</body></html>`;
}

// ── WebView (모바일) / iframe (웹) 지도 컴포넌트 ─────────────────────────────
let WebView: any = null;
try { WebView = require('react-native-webview').WebView; } catch (_) {}

const RouteMap: React.FC<{ path: GeoNode[]; currentLoc?: { lat: number; lng: number } | null }> = ({ path, currentLoc }) => {
  const html = buildRouteMapHTML(path, currentLoc);
  if (Platform.OS === 'web') {
    return (
      <View style={mapStyles.wrap}>
        {/* @ts-ignore */}
        <iframe srcDoc={html} style={{ width: '100%', height: '100%', border: 'none' }} title="route-map" />
      </View>
    );
  }
  if (!WebView) return <View style={[mapStyles.wrap, { justifyContent: 'center', alignItems: 'center' }]}><Text>🗺️</Text></View>;
  return (
    <View style={mapStyles.wrap}>
      <WebView originWhitelist={['*']} source={{ html }} javaScriptEnabled domStorageEnabled
        startInLoadingState renderLoading={() => <ActivityIndicator color={Colors.primary} style={StyleSheet.absoluteFill} />}
      />
    </View>
  );
};
const mapStyles = StyleSheet.create({ wrap: { height: 260, borderRadius: 20, overflow: 'hidden', backgroundColor: '#f0f4ff' } });

// ── 장소 선택 모달 ────────────────────────────────────────────────────────────
const NodePicker: React.FC<{
  visible: boolean;
  selected: string[];
  onSelect: (node: GeoNode) => void;
  onClose: () => void;
}> = ({ visible, selected, onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  if (!visible) return null;

  const filtered = JEJU_NODES.filter(n =>
    n.name.includes(search) && !selected.includes(n.id)
  );

  return (
    <View style={pickerStyles.overlay}>
      <View style={pickerStyles.sheet}>
        <View style={pickerStyles.header}>
          <Text style={pickerStyles.title}>장소 선택</Text>
          <TouchableOpacity onPress={onClose}><X color={Colors.text} size={22} /></TouchableOpacity>
        </View>
        {/* @ts-ignore */}
        <View style={pickerStyles.searchBox}>
          <Text style={pickerStyles.searchPlaceholder}>🔍 제주도 명소를 탭하세요</Text>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={pickerStyles.item} onPress={() => onSelect(item)}>
              <View style={[pickerStyles.dot, { backgroundColor: CATEGORY_COLOR[item.category || ''] || Colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={pickerStyles.itemName}>{item.name}</Text>
                <Text style={pickerStyles.itemCat}>{item.category}</Text>
              </View>
              <ChevronRight color={Colors.textSecondary} size={16} />
            </TouchableOpacity>
          )}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};
const pickerStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '75%', paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  searchBox: { marginHorizontal: 16, marginBottom: 8, backgroundColor: Colors.background, borderRadius: 12, padding: 12 },
  searchPlaceholder: { color: Colors.textSecondary, fontSize: 14 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  itemName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  itemCat: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});

// ── 메인 화면 ─────────────────────────────────────────────────────────────────
export const PathFindingScreen = () => {
  const navigation = useNavigation();
  const [stops, setStops] = useState<GeoNode[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof dijkstraMultiStop>>(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [error, setError] = useState('');
  const [travelMode, setTravelMode] = useState<'walk' | 'drive'>('drive');
  const [currentLoc, setCurrentLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestNode, setNearestNode] = useState<GeoNode | null>(null);

  const edges = useMemo(() => buildFullGraph(JEJU_NODES), []);

  // 현재 위치 가져오기
  const fetchCurrentLocation = async () => {
    setLocLoading(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('위치 권한이 거부되었습니다. 설정에서 허용해 주세요.');
        setLocLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lng } = loc.coords;
      setCurrentLoc({ lat, lng });

      // 가장 가까운 노드 찾기
      let minDist = Infinity;
      let nearest: GeoNode | null = null;
      for (const node of JEJU_NODES) {
        const d = haversineMeters(lat, lng, node.lat, node.lng);
        if (d < minDist) { minDist = d; nearest = node; }
      }
      if (nearest) {
        setNearestNode(nearest);
        // 출발지로 자동 설정 (맨 앞에 삽입)
        setStops(prev => {
          const filtered = prev.filter(n => n.id !== nearest!.id);
          return [nearest!, ...filtered];
        });
        setResult(null);
      }
    } catch (e) {
      setError('위치를 가져오는데 실패했습니다.');
    }
    setLocLoading(false);
  };

  const addStop = (node: GeoNode) => {
    setStops(prev => [...prev, node]);
    setPickerVisible(false);
    setResult(null);
    setError('');
  };

  const removeStop = (id: string) => {
    setStops(prev => prev.filter(n => n.id !== id));
    setResult(null);
    setError('');
  };

  const swapStops = () => {
    setStops(prev => [...prev].reverse());
    setResult(null);
  };

  const findPath = () => {
    if (stops.length < 2) { setError('출발지와 도착지를 최소 2곳 선택하세요.'); return; }
    setLoading(true);
    setError('');
    setTimeout(() => {
      const res = dijkstraMultiStop(JEJU_NODES, edges, stops.map(n => n.id));
      setResult(res);
      if (!res) setError('경로를 찾을 수 없습니다.');
      setLoading(false);
    }, 300);
  };

  const reset = () => { setStops([]); setResult(null); setError(''); setCurrentLoc(null); setNearestNode(null); };

  const timeLabel = result
    ? (travelMode === 'walk' ? estimateWalkTime(result.totalDistance) : estimateDriveTime(result.totalDistance))
    : '';

  return (
    <SafeAreaView style={styles.safe}>
      <NodePicker visible={pickerVisible} selected={stops.map(n => n.id)} onSelect={addStop} onClose={() => setPickerVisible(false)} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={Colors.text} size={22} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🗺️ 길찾기</Text>
          <Text style={styles.headerSub}>다익스트라 최단경로 탐색</Text>
        </View>
        <TouchableOpacity onPress={reset} style={styles.resetBtn}>
          <RefreshCw color={Colors.textSecondary} size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* 현재 위치 배너 */}
        <TouchableOpacity style={styles.locBtn} onPress={fetchCurrentLocation} disabled={locLoading}>
          {locLoading
            ? <ActivityIndicator color={Colors.secondary} size="small" />
            : <Crosshair color={Colors.secondary} size={18} />}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.locBtnTitle}>📍 현재 위치로 출발지 설정</Text>
            {currentLoc
              ? <Text style={styles.locBtnSub}>
                  {nearestNode?.name} 근처 · {currentLoc.lat.toFixed(4)}, {currentLoc.lng.toFixed(4)}
                </Text>
              : <Text style={styles.locBtnSub}>GPS로 내 위치를 가져와 출발지로 자동 설정합니다</Text>}
          </View>
          {currentLoc && <View style={styles.locDot} />}
        </TouchableOpacity>

        {/* 경유지 목록 */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>📍 경유지 설정 (최대 6곳)</Text>

          {stops.map((node, idx) => (
            <View key={node.id} style={styles.stopRow}>
              <View style={[styles.stopIndex, {
                backgroundColor: idx === 0 ? '#52C41A' : idx === stops.length - 1 ? '#FF4D4F' : Colors.primary
              }]}>
                <Text style={styles.stopIndexText}>
                  {idx === 0 ? 'S' : idx === stops.length - 1 ? 'E' : String(idx)}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.stopName}>
                  {node.name}
                  {nearestNode?.id === node.id && idx === 0 && currentLoc
                    ? ' 📍' : ''}
                </Text>
                <Text style={styles.stopCat}>{node.category}</Text>
              </View>
              {idx === 0 && stops.length === 2 && (
                <TouchableOpacity onPress={swapStops} style={styles.swapBtn}>
                  <Text style={{ fontSize: 18 }}>⇅</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => removeStop(node.id)} style={styles.removeBtn}>
                <X color={Colors.textSecondary} size={16} />
              </TouchableOpacity>
            </View>
          ))}

          {stops.length < 6 && (
            <TouchableOpacity style={styles.addStopBtn} onPress={() => setPickerVisible(true)}>
              <Plus color={Colors.primary} size={18} />
              <Text style={styles.addStopText}>
                {stops.length === 0 ? '출발지 추가' : stops.length === 1 ? '도착지 추가' : '경유지 추가'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 이동수단 */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, travelMode === 'drive' && styles.modeBtnActive]}
            onPress={() => setTravelMode('drive')}
          >
            <Text style={[styles.modeBtnText, travelMode === 'drive' && styles.modeBtnTextActive]}>🚗 차량</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, travelMode === 'walk' && styles.modeBtnActive]}
            onPress={() => setTravelMode('walk')}
          >
            <Text style={[styles.modeBtnText, travelMode === 'walk' && styles.modeBtnTextActive]}>🚶 도보</Text>
          </TouchableOpacity>
        </View>

        {/* 에러 */}
        {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>}

        {/* 탐색 버튼 */}
        <TouchableOpacity
          style={[styles.findBtn, stops.length < 2 && styles.findBtnDisabled]}
          onPress={findPath}
          disabled={stops.length < 2 || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <><Navigation color="#fff" size={20} /><Text style={styles.findBtnText}>최단경로 탐색</Text></>
          }
        </TouchableOpacity>

        {/* 결과 */}
        {result && (
          <>
            {/* 지도 */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>🗺️ 경로 지도</Text>
              {currentLoc && (
                <View style={styles.locChip}>
                  <View style={styles.locChipDot} />
                  <Text style={styles.locChipText}>파란 점 = 현재 위치</Text>
                </View>
              )}
              <View style={{ marginTop: 8 }}>
                <RouteMap path={result.path} currentLoc={currentLoc} />
              </View>
            </View>

            {/* 요약 */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ruler color={Colors.primary} size={20} />
                <Text style={styles.summaryValue}>{formatDistance(result.totalDistance)}</Text>
                <Text style={styles.summaryLabel2}>총 거리</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Clock color={Colors.primary} size={20} />
                <Text style={styles.summaryValue}>{timeLabel.split(' ').slice(1).join(' ')}</Text>
                <Text style={styles.summaryLabel2}>{travelMode === 'drive' ? '예상 차량' : '예상 도보'}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <MapPin color={Colors.primary} size={20} />
                <Text style={styles.summaryValue}>{result.path.length}곳</Text>
                <Text style={styles.summaryLabel2}>경유 지점</Text>
              </View>
            </View>

            {/* 구간별 상세 */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>📋 구간별 경로</Text>
              {result.segments.map((seg, i) => (
                <View key={i} style={styles.segRow}>
                  <View style={styles.segLine}>
                    <View style={[styles.segDot, { backgroundColor: i === 0 ? '#52C41A' : Colors.primary }]} />
                    {i < result.segments.length - 1 && <View style={styles.segConnector} />}
                  </View>
                  <View style={styles.segInfo}>
                    <Text style={styles.segFrom}>{seg.from.name}</Text>
                    <View style={styles.segDistRow}>
                      <ChevronRight color={Colors.textSecondary} size={12} />
                      <Text style={styles.segDist}>{formatDistance(seg.distance)}</Text>
                      <Text style={styles.segTime}>
                        ({travelMode === 'walk' ? estimateWalkTime(seg.distance) : estimateDriveTime(seg.distance)})
                      </Text>
                    </View>
                    {i === result.segments.length - 1 && (
                      <Text style={[styles.segFrom, { color: '#FF4D4F', marginTop: 8 }]}>{seg.to.name}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // 현재 위치 버튼
  locBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#4A90E2', borderRadius: 18,
    padding: Spacing.md,
    shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  locBtnTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  locBtnSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  locDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#52C41A', marginLeft: 8 },

  // 지도 현재위치 칩
  locChip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 2 },
  locChipDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4A90E2', borderWidth: 2, borderColor: '#fff', shadowColor: '#4A90E2', shadowRadius: 3, shadowOpacity: 0.5, elevation: 2 },
  locChipText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    backgroundColor: Colors.secondary,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  headerSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  resetBtn: { padding: 8 },
  container: { flex: 1 },
  content: { padding: Spacing.md, gap: 14 },

  card: {
    backgroundColor: Colors.secondary, borderRadius: 20,
    padding: Spacing.lg, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 3,
  },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12 },

  stopRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  stopIndex: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  stopIndexText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
  stopName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  stopCat: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  swapBtn: { padding: 8, marginRight: 4 },
  removeBtn: { padding: 8 },
  addStopBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.primary + '50',
    borderRadius: 12, marginTop: 10, borderStyle: 'dashed',
  },
  addStopText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },

  modeRow: { flexDirection: 'row', gap: 10 },
  modeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    backgroundColor: Colors.secondary, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modeBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  modeBtnTextActive: { color: '#fff' },

  errorBox: {
    backgroundColor: '#FFF5F5', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#FFCCCC',
  },
  errorText: { color: Colors.error, fontSize: 13, fontWeight: '600' },

  findBtn: {
    backgroundColor: Colors.primary, borderRadius: 18,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  findBtnDisabled: { backgroundColor: Colors.border, shadowOpacity: 0 },
  findBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  summaryRow: {
    flexDirection: 'row', backgroundColor: Colors.secondary,
    borderRadius: 20, padding: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  summaryLabel2: { fontSize: 11, color: Colors.textSecondary },

  segRow: { flexDirection: 'row', marginBottom: 4 },
  segLine: { width: 20, alignItems: 'center', paddingTop: 4 },
  segDot: { width: 10, height: 10, borderRadius: 5 },
  segConnector: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: 2 },
  segInfo: { flex: 1, paddingLeft: 12, paddingBottom: 16 },
  segFrom: { fontSize: 14, fontWeight: '600', color: Colors.text },
  segDistRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  segDist: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  segTime: { fontSize: 11, color: Colors.textSecondary, marginLeft: 4 },
});
