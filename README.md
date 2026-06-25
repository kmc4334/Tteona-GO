<div align="center">

# 떠나GO (Tteona-GO)

### *"당신이 꿈꾸는 여행을 떠나다"*

**AI 여행 성향 분석 · 맞춤 일정 생성 · 통합 여행 쇼핑 플랫폼**

<br/>

![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-DC244C?style=for-the-badge)

</div>

---

## 📖 프로젝트 소개

**떠나GO**는 AI가 사용자의 여행 성향을 분석하고, 예산과 취향에 맞는 최적의 여행 일정을 자동으로 생성해주는 스마트 여행 플랫폼입니다.

단순 정보 제공을 넘어 — 12개의 심리 기반 퀴즈로 8가지 여행 유형을 판별하고, RAG(Retrieval-Augmented Generation) 파이프라인으로 실제 관광·숙박 데이터를 검색해 GPT-4o-mini가 맞춤 일정을 생성합니다. Dijkstra 알고리즘으로 최적 동선까지 계산합니다.

---

##  주요 기능

###  AI 여행 성향 분석
- 12문항의 심리학 기반 퀴즈 (Big Five, Plog 모델 적용)
- 13개 특성 점수 집계 → **8가지 여행 유형** 판별
  -  철두철미한 인간 엑셀 ·  자유로운 프로 방랑러
  -  에너지를 충전하는 칩거형 ·  트렌디한 감성 사냥꾼
  -  익스트림 중독 활동가 ·  로컬 헤리티지 미식가
  -  모두가 즐거운 평화주의자 ·  고독한 사색가
- 성향별 맞춤 관광지·숙소·액티비티·카페 추천

###  AI 여행 컨시어지 (RAG 파이프라인)
- `intfloat/multilingual-e5-base` 모델로 사용자 메시지 768차원 벡터 임베딩
- **Qdrant** 벡터 DB에서 코사인 유사도 기반 실제 시설 정보 검색
- **GPT-4o-mini**에 검색 결과 주입 → 환각 없는 신뢰도 높은 추천
- 대화 맥락 유지 (MongoDB에 최근 10개 메시지 저장)
- 응답에 추천 상품 카드 + 여행 일정 자동 렌더링

### �️ AI 맞춤 일정 자동 생성
- 사용자 성향 태그 기반 Qdrant 실시간 검색
- GPT-4o-mini가 테마·시간표·팁 포함 완성형 일정 생성
- "다시 추천" 시 매번 다른 창의적 일정 제공

### 스마트 경로 최적화
- **Dijkstra 알고리즘** 기반 다중 목적지 최단 경로 계산
- Haversine 공식으로 실제 거리 계산
- 도보·차량 예상 소요 시간 제공

### 통합 여행 쇼핑몰
- 숙박·체험·교통·관광지별 카테고리 상품
- 장바구니·찜하기·예약 관리
- 포인트 적립 & 사용 시스템

### 사용자 관리
- JWT 토큰 기반 인증 (이메일 인증 코드 발송)
- 온보딩 플로우 (프로필 설정 → 관심사 → 성향 퀴즈 → 선호도 → AI 일정 검토)
- 개인정보 변경·회원 탈퇴 (관련 데이터 일괄 삭제)

---

## 기술 스택

### Frontend
| 기술 | 용도 |
|------|------|
| React Native (Expo) | iOS/Android 크로스 플랫폼 앱 |
| TypeScript | 정적 타이핑 |
| React Navigation | 스택/탭 네비게이션 |
| Lucide React Native | 벡터 아이콘 |
| AsyncStorage | 로컬 인증 상태 저장 |

### Backend
| 기술 | 용도 |
|------|------|
| Node.js + Express | REST API 서버 |
| MongoDB + Mongoose | 이중 DB 커넥션 (유저 DB / 상품 DB) |
| JWT | 토큰 기반 인증 |
| Resend | 이메일 인증 코드 발송 |

### AI / ML
| 기술 | 용도 |
|------|------|
| OpenAI GPT-4o-mini | 여행 상담 · 일정 생성 |
| Qdrant | 벡터 DB (관광·숙박 시설 시맨틱 검색) |
| intfloat/multilingual-e5-base | 한국어 텍스트 임베딩 (768차원) |
| @xenova/transformers | 로컬 임베딩 파이프라인 |
| Python 3 | 일정 최적화 엔진 (Dijkstra, Haversine) |

---

## 📂 프로젝트 구조

