  <img width="1151" height="628" alt="스크린샷 2026-03-30 140744" src="https://github.com/user-attachments/assets/6abf9db0-72c4-4b27-838d-c4271d8f26df" />


# 🧭 떠나GO (DDUNA-GO)
> **"당신이 꿈꾸는 여행을 그리다"**  
> 스마트 여행 경로 최적화 및 통합 쇼핑 플랫폼

---

## 1. 📖 프로젝트 소개 (Introduction)
**떠나GO**는 복잡한 여행 계획을 스마트하게 해결해주는 통합 솔루션입니다. 
단순한 정보 제공을 넘어, 사용자의 현재 위치와 목적지들을 분석하여 최적의 동선을 제안하고, 필요한 여행 상품(숙소, 체험, 교통 등)을 한곳에서 예약할 수 있는 미래형 여행 플랫폼입니다.

---

## 2. ✨ 주요 기능 설명 (Features)

### 🚀 스마트 경로 최적화 (Path Optimization)
- **Dijkstra Algorithm**: 다중 목적지 방문 시 최단 경로 및 효율적 동선 자동 계산.
- **실시간 소요 시간**: 도보 및 차량 이동 시 예상 소요 시간 실시간 계산.

### 🗺️ 위치 기반 지도 서비스 (Location-Based Service)
- **카카오맵 API**: 고정밀 지도 렌더링 및 장소 마커 표시.
- **GPS 연동**: 현재 내 위치를 기반으로 목적지까지의 거리 정보 제공.

### 🛍️ 통합 여행 쇼핑몰 (Travel Marketplace)
- **카테고리 시스템**: 숙박, 체험, 교통수단, 관광지별 맞춤 상품 제공.
- **실시간 검색**: 제목, 지역, 태그 기반의 강력한 검색 엔진.
- **다이내믹 가격 시스템**: 실시간으로 변동되는 상품 가격 시뮬레이션 서비스.

### 👤 사용자 관리 및 포인트 (User & Rewards)
- **포인트 시스템**: 활동에 따른 포인트 적립 및 상세 내역 관리.
- **개인화 프로필**: 관심 지역 및 여행 스타일 설정.

---

## 3. 🛠 기술 스택 (Tech Stack)

### **Frontend**
- **React Native (Expo)**: 모바일 앱 개발 (iOS/Android 지원)
- **TypeScript**: 안정적인 코드 개발을 위한 정적 타이핑
- **Lucide-native**: 세련된 벡터 아이콘 라이브러리
- **React Navigation**: 하단 탭 및 스택 내비게이션 관리

### **Backend**
- **Node.js (Express)**: REST API 서버 구축
- **MongoDB & Mongoose**: 이중 커넥션(유저 DB / 상품 DB) 아키텍처 적용
- **JWT**: 보안을 위한 토큰 기반 인증 시스템

---

## 4. ⚙️ 환경 설정 (Environment Setup)

프로젝트 실행을 위해 다음 환경 변수(`.env`) 설정이 필요합니다.

### Backend (`travel-shopping-backend/.env`)
```env
PORT=5000
# 유저 정보 DB 주소
MONGO_URI=mongodb://localhost:27017/one_user_DB
# 상품 정보 DB 주소 (로컬 또는 Atlas)
PRODUCT_MONGO_URI=mongodb://localhost:27017/one_bell_products
# 보안 설정
JWT_SECRET=your_secret_key
# 이메일 발송 API (옵션)
RESEND_API_KEY=your_resend_api_key
```

---

## 5. 🚀 실행 방법 (Execution)

### **사전 준비 (Prerequisites)**
- [Node.js](https://nodejs.org/) (v16 이상 권장)
- [MongoDB](https://www.mongodb.com/) (로컬 설치 또는 Atlas 계정)

### **Backend 실행**
```bash
cd travel-shopping-backend
npm install
npm start
```
*서버는 기본적으로 `http://localhost:5000`에서 실행됩니다.*

### **Frontend 실행**
```bash
cd travel-shopping-app
npm install
npx expo start
```
*Expo Go 앱을 사용하여 QR 코드를 스캔하거나 에뮬레이터로 실행하세요.*

---

## 📂 프로젝트 구조
- `travel-shopping-app/`: React Native 프론트엔드 전체 소스
- `travel-shopping-backend/`: Express 백엔드 API 및 DB 모델

---
© 2026 그리GO Team. All rights reserved.
