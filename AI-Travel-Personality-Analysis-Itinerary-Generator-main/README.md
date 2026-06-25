# 떠나GO 데모 
(TteonaGO) ✈️

> AI 기반 개인 맞춤형 여행 일정 플래너

<img width="400" height="294" alt="떠나고 데모 영상 (30초이하)" src="https://github.com/user-attachments/assets/df95a9e0-b8d1-422e-aadb-ad45d9f7aed7" />

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)

## 📋 프로젝트 소개

**떠나GO**는 사용자의 여행 성향을 분석하여 맞춤형 여행 일정을 추천하는 AI 기반 여행 플래너입니다. 
Big Five 성격 이론과 Plog의 여행자 성향 이론을 기반으로 사용자에게 최적화된 여행지와 일정을 제안합니다.

### 🎬 데모

웹 애플리케이션을 실행하면 다음 기능들을 사용할 수 있습니다:
- 실시간 성향 분석 및 여행 유형 진단
- 지역/카테고리별 맞춤 장소 추천
- 드래그 앤 드롭 방식의 직관적 일정 편집
- 작성한 일정 라이브러리 관리
- 즐겨찾기 및 AI 챗봇 기능

### ✨ 주요 기능

#### 1. 🎯 여행 성향 분석
- 12문항의 심리 테스트로 8가지 여행 유형 분석
- Big Five 기반 성향 프로파일 생성
- 실시간 성향 변화 감지 및 추적

#### 2. 🤖 AI 맞춤 추천
- 성향에 맞는 여행지, 맛집, 카페, 숙소 추천
- 지역별/카테고리별 필터링
- 가격대별 검색 및 평점 기반 정렬
- 계절별, 테마별 추천 섹션

#### 3. 📅 스마트 일정 관리
- 직관적인 일정 작성 인터페이스
- 날짜별 슬롯 기반 일정 구성
- AI 자동 장소 추천 기능
- 시간대 설정 및 카테고리별 구분
- 메모 및 교통수단 정보 저장

#### 4. 📚 라이브러리
- 작성한 일정 자동 저장
- 일정 목록 조회 및 검색
- 카드 클릭으로 상세 정보 팝업
- 일정 수정 및 삭제 기능
- localStorage 기반 영구 저장

#### 5. ⭐ 즐겨찾기
- 마음에 드는 장소 북마크
- 여행 일정 즐겨찾기
- 즐겨찾기 페이지에서 통합 관리
- 라이브러리와 연동

#### 6. 💬 AI 챗봇 (개발 중)
- 실시간 여행지 추천
- 자연어 질문 응답
- 맞춤형 일정 생성 지원

## 🎨 8가지 여행 유형

1. **🛋️ 코지 힐러** - 편안한 휴식 중심
2. **🍜 로컬 미식가** - 현지 음식 탐험
3. **🏛️ 역사 탐험가** - 문화유산 방문
4. **🌄 액션 시커** - 스릴 넘치는 활동
5. **📸 감성 수집가** - 인생샷 명소
6. **🚶 론 원더러** - 혼자만의 여행
7. **🎉 프리 스피릿** - 즉흥적 모험
8. **👨‍👩‍👧‍👦 패밀리 플래너** - 가족 여행 최적화

## 🏗️ 아키텍처

### 프로젝트 구조

```
떠나GO/
├── cmd/
│   └── server/
│       └── main.py              # Python 데모 실행 파일
├── internal/                    # Python 백엔드 모듈
│   ├── models/                  # 데이터 모델 (User, TravelItem, Preference 등)
│   │   ├── user.py
│   │   ├── preference.py
│   │   ├── travel_item.py
│   │   └── itinerary.py
│   ├── preference/              # 성향 분석 AI
│   │   ├── analyzer.py          # 성향 프로파일 생성/업데이트
│   │   └── clustering.py        # 유사 사용자 클러스터링
│   ├── recommendation/          # 추천 AI
│   │   ├── query_parser.py      # 자연어 쿼리 파싱
│   │   ├── ranker.py            # 다중 점수 기반 랭킹
│   │   ├── filter.py            # 필터링 로직
│   │   └── summarizer.py        # 리뷰 요약
│   └── planning/                # 일정 생성 AI
│       ├── generator.py         # 일정 자동 생성
│       ├── optimizer.py         # 동선 최적화 (TSP)
│       └── scheduler.py         # 시간 슬롯 배치
├── web/                         # 프론트엔드
│   ├── public/                  # 메인 웹 애플리케이션 (Vanilla JS)
│   │   ├── index.html           # 메인 페이지
│   │   ├── app-simple.js        # 핵심 로직 (2800+ 줄)
│   │   ├── data.js              # 장소 데이터베이스
│   │   └── style.css            # 스타일시트
│   ├── personality-analysis/    # 성향 분석 React 모듈
│   │   ├── src/
│   │   │   ├── App.tsx          # 메인 컴포넌트
│   │   │   ├── components/      # Quiz, Result 컴포넌트
│   │   │   ├── data/            # 질문/유형 데이터
│   │   │   └── utils/           # 분석 알고리즘
│   │   └── package.json
│   ├── scripts/                 # Python-Node.js 연동 스크립트
│   │   ├── preference_init.py
│   │   ├── recommend_search.py
│   │   └── plan_generate.py
│   ├── server.js                # Express 서버
│   └── package.json
├── .gitignore
├── README.md
├── ARCHITECTURE.md              # 상세 아키텍처 문서
├── SPECIFICATION.md             # 기능 명세
└── IMPLEMENTATION.md            # 구현 가이드
```

