# 일정 관리 모듈

이 폴더는 떠나GO 앱의 일정(Schedule) 관련 기능을 담고 있습니다.

## 📁 파일 구조

```
schedule/
├── schedule.js        # 핵심 일정 관리 로직
├── schedule-ui.js     # UI 렌더링 및 이벤트 처리
└── README.md         # 문서 (현재 파일)
```

## 📋 주요 기능

### 1. 일정 데이터 관리 (`schedule.js`)
- **저장/불러오기**: localStorage를 활용한 일정 영구 저장
- **일정 생성**: 여행 제목, 날짜, 인원, 예산 등 기본 정보 설정
- **장소 관리**: 일정에 장소 추가/삭제
- **시간 관리**: 각 장소별 시간 설정

### 2. UI 렌더링 (`schedule-ui.js`)
- **폼 입력 처리**: 일정 기본 정보 입력 폼
- **일정표 렌더링**: Day별 장소 목록 표시
- **인터랙션**: 장소 추가, 삭제, 시간 변경 등

## 🔌 사용 방법

### 기본 초기화
```javascript
import { initScheduleModule } from './schedule/schedule-ui.js';

// state: 전역 상태 객체
// CAT_EMOJI: 카테고리별 이모지 맵
// goToPage: 페이지 전환 함수
initScheduleModule(state, CAT_EMOJI, goToPage);
```

### 개별 함수 사용
```javascript
import { 
  savePlanToStorage, 
  createSchedule, 
  addToSchedule 
} from './schedule/schedule.js';

// 일정 생성
createSchedule(state, formData, {
  onSuccess: () => {
    console.log('일정 생성 완료');
  }
});

// 장소 추가
addToSchedule(state, place, {
  onSuccess: () => {
    console.log('장소 추가 완료');
  }
});
```

## 📊 데이터 구조

### 일정 정보 (planInfo)
```javascript
{
  title: string,       // 여행 제목
  dest: string,        // 여행지
  start: string,       // 출발일 (YYYY-MM-DD)
  end: string,         // 도착일 (YYYY-MM-DD)
  days: number,        // 여행 일수
  people: string,      // 인원
  budget: string,      // 예산
  transport: string,   // 교통수단
  memo: string        // 메모
}
```

### 일정표 (planSchedule)
```javascript
[
  {
    day: 1,
    date: "2026-06-15",
    slots: [
      {
        id: "place_123",
        name: "부산 해운대",
        city: "부산",
        category: "attraction",
        start_time: "09:00",
        duration: 120,
        ...
      }
    ]
  },
  ...
]
```

## 🔄 주요 흐름

1. **일정 생성**
   - 사용자가 폼 입력 → `createSchedule()` 호출
   - 상태 업데이트 → `savePlanToStorage()` 자동 호출
   - UI 렌더링 → `renderSchedule()` 호출

2. **장소 추가**
   - "장소 추가하기" 버튼 클릭 → 추천 페이지로 이동
   - 장소 선택 → `state.selectedItems`에 저장
   - "일정에 추가" 버튼 클릭 → `addMultiplePlacesToSchedule()` 호출

3. **장소 삭제**
   - 삭제 버튼 클릭 → 확인 다이얼로그
   - 확인 시 → `removeFromSchedule()` 호출
   - 일정표 재렌더링

## 🛠 개발 가이드

### 새로운 기능 추가 시
1. `schedule.js`에 데이터 로직 추가
2. `schedule-ui.js`에 UI 핸들러 추가
3. 콜백 패턴을 사용하여 결합도 낮추기

### 테스트 방법
```javascript
// 브라우저 콘솔에서
localStorage.getItem('ttaerago_plan'); // 저장된 일정 확인
```

## 📝 향후 개선 사항
- [ ] AI 기반 자동 일정 생성
- [ ] 일정 공유 기능
- [ ] 일정 템플릿 저장
- [ ] 드래그 앤 드롭으로 일정 순서 변경
- [ ] 지도 연동
- [ ] 경로 최적화
