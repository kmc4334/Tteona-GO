/**
 * kakaoMapService.ts
 * 카카오맵 HTML 빌더 - SDK를 동적으로 로드하여 안정적으로 초기화
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
const CATEGORY_COLOR: Record<string, string> = {
  관광지: '#4A90E2', 맛집: '#FF6B6B', 숙소: '#52C41A', 카페: '#F39C12', 기타: '#9B59B6',
};

export function buildKakaoMapHTML(params: {
  apiKey: string;
  center: { lat: number; lng: number };
  places: Place[];
  currentLoc?: { lat: number; lng: number } | null;
  showRoute?: boolean;
}): string {
  const { apiKey, center, places, currentLoc, showRoute = true } = params;

  // 일차별 그룹화
  const dayGroups: Record<number, Place[]> = {};
  places.forEach(p => {
    const d = p.day ?? 0;
    if (!dayGroups[d]) dayGroups[d] = [];
    dayGroups[d].push(p);
  });

  // 마커 JS
  const markersJS = places.map((p, idx) => {
    const emoji = CATEGORY_EMOJI[p.category] || '📍';
    const color = CATEGORY_COLOR[p.category] || '#9B59B6';
    const dayLabel = p.day ? `Day${p.day}` : '';
    const orderLabel = p.order ?? idx + 1;
    // 인포윈도우 내용 (줄바꿈 제거, 따옴표 이스케이프)
    const infoHtml = [
      `<div style='padding:12px 16px;min-width:180px;'>`,
      `<b style='font-size:14px;'>${emoji} ${p.name}</b><br/>`,
      `<span style='font-size:11px;color:${color};'>${p.category}${dayLabel ? ' · ' + dayLabel : ''}</span>`,
      p.address ? `<br/><span style='font-size:11px;color:#888;'>📌 ${p.address}</span>` : '',
      p.description ? `<br/><span style='font-size:11px;color:#555;'>${p.description}</span>` : '',
      `</div>`,
    ].join('').replace(/'/g, "\\'");

    return `(function(){
      var pos=new kakao.maps.LatLng(${p.lat},${p.lng});
      var html='<div style="width:34px;height:34px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;">${emoji}</div>';
      var ov=new kakao.maps.CustomOverlay({position:pos,content:html,yAnchor:0.5});
      ov.setMap(map);
      var iw=new kakao.maps.InfoWindow({content:'${infoHtml}',removable:true});
      ov.getContent().addEventListener('click',function(){
        if(ciw){ciw.close();}
        iw.open(map,new kakao.maps.Marker({position:pos}));
        ciw=iw; map.panTo(pos);
      });
    })();`;
  }).join('\n');

  // 경로선 JS
  const routeJS = showRoute ? Object.entries(dayGroups).map(([day, pts]) => {
    if (pts.length < 2) return '';
    const color = DAY_COLORS[(Number(day) - 1) % DAY_COLORS.length] || '#4A90E2';
    const coords = pts
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(p => `new kakao.maps.LatLng(${p.lat},${p.lng})`)
      .join(',');
    return `new kakao.maps.Polyline({path:[${coords}],strokeWeight:3,strokeColor:'${color}',strokeOpacity:0.8,strokeStyle:'shortdash'}).setMap(map);`;
  }).join('\n') : '';

  // 현재 위치 마커 JS
  const currentLocJS = currentLoc
    ? `new kakao.maps.CustomOverlay({position:new kakao.maps.LatLng(${currentLoc.lat},${currentLoc.lng}),content:'<div style="width:14px;height:14px;border-radius:50%;background:#4A90E2;border:2px solid #fff;box-shadow:0 0 0 5px rgba(74,144,226,0.25);"></div>',yAnchor:0.5}).setMap(map);`
    : '';

  // bounds JS
  const boundsJS = places.length > 1
    ? `var b=new kakao.maps.LatLngBounds();${places.map(p => `b.extend(new kakao.maps.LatLng(${p.lat},${p.lng}));`).join('')}map.setBounds(b);`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body,#map{width:100%;height:100%;overflow:hidden}
#sb{position:absolute;top:12px;left:50%;transform:translateX(-50%);
  width:calc(100% - 32px);max-width:400px;background:#fff;border-radius:24px;
  box-shadow:0 4px 20px rgba(0,0,0,0.15);display:flex;align-items:center;
  padding:10px 16px;z-index:10;}
#si{flex:1;border:none;outline:none;font-size:14px;color:#333;background:transparent;}
#sbtn{background:#4A90E2;color:#fff;border:none;border-radius:16px;
  padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;}
#cb{position:absolute;bottom:24px;right:16px;width:44px;height:44px;border-radius:22px;
  background:#fff;box-shadow:0 2px 12px rgba(0,0,0,0.15);border:none;cursor:pointer;font-size:20px;z-index:10;}
#lg{position:absolute;bottom:80px;right:16px;background:#fff;border-radius:14px;
  padding:10px 14px;box-shadow:0 2px 12px rgba(0,0,0,0.12);z-index:10;}
.li{display:flex;align-items:center;margin-bottom:5px;font-size:11px;color:#555;}
.li:last-child{margin-bottom:0}
.ld{width:10px;height:10px;border-radius:50%;margin-right:7px;}
</style>
</head>
<body>
<div id="sb">
  <span style="font-size:16px;margin-right:8px;color:#999">🔍</span>
  <input id="si" placeholder="장소를 검색해보세요"/>
  <button id="sbtn">검색</button>
</div>
<div id="map"></div>
<button id="cb" title="현재 위치">📍</button>
${places.length > 0 ? `<div id="lg">
  <div class="li"><div class="ld" style="background:#4A90E2"></div>관광지</div>
  <div class="li"><div class="ld" style="background:#FF6B6B"></div>맛집</div>
  <div class="li"><div class="ld" style="background:#52C41A"></div>숙소</div>
  <div class="li"><div class="ld" style="background:#F39C12"></div>카페</div>
</div>` : ''}
<script>
// SDK 동적 로드
(function(){
  var s=document.createElement('script');
  s.src='https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false';
  s.onload=function(){
    kakao.maps.load(function(){
      var map=new kakao.maps.Map(document.getElementById('map'),{
        center:new kakao.maps.LatLng(${center.lat},${center.lng}),level:7
      });
      map.addControl(new kakao.maps.ZoomControl(),kakao.maps.ControlPosition.RIGHT);
      var ciw=null, ps=new kakao.maps.services.Places(), sm=[];

      ${currentLocJS}
      ${markersJS}
      ${routeJS}
      ${boundsJS}

      // 현재위치 이동
      document.getElementById('cb').onclick=function(){
        ${currentLoc
          ? `map.panTo(new kakao.maps.LatLng(${currentLoc.lat},${currentLoc.lng}));`
          : `if(navigator.geolocation){navigator.geolocation.getCurrentPosition(function(p){map.panTo(new kakao.maps.LatLng(p.coords.latitude,p.coords.longitude));});}`
        }
      };

      // 장소 검색
      function search(){
        var kw=document.getElementById('si').value.trim();
        if(!kw)return;
        sm.forEach(function(m){m.setMap(null);}); sm=[];
        ps.keywordSearch(kw,function(data,status){
          if(status!==kakao.maps.services.Status.OK){alert('검색 결과 없음');return;}
          var b=new kakao.maps.LatLngBounds();
          data.forEach(function(pl){
            var pos=new kakao.maps.LatLng(pl.y,pl.x);
            var m=new kakao.maps.Marker({map:map,position:pos});
            var iw=new kakao.maps.InfoWindow({content:'<div style="padding:8px 12px;font-weight:bold;">'+pl.place_name+'</div>',removable:true});
            kakao.maps.event.addListener(m,'click',function(){if(ciw)ciw.close();iw.open(map,m);ciw=iw;map.panTo(pos);});
            sm.push(m); b.extend(pos);
          });
          map.setBounds(b);
        });
      }
      document.getElementById('sbtn').onclick=search;
      document.getElementById('si').onkeydown=function(e){if(e.key==='Enter')search();};
    });
  };
  document.head.appendChild(s);
})();
</script>
</body>
</html>`;
}
