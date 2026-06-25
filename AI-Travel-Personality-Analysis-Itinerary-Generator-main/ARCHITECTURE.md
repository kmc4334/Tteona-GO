# 떠나GO AI 아키텍처 가이드

## 목차
1. [시스템 개요](#시스템-개요)
2. [3개 에이전트 상세 설명](#3개-에이전트-상세-설명)
3. [데이터 흐름](#데이터-흐름)
4. [구현 가이드](#구현-가이드)

---

## 시스템 개요

### 핵심 개념

**떠나GO**는 사용자의 성향을 동적으로 학습하고, 이를 기반으로 개인화된 여행 경험을 제공하는 멀티-에이전트 AI 시스템입니다.

```
사용자 행동 → Preference AI → 성향 벡터 
                    ↓
          Recommendation AI → 추천 상품 + 랭킹
                    ↓
          Planning AI → 최적화된 일정
```

---

## 3개 에이전트 상세 설명

### 1️⃣ Preference AI (성향 분석 에이전트)

#### 목적
- 사용자의 여행 성향을 정량화된 벡터로 표현
- 시간 경과에 따른 성향 변화 추적
- 유사 사용자 찾기 (Collaborative Filtering)

#### 주요 기능

##### 1.1 초기 성향 분석 (Onboarding)

**처리 로직:**
```
입력: OnboardingAnswers {
  travel_style: ["힐링", "자연"],
  budget: "중간",
  activity_level: "낮음",
  food_interest: true
}
```

**처리 단계:**
1. 각 선택지에 대해 사전정의된 가중치 적용
   - "힐링" → 0.5
   - "자연" → 0.3
   - "활동 낮음" → "힐링" 추가 가중 (+0.1)
   - "음식관심" → "맛집" 0.4

2. 벡터 정규화: `vector[i] = value[i] / sum(values)`

**출력:**
```json
{
  "user_id": "user123",
  "profile": {
    "힐링": 0.7,
    "액티비티": 0.2,
    "맛집": 0.1
  },
  "vector": [0.7, 0.2, 0.1],
  "weights": {
    "힐링": 1.4,
    "액티비티": 0.4,
    "맛집": 0.2
  }
}
```

**설계 의도:**
- Cold Start 문제 해결
- 초기 추천 품질 확보

---

##### 1.2 행동 기반 성향 업데이트

**이벤트 타입:**
- `click`: 클릭 (가중치: 0.5)
- `view`: 조회 (가중치: 0.3)  
- `purchase`: 구매 (가중치: 1.0)

**업데이트 공식:**
```
preference[tag] = preference[tag] + α × weight × tag_base_weight

여기서:
- α = 학습률 (0.1)
- weight = 이벤트 가중치
- tag_base_weight = 태그의 기본 가중치
```

**예시:**
```
Event: user가 "카페" 태그 상품을 클릭
- preference["감성"] += 0.1 × 0.5 × 0.25 = 0.0125
- preference["조용"] += 0.1 × 0.5 × 0.2 = 0.01

이후 정규화 재적용
```

**설계 의도:**
- 실제 행동 데이터가 가장 신뢰도 높음
- 지속적인 개인화로 추천 품질 개선

---

##### 1.3 성향 변화 감지

**알고리즘: Cosine Similarity**

```
similarity = (vec1 · vec2) / (||vec1|| × ||vec2||)

변화 감지 임계값: 1 - similarity > 0.1
```

**출력:**
```json
{
  "changed": true,
  "cosine_similarity": 0.88,
  "dominant_shift": "힐링 (0.5→0.3) → 액티비티 (0.2→0.5)"
}
```

**사용 사례:**
- 사용자 성향 변화 시 추천 결과 재계산 트리거
- 추천 이력 관리

---

##### 1.4 유사 사용자 클러스터링

**알고리즘: K-Nearest Neighbors (KNN)**

```
1. 현재 사용자의 성향 벡터: user_vec
2. 모든 사용자와의 코사인 유사도 계산
3. 상위 k명 선택
4. Collaborative Filtering에 활용
```

**출력:**
```json
{
  "user_id": "user123",
  "similar_users": [
    {"user_id": "user456", "similarity": 0.94},
    {"user_id": "user789", "similarity": 0.87}
  ]
}
```

**활용:**
- "당신과 유사한 사용자도 이 상품을 좋아합니다"
- 콜드 스타트 신규 사용자 추천

---

### 2️⃣ Recommendation AI (추천 에이전트)

#### 목적
- 사용자 질의를 이해하고 의도 파악
- RAG 기반 벡터 검색으로 후보 생성
- 다차원 점수 계산을 통한 랭킹

#### 주요 기능

##### 2.1 자연어 쿼리 파싱 및 NER

**입력:**
```
"부산 조용한 감성 여행, 저렴한 비용"
```

**처리:**
```
1. 키워드 추출
   - "부산" → LOCATION
   - "조용", "감성" → ATTRIBUTES
   - "저렴" → BUDGET

2. 의도 분류
   - Region: "부산"
   - Tags: ["조용", "감성"]
   - Budget: "low"
   - ActivityLevel: "low"
```

**출력:**
```json
{
  "original_query": "부산 조용한 감성 여행",
  "region": "부산",
  "tags": ["조용", "감성"],
  "budget": "low",
  "activity_level": "low",
  "keywords": ["부산", "조용", "감성", "여행"]
}
```

---

##### 2.2 벡터 검색 (RAG Retrieval)

**프로세스:**

```
1. 쿼리 임베딩 생성
   query_embedding = embed("부산 조용한 감성 여행")

2. 벡터 DB에서 유사 상품 검색
   candidates = vector_db.search(query_embedding, top_k=50)

3. 상품 정보 반환
   {
     "candidates": [
       {
         "id": "item_001",
         "name": "해운대 해변",
         "similarity": 0.92,
         ...
       },
       ...
     ]
   }
```

**RAG 이점:**
- 의미 기반 검색 (텍스트 매칭이 아님)
- 예: "조용한 곳" → "힐링", "자연", "카페" 포함
- Embedding 모델로 문맥 이해

---

##### 2.3 다단계 필터링

**필터 조건 (순서대로):**

```
1. 등급 필터: rating >= min_rating
   예: 4.0점 이상만

2. 예산 필터: price_range 일치
   - low: 무료, 저가
   - medium: 무료~중가
   - high: 모든 가격

3. 지역 필터: location.city 일치

4. 태그 필터: 최소 하나의 태그 일치 (AND/OR 선택 가능)
```

**효과:**
- 불필요한 상품 조기 제거
- 랭킹 계산 비용 감소

---

##### 2.4 다중 점수 기반 랭킹

**점수 공식:**

```
final_score = 0.4 × similarity +
              0.2 × rating +
              0.2 × preference +
              0.2 × popularity

각 스코어는 0.0 ~ 1.0 정규화됨
```

**각 요소 설명:**

| 요소 | 비중 | 계산식 | 목적 |
|------|------|--------|------|
| similarity | 40% | 쿼리와의 임베딩 유사도 | 사용자 의도 매칭 |
| rating | 20% | item.rating / 5.0 | 상품 품질 |
| preference | 20% | Σ(tag_weight) / count | 사용자 성향 매칭 |
| popularity | 20% | item.popularity | 인기도 (신뢰도) |

**예시 계산:**

```
상품: "감성 카페"
- similarity: 0.88 (조용한 감성 쿼리와 잘 맞음)
- rating: 4.6 / 5 = 0.92 (평점 좋음)
- preference: 0.8 (사용자가 "감성" 0.7, "조용" 0.8 선호)
- popularity: 0.75 (중간 정도 인기)

final_score = 0.4×0.88 + 0.2×0.92 + 0.2×0.8 + 0.2×0.75
            = 0.352 + 0.184 + 0.16 + 0.15
            = 0.846 (상위 추천)
```

---

##### 2.5 리뷰 요약

**입력:**
```
reviews = [
  "위치도 좋고 분위기도 최고예요!",
  "음식이 맛있지만 가격이 비싸요",
  "깨끗하고 조용해요. 추천합니다",
  "음식이 별로예요",
  "종업원들이 친절해요"
]
```

**처리:**

```
1. 감정 분석 (간단한 키워드 기반)
   긍정 키워드: "좋음", "최고", "추천", "친절", "깨끗", ...
   부정 키워드: "나쁨", "비쌈", "별로", "더러움", ...

2. 키워드 추출 및 빈도 계산
   긍정: {"좋음": 1, "최고": 1, "위치": 1, "조용": 1, "친절": 1}
   부정: {"비쌈": 1, "별로": 1}

3. 상위 항목 선택 (최대 5개)
```

**출력:**
```json
{
  "pros": ["위치 좋음", "분위기 좋음", "조용함", "친절함"],
  "cons": ["가격 비쌈", "음식 별로"]
}
```

**UI 표시:**
```
✅ 위치 좋음 ✅ 분위기 좋음 ✅ 조용함
❌ 가격 비쌈 ❌ 음식 별로
```

---

### 3️⃣ Planning AI (계획 에이전트)

#### 목적
- 추천 상품들을 실행 가능한 일정으로 변환
- 동선 최적화로 이동 시간/비용 최소화
- 사용자 성향에 맞춘 일정 밀도 조절

#### 주요 기능

##### 3.1 일정 생성

**입력:**
```json
{
  "items": [...10개 추천 상품...],
  "days": 3,
  "start_date": "2024-01-20",
  "preferences": {"힐링": 1.4, "액티비티": 0.4}
}
```

**처리 단계:**

```
1. 지리적 클러스터링 (도시별 그룹)
   Day 1: 부산 시내 (해운대, 카페)
   Day 2: 부산 외곽 (박물관, 자연)
   Day 3: 특색지 (야경, 쇼핑)

2. 각 일에 최적화된 동선 적용

3. 시간 슬롯 배치
```

**출력:**
```json
{
  "itinerary_id": "itin_20240120_001",
  "days": 3,
  "total_distance": 28.5,
  "schedule": [
    {
      "day": 1,
      "time_slots": [
        {
          "start_time": "09:00",
          "end_time": "11:00",
          "item": {"name": "해운대 해변", ...}
        }
      ]
    }
  ]
}
```

---

##### 3.2 동선 최적화 (TSP)

**알고리즘: Greedy Nearest Neighbor**

```
1. 첫 번째 위치에서 시작
2. 아직 방문하지 않은 위치 중 가장 가까운 곳 선택
3. 반복

복잡도: O(n²) - TSP 최적화 대비 빠름
근사도: 최적값의 약 125% 이내
```

**거리 계산: Haversine 공식**

```
d = 2R × arcsin(√(sin²(Δlat/2) + cos(lat1)cos(lat2)sin²(Δlon/2)))

R = 지구 반지름 (6371 km)
lat, lon = 위도, 경도
```

**예시:**
```
해운대 (35.16, 129.16) → 감성카페 (35.17, 129.15) → 박물관 (35.15, 129.14)

거리:
- 해운대 → 카페: 1.2 km
- 카페 → 박물관: 0.8 km
총 동선: 2.0 km
```

---

##### 3.3 시간 슬롯 배치

**시간대 정의:**
- 아침: 09:00 ~ 12:00
- 오후: 12:00 ~ 18:00
- 저녁: 18:00 ~ 21:00

**배치 로직:**

```
1. 상품당 예상 시간 (duration) 확인
2. 순서대로 시간 슬롯 할당
3. 각 활동 사이에 1시간 휴식/이동 시간 추가
4. 일정이 끝나는 시간 계산
```

**예시:**
```
Day 1:
09:00-11:00 (2h): 해운대 해변 (duration: 120분)
11:00-12:00 (1h): 이동 + 휴식
12:00-13:30 (1.5h): 감성 카페 (duration: 90분)
13:30-18:00: 자유 시간
```

---

##### 3.4 성향 기반 일정 밀도 조절

**공식:**

```
density = 0.5 + 0.3×(1 - healing_score)  // 힐링 선호 → 낮은 밀도
또는
density = 0.7 + 0.2×activity_score      // 액티비티 선호 → 높은 밀도
```

**효과:**

| 성향 | 점수 | 밀도 | 해석 |
|------|------|------|------|
| 순수 힐링 | H:0.9, A:0.1 | 0.57 | 하루 3-4개 상품 |
| 균형 | H:0.5, A:0.5 | 0.75 | 하루 5-6개 상품 |
| 순수 액티비티 | H:0.1, A:0.9 | 0.88 | 하루 7-8개 상품 |

---

##### 3.5 일정 수정 (부분 재생성)

**요청:**
```json
{
  "request": "Day 2 일정을 줄여줘",
  "itinerary_id": "itin_001"
}
```

**처리:**
```
1. Day 2만 추출
2. 상품 개수 50% 감소
3. 동선 재최적화
4. 시간 슬롯 재배치
5. 나머지 Day는 유지
```

**효과:**
- 전체 일정 재생성보다 빠름 (초 단위)
- 사용자 UX 개선

---

##### 3.6 날씨 기반 동적 조정

**로직:**

```
if weather == "rainy":
    - 실내 활동으로 변경
    - item.category == "attraction" && outdoor → 우산 아이콘 표시
    - 카페, 박물관 우선

if weather == "hot":
    - 카페, 아이스크림 추가
    - 해수욕장 이동 시간 조정

if weather == "cold":
    - 실내 활동 우선
    - 따뜻한 음식점 추가
```

---

## 데이터 흐름

### End-to-End 시나리오

```
사용자: "부산 3박 조용한 감성 여행"
       ↓
[Query Parser] → {region: "부산", tags: ["조용", "감성"], days: 3}
       ↓
[Vector Search] → 부산 상품 50개 후보 추출
       ↓
[Filtering] → 등급 4.0+, 무료/저가 → 15개
       ↓
[Ranking] 
  - user_preference: {"힐링": 0.7, "액티비티": 0.2}
  - 점수 계산 (similarity + rating + preference + popularity)
  → 상위 10개 정렬
       ↓
[Itinerary Generation]
  - 10개 상품 클러스터링
  - 3일에 분배
  - 동선 최적화
  - 시간 슬롯 배치
       ↓
[Final Output]
{
  "itinerary": {
    "day1": ["해운대 09:00", "카페 11:00", ...],
    "day2": [...],
    "day3": [...]
  },
  "summary": "총 28.5km, 8.5시간",
  "booking_links": [...]
}
```

---

## 구현 가이드

### 폴더 구조

```
internal/
├── models/               # 데이터 모델
│   ├── user.go
│   ├── travel_item.go
│   ├── preference.go
│   └── itinerary.go
│
├── preference/           # Preference AI
│   ├── analyzer.go       # 성향 분석
│   └── clustering.go     # 유사 사용자
│
├── recommendation/       # Recommendation AI
│   ├── query_parser.go   # 쿼리 파싱
│   ├── ranker.go         # 랭킹
│   ├── filter.go         # 필터링
│   └── summarizer.go     # 리뷰 요약
│
└── planning/             # Planning AI
    ├── generator.go      # 일정 생성
    ├── optimizer.go      # 동선 최적화
    └── scheduler.go      # 시간 배치
```

### 주요 인터페이스

```go
// Preference AI
type Analyzer interface {
    InitializePreference(userID string, answers OnboardingAnswers) *PreferenceProfile
    UpdatePreferenceFromEvent(current *PreferenceProfile, event UserEvent) *PreferenceProfile
    DetectPreferenceChange(prev, current *PreferenceProfile) PreferenceChange
}

// Recommendation AI
type QueryParser interface {
    Parse(query string) ParsedQuery
    NER(query string) map[string]interface{}
}

type Ranker interface {
    Rank(items []TravelItem, similarities []float32, preferences map[string]float32) []RankedItem
}

// Planning AI
type Generator interface {
    Generate(userID string, request ItineraryRequest) *Itinerary
}

type Optimizer interface {
    OptimizeRoute(items []TravelItem) []TravelItem
    CalculateTotalDistance(items []TravelItem) float64
}
```

---

## 다음 단계

1. **RAG 통합**
   - Pinecone/Weaviate 벡터 DB 연결
   - OpenAI/Claude Embedding API 통합

2. **LLM 통합**
   - 리뷰 요약 개선
   - 자연어 쿼리 더 정교한 파싱

3. **API 구현**
   - REST/GraphQL 엔드포인트
   - 웹소켓 실시간 업데이트

4. **프론트엔드**
   - React 대시보드
   - 일정 시각화
   - 상품 검색 UI

5. **테스트 및 모니터링**
   - 단위 테스트 작성
   - E2E 통합 테스트
   - 성능 모니터링 (응답시간, 정확도)
