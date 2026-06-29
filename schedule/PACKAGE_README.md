# 📦 여행 일정 관리 패키지

> 다른 프로젝트에 바로 복사해서 사용할 수 있는 완전 독립형 일정 관리 모듈

## 🎯 핵심 특징

✅ **완전 독립형** - 외부 의존성 없음 (Vanilla JavaScript)  
✅ **즉시 사용 가능** - 폴더만 복사하면 바로 작동  
✅ **localStorage 자동 관리** - 데이터 자동 저장/불러오기  
✅ **AI 챗봇 통합** - 장소 추천 챗봇 포함  
✅ **반응형 디자인** - 모바일/데스크톱 모두 지원  
✅ **완벽한 문서화** - 상세한 가이드와 예제  

---

## 📂 패키지 구조

```
schedule/
├── 📄 PACKAGE_README.md           ⭐ 패키지 전체 가이드 (현재 파일)
├── 📘 README.md                    모듈 상세 설명
├── 📗 INTEGRATION_GUIDE.md         통합 가이드
├── 📕 INDEX.md                     전체 구조
│
├── 🚀 schedule-standalone.js       ⭐ 독립형 메인 모듈 (이것만 있어도 OK)
├── 💬 chatbot.js                   AI 챗봇 모듈
│
├── 🔧 schedule.js                  핵심 로직 (모듈식)
├── 🎨 schedule-ui.js               UI 핸들러 (모듈식)
│
├── 🌐 schedule-template.html       HTML 템플릿
├── 💅 schedule-styles.css          스타일시트
└── 💡 example-usage.js             사용 예제
```

---

## 🚀 빠른 시작 (3단계)

### 방법 1: 독립형 모듈 사용 (권장)

#### 1단계: 파일 복사
```bash
# schedule 폴더 전체를 프로젝트에 복사
cp -r schedule/ your-project/schedule/
```

#### 2단계: HTML에 추가
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="schedule/schedule-styles.css" />
</head>
<body>
  <!-- 일정 페이지 HTML -->
  <div id="schedule-container"></div>
  
  <!-- 챗봇 모달 (선택사항) -->
  <div id="chatbot-modal" class="modal hidden">
    <!-- 챗봇 HTML -->
  </div>
  
  <script src="schedule/schedule-standalone.js"></script>
  <script src="schedule/chatbot.js"></script>
  <script>
    // 3단계에서 계속...
  </script>
</body>
</html>
```

#### 3단계: 초기화
```javascript
// 일정 모듈 초기화
const mySchedule = new ScheduleModule({
  storageKey: 'my_travel_plan',
  onPageChange: (page) => {
    console.log('페이지 이동:', page);
    // 실제 페이지 전환 로직
  },
  onStateChange: (state) => {
    console.log('상태 변경:', state);
  }
});

// 챗봇 초기화 (선택사항)
const chatbot = new ChatbotModule(mySchedule, PLACES_DB, {
  apiEndpoint: '/api/chatbot',  // 또는 null (로컬 검색)
});
```

**완료!** 이제 사용할 수 있습니다.

---

### 방법 2: ES6 모듈 사용

```html
<script type="module">
  import { ScheduleManager } from './schedule/schedule.js';
  import { initScheduleModule } from './schedule/schedule-ui.js';
  
  const schedule = new ScheduleManager(config);
  initScheduleModule(state, CAT_EMOJI, goToPage);
</script>
```

---

## 💡 사용 예제

### 기본 사용법

```javascript
// 1. 일정 생성
mySchedule.createPlan({
  title: '제주도 3박 4일',
  dest: '제주',
  start: '2026-07-01',
  end: '2026-07-04',
  people: '2',
  budget: '1000000',
  transport: '렌터카',
  memo: '날씨 좋을 때'
});

// 2. 장소 추가
mySchedule.addPlace(0, {  // Day 1에 추가
  id: 'place_001',
  name: '성산일출봉',
  city: '제주',
  category: 'attraction',
  rating: 4.8
});

