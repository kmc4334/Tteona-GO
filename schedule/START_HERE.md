# ⚡ 빠른 시작 가이드

> 📦 **여행 일정 관리 패키지** - 다른 프로젝트에 바로 사용할 수 있는 완전 독립형 모듈

---

## 🎯 이 폴더에는?

**완전히 독립적인 여행 일정 관리 시스템**이 들어있습니다!

✅ 일정 생성/수정/삭제  
✅ 장소 추가/삭제/이동  
✅ 자동 저장 (localStorage)  
✅ AI 챗봇 추천  
✅ 반응형 디자인  
✅ 제로 의존성 (Vanilla JS)  

---

## 🚀 30초 만에 시작하기

### 1. 파일 복사 (이미 됨!)
```
schedule/ 폴더가 준비되어 있습니다!
```

### 2. HTML에 추가
```html
<!DOCTYPE html>
<html>
<head>
  <!-- 스타일 추가 -->
  <link rel="stylesheet" href="schedule/schedule-styles.css" />
</head>
<body>
  <!-- 일정 표시할 곳 -->
  <div id="schedule-container"></div>
  
  <!-- 스크립트 추가 -->
  <script src="schedule/schedule-standalone.js"></script>
  <script>
    // 초기화
    const mySchedule = new ScheduleModule({
      storageKey: 'my_travel_plan'
    });
  </script>
</body>
</html>
```

### 3. 사용하기
```javascript
// 일정 생성
mySchedule.createPlan({
  title: '제주도 3박 4일',
  dest: '제주',
  start: '2026-07-01',
  end: '2026-07-04'
});

// 장소 추가
mySchedule.addPlace(0, {
  id: 'place_1',
  name: '성산일출봉',
  city: '제주',
  category: 'attraction'
});

// HTML 렌더링
document.getElementById('schedule-container').innerHTML = 
  mySchedule.renderScheduleHTML();
```

**끝!** 이제 사용할 수 있습니다.

---

## 📚 더 알아보기

### 핵심 파일

| 파일 | 용도 | 필수 여부 |
|------|------|-----------|
| **schedule-standalone.js** | 메인 모듈 | ⭐ 필수 |
| **schedule-styles.css** | 스타일 | ⭐ 필수 |
| **chatbot.js** | AI 챗봇 | 선택 |

### 문서 가이드

| 문서 | 내용 |
|------|------|
| **PACKAGE_README.md** | 완전한 사용 가이드 (시작은 여기서!) |
| **README.md** | 모듈 상세 설명 |
| **INTEGRATION_GUIDE.md** | 다른 프로젝트에 통합하는 방법 |
| **INDEX.md** | 전체 파일 구조 |
| **example-usage.js** | 코드 예제 모음 |

---

## 💡 기본 사용 예제

### 일정 만들기
```javascript
const schedule = new ScheduleModule({
  storageKey: 'my_plan',
  onPageChange: (page) => console.log('Go to:', page),
  onStateChange: (state) => console.log('Updated:', state)
});

schedule.createPlan({
  title: '부산 2박 3일',
  dest: '부산',
  start: '2026-08-01',
  end: '2026-08-03',
  people: '2',
  budget: '800000'
});
```

### 장소 추가하기
```javascript
// 단일 장소
schedule.addPlace(0, {
  id: 'p1',
  name: '해운대 해수욕장',
  city: '부산',
  category: 'attraction',
  rating: 4.8
});

// 여러 장소 한 번에
const places = [
  { id: 'p2', name: '광안리', city: '부산', category: 'attraction' },
  { id: 'p3', name: '자갈치시장', city: '부산', category: 'restaurant' }
];
schedule.addMultiplePlaces(0, places);
```

### 데이터 관리
```javascript
// 저장 (자동으로 됨)
schedule.saveToStorage();

// 불러오기
schedule.loadFromStorage();

// 내보내기
const json = schedule.exportToJSON();
console.log(json);

// 가져오기
schedule.importFromJSON(jsonString);
```

### HTML 렌더링
```javascript
// HTML 생성
const html = schedule.renderScheduleHTML();

// DOM에 넣기
document.getElementById('container').innerHTML = html;

// 또는 직접 렌더링
schedule.renderToDOM();  // day-schedules 요소에 자동 렌더링
```

---

## 🤖 챗봇 추가하기 (선택사항)

