/**
 * googleMapService.ts
 * Google Maps JavaScript API HTML 빌더
 * - Maps JavaScript API + Places API 사용
 * - WebView(모바일) / iframe(웹) 환경 모두 지원
 * - 카테고리별 마커, 일차별 경로 폴리라인, 장소 검색 포함
 */

export interface Place {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  category: '관광지' | '맛집' | '숙소' | '카페' | '기타';
  address?: string;
  description?: string;
  day?: number;
  order?: number;
}

export const DAY_COLORS = ['#4A90E2', '#FF6B6B', '#52C41A', '#F39C12', '#9B59B6', '#1ABC9C'];

const CATEGORY_EMOJI: Record<string, string> = {
  관광지: '🎡', 맛집: '🍜', 숙소: '🏨', 카페: '☕', 기타: '📍',
};

// Google Maps 마커 색상 (HEX)
const CATEGORY_COLOR: Record<string, string> = {
  관광지: '#4A90E2',
  맛집:   '#FF6B6B',
  숙소:   '#52C41A',
  카페:   '#F39C12',
  기타:   '#9B59B6',
};

export function buildGoogleMapHTML(params: {
  apiKey: string;
  center: { lat: number; lng: number };
  places: Place[];
  currentLoc?: { lat: number; lng: number } | null;
  showRoute?: boolean;
}): string {
  const { apiKey, center, places, currentLoc, showRoute = true } = params;

  // ── 일차별 그룹화 ─────────────────────────────────────────────
  const dayGroups: Record<number, Place[]> = {};
  places.forEach(p => {
    const d = p.day ?? 0;
    if (!dayGroups[d]) dayGroups[d] = [];
    dayGroups[d].push(p);
  });

  // ── 마커 데이터 JSON (JS 인젝션) ──────────────────────────────
  const placesJson = JSON.stringify(
    places.map((p, idx) => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      category: p.category,
      address: p.address || '',
      description: p.description || '',
      day: p.day ?? 0,
      order: p.order ?? idx + 1,
      emoji: CATEGORY_EMOJI[p.category] || '📍',
      color: CATEGORY_COLOR[p.category] || '#9B59B6',
    }))
  );

  // ── 경로 데이터 JSON ───────────────────────────────────────────
  const routesJson = JSON.stringify(
    showRoute
      ? Object.entries(dayGroups)
          .filter(([, pts]) => pts.length >= 2)
          .map(([day, pts]) => ({
            day: Number(day),
            color: DAY_COLORS[(Number(day) - 1) % DAY_COLORS.length] || '#4A90E2',
            coords: pts
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map(p => ({ lat: p.lat, lng: p.lng })),
          }))
      : []
  );

  const currentLocJson = currentLoc ? JSON.stringify(currentLoc) : 'null';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body,#map{width:100%;height:100%}
  /* 검색바 */
  #searchbar{
    position:absolute;top:12px;left:50%;transform:translateX(-50%);
    width:calc(100% - 24px);max-width:420px;
    display:flex;align-items:center;gap:8px;
    background:#fff;border-radius:24px;
    box-shadow:0 4px 16px rgba(0,0,0,0.18);
    padding:10px 16px;z-index:5;
  }
  #searchInput{
    flex:1;border:none;outline:none;
    font-size:14px;color:#333;background:transparent;
  }
  #searchBtn{
    background:#4A90E2;color:#fff;border:none;border-radius:16px;
    padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;
    white-space:nowrap;
  }
  /* 현재위치 버튼 */
  #locBtn{
    position:absolute;bottom:28px;right:14px;
    width:44px;height:44px;border-radius:22px;
    background:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.18);
    border:none;cursor:pointer;font-size:20px;z-index:5;
  }
  /* 범례 */
  #legend{
    position:absolute;bottom:84px;right:14px;
    background:#fff;border-radius:14px;
    padding:10px 14px;box-shadow:0 2px 10px rgba(0,0,0,0.14);
    z-index:5;
  }
  .leg-row{display:flex;align-items:center;margin-bottom:5px;font-size:11px;color:#555;}
  .leg-row:last-child{margin-bottom:0}
  .leg-dot{width:10px;height:10px;border-radius:50%;margin-right:7px;flex-shrink:0;}
  /* 커스텀 마커 */
  .gm-marker{
    width:36px;height:36px;border-radius:50%;
    border:2.5px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,0.28);
    display:flex;align-items:center;justify-content:center;
    font-size:16px;cursor:pointer;
  }
  /* 인포윈도우 */
  .iw-wrap{padding:10px 14px;min-width:180px;max-width:240px;font-family:sans-serif;}
  .iw-title{font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:4px;}
  .iw-cat{font-size:11px;font-weight:700;margin-bottom:3px;}
  .iw-addr{font-size:11px;color:#888;margin-bottom:2px;}
  .iw-desc{font-size:11px;color:#555;}
</style>
</head>
<body>
<!-- 검색바 -->
<div id="searchbar">
  <span style="font-size:16px;color:#999">🔍</span>
  <input id="searchInput" placeholder="장소를 검색해보세요" />
  <button id="searchBtn">검색</button>
</div>

<!-- 지도 컨테이너 -->
<div id="map"></div>

<!-- 현재위치 버튼 -->
<button id="locBtn" title="현재 위치">📍</button>

<!-- 카테고리 범례 -->
${places.length > 0 ? `<div id="legend">
  <div class="leg-row"><div class="leg-dot" style="background:#4A90E2"></div>관광지</div>
  <div class="leg-row"><div class="leg-dot" style="background:#FF6B6B"></div>맛집</div>
  <div class="leg-row"><div class="leg-dot" style="background:#52C41A"></div>숙소</div>
  <div class="leg-row"><div class="leg-dot" style="background:#F39C12"></div>카페</div>
</div>` : ''}

<script>
// ── 데이터 ───────────────────────────────────────────────
var PLACES = ${placesJson};
var ROUTES = ${routesJson};
var CURRENT_LOC = ${currentLocJson};

var map, infoWindow, searchService, searchMarkers = [];

// ── 지도 초기화 (Google Maps 콜백) ─────────────────────
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: ${center.lat}, lng: ${center.lng} },
    zoom: 13,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    styles: [
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
    ]
  });

  infoWindow = new google.maps.InfoWindow();

  // 검색 서비스 초기화
  searchService = new google.maps.places.PlacesService(map);

  // 마커 생성
  addPlaceMarkers();

  // 경로 폴리라인
  addRoutes();

  // 현재 위치 마커
  if (CURRENT_LOC) addCurrentLocMarker(CURRENT_LOC);

  // bounds 자동 맞춤 (마커가 2개 이상)
  if (PLACES.length > 1) fitBounds();

  // 이벤트 바인딩
  document.getElementById('locBtn').addEventListener('click', goToCurrentLoc);
  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.getElementById('searchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doSearch();
  });
}