// 3. HTML 렌더링
document.getElementById('schedule-container').innerHTML = 
  mySchedule.renderScheduleHTML();

// 4. 데이터 확인
console.log(mySchedule.getPlanInfo());
console.log(mySchedule.getSchedule());
```

### 여러 장소 한 번에 추가

```javascript
const places = [
  { id: 'p1', name: '해운대', city: '부산', category: 'attraction' },
  { id: 'p2', name: '광안리', city: '부산', category: 'attraction' },
  { id: 'p3', name: '자갈치시장', city: '부산', category: 'restaurant' }
];

mySchedule.addMultiplePlaces(0, places);  // Day 1에 3개 추가
```

### 장소 삭제 및 이동

```javascript
// 장소 삭제
mySchedule.removePlace(0, 1);  // Day 1의 두 번째 장소 삭제

// 장소 이동
mySchedule.movePlaceToDay(0, 0, 1);  // Day 1의 첫 번째 → Day 2로
```

### 시간 설정

```javascript
mySchedule.updatePlaceTime(0, 0, '09:00');  // Day 1 첫 장소 9시
mySchedule.updatePlaceTime(0, 1, '12:00');  // Day 1 둘째 장소 12시
```

### 데이터 내보내기/가져오기

```javascript
// JSON으로 내보내기
const jsonData = mySchedule.exportToJSON();
console.log(jsonData);

// 파일로 저장
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'my-travel-plan.json';
a.click();

// JSON에서 가져오기
mySchedule.importFromJSON(jsonData);
```

---

## 🤖 챗봇 사용법

```javascript
// 1. 챗봇 초기화 (일정 모듈 필요)
const chatbot = new ChatbotModule(mySchedule, PLACES_DB);

// 2. 챗봇 열기/닫기
chatbot.open();
chatbot.close();

// 3. 프로그래밍 방식으로 메시지 전송
chatbot.addMessage('bot', '안녕하세요! 무엇을 도와드릴까요?');

// 4. 메시지 초기화
chatbot.clearMessages();
chatbot.reset();
```

---

## 🎨 스타일 커스터마이징

```css
/* schedule/schedule-styles.css 수정 */

/* CSS 변수 재정의 */
:root {
  --primary: #4682FF;      /* 메인 컬러 */
  --border: #E5E7EB;       /* 테두리 */
  --bg: #F9FAFB;           /* 배경 */
  --text: #1F2937;         /* 텍스트 */
}

