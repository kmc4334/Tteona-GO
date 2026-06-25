# 떠나GO 웹 프론트엔드

떠나GO 프로젝트의 메인 웹 애플리케이션입니다.

## 📁 구조

```
web/
├── public/              # 메인 웹 애플리케이션
│   ├── index.html      # 메인 HTML
│   ├── app-simple.js   # 메인 JavaScript
│   ├── data.js         # 더미 데이터 (장소, 질문 등)
│   └── style.css       # 스타일시트
├── personality-analysis/ # React 성향 분석 앱
├── server.js           # 개발 서버
└── package.json
```

## 🚀 실행 방법

### 개발 서버
```bash
npm install
npm start
```

서버가 `http://localhost:8080`에서 실행됩니다.

## 🔧 주요 파일 설명

### `index.html`
- 싱글 페이지 애플리케이션 (SPA) 구조
- 5개 주요 섹션: 성향 분석, 추천, 일정, 즐겨찾기
- 모달: 일정 상세보기, AI 챗봇, 확인 다이얼로그

### `app-simple.js`
메인 애플리케이션 로직:
- **상태 관리**: 퀴즈 답변, 일정 데이터, 즐겨찾기
- **페이지 전환**: SPA 라우팅
- **성향 분석**: 응답 수집 및 유형 계산
- **추천 시스템**: 필터링 및 검색
- **일정 관리**: CRUD 작업
- **라이브러리**: localStorage 기반 저장

### `data.js`
더미 데이터:
- `QUIZ_QUESTIONS`: 12개 성향 테스트 질문
- `TRAVEL_TYPES`: 8가지 여행 유형 정의
- `PLACES_DB`: 400+ 장소 데이터
- `SEASON_RECS`: 계절별 추천
- `THEME_RECS`: 테마별 추천

### `style.css`
- CSS 변수 기반 테마
- 반응형 디자인 (모바일, 태블릿, 데스크톱)
- 애니메이션 및 트랜지션
- 커스텀 UI 컴포넌트

## 💾 데이터 저장

### localStorage 키
- `ttaerago_favs`: 즐겨찾기 장소
- `tteonago_plan`: 현재 작성 중인 일정
- `tteonago_library`: 저장된 일정 목록

### 데이터 구조
```javascript
// 일정 데이터
{
  id: 'plan_1234567890',
  title: '부산 2박 3일',
  destination: '부산',
  startDate: '2026-05-20',
  endDate: '2026-05-22',
  people: '2',
  transport: '자가용',
  memo: '...',
  days: [
    {
      day: 1,
      date: '2026-05-20',
      slots: [
        {
          id: 'slot_xxx',
          name: '해운대 해수욕장',
          time: '10:00',
          category: 'attraction'
        }
      ]
    }
  ]
}
```

## 🎨 UI 컴포넌트

### 카드 컴포넌트
- `.item-card`: 장소 카드
- `.library-card`: 일정 카드
- `.type-card`: 성향 유형 카드

### 버튼
- `.btn-primary`: 주요 액션
- `.btn-secondary`: 보조 액션
- `.btn-icon`: 아이콘 버튼

### 폼 요소
- `.form-input`: 텍스트 입력
- `.form-select`: 드롭다운
- `.form-textarea`: 텍스트 영역

### 모달
- `.modal`: 모달 컨테이너
- `.modal-overlay`: 배경 오버레이
- `.modal-content`: 모달 내용

## 🔄 페이지 흐름

```
홈 (성향 분석)
  ↓ 퀴즈 완료
결과 표시
  ↓ 여행 계획 작성하기
일정 페이지
  ↓ 장소 추가
추천 페이지
  ↓ 장소 선택
일정에 추가
  ↓ 완료
라이브러리
```

## 🐛 디버깅

브라우저 개발자 도구(F12) 콘솔에서:
```javascript
// 상태 확인
console.log(state);
console.log(planState);

// localStorage 확인
localStorage.getItem('tteonago_plan');
localStorage.getItem('tteonago_library');

// 테스트 함수
window.testLibraryTab();
window.switchPlanTab('library');
```

## 📱 반응형 브레이크포인트

- **모바일**: < 768px
- **태블릿**: 768px - 1024px
- **데스크톱**: > 1024px

## ⚡ 성능 최적화

- 이미지 대신 이모지 사용
- localStorage 캐싱
- 이벤트 위임 사용
- CSS 트랜지션 활용

## 🔜 향후 개선 사항

- [ ] 서버 API 연동
- [ ] 이미지 업로드 지원
- [ ] PWA 지원
- [ ] 오프라인 모드
- [ ] 다국어 지원
