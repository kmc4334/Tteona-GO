# 🧭 떠나GO 여행 성향 분석 모듈

## 📋 개요

떠나GO의 여행 성향 분석 모듈은 사용자의 여행 스타일을 12가지 질문을 통해 분석하고, 8가지 여행 유형 중 하나로 분류하는 AI 기반 성향 분석 시스템입니다.

**기술 스택**: React 18 + TypeScript + Vite

## 🎯 주요 기능

### 1. 12문항 성향 테스트
- **6가지 축(Axis)** 기반 질문 설계
  - 계획성 vs 즉흥성
  - 모험심 vs 안전추구
  - 활동성 vs 휴식선호
  - 사교성 vs 독립성
  - 소비 가치관
  - 정서적 안정성

### 2. 8가지 여행 유형 분류
1. **🗺️ 철두철미한 인간 엑셀** (Master Planner)
2. **🎒 자유로운 프로 방랑러** (Free Spirit)
3. **🌿 에너지를 충전하는 칩거형** (Cozy Healer)
4. **📸 트렌디한 감성 사냥꾼** (Trend Setter)
5. **🏃 익스트림 중독 활동가** (Action Seeker)
6. **🍜 로컬 헤리티지 미식가** (Local Gourmet)
7. **🤝 모두가 즐거운 평화주의자** (Easy-Going Companion)
8. **🧭 고독한 사색가** (Lone Wanderer)

### 3. 맞춤형 추천 시스템
- 각 유형별 추천 여행지, 숙소, 액티비티, 카페 제공
- 성향 축 분석 시각화
- 같은 유형 사용자들의 선호 장소 추천

## 📁 파일 구조

```
personality-analysis/
├── src/
│   ├── components/
│   │   ├── Quiz.tsx             # 퀴즈 컴포넌트
│   │   ├── Quiz.css
│   │   ├── Result.tsx           # 결과 컴포넌트
│   │   └── Result.css
│   ├── data/
│   │   ├── questions.json       # 질문 데이터
│   │   └── travelTypes.json     # 여행 유형 정의
│   ├── types/
│   │   └── index.ts             # TypeScript 타입 정의
│   ├── utils/
│   │   └── analyzer.ts          # 성향 분석 알고리즘
│   ├── App.tsx                  # 메인 앱
│   ├── App.css
│   ├── main.tsx                 # 진입점
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md                    # 이 문서
└── RESEARCH.md                  # 심리학 이론 배경
```

## 🔧 사용 방법

### 1. 의존성 설치

```bash
cd personality-analysis
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3001` 접속

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 4. 프로그래밍 방식 사용

```typescript
import { analyzePersonality } from './utils/analyzer';
import type { UserAnswers } from './types';

// 답변 수집
const answers: UserAnswers = {
  q1: 'A',
  q2: 'B',
  // ...
};

// 유형 분석
const result = analyzePersonality(answers);
console.log(result.type); // 'master_planner'
console.log(result.scores); // { plan: 8, spontaneous: 2, ... }
console.log(result.typeData); // 여행 유형 상세 정보
```

## 📊 데이터 구조

### 질문 데이터 (QuizQuestion)

```typescript
interface QuizQuestion {
  id: string;                  // 질문 ID
  axis: AxisType;              // 측정 축
  category: string;            // 카테고리
  question: string;            // 질문 내용
  type: 'single' | 'multiple'; // 질문 유형
  options: QuizOption[];       // 선택지 배열
}

interface QuizOption {
  label: string;               // 선택지 텍스트
  value: string;               // 선택지 값
  scores: Partial<Record<ScoreKey, number>>; // 점수 배분
}
```

### 여행 유형 데이터 (TravelType)

```typescript
interface TravelType {
  key: TravelTypeKey;          // 유형 키
  emoji: string;               // 이모지
  name: string;                // 유형 이름
  sub: string;                 // 영문 부제
  desc: string;                // 상세 설명
  tags: string[];              // 태그
  rec: TravelTypeRecommendations; // 추천 장소
  color: string;               // 테마 색상
  psychologicalBasis: string;  // 심리학적 배경
  characteristics: string[];   // 주요 특징
}
```

## 🧮 분석 알고리즘

### 1. 점수 집계
각 질문의 선택지에 할당된 점수를 축별로 합산합니다.

```javascript
score = {
  plan: 0,
  spontaneous: 0,
  adventure: 0,
  safe: 0,
  active: 0,
  rest: 0,
  social: 0,
  solo: 0,
  healing: 0,
  aesthetic: 0,
  food: 0,
  nature: 0,
  easygoing: 0
}
```