/* 개별 요소 스타일 */
.day-card {
  border-radius: 16px;     /* 모서리 둥글게 */
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.slot-item {
  padding: 20px;           /* 여백 */
}
```

---

## 🔧 설정 옵션

### ScheduleModule 옵션

```javascript
const mySchedule = new ScheduleModule({
  // localStorage 키 (기본: 'travel_schedule')
  storageKey: 'my_custom_key',
  
  // 카테고리별 이모지
  categoryEmojis: {
    attraction: '🏛',
    restaurant: '🍽',
    cafe: '☕',
    accommodation: '🏨',
    activity: '🎡'
  },
  
  // 페이지 전환 콜백
  onPageChange: (page) => {
    // 페이지 전환 로직
    goToPage(page);
  },
  
  // 상태 변경 콜백
  onStateChange: (state) => {
    console.log('State updated:', state);
    // 다른 UI 업데이트
  },
  
  // 에러 핸들러
  onError: (message) => {
    alert(message);
    // 또는 커스텀 에러 표시
  }
});
```

### ChatbotModule 옵션

```javascript
const chatbot = new ChatbotModule(scheduleModule, placesDB, {
  // AI API 엔드포인트 (null이면 로컬 검색)
  apiEndpoint: 'https://api.example.com/chatbot',
  
  // 또는 로컬 검색만 사용
  apiEndpoint: null,
  
  // 에러 핸들러
  onError: (message) => {
    console.error('Chatbot error:', message);
  },
  
  // 카테고리 이모지 (schedule과 동일하게)
  categoryEmojis: { ... }
});
```

---

## 📊 데이터 구조

### 일정 정보 (planInfo)

```javascript
{
  title: "부산 2박 3일",
  dest: "부산",
  start: "2026-08-01",
  end: "2026-08-03",
  days: 3,
  people: "2",
  budget: "800000",
  transport: "기차",
  memo: "해변 중심 여행",
  createdAt: "2026-06-10T14:30:00.000Z"
}
```

### 일정표 (planSchedule)

```javascript
[
  {
    day: 1,
    date: "2026-08-01",
    slots: [
      {
        id: "place_001",
        name: "해운대 해수욕장",
        city: "부산",
        category: "attraction",
        rating: 4.8,
        start_time: "09:00",
        duration: 120,
        addedAt: "2026-06-10T14:35:00.000Z"
      },
      // ... 더 많은 장소
    ]
  },
  // ... Day 2, Day 3
]
```

---

## 🔌 API 메서드

### 일정 관리

| 메서드 | 설명 | 예제 |
|--------|------|------|
| `createPlan(formData)` | 새 일정 생성 | `createPlan({ title: '제주도', ... })` |
| `getPlanInfo()` | 일정 정보 조회 | `const info = getPlanInfo()` |
| `getSchedule()` | 전체 일정표 조회 | `const schedule = getSchedule()` |
| `hasPlan()` | 일정 존재 여부 | `if (hasPlan()) { ... }` |

### 장소 관리

| 메서드 | 설명 | 예제 |
|--------|------|------|
| `addPlace(dayIdx, place)` | 장소 추가 | `addPlace(0, placeObj)` |
| `addMultiplePlaces(dayIdx, places)` | 여러 장소 추가 | `addMultiplePlaces(0, [p1, p2])` |
| `removePlace(dayIdx, slotIdx)` | 장소 삭제 | `removePlace(0, 1)` |
| `movePlaceToDay(from, slot, to)` | 장소 이동 | `movePlaceToDay(0, 0, 1)` |
| `updatePlaceTime(day, slot, time)` | 시간 수정 | `updatePlaceTime(0, 0, '09:00')` |

### 데이터 조회

| 메서드 | 설명 | 예제 |
|--------|------|------|
| `getDay(dayIdx)` | 특정 Day 조회 | `const day1 = getDay(0)` |
| `getPlace(dayIdx, slotIdx)` | 특정 장소 조회 | `const place = getPlace(0, 0)` |
| `getTotalPlaces()` | 총 장소 수 | `const total = getTotalPlaces()` |

### 저장/불러오기

| 메서드 | 설명 | 예제 |
|--------|------|------|
| `saveToStorage()` | localStorage 저장 | `saveToStorage()` |
| `loadFromStorage()` | localStorage 불러오기 | `loadFromStorage()` |
| `clearStorage()` | 데이터 초기화 | `clearStorage()` |
| `exportToJSON()` | JSON 내보내기 | `const json = exportToJSON()` |
| `importFromJSON(json)` | JSON 가져오기 | `importFromJSON(jsonString)` |

### UI 렌더링

| 메서드 | 설명 | 예제 |
|--------|------|------|
| `renderScheduleHTML()` | 전체 HTML 생성 | `const html = renderScheduleHTML()` |
| `renderSlotHTML(d, s, slot)` | 슬롯 HTML 생성 | `const html = renderSlotHTML(0, 0, slot)` |
| `renderToDOM()` | DOM에 직접 렌더링 | `renderToDOM()` |

---

## 🧪 테스트

### 브라우저 콘솔에서 테스트

```javascript
// 1. 샘플 데이터로 일정 생성
mySchedule.createPlan({
  title: '테스트 여행',
  dest: '부산',
  start: '2026-08-01',
  end: '2026-08-02',
  people: '2'
});

// 2. 장소 추가
mySchedule.addPlace(0, {
  id: 'test_1',
  name: '테스트 장소',
  city: '부산',
  category: 'attraction'
});

// 3. 상태 확인
console.log('일정 정보:', mySchedule.getPlanInfo());
console.log('일정표:', mySchedule.getSchedule());
console.log('총 장소:', mySchedule.getTotalPlaces());

// 4. localStorage 확인
console.log('저장된 데이터:', 
  JSON.parse(localStorage.getItem('travel_schedule'))
);

// 5. HTML 렌더링 테스트
document.getElementById('schedule-container').innerHTML = 
  mySchedule.renderScheduleHTML();
```

---

## 🛠 문제 해결

### 일정이 저장되지 않음

**원인**: localStorage 용량 초과 또는 접근 권한 없음

**해결**:
```javascript
// localStorage 확인
try {
  localStorage.setItem('test', 'value');
  localStorage.removeItem('test');
  console.log('✅ localStorage 사용 가능');
} catch (e) {
  console.error('❌ localStorage 사용 불가:', e);
}
```

### HTML이 렌더링되지 않음

**원인**: DOM 요소가 없거나 타이밍 문제

**해결**:
```javascript
// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  const mySchedule = new ScheduleModule({ ... });
  mySchedule.renderToDOM();
});
```

### 챗봇이 작동하지 않음

**원인**: placesDB가 없거나 형식이 잘못됨

**해결**:
```javascript
// placesDB 형식 확인
const PLACES_DB = [
  {
    id: 'place_001',
    name: '장소명',
    city: '도시',
    category: 'attraction',
    rating: 4.5,
    tags: ['태그1', '태그2']
  },
  // ... 더 많은 장소
];

