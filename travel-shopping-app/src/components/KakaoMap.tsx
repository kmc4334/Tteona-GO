import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  Platform,
} from 'react-native';
import { Colors } from '../theme/colors';

interface KakaoMapProps {
  lat: number;
  lng: number;
  title?: string;
}

const KAKAO_KEY = process.env.EXPO_PUBLIC_KAKAO_MAP_API_KEY || '';

// ──────────────────────────────────────────────────
// 웹 플랫폼: iframe (OpenStreetMap embed)
// ──────────────────────────────────────────────────
const WebMapView: React.FC<KakaoMapProps> = ({ lat, lng, title = '장소' }) => {
  const delta = 0.008;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  // React Native Web 환경에서 iframe 사용
  const iframeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: 0,
  };

  return (
    <View style={styles.container}>
      {/* @ts-ignore – web only */}
      <iframe
        src={src}
        style={iframeStyle}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>🌍 OpenStreetMap</Text>
      </View>
    </View>
  );
};

// ──────────────────────────────────────────────────
// 모바일: WebView (Kakao → Leaflet fallback)
// ──────────────────────────────────────────────────
let WebView: any = null;
try {
  // 모바일에서만 import
  WebView = require('react-native-webview').WebView;
} catch (_) {}

function buildLeafletHTML(lat: number, lng: number, title: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map { width:100%; height:100%; margin:0; padding:0; }
    .leaflet-popup-content-wrapper {
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .leaflet-popup-content {
      font-size: 14px; font-weight: 800; color: #1a1a1a; padding: 4px 8px;
    }
    .leaflet-control-attribution { display: none; }
    .custom-dot {
      width: 16px; height: 16px;
      background: #4A90E2;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 3px 10px rgba(74,144,226,0.5);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([${lat}, ${lng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    var icon = L.divIcon({ className: 'custom-dot', iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -12] });
    L.marker([${lat}, ${lng}], { icon: icon }).addTo(map)
      .bindPopup('<b>${title.replace(/'/g, "&#39;")}</b>').openPopup();
    setTimeout(function() { map.invalidateSize(); }, 100);
  </script>
</body>
</html>`;
}

function buildKakaoHTML(lat: number, lng: number, title: string, apiKey: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    body, html, #map { width:100%; height:100%; margin:0; padding:0; background:#f8f9fa; }
    .overlay-wrap {
      position:absolute; bottom:45px; left:-50%;
      transform:translateX(-50%);
      background:#fff; border-radius:20px; padding:8px 16px;
      box-shadow:0 8px 20px rgba(0,0,0,0.12); display:flex; align-items:center; white-space:nowrap;
    }
    .overlay-wrap:after {
      content:''; position:absolute; bottom:-8px; left:50%; margin-left:-8px;
      border-top:8px solid #fff; border-left:8px solid transparent; border-right:8px solid transparent;
    }
    .overlay-dot { width:8px; height:8px; background:#4A90E2; border-radius:50%; margin-right:8px; }
    .overlay-text { font-size:14px; font-weight:800; color:#1a1a1a; }
  </style>
  <script type="text/javascript"
    src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false"
    onerror="onSdkError()">
  </script>
</head>
<body>
  <div id="map"></div>
  <script>
    function onSdkError() {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage('KAKAO_ERROR');
    }
    function initMap() {
      try {
        kakao.maps.load(function() {
          var container = document.getElementById('map');
          var map = new kakao.maps.Map(container, {
            center: new kakao.maps.LatLng(${lat}, ${lng}),
            level: 4
          });
          var pos = new kakao.maps.LatLng(${lat}, ${lng});
          var marker = new kakao.maps.Marker({ position: pos });
          marker.setMap(map);
          var overlay = new kakao.maps.CustomOverlay({
            position: pos,
            content: '<div class="overlay-wrap"><div class="overlay-dot"></div><div class="overlay-text">${title.replace(/'/g, "&#39;")}</div></div>',
            yAnchor: 1
          });
          overlay.setMap(map);
          setTimeout(function() { map.relayout(); map.setCenter(pos); }, 100);
        });
      } catch(e) { onSdkError(); }
    }
    if (window.kakao && window.kakao.maps) { initMap(); }
    else { window.addEventListener('load', function() {
      if (window.kakao && window.kakao.maps) { initMap(); } else { onSdkError(); }
    }); }
  </script>
</body>
</html>`;
}

const MobileMapView: React.FC<KakaoMapProps> = ({ lat, lng, title = '장소' }) => {
  const [useLeaflet, setUseLeaflet] = useState(!KAKAO_KEY);

  const htmlContent = useLeaflet
    ? buildLeafletHTML(lat, lng, title)
    : buildKakaoHTML(lat, lng, title, KAKAO_KEY);

  const handleMessage = (event: any) => {
    if (event.nativeEvent.data === 'KAKAO_ERROR') {
      setUseLeaflet(true);
    }
  };

  if (!WebView) {
    return (
      <View style={[styles.container, styles.fallbackBox]}>
        <Text style={styles.fallbackEmoji}>🗺️</Text>
        <Text style={styles.fallbackText}>{title}</Text>
        <Text style={styles.fallbackSub}>{lat.toFixed(4)}, {lng.toFixed(4)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        key={useLeaflet ? 'leaflet' : 'kakao'}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="always"
        onMessage={handleMessage}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        )}
      />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {useLeaflet ? '🌍 OpenStreetMap' : '🗺️ Kakao Maps'}
        </Text>
      </View>
    </View>
  );
};

// ──────────────────────────────────────────────────
// 플랫폼별 자동 분기
// ──────────────────────────────────────────────────
export const KakaoMap: React.FC<KakaoMapProps> = (props) => {
  if (Platform.OS === 'web') {
    return <WebMapView {...props} />;
  }
  return <MobileMapView {...props} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  map: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  badge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  fallbackBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 16,
  },
  fallbackEmoji: { fontSize: 36, marginBottom: 8 },
  fallbackText: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  fallbackSub: { fontSize: 12, color: '#999' },
});
