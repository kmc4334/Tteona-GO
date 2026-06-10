# 📅 일정 관리 모듈 - 전체 구조

떠나GO 앱의 일정(Schedule) 기능이 모듈화되어 `/schedule` 폴더에 정리되었습니다.

## 📂 파일 구조

```
schedule/
├── 📄 INDEX.md                     # 전체 구조 (현재 파일)
├── 📘 README.md                    # 모듈 개요 및 기능 설명
├── 📗 INTEGRATION_GUIDE.md         # 통합 가이드
│
├── 🔧 schedule.js                  # 핵심 로직 (데이터 관리)
├── 🎨 schedule-ui.js               # UI 렌더링 및 이벤트
├── 🌐 schedule-template.html       # HTML 템플릿
├── 💅 schedule-styles.css          # 스타일시트
└── 💡 example-usage.js             # 사용 예제 코드
```

## 📖 문서 가이드

### 시작하기
1. **README.md** 먼저 읽기
   - 모듈의 전체 개요
   - 주요 기능 설명
   - 데이터 구조 이해

2. **INTEGRATION_GUIDE.md** 참고
   - app.js와 통합하는 방법
   - 단계별 설정 가이드
   - 문제 해결 방법

3. **example-usage.js** 실습
   - 실제 사용 예제
   - 워크플로우 예제
   - 테스트 코드

## 🔍 파일별 상세 설명

### 1. schedule.js (핵심 로직)
**역할**: 데이터 관리 및 비즈니스 로직

**주요 함수**:
- `savePlanToStorage()` - localStorage에 저장
- `loadPlanFromStorage()` - localStorage에서 불러오기
- `createSchedule()` - 새 일정 생성
- `addToSchedule()` - 장소 추가
- `removeFromSchedule()` - 장소 삭제
- `updateSlotTime()` - 시간 업데이트

**특징**:
- Pure JavaScript (라이브러리 의존성 없음)
- 콜백 패턴으로 UI와 분리
- localStorage 자동 관리

**사용 예시**:
```javascript
import { createSchedule } from './schedule/schedule.js';

createSchedule(state, formData, {
  onSuccess: () => console.log('완료')
});
```

---

### 2. schedule-ui.js (UI 레이어)
**역할**: DOM 조작 및 사용자 이벤트 처리

**주요 함수**:
- `initScheduleModule()` - 전체 모듈 초기화
- `renderScheduleUI()` - 일정표 UI 렌더링
- `initScheduleCreateHandler()` - 생성 버튼 핸들러
- `initAddToPlanHandler()` - 추가 버튼 핸들러

**특징**:
- schedule.js의 함수들을 호출
- DOM 요소 직접 조작
- 이벤트 리스너 관리

**사용 예시**:
```javascript
import { initScheduleModule } from './schedule/schedule-ui.js';

initScheduleModule(state, CAT_EMOJI, goToPage);
```

---

### 3. schedule-template.html (템플릿)
**역할**: 일정 페이지 HTML 구조

**포함 요소**:
- 일정 생성 폼 (제목, 날짜, 인원 등)
- 세부 일정표 (Day 카드, 장소 슬롯)
- 라이브러리 탭
- 푸터 (장소 추가 시)

**사용 방법**:
- Option A: index.html에 직접 복사
- Option B: 참고용으로만 사용

---

### 4. schedule-styles.css (스타일)
**역할**: 일정 관련 모든 스타일

**스타일 범위**:
- `.plan-tabs` - 탭 네비게이션
- `.form-*` - 폼 입력 요소들
- `.day-card` - Day 카드
- `.slot-item` - 장소 슬롯
- `.plan-footer` - 하단 푸터

**특징**:
- 반응형 디자인
- CSS 변수 활용 (--primary, --border 등)
- 모바일 최적화

**사용 방법**:
```html
<link rel="stylesheet" href="schedule/schedule-styles.css" />
```

---

### 5. example-usage.js (예제)
**역할**: 실제 사용 예제 코드

**포함 내용**:
- 기본 설정 예제
- 개별 함수 사용 예제
- 완전한 워크플로우 예제
- 에러 처리 예제
- 테스트 유틸리티

**활용 방법**:
```javascript
// 브라우저 콘솔에서
import('./schedule/example-usage.js').then(module => {
  module.fillWithSampleData();  // 샘플 데이터로 채우기
  module.debugScheduleState();  // 상태 디버깅
});
```

---

### 6. README.md (개요)
**역할**: 모듈 전체 설명서

**내용**:
- 파일 구조
- 주요 기능 설명
- 데이터 구조 정의
- 개발 가이드
- 향후 개선 사항

**대상 독자**: 처음 사용하는 개발자

---

### 7. INTEGRATION_GUIDE.md (통합 가이드)
**역할**: 기존 프로젝트에 통합하는 방법