const chatbot = new ChatbotModule(mySchedule, PLACES_DB);
```

---

## 📦 다른 프로젝트에 통합하기

### React 프로젝트

```jsx
import { useEffect, useRef } from 'react';

function SchedulePage() {
  const scheduleRef = useRef(null);
  
  useEffect(() => {
    const schedule = new ScheduleModule({
      onPageChange: (page) => {
        // React Router 사용
        navigate(`/${page}`);
      }
    });
    
    scheduleRef.current = schedule;
    schedule.renderToDOM();
  }, []);
  
  return <div id="schedule-container"></div>;
}
```

### Vue 프로젝트

```vue
<template>
  <div id="schedule-container"></div>
</template>

<script>
export default {
  mounted() {
    this.schedule = new ScheduleModule({
      onPageChange: (page) => {
        this.$router.push(`/${page}`);
      }
    });
    
    this.schedule.renderToDOM();
  }
}
</script>
```

### Angular 프로젝트

```typescript
import { Component, OnInit } from '@angular/core';
declare const ScheduleModule: any;

@Component({
  selector: 'app-schedule',
  template: '<div id="schedule-container"></div>'
})
export class ScheduleComponent implements OnInit {
  private schedule: any;
  
  ngOnInit() {
    this.schedule = new ScheduleModule({
      onPageChange: (page: string) => {
        this.router.navigate([`/${page}`]);
      }
    });
    
    this.schedule.renderToDOM();
  }
}
```

---

## 📞 지원

- 📘 문서: `README.md`, `INTEGRATION_GUIDE.md`, `INDEX.md`
- 💡 예제: `example-usage.js`
- 🐛 버그 리포트: 이슈 트래커
- 💬 질문: 프로젝트 관리자

---

## 📄 라이센스

MIT License - 자유롭게 사용 가능

---

## ✨ 체크리스트

- [ ] `schedule` 폴더를 프로젝트에 복사
- [ ] HTML에 CSS 링크 추가
- [ ] HTML에 스크립트 추가
- [ ] ScheduleModule 초기화
- [ ] 기본 기능 테스트
- [ ] ChatbotModule 초기화 (선택)
- [ ] 스타일 커스터마이징 (선택)
- [ ] 실제 데이터로 테스트

---

**버전**: 1.0.0  
**마지막 업데이트**: 2026-06-10  
**제작**: 떠나GO 개발팀
