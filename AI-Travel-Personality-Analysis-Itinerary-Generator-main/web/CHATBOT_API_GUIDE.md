# AI 챗봇 API 연동 가이드

## 📋 개요

일정 페이지에 AI 챗봇 기능이 추가되었습니다. 현재는 로컬 검색으로 임시 구현되어 있으며, 실제 AI API를 연동하여 개발을 완료해야 합니다.

## 🎯 기능 설명

### 사용자 플로우
1. 일정 페이지에서 "🤖 AI 추천 받기" 버튼 클릭
2. 챗봇 모달이 열림
3. 사용자가 메시지 입력 (예: "제주도 힐링 카페 추천해줘")
4. AI가 장소 추천
5. 사용자가 원하는 장소 선택
6. 선택한 장소를 특정 날짜의 일정에 추가

### 현재 구현 상태
- ✅ UI/UX 완성 (모달, 채팅 인터페이스, 장소 선택)
- ✅ 로컬 키워드 검색 (임시)
- ⏳ AI API 연동 필요

## 🔌 API 연동 방법

### 1. API 엔드포인트 생성

**요청 URL**: `POST /api/chatbot/recommend`

**요청 Body**:
```json
{
  "message": "맛집 추천해줘",
  "userType": "cozy_healer",
  "destination": "제주",
  "people": "2",
  "budget": "500000",
  "visitedCities": ["제주시", "서귀포시"],
  "visitedPlaces": [
    {
      "name": "협재해수욕장",
      "city": "제주시",
      "category": "attraction",
      "day": 1
    },
    {
      "name": "오션뷰 카페",
      "city": "제주시",
      "category": "cafe",
      "day": 1
    }
  ],
  "schedule": [
    {
      "day": 1,
      "date": "2026-06-15",
      "places": [
        {
          "name": "협재해수욕장",
          "category": "attraction",
          "time": "09:00"
        },
        {
          "name": "오션뷰 카페",
          "category": "cafe",
          "time": "12:00"
        }
      ]
    }
  ]
}
```

**응답 Body**:
```json
{
  "reply": "제주시 지역의 맛집 5곳을 추천해드릴게요! 일정에 있는 협재해수욕장 근처 장소들이에요.",
  "places": [
    {
      "id": "place_123",
      "name": "제주 오션뷰 카페",
      "city": "제주시",
      "category": "cafe",
      "rating": 4.8,
      "price": "moderate",
      "price_range": "moderate",
      "tags": ["오션뷰", "힐링", "브런치"],
      "desc": "제주 바다를 한눈에 볼 수 있는 감성 카페",
      "address": "제주시 애월읍...",
      "hours": "09:00-21:00",
      "phone": "064-xxx-xxxx",
      "lat": 33.xxxx,
      "lng": 126.xxxx
    }
  ]
}
```

### 2. JavaScript 코드 수정

**파일**: `c:\GoProject\web\public\app-simple.js`

**수정 위치**: `processChatMessage` 함수 (약 1850번째 줄)

**현재 코드**:
```javascript
function processChatMessage(message) {
  removeChatLoading();
  
  // TODO: 실제 AI API 호출
  // const response = await fetch('/api/chatbot/recommend', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ 
  //     message, 
  //     userType: state.travelTypeKey,
  //     destination: planState.destination 
  //   })
  // });
  // const data = await response.json();
  
  // 임시: 키워드 기반 로컬 검색
  const keywords = message.toLowerCase();
  let places = PLACES_DB.filter(p => {
    // ... 로컬 검색 로직
  });
  
  // ...
}
```

**수정 후 코드**:
```javascript
async function processChatMessage(message) {
  removeChatLoading();
  
  // 현재 일정에서 방문 지역 및 장소 추출
  const visitedCities = new Set();
  const visitedPlaces = [];
  
  planState.days.forEach(day => {
    day.slots.forEach(slot => {
      if (slot.placeId) {
        const place = PLACES_DB.find(p => p.id === slot.placeId);
        if (place) {
          visitedCities.add(place.city);
          visitedPlaces.push({
            name: place.name,
            city: place.city,
            category: place.category,
            day: day.day
          });
        }
      }
    });
  });
  
  try {
    // 실제 AI API 호출
    const response = await fetch('/api/chatbot/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message, 
        userType: state.travelTypeKey,
        destination: planState.destination,
        people: planState.people,
        budget: planState.budget,
        visitedCities: Array.from(visitedCities),
        visitedPlaces: visitedPlaces,
        schedule: planState.days.map(day => ({
          day: day.day,
          date: day.date,
          places: day.slots.map(slot => ({
            name: slot.name,
            category: slot.category,
            time: slot.time
          }))
        }))
      })
    });
    
    if (!response.ok) {
      throw new Error('API 호출 실패');
    }
    
    const data = await response.json();
    
    // AI 응답 메시지 표시
    addChatMessage('bot', data.reply);
    
    // 추천 장소 표시
    if (data.places && data.places.length > 0) {
      showRecommendedPlaces(data.places);
    } else {
      addChatMessage('bot', '죄송합니다. 추천할 장소를 찾지 못했어요. 다른 키워드로 다시 시도해주세요.');
    }
    
  } catch (error) {
    console.error('챗봇 API 오류:', error);
    addChatMessage('bot', '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
}
```

