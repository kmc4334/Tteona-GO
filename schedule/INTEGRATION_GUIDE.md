# 일정 모듈 통합 가이드

이 문서는 기존 `app.js`에서 일정 모듈을 통합하는 방법을 설명합니다.

## 📦 파일 구조

```
web/public/
├── app.js                          # 메인 앱 (일정 관련 코드 제거)
├── index.html                      # 메인 HTML
├── schedule/                       # 일정 모듈 폴더
│   ├── schedule.js                 # 핵심 로직
│   ├── schedule-ui.js              # UI 핸들러
│   ├── schedule-template.html      # HTML 템플릿
│   ├── schedule-styles.css         # 스타일
│   ├── example-usage.js            # 사용 예제
│   ├── INTEGRATION_GUIDE.md        # 통합 가이드 (현재 파일)
│   └── README.md                   # 모듈 설명
```

## 🔧 통합 단계

### 1단계: app.js에서 일정 관련 코드 제거

기존 `app.js`에서 다음 섹션을 제거하거나 주석 처리:

```javascript
/* ── localStorage 일정 관리 ───────────────────── */
function savePlanToStorage() { ... }
function loadPlanFromStorage() { ... }
function clearPlanFromStorage() { ... }

/* ⑥ 일정 페이지 */
document.getElementById('btn-create-schedule').addEventListener(...)
function renderSchedule() { ... }
function addToSchedule(place) { ... }
// ... 기타 일정 관련 함수들
```

### 2단계: index.html에 모듈 스크립트 추가

`index.html`의 `<body>` 태그 끝부분에 다음을 추가:

```html
<!-- 기존 스크립트 -->
<script src="data.js"></script>
<script src="ai-algorithms.js"></script>

<!-- 일정 모듈 추가 (ES6 모듈) -->
<script type="module">
  import { initScheduleModule } from './schedule/schedule-ui.js';
  
  // 전역 상태와 함수를 모듈에 전달
  document.addEventListener('DOMContentLoaded', () => {
    initScheduleModule(state, CAT_EMOJI, goToPage);
  });
</script>

<script src="app.js"></script>
</body>
```

### 3단계: 스타일 추가

`index.html`의 `<head>` 섹션에 일정 스타일 추가:

```html
<head>
  <meta charset="UTF-8" />
  <title>떠나GO — AI 여행 플래너</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="schedule/schedule-styles.css" />
</head>
```

### 4단계: HTML 템플릿 통합 (선택사항)

**옵션 A: 그대로 유지**
- 현재 `index.html`의 일정 섹션을 그대로 사용
- `schedule-template.html`은 참고용으로만 사용

**옵션 B: 템플릿 교체**
- `index.html`의 `<section id="page-plan">` 부분을 `schedule-template.html` 내용으로 교체

## 🔌 기존 코드와의 호환성

### 전역 상태 (state)

모듈은 기존 `state` 객체를 그대로 사용합니다:

```javascript
const state = {
  // ... 기존 속성들
  planInfo: null,           // 일정 기본 정보
  planSchedule: [],         // 일정표 데이터
  fromPlanDay: null,        // 장소 추가할 Day 인덱스
  selectedItems: [],        // 선택된 장소들
};
```

### CAT_EMOJI

카테고리별 이모지 맵도 기존 것을 사용:

```javascript
const CAT_EMOJI = {
  attraction: '🏛',
  restaurant: '🍽',
  cafe: '☕',
  accommodation: '🏨',
  activity: '🎡'
};
```

### goToPage 함수

페이지 전환 함수도 기존 것을 그대로 전달:

```javascript
function goToPage(name) {
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === name));
  document.querySelectorAll('.page').forEach(p => 
    p.classList.remove('active'));
  document.getElementById(`page-${name}`).classList.add('active');
  window.scrollTo(0, 0);
}
```

## 🔍 모듈 인터페이스

### 주요 함수

#### 1. 초기화
```javascript
import { initScheduleModule } from './schedule/schedule-ui.js';

initScheduleModule(state, CAT_EMOJI, goToPage);
```

#### 2. 일정 생성
```javascript
import { createSchedule } from './schedule/schedule.js';

createSchedule(state, formData, {
  onSuccess: () => {
    console.log('일정 생성 완료');
  }
});
```

#### 3. 장소 추가
```javascript
import { addToSchedule } from './schedule/schedule.js';

addToSchedule(state, place, {
  onSuccess: () => {
    console.log('장소 추가 완료');
  }
});
```

#### 4. 저장/불러오기
```javascript
import { 
  savePlanToStorage, 
  loadPlanFromStorage 
} from './schedule/schedule.js';

savePlanToStorage(state);
loadPlanFromStorage(state);
```

## 🧪 테스트