// ── 장소 마커 ────────────────────────────────────────────
function addPlaceMarkers() {
  PLACES.forEach(function(p) {
    var dayLabel = p.day ? 'Day' + p.day : '';

    // 커스텀 오버레이로 이모지 마커
    var markerDiv = document.createElement('div');
    markerDiv.className = 'gm-marker';
    markerDiv.style.background = p.color;
    markerDiv.innerHTML = p.emoji;

    var overlay = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: p.lat, lng: p.lng },
      map: map,
      title: p.name,
      content: markerDiv,
    });

    overlay.addListener('click', function() {
      var content = [
        '<div class="iw-wrap">',
        '<div class="iw-title">' + p.emoji + ' ' + escHtml(p.name) + '</div>',
        '<div class="iw-cat" style="color:' + p.color + '">' + p.category + (dayLabel ? ' · ' + dayLabel : '') + '</div>',
        p.address ? '<div class="iw-addr">📌 ' + escHtml(p.address) + '</div>' : '',
        p.description ? '<div class="iw-desc">' + escHtml(p.description) + '</div>' : '',
        '</div>'
      ].join('');
      infoWindow.setContent(content);
      infoWindow.open({ anchor: overlay, map: map });
      map.panTo({ lat: p.lat, lng: p.lng });
    });
  });
}

// ── 경로 폴리라인 ─────────────────────────────────────────
function addRoutes() {
  ROUTES.forEach(function(route) {
    new google.maps.Polyline({
      path: route.coords,
      strokeColor: route.color,
      strokeOpacity: 0.85,
      strokeWeight: 3,
      icons: [{
        icon: { path: google.maps.SymbolPath.FORWARD_OPEN_ARROW, scale: 3 },
        offset: '100%',
        repeat: '80px'
      }],
      map: map,
    });
  });
}

