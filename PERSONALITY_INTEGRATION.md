# 🧭 여행 성향 분석 통합 가이드

## 📋 개요
personality-analysis 폴더의 여행 성향 분석 기능을 travel-shopping-app(프론트엔드)과 travel-shopping-backend(백엔드)에 완전히 통합했습니다.

---

## 🎯 통합된 기능

### 1. **여행 성향 테스트**
- 12가지 질문으로 사용자의 여행 성향 분석
- Big Five 성격 이론, Plog의 여행자 성향 이론, Crompton의 여행 동기 이론 기반
- 8가지 여행 유형 분류:
  - 🗺️ 철두철미한 인간 엑셀 (Master Planner)
  - 🎒 자유로운 프로 방랑러 (Free Spirit)
  - 🌿 에너지를 충전하는 칩거형 (Cozy Healer)
  - 📸 트렌디한 감성 사냥꾼 (Trend Setter)
  - 🏃 익스트림 중독 활동가 (Action Seeker)
  - 🍜 로컬 헤리티지 미식가 (Local Gourmet)
  - 🤝 모두가 즐거운 평화주의자 (Easy-Going)
  - 🧭 고독한 사색가 (Lone Wanderer)

### 2. **맞춤형 추천**
- 성향별 추천 관광지
- 성향별 추천 숙소
- 성향별 추천 액티비티
- 성향별 추천 카페

### 3. **결과 저장 및 관리**
- 사용자별 성향 테스트 결과 저장
- 테스트 이력 조회
- 결과 삭제 기능

---

## 📁 생성된 파일 구조

### **Frontend (travel-shopping-app)**
```
travel-shopping-app/
├── src/
│   ├── data/
│   │   ├── personalityQuestions.json      # 12가지 질문 데이터
│   │   └── personalityTypes.json          # 8가지 여행 유형 데이터
│   ├── screens/
│   │   ├── PersonalityTestScreen.tsx      # 성향 테스트 화면
│   │   └── PersonalityResultScreen.tsx    # 결과 화면
│   ├── utils/
│   │   └── personalityAnalyzer.ts         # 분석 알고리즘
│   └── types/
│       └── travelTypes.ts                 # 타입 정의 (업데이트)
```

### **Backend (travel-shopping-backend)**
```
travel-shopping-backend/
├── controllers/
│   └── personalityController.js           # 성향 테스트 컨트롤러
├── models/
│   └── PersonalityResult.js               # 성향 결과 모델
└── routes/
    └── personalityRoutes.js               # 성향 테스트 라우트
```

---

## 🔌 API 엔드포인트

### **POST /api/personality/save**
성향 테스트 결과 저장
```json
{
  "travelType": "master_planner",
  "scores": { ... },
  "axisScores": { ... },
  "answers": { ... }
}
```

### **GET /api/personality/result**
최신 성향 테스트 결과 조회

### **GET /api/personality/history**
성향 테스트 이력 조회 (최대 10개)

### **DELETE /api/personality/result/:id**
특정 성향 테스트 결과 삭제

---

## 🎨 UI 변경사항

### **HomeScreen 수정**
- **이전**: AI 챗봇 추천 박스
- **이후**: 여행 성향 테스트 박스
  - 아이콘: ✈️
  - 제목: "나의 여행 스타일은?"
  - 부제: "12가지 질문으로 알아보는 여행 성향 테스트"
  - 색상: 보라색 (#9F7AEA)

---

## 🚀 실행 방법

### **1. 백엔드 실행**
```bash
cd travel-shopping-backend
npm install
npm start
```

### **2. 프론트엔드 실행**
```bash
cd travel-shopping-app
npm install
npx expo start
```

### **3. 성향 테스트 사용**
1. 앱 실행 후 홈 화면에서 "나의 여행 스타일은?" 박스 클릭
2. 12가지 질문에 답변
3. 결과 확인 및 저장

---

## 🔧 기술 스택

### **Frontend**
- React Native (Expo)
- TypeScript
- React Navigation
- Lucide React Native (아이콘)

### **Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT 인증

### **알고리즘**
- Big Five 성격 이론
- Plog의 여행자 성향 이론 (Psychocentric vs Allocentric)
- Crompton의 여행 동기 이론

---

## 📊 데이터베이스 스키마

### **PersonalityResult Collection**
```javascript
{
  userId: ObjectId,              // 사용자 ID
  travelType: String,            // 여행 유형 (8가지 중 1개)
  scores: {                      // 세부 점수
    plan: Number,
    spontaneous: Number,
    adventure: Number,
    safe: Number,
    active: Number,
    rest: Number,
    social: Number,
    solo: Number,
    healing: Number,
    aesthetic: Number,
    food: Number,
    nature: Number,
    easygoing: Number
  },
  axisScores: {                  // 축별 점수
    plan: Number,
    adventure: Number,
    active: Number,
    social: Number
  },
  answers: Map<String, String>,  // 사용자 답변
  createdAt: Date                // 생성 시간
}
```

---

## 🎯 향후 개선 사항

1. **AI 기반 추천 강화**
   - 성향 데이터를 활용한 상품 추천 알고리즘
   - 성향별 맞춤 여행 패키지 자동 생성

2. **소셜 기능**
   - 같은 성향의 사용자 매칭
   - 성향별 커뮤니티 기능

3. **통계 및 분석**
   - 성향 분포 통계
   - 성향별 인기 여행지 분석

4. **재테스트 알림**
   - 일정 기간 후 재테스트 권장
   - 성향 변화 추적

---

## 📝 참고 문헌

- **Big Five Personality Traits**: Costa, P. T., & McCrae, R. R. (1992)
- **Plog's Psychographic Types**: Plog, S. C. (1974)
- **Crompton's Travel Motivations**: Crompton, J. L. (1979)

---

## 👥 기여자

© 2026 떠나GO Team. All rights reserved.

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