### 기술 스택

#### 프론트엔드
- **메인 앱**: Vanilla JavaScript (ES6+)
  - 커스텀 토스트 알림 시스템
  - 드래그 앤 드롭 일정 관리
  - localStorage 기반 상태 관리
- **성향 분석 모듈**: React 18.2 + TypeScript 5.2
  - Vite 빌드 시스템
  - 컴포넌트 기반 아키텍처
- **스타일링**: 순수 CSS3
  - CSS Variables (다크모드 대응)
  - Flexbox/Grid 레이아웃
  - 반응형 디자인

#### 백엔드
- **언어**: Python 3.8+
- **웹 서버**: Node.js Express 4.18
- **API**: RESTful API (Python-Node.js 연동)
- **데이터**: JSON 기반 (추후 DB 확장 예정)

## 🔧 핵심 기술

### AI 알고리즘

#### 1. Preference AI (성향 분석)
```python
# 성향 벡터 정규화
preference[tag] = preference[tag] + α × weight × tag_base_weight

# 코사인 유사도 기반 변화 감지
similarity = (vec1 · vec2) / (||vec1|| × ||vec2||)
```

**특징:**
- Big Five 기반 다차원 성향 분석
- 행동 데이터 기반 동적 업데이트
- K-Nearest Neighbors 클러스터링

#### 2. Recommendation AI (추천)
```python
# 다중 점수 기반 랭킹
final_score = 0.4 × similarity +
              0.2 × rating +
              0.2 × preference +
              0.2 × popularity
```

**특징:**
- 자연어 쿼리 파싱 (NER)
- RAG 기반 벡터 검색 (예정)
- TF-IDF 장소 매칭
- 다단계 필터링

#### 3. Planning AI (일정 생성)
```python
# TSP 기반 동선 최적화
distance = Haversine(location1, location2)

# 성향 기반 일정 밀도 조절
density = 0.5 + 0.3 × (1 - healing_score)
```

**특징:**
- Greedy Nearest Neighbor 알고리즘
- 지리적 클러스터링
- 시간 슬롯 자동 배치
- 성향 맞춤 일정 밀도

### 데이터 관리

#### 클라이언트 (localStorage)
```javascript
// 저장 키
- tteonago_plan: 현재 작성 중인 일정
- tteonago_library: 저장된 일정 목록
- tteonago_favorites_places: 즐겨찾기 장소
- tteonago_favorites_plans: 즐겨찾기 일정
```

#### 서버 (향후 확장)
- PostgreSQL: 사용자 데이터, 일정 데이터
- Redis: 세션, 캐싱
- Vector DB (Pinecone/Weaviate): 장소 임베딩

## 📊 알고리즘

### 성향 분석 알고리즘
```python
# K-means 클러스터링 기반
1. 사용자 응답 수집 (12개 질문)
2. 벡터화 및 정규화
3. 사전 학습된 클러스터 중심과 비교
4. 가장 가까운 클러스터 (여행 유형) 반환
```

### 추천 알고리즘
```python
# TF-IDF + 협업 필터링
1. 사용자 성향 태그 추출
2. 장소 태그와 유사도 계산
3. 평점, 거리, 계절성 가중치 적용
4. 상위 N개 추천
```

### 일정 최적화
```python
# 휴리스틱 기반 스케줄링
1. 지역별 장소 그룹화
2. 이동 거리 최소화
3. 카테고리 균형 유지 (관광지, 맛집, 휴식)
```