// ── 현재위치 마커 ─────────────────────────────────────────
function addCurrentLocMarker(loc) {
  var dot = document.createElement('div');
  dot.style.cssText = [
    'width:14px;height:14px;border-radius:50%;',
    'background:#4A90E2;border:2.5px solid #fff;',
    'box-shadow:0 0 0 6px rgba(74,144,226,0.22);',
  ].join('');
  new google.maps.marker.AdvancedMarkerElement({
    position: loc,
    map: map,
    title: '현재 위치',
    content: dot,
  });
}

// ── Bounds 자동 맞춤 ──────────────────────────────────────
function fitBounds() {
  var bounds = new google.maps.LatLngBounds();
  PLACES.forEach(function(p) { bounds.extend({ lat: p.lat, lng: p.lng }); });
  if (CURRENT_LOC) bounds.extend(CURRENT_LOC);
  map.fitBounds(bounds, { top: 80, right: 20, bottom: 100, left: 20 });
}

// ── 현재위치 이동 ─────────────────────────────────────────
function goToCurrentLoc() {
  if (CURRENT_LOC) {
    map.panTo(CURRENT_LOC);
    map.setZoom(14);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      var loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      map.panTo(loc);
      map.setZoom(14);
    }, function() {
      alert('위치 정보를 가져올 수 없습니다.');
    });
  }
}

// ── 장소 검색 (Places API) ───────────────────────────────
function doSearch() {
  var kw = document.getElementById('searchInput').value.trim();
  if (!kw) return;

  // 이전 검색 마커 제거
  searchMarkers.forEach(function(m) { m.map = null; });
  searchMarkers = [];
  infoWindow.close();

  var req = {
    query: kw,
    fields: ['name', 'geometry', 'formatted_address', 'rating'],
    locationBias: map.getCenter(),
  };

  searchService.findPlaceFromQuery(req, function(results, status) {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
      // Text Search 폴백
      searchService.textSearch({ query: kw }, function(r2, s2) {
        if (s2 === google.maps.places.PlacesServiceStatus.OK && r2) {
          showSearchResults(r2);
        } else {
          alert('검색 결과가 없습니다.');
        }
      });
      return;
    }
    showSearchResults(results);
  });
}

function showSearchResults(results) {
  var bounds = new google.maps.LatLngBounds();
  results.slice(0, 5).forEach(function(place) {
    if (!place.geometry || !place.geometry.location) return;
    var loc = place.geometry.location;

    var pin = document.createElement('div');
    pin.style.cssText = [
      'width:32px;height:32px;border-radius:50%;',
      'background:#FF5252;border:2.5px solid #fff;',
      'box-shadow:0 2px 8px rgba(0,0,0,0.28);',
      'display:flex;align-items:center;justify-content:center;',
      'font-size:15px;cursor:pointer;',
    ].join('');
    pin.innerHTML = '🔍';

    var marker = new google.maps.marker.AdvancedMarkerElement({
      position: loc,
      map: map,
      title: place.name,
      content: pin,
    });

    marker.addListener('click', function() {
      var content = [
        '<div class="iw-wrap">',
        '<div class="iw-title">🔍 ' + escHtml(place.name || '') + '</div>',
        place.formatted_address
          ? '<div class="iw-addr">📌 ' + escHtml(place.formatted_address) + '</div>'
          : '',
        place.rating
          ? '<div class="iw-desc">⭐ 평점 ' + place.rating + '</div>'
          : '',
        '</div>'
      ].join('');
      infoWindow.setContent(content);
      infoWindow.open({ anchor: marker, map: map });
    });

    searchMarkers.push(marker);
    bounds.extend(loc);
  });

  if (searchMarkers.length > 0) {
    map.fitBounds(bounds, { top: 80, right: 20, bottom: 20, left: 20 });
  }
}

// ── HTML 이스케이프 유틸 ──────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
</script>

<!-- Google Maps JS API (AdvancedMarkerElement + Places) -->
<script
  src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=initMap&loading=async"
  async defer>
</script>
</body>
</html>`;
}