### 3. 백엔드 API 구현 예시 (Python/Flask)

```python
from flask import Flask, request, jsonify
from internal.recommendation.query_parser import parse_query
from internal.recommendation.ranker import rank_places
from internal.models.user import get_user_preferences

app = Flask(__name__)

@app.route('/api/chatbot/recommend', methods=['POST'])
def chatbot_recommend():
    data = request.json
    
    message = data.get('message')
    user_type = data.get('userType')
    destination = data.get('destination')
    people = data.get('people', 2)
    budget = data.get('budget')
    visited_cities = data.get('visitedCities', [])
    visited_places = data.get('visitedPlaces', [])
    schedule = data.get('schedule', [])
    
    # 1. 메시지 파싱 (키워드, 카테고리, 지역 추출)
    parsed = parse_query(message)
    
    # 2. 사용자 성향 가져오기
    preferences = get_user_preferences(user_type)
    
    # 3. 일정표 기반 지역 필터링
    # 메시지에 특정 지역이 언급되지 않았다면 일정의 모든 지역에서 검색
    target_cities = parsed.get('cities', [])
    if not target_cities and visited_cities:
        target_cities = visited_cities
    
    # 4. 이미 방문한 장소 제외
    exclude_names = [place['name'] for place in visited_places]
    
    # 5. 장소 검색 및 랭킹
    places = rank_places(
        keywords=parsed['keywords'],
        category=parsed['category'],
        cities=target_cities,
        preferences=preferences,
        exclude_names=exclude_names,
        limit=5
    )
    
    # 6. 응답 생성 (위치 기반 컨텍스트 포함)
    reply = generate_contextual_reply(
        message=message,
        places=places,
        visited_cities=visited_cities,
        schedule=schedule
    )
    
    return jsonify({
        'reply': reply,
        'places': [place.to_dict() for place in places]
    })

def generate_contextual_reply(message, places, visited_cities, schedule):
    """일정 컨텍스트를 반영한 AI 응답 생성"""
    if not places:
        return "죄송합니다. 조건에 맞는 장소를 찾지 못했어요."
    
    count = len(places)
    
    # 방문 지역 정보 포함
    if visited_cities:
        cities_str = ', '.join(visited_cities)
        return f"{cities_str} 지역의 {count}개 장소를 추천해드릴게요! 일정에 있는 장소들 근처예요."
    else:
        return f"{count}개의 추천 장소를 찾았어요! 아래에서 선택해주세요."
```

## 🎨 UI 커스터마이징

### 챗봇 스타일 수정
**파일**: `c:\GoProject\web\public\style.css`

주요 CSS 클래스:
- `.chatbot-container`: 챗봇 전체 컨테이너
- `.chat-message`: 메시지 버블
- `.chat-bubble`: 말풍선
- `.chatbot-rec-item`: 추천 장소 아이템

### 챗봇 초기 메시지 수정
**파일**: `c:\GoProject\web\public\index.html`

```html
<div class="chat-message bot">
  <div class="chat-avatar">🤖</div>
  <div class="chat-bubble">
    <!-- 여기서 초기 메시지 수정 -->
    안녕하세요! AI 여행 추천 챗봇입니다.<br>
    어떤 장소를 찾고 계신가요?
  </div>
</div>
```

## 🔧 고급 기능 추가 가이드

### 1. 대화 히스토리 저장
```javascript
// localStorage에 대화 저장
function saveChatHistory() {
  localStorage.setItem('chatbot_history', JSON.stringify(chatbotState.messages));
}

// 대화 불러오기
function loadChatHistory() {
  const saved = localStorage.getItem('chatbot_history');
  if (saved) {
    chatbotState.messages = JSON.parse(saved);
    renderChatHistory();
  }
}
```