```
DDUNA-GO/
├── travel-shopping-app/          # React Native 프론트엔드
│   ├── src/
│   │   ├── screens/              # 25개 화면
│   │   │   ├── PersonalityQuizScreen.tsx    # AI 성향 퀴즈
│   │   │   ├── PersonalityResultScreen.tsx  # 성향 분석 결과
│   │   │   ├── AIReviewScreen.tsx           # AI 일정 검토
│   │   │   ├── ConciergeScreen.tsx          # AI 여행 컨시어지 채팅
│   │   │   └── ...
│   │   ├── store/                # Context (Auth, Cart, Budget 등)
│   │   ├── utils/
│   │   │   └── personalityAnalyzer.ts       # 성향 분석 알고리즘
│   │   ├── data/
│   │   │   ├── questions.json    # 12개 퀴즈 문항
│   │   │   └── travelTypes.json  # 8가지 여행 유형 데이터
│   │   └── navigation/           # 앱 네비게이션
│   └── .env                      # EXPO_PUBLIC_API_BASE_URL 등
│
├── travel-shopping-backend/      # Node.js 백엔드
│   ├── routes/
│   │   ├── authRoutes.js         # 인증 (회원가입/로그인/탈퇴)
│   │   ├── chatRoutes.js         # AI 컨시어지 채팅
│   │   ├── itineraryRoutes.js    # AI 일정 생성 (RAG)
│   │   ├── preferenceRoutes.js   # 여행 성향 저장
│   │   ├── productRoutes.js      # 상품 API
│   │   └── ...
│   ├── services/
│   │   └── ragService.js         # RAG 파이프라인 핵심
│   ├── ai_engine/
│   │   ├── internal/             # Python AI 엔진 (경로 최적화)
│   │   └── scripts/              # Python 실행 스크립트
│   ├── models/                   # Mongoose 스키마 (9개)
│   └── server.js                 # Express 서버 진입점
│
└── README.md
```

---

## 환경 설정

### Backend (`travel-shopping-backend/.env`)

```env
PORT=5000

# MongoDB (로컬 또는 Atlas)
MONGO_URI=mongodb://localhost:27017/ddunago_users
PRODUCT_MONGO_URI=mongodb://localhost:27017/ddunago_products

# 인증
JWT_SECRET=your_jwt_secret_key

# AI 서비스
OPENAI_API_KEY=sk-...
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_COLLECTION=labeling

# 이메일 발송 (선택)
RESEND_API_KEY=re_...

# Python 경로
PYTHON_PATH=python
```

### Frontend (`travel-shopping-app/.env`)

```env
# 실기기 테스트 시 PC의 로컬 IP로 변경 (ipconfig 확인)
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:5000/api

EXPO_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_key
EXPO_PUBLIC_WEATHER_API_KEY=your_weather_key
```

>  IP는 네트워크 변경 시 `.env` 파일만 수정하면 됩니다.

---

## 실행 방법

### 사전 요구사항
- Node.js v18 이상
- Python 3.8 이상
- MongoDB (로컬 설치 or Atlas)
- Expo Go 앱 (실기기 테스트)

### Backend 실행

```bash
cd travel-shopping-backend
npm install
node server.js
```

` 서버 실행 중: http://0.0.0.0:5000` 출력 확인

### Frontend 실행

```bash
cd travel-shopping-app
npm install
npx expo start --clear
```

- **실기기**: Expo Go 앱으로 QR 코드 스캔
- **Android 에뮬레이터**: `a` 키
- **iOS 시뮬레이터**: `i` 키 (Mac 전용)

---

## � 사용자 플로우

```
회원가입 → 이메일 인증
    ↓
프로필 설정 → 관심사 선택
    ↓
 AI 성향 퀴즈 (12문항)
    ↓
성향 결과 확인 (8가지 유형)
    ↓
여행 선호도 입력 (예산 · 동행)
    ↓
 AI 일정 자동 생성 (GPT-4o-mini + RAG)
    ↓
메인 앱 진입
    ├── 홈: 추천 상품 탐색
    ├── AI 추천: 컨시어지 채팅
    ├── 패키지: 나만의 패키지 생성
    ├── 장바구니: 상품 관리
    └── 마이: 프로필 · 예약 · 설정
```

---

## 📋 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| DELETE | `/api/auth/delete` | 회원 탈퇴 |
| POST | `/api/chat/message` | AI 컨시어지 메시지 전송 |
| POST | `/api/itinerary/generate` | AI 일정 생성 |
| POST | `/api/preference/init` | 여행 성향 저장 |
| GET | `/api/products` | 상품 목록 |
| GET/POST/DELETE | `/api/cart` | 장바구니 관리 |
| GET/POST | `/api/activity/bookings` | 예약 관리 |
| GET/POST | `/api/packages` | 패키지 관리 |

---

## 👥 팀

> 2026 캡스톤 디자인 프로젝트

---

<div align="center">

© 2026 떠나GO Team · All rights reserved.

*AI와 함께 떠나는 스마트 여행의 시작*

</div>