```html
<!-- HTML에 추가 -->
<script src="schedule/chatbot.js"></script>
<script>
  // 장소 데이터베이스 필요
  const PLACES_DB = [
    { id: 'p1', name: '장소명', city: '도시', category: 'attraction', rating: 4.5 },
    // ... 더 많은 장소
  ];
  
  // 챗봇 초기화
  const chatbot = new ChatbotModule(mySchedule, PLACES_DB, {
    apiEndpoint: null  // null이면 로컬 검색
  });
</script>
```

---

## ⚙️ 설정 옵션

```javascript
new ScheduleModule({
  // localStorage 키
  storageKey: 'my_custom_key',
  
  // 카테고리 이모지
  categoryEmojis: {
    attraction: '🏛',
    restaurant: '🍽',
    cafe: '☕',
    accommodation: '🏨',
    activity: '🎡'
  },
  
  // 페이지 전환 콜백
  onPageChange: (page) => {
    // 페이지 이동 로직
  },
  
  // 상태 변경 콜백
  onStateChange: (state) => {
    // state.planInfo
    // state.planSchedule
  },
  
  // 에러 핸들러
  onError: (message) => {
    alert(message);
  }
});
```

---

## 📦 React / Vue / Angular에서 사용하기

### React
```jsx
import { useEffect, useRef } from 'react';

function SchedulePage() {
  const scheduleRef = useRef(null);
  
  useEffect(() => {
    scheduleRef.current = new ScheduleModule({
      storageKey: 'my_plan'
    });
    scheduleRef.current.renderToDOM();
  }, []);
  
  return <div id="schedule-container"></div>;
}
```

### Vue
```vue
<template>
  <div id="schedule-container"></div>
</template>

<script>
export default {
  mounted() {
    this.schedule = new ScheduleModule({
      storageKey: 'my_plan'
    });
    this.schedule.renderToDOM();
  }
}
</script>
```

---

## 🔧 API 치트시트

### 일정 관리
```javascript
schedule.createPlan(formData)     // 일정 생성
schedule.getPlanInfo()             // 일정 정보 조회
schedule.getSchedule()             // 전체 일정표
schedule.hasPlan()                 // 일정 있는지 확인
```

### 장소 관리
```javascript
schedule.addPlace(dayIdx, place)           // 장소 추가
schedule.addMultiplePlaces(dayIdx, places) // 여러 장소 추가
schedule.removePlace(dayIdx, slotIdx)      // 장소 삭제
schedule.movePlaceToDay(from, slot, to)    // 장소 이동
schedule.updatePlaceTime(d, s, time)       // 시간 수정
```

### 데이터 조회
```javascript
schedule.getDay(dayIdx)                  // 특정 Day
schedule.getPlace(dayIdx, slotIdx)       // 특정 장소
schedule.getTotalPlaces()                // 총 장소 수
```

### 저장/불러오기
```javascript
schedule.saveToStorage()       // localStorage 저장
schedule.loadFromStorage()     // localStorage 불러오기
schedule.clearStorage()        // 초기화
schedule.exportToJSON()        // JSON 내보내기
schedule.importFromJSON(json)  // JSON 가져오기
```

---

## 🐛 문제 해결

### 일정이 저장 안 됨
```javascript
// localStorage 확인
try {
  localStorage.setItem('test', 'value');
  console.log('✅ OK');
} catch (e) {
  console.error('❌ localStorage 접근 불가');
}
```

### HTML이 안 보임
```javascript
// DOM 로드 대기
document.addEventListener('DOMContentLoaded', () => {
  const schedule = new ScheduleModule({ ... });
  schedule.renderToDOM();
});
```

---

## 📞 도움이 필요하면?

1. **PACKAGE_README.md** 읽기 (완전한 가이드)
2. **example-usage.js** 보기 (코드 예제)
3. **브라우저 콘솔** 확인 (에러 메시지)

---

## ✅ 체크리스트

다른 프로젝트에 사용할 때:

- [ ] `schedule/` 폴더 복사
- [ ] HTML에 CSS 추가
- [ ] HTML에 JS 추가
- [ ] ScheduleModule 초기화
- [ ] 테스트

---

**🎉 준비 완료! 이제 여행 일정을 만들어보세요!**

더 자세한 내용은 **PACKAGE_README.md**를 확인하세요.