### 브라우저 콘솔에서 테스트

```javascript
// 1. 모듈 로드 확인
console.log('일정 모듈이 로드되었는지 확인');

// 2. 상태 확인
console.log(state.planInfo);
console.log(state.planSchedule);

// 3. localStorage 확인
console.log(localStorage.getItem('ttaerago_plan'));

// 4. 샘플 데이터로 테스트
import('./schedule/example-usage.js').then(module => {
  module.fillWithSampleData();
});
```

### 기능별 테스트

1. **일정 생성 테스트**
   - 일정 페이지로 이동
   - 폼에 정보 입력
   - "세부 일정 작성하기" 버튼 클릭
   - 일정표가 표시되는지 확인

2. **장소 추가 테스트**
   - 일정표에서 "장소 추가하기" 버튼 클릭
   - 추천 페이지로 이동
   - 장소 선택
   - "일정에 추가" 버튼 클릭
   - 일정표에 장소가 추가되었는지 확인

3. **저장/불러오기 테스트**
   - 일정 생성 후 페이지 새로고침
   - 일정이 유지되는지 확인

4. **삭제 테스트**
   - 장소 삭제 버튼 클릭
   - 확인 다이얼로그 확인
   - 장소가 삭제되는지 확인

## 🐛 문제 해결

### 모듈이 로드되지 않음

**증상**: 콘솔에 "Failed to load module" 오류

**해결**:
```html
<!-- type="module" 속성 확인 -->
<script type="module" src="./schedule/schedule-ui.js"></script>
```

### 상태가 업데이트되지 않음

**증상**: 일정 생성 후 `state` 객체가 비어있음

**해결**: `state` 객체가 전역으로 선언되었는지 확인
```javascript
// app.js 최상단
const state = { ... };  // window.state 가 아님
```

### localStorage 저장 실패

**증상**: 페이지 새로고침 시 일정이 사라짐

**해결**: 브라우저 개발자 도구 → Application → Local Storage 확인
```javascript
// 수동 저장 테스트
localStorage.setItem('test', 'value');
localStorage.getItem('test');
```

### CSS 스타일 미적용

**증상**: 일정표가 깨져 보임

**해결**: `schedule-styles.css` 링크 확인
```html
<link rel="stylesheet" href="schedule/schedule-styles.css" />
```

### 함수를 찾을 수 없음

**증상**: "goToPage is not defined" 오류

**해결**: 함수가 전역 스코프에 있는지 확인
```javascript
// app.js
function goToPage(name) { ... }  // const goToPage = ... 대신
```

## 📚 추가 리소스

- **README.md**: 모듈 전체 개요
- **example-usage.js**: 실제 사용 예제
- **schedule.js**: API 문서 (JSDoc 주석)

## 🔄 마이그레이션 체크리스트

- [ ] app.js에서 일정 관련 코드 제거
- [ ] index.html에 모듈 스크립트 추가
- [ ] schedule-styles.css 링크 추가
- [ ] 일정 생성 기능 테스트
- [ ] 장소 추가 기능 테스트
- [ ] 저장/불러오기 테스트
- [ ] 삭제 기능 테스트
- [ ] 시간 변경 기능 테스트
- [ ] 초기화 기능 테스트
- [ ] 반응형 레이아웃 확인
- [ ] 브라우저 호환성 테스트

## 💡 모범 사례

### 1. 콜백 패턴 사용

```javascript
createSchedule(state, formData, {
  onSuccess: () => {
    // 성공 시 처리
    renderScheduleUI(state, CAT_EMOJI, goToPage);
  },
  onError: (error) => {
    // 에러 처리 (선택사항)
    console.error(error);
  }
});
```

### 2. 에러 처리

```javascript
const success = createSchedule(state, formData, callbacks);

if (!success) {
  // 실패 처리
  alert('일정 생성에 실패했습니다.');
}
```

### 3. 상태 확인

```javascript
// 일정이 있는지 확인 후 작업
if (state.planInfo && state.planSchedule.length > 0) {
  renderScheduleUI(state, CAT_EMOJI, goToPage);
}
```

## 🚀 다음 단계

모듈 통합 후 다음 기능을 추가할 수 있습니다:

1. **AI 자동 일정 생성**
   - `schedule.js`에 AI 통신 함수 추가
   - API 호출 및 결과 파싱

2. **일정 공유**
   - JSON 내보내기/가져오기
   - URL 공유 기능

3. **드래그 앤 드롭**
   - 장소 순서 변경
   - Day 간 이동

4. **지도 연동**
   - 장소 위치 표시
   - 경로 최적화

## 📞 지원

문제가 발생하면:
1. 브라우저 콘솔 확인
2. `example-usage.js` 참고
3. README.md 재확인