**내용**:
- 통합 단계 (1~4단계)
- 기존 코드와의 호환성
- 모듈 인터페이스
- 테스트 방법
- 문제 해결
- 체크리스트

**대상 독자**: 프로젝트에 적용하려는 개발자

## 🚀 빠른 시작 (Quick Start)

### 1분 안에 시작하기

```javascript
// 1. HTML에 스크립트 추가
<script type="module">
  import { initScheduleModule } from './schedule/schedule-ui.js';
  initScheduleModule(state, CAT_EMOJI, goToPage);
</script>

// 2. CSS 추가
<link rel="stylesheet" href="schedule/schedule-styles.css" />

// 완료! 일정 기능 사용 가능
```

### 5분 안에 테스트하기

```javascript
// 브라우저 콘솔에서
import('./schedule/example-usage.js').then(m => {
  // 샘플 데이터로 일정 생성
  m.completeScheduleWorkflow();
  
  // 상태 확인
  m.debugScheduleState();
});
```

## 📊 모듈 의존성

```
schedule-ui.js
    ↓ import
schedule.js
    ↓ 사용
state (전역)
CAT_EMOJI (전역)
goToPage (전역)
```

## 🔄 데이터 흐름

```
사용자 입력
    ↓
UI 이벤트 (schedule-ui.js)
    ↓
비즈니스 로직 (schedule.js)
    ↓
상태 업데이트 (state)
    ↓
localStorage 저장
    ↓
UI 재렌더링
```

## 🎯 주요 사용 시나리오

### 시나리오 1: 새 일정 생성
```
사용자: 폼 작성 → "일정 작성하기" 클릭
시스템: createSchedule() → state 업데이트 → 저장 → 일정표 표시
```

### 시나리오 2: 장소 추가
```
사용자: "장소 추가" 클릭 → 추천 페이지 → 장소 선택 → "일정에 추가"
시스템: addToSchedule() → state 업데이트 → 저장 → 재렌더링
```

### 시나리오 3: 페이지 새로고침
```
사용자: 페이지 새로고침
시스템: loadPlanFromStorage() → state 복원 → 일정표 표시
```

## 🛠 개발 워크플로우

### 새 기능 추가 시
1. **데이터 로직**: `schedule.js`에 함수 추가
2. **UI 로직**: `schedule-ui.js`에 핸들러 추가
3. **스타일**: `schedule-styles.css`에 스타일 추가
4. **테스트**: `example-usage.js`에 예제 추가
5. **문서화**: `README.md` 업데이트

### 버그 수정 시
1. 문제 재현
2. `debugScheduleState()` 로 상태 확인
3. 해당 파일 수정
4. 테스트 코드로 검증

## 📈 모듈 메트릭

| 파일 | 라인 수 | 역할 | 의존성 |
|------|---------|------|--------|
| schedule.js | ~200 | 데이터 로직 | 없음 |
| schedule-ui.js | ~300 | UI 로직 | schedule.js |
| schedule-styles.css | ~400 | 스타일 | 없음 |
| example-usage.js | ~350 | 예제 | schedule.js |

**총 코드 라인**: ~1,250 라인
**외부 의존성**: 없음 (Vanilla JS)
**브라우저 호환성**: ES6+ (모던 브라우저)

## 💡 모범 사례

### DO ✅
- 콜백 패턴 사용
- 에러 처리 추가
- 상태 확인 후 작업
- 문서 주석 작성

### DON'T ❌
- 전역 state 직접 수정 (함수 사용)
- UI 로직을 schedule.js에 추가
- DOM 직접 조작 (schedule-ui.js 사용)
- localStorage 직접 접근

## 🔗 관련 파일

### 메인 프로젝트
- `web/public/app.js` - 메인 앱 로직
- `web/public/index.html` - 메인 HTML
- `web/public/style.css` - 메인 스타일
- `web/public/data.js` - 데이터 (PLACES_DB 등)

### 백엔드 API (선택사항)
- `internal/planning/generator.py` - AI 일정 생성
- `internal/planning/optimizer.py` - 일정 최적화
- `internal/planning/scheduler.py` - 일정 관리

## 📞 지원 및 문의

- 🐛 버그 리포트: 이슈 트래커 사용
- 💬 질문: README.md FAQ 섹션 참고
- 📧 문의: 프로젝트 관리자에게 연락

## 🎓 학습 경로

**초급 (1일)**
1. README.md 읽기
2. example-usage.js 실행
3. 간단한 수정 시도

**중급 (3일)**
1. INTEGRATION_GUIDE.md 따라하기
2. 새 기능 추가해보기
3. 커스텀 스타일 적용

**고급 (1주)**
1. 전체 구조 이해
2. AI 연동 구현
3. 성능 최적화

---

**버전**: 1.0.0  
**마지막 업데이트**: 2026-06-10  
**유지보수자**: 떠나GO 개발팀