### 2. 유형 판별 규칙

**우선순위 규칙:**
1. `easygoing >= 2 && socialScore >= 1` → Easy-Going
2. `solo >= 3 && adventureScore >= 1` → Lone Wanderer
3. `food >= 3 && adventureScore >= 1` → Local Gourmet
4. `activeScore >= 3 && adventureScore >= 2` → Action Seeker
5. `aesthetic >= 3` → Trend Setter
6. `healing >= 3 && planScore >= 0` → Cozy Healer
7. `adventureScore >= 3 && planScore < 0` → Free Spirit
8. `planScore >= 3` → Master Planner

**점수 합산 방식:**
```javascript
typeScores = {
  master_planner: score.plan * 2 + score.safe,
  free_spirit: score.spontaneous * 2 + score.adventure,
  cozy_healer: score.healing * 2 + score.rest,
  trend_setter: score.aesthetic * 2,
  action_seeker: score.active * 2 + score.adventure,
  local_gourmet: score.food * 2 + score.adventure,
  easy_going: score.easygoing * 2 + score.social,
  lone_wanderer: score.solo * 2 + score.adventure
}
```

최종적으로 가장 높은 점수를 받은 유형으로 결정됩니다.

## 🎨 UI 컴포넌트

### 1. 퀴즈 카드
- 진행 바 (Progress Bar)
- 질문 카드 (Question Card)
- 선택지 버튼 (Option Buttons)
- 네비게이션 버튼 (Prev/Next)

### 2. 결과 화면
- 유형 카드 (Type Card)
- 성향 축 분석 바 차트 (Profile Bars)
- 같은 유형 추천 (Similar Recommendations)
- 액션 버튼 (Retry/Plan)

## 🔄 확장 가능성

### 새로운 질문 추가

`src/data/questions.json` 파일에 질문 추가:

```json
{
  "id": "q13",
  "axis": "new_axis",
  "category": "새 카테고리",
  "question": "새로운 질문?",
  "type": "single",
  "options": [
    { "label": "선택지 1", "value": "A", "scores": { "new_axis": 2 } },
    { "label": "선택지 2", "value": "B", "scores": { "new_axis": 0 } }
  ]
}
```

### 새로운 유형 추가

`src/data/travelTypes.json` 파일에 유형 추가:

```json
{
  "new_type": {
    "key": "new_type",
    "emoji": "🆕",
    "name": "새로운 유형",
    "sub": "The New Type",
    "desc": "설명...",
    "tags": ["태그1", "태그2"],
    "rec": {
      "attraction": [],
      "accommodation": [],
      "activity": [],
      "cafe": []
    },
    "color": "#FF6B6B",
    "psychologicalBasis": "이론적 배경",
    "characteristics": ["특징1", "특징2"]
  }
}
```

### 분석 알고리즘 커스터마이징

`src/utils/analyzer.ts`의 `determineTravelType` 함수 수정:

```typescript
function determineTravelType(scores: AnalysisScores): TravelTypeKey {
  // 커스텀 로직 구현
  return 'custom_type';
}
```

## 📈 성능 최적화

- **지연 로딩**: 결과 화면은 분석 완료 후 렌더링
- **캐싱**: localStorage에 마지막 결과 저장
- **애니메이션**: CSS transition으로 부드러운 전환

## 🧪 테스트

### 단위 테스트 예시

```typescript
import { analyzePersonality, getTravelType } from './utils/analyzer';

// 점수 계산 테스트
const testAnswers = { q1: 'A', q2: 'A', /* ... */ };
const result = analyzePersonality(testAnswers);
console.assert(result.type === 'master_planner');

// 유형 데이터 테스트
const typeData = getTravelType('master_planner');
console.assert(typeData.rec.attraction.length > 0);
```

## 🔐 데이터 프라이버시

- 모든 분석은 **클라이언트 사이드**에서 수행
- 서버로 개인 답변 전송 없음
- localStorage에만 저장 (사용자 제어 가능)

## 📝 라이선스

이 모듈은 떠나GO 프로젝트의 일부이며, 프로젝트 라이선스를 따릅니다.

## 🤝 기여

버그 리포트, 기능 제안, 풀 리퀘스트를 환영합니다!

## 📞 문의

프로젝트 관련 문의는 메인 README를 참조해주세요.

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-20  
**Author**: 떠나GO Team