### 2. 이미지 첨부 기능
```javascript
// 이미지 업로드 버튼 추가
<input type="file" id="chatbot-image-upload" accept="image/*" />

// 이미지 전송
async function sendImageMessage(file) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('message', '이 장소와 비슷한 곳 추천해줘');
  
  const response = await fetch('/api/chatbot/recommend-by-image', {
    method: 'POST',
    body: formData
  });
}
```

### 3. 음성 입력 기능
```javascript
// Web Speech API 사용
const recognition = new webkitSpeechRecognition();
recognition.lang = 'ko-KR';

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  document.getElementById('chatbot-input').value = transcript;
};

document.getElementById('btn-voice-input').addEventListener('click', () => {
  recognition.start();
});
```

## 📊 데이터 구조

### chatbotState 객체
```javascript
{
  messages: [
    { type: 'user', content: '제주도 카페 추천해줘' },
    { type: 'bot', content: '5개의 장소를 찾았어요!' }
  ],
  recommendedPlaces: [...], // 현재 추천된 장소 목록
  selectedPlaces: [...],    // 사용자가 선택한 장소
  isOpen: false             // 챗봇 열림 상태
}
```

### planState 객체 (일정 데이터)
```javascript
{
  id: 'plan_1234567890',
  title: '제주 2박 3일',
  destination: '제주',
  startDate: '2026-06-15',
  endDate: '2026-06-17',
  people: '2',
  budget: '500000',
  days: [
    {
      day: 1,
      date: '2026-06-15',
      slots: [
        {
          id: 'slot_xxx',
          name: '제주 오션뷰 카페',
          description: '바다를 보며 힐링',
          budget: 15000,
          time: '09:00',
          category: 'cafe',
          placeId: 'place_123'
        }
      ]
    }
  ]
}
```

## 🐛 디버깅

### 콘솔 로그 확인
```javascript
// 챗봇 상태 확인
console.log('챗봇 상태:', chatbotState);

// API 응답 확인
console.log('API 응답:', data);

// 일정 상태 확인
console.log('일정 상태:', planState);
```

### 일반적인 문제 해결

1. **챗봇이 열리지 않음**
   - 버튼 ID 확인: `btn-open-chatbot`
   - 모달 ID 확인: `chatbot-modal`

2. **메시지가 전송되지 않음**
   - 입력창 ID 확인: `chatbot-input`
   - 이벤트 리스너 등록 확인

3. **장소가 일정에 추가되지 않음**
   - `planState.days` 배열 확인
   - `savePlan()` 함수 호출 확인

## 📝 테스트 시나리오

### 1. 일정 기반 지역 추천 테스트
```
일정: Day 1 - 제주시 (협재해수욕장, 오션뷰 카페)
사용자: "맛집 추천해줘"
기대 결과: 제주시 지역의 맛집 추천 (협재해수욕장 근처 우선)
```

### 2. 특정 지역 지정 테스트
```
일정: Day 1 - 제주시, Day 2 - 서귀포시
사용자: "서귀포 카페 추천"
기대 결과: 서귀포시의 카페만 추천
```

### 3. 중복 제외 테스트
```
일정: Day 1 - 협재해수욕장 이미 추가됨
사용자: "제주 해변 추천"
기대 결과: 협재해수욕장 제외한 다른 해변 추천
```

### 4. 주변 장소 추천 테스트
```
일정: Day 1 - 부산 해운대
사용자: "주변 관광지"
기대 결과: 해운대 근처 관광지 추천
```

### 5. 일정 추가 테스트
```
1. 장소 3개 선택
2. Day 2 선택
3. "선택한 장소 일정에 추가" 클릭
기대 결과: Day 2에 3개 장소 추가됨 (예산, 설명 포함)
```

### 6. 라이브러리 상세보기 테스트
```
1. 라이브러리 페이지 이동
2. 일정 카드 클릭
3. 팝업에서 일정 확인
4. "수정하기" 버튼 클릭
기대 결과: 일정 페이지로 이동하여 수정 가능
```

## 🚀 배포 전 체크리스트

- [ ] API 엔드포인트 구현 완료
- [ ] API 응답 형식 확인
- [ ] 에러 핸들링 구현
- [ ] 로딩 상태 표시 확인
- [ ] 모바일 반응형 테스트
- [ ] 크로스 브라우저 테스트
- [ ] 성능 최적화 (API 캐싱 등)
- [ ] 보안 검토 (XSS, CSRF 방지)

## 📞 문의

API 연동 관련 문의사항이 있으면 개발팀에 연락주세요.
