# Design Document: Qdrant RAG Chatbot

## Overview

이 설계는 DDUNA-GO 여행 쇼핑 앱의 AI 챗봇을 목업(setTimeout) 기반에서 실제 Qdrant 벡터 DB + OpenAI GPT RAG 파이프라인으로 전환하는 방법을 정의한다.

핵심 변경 사항은 세 가지다:

1. **백엔드**: `services/ragService.js` 신규 생성 — 임베딩 → 벡터 검색 → GPT 응답 생성 파이프라인
2. **백엔드**: `POST /api/chat/message` 엔드포인트 추가 — 단일 호출로 사용자 메시지 처리 + AI 응답 반환 + DB 저장
3. **프론트엔드**: `ConciergeScreen.tsx`의 `setTimeout` 목업과 `saveMessageToBackend` 분리 호출을 새 엔드포인트 단일 호출로 교체

기존 `GET /api/chat`, `POST /api/chat`, `DELETE /api/chat` 엔드포인트와 `ChatHistory` MongoDB 모델은 그대로 유지된다.

**실제 Qdrant 데이터 현황:**
- 컬렉션명: `labeling`
- 벡터 차원: 768차원 (Cosine 거리)
- 총 포인트 수: 88,589개
- 데이터 내용: 한국 관광숙박업 공공데이터 (관광호텔, 가족호텔 등)
- 데이터는 이미 Qdrant에 업로드 완료 — 시딩 스크립트 불필요

---

## Architecture

```mermaid
graph TD
    A[ConciergeScreen.tsx] -->|POST /api/chat/message| B[chatRoutes.js]
    B --> C[protect middleware]
    C --> D[sendMessage controller]
    D --> E[ragService.js]
    E -->|multilingual-e5-base 768dim| F[@xenova/transformers local]
    E -->|cosine search| G[Qdrant Cloud - labeling collection]
    G -->|top-5 docs score≥0.5| E
    E -->|gpt-4o-mini| H[OpenAI Chat API]
    H -->|structured response| E
    E -->|{content, recommendation, itinerary}| D
    D -->|save user+bot messages| I[ChatHistory MongoDB]
    D -->|{success, userMessage, botMessage}| A
```

### 데이터 흐름 요약

1. 사용자가 메시지 전송 → `POST /api/chat/message`
2. `protect` 미들웨어가 JWT 검증
3. `sendMessage` 컨트롤러가 `ragService.generateResponse(userId, message)` 호출
4. RAG 서비스가 메시지를 `@xenova/transformers`의 `intfloat/multilingual-e5-base` 모델로 768차원 벡터로 임베딩 (로컬 실행, OpenAI 임베딩 API 미사용)
5. Qdrant `labeling` 컬렉션에서 코사인 유사도 검색 (score ≥ 0.5, 최대 5개)
6. MongoDB에서 최근 10개 대화 히스토리 조회
7. 시스템 프롬프트(역할 + 검색 컨텍스트) + 히스토리 + 사용자 메시지를 GPT에 전달
8. GPT 응답을 파싱하여 `{ content, recommendation, itinerary }` 구조로 반환
9. 사용자 메시지 + 봇 메시지를 ChatHistory에 저장 (100개 초과 시 트리밍)
10. 클라이언트에 `{ success, userMessage, botMessage }` 반환

---

## Components and Interfaces

### 1. `services/ragService.js` (신규)

모듈 초기화 시 환경변수를 검증하고 Qdrant 클라이언트를 생성한다. `@xenova/transformers` 파이프라인은 첫 호출 시 lazy 초기화된다. 환경변수 누락 또는 연결 실패 시 `process.exit(1)`로 즉시 종료한다.

```javascript
// 공개 인터페이스
/**
 * 사용자 메시지에 대한 RAG 기반 AI 응답을 생성한다.
 * @param {string} userId - MongoDB ObjectId (ChatHistory 조회용)
 * @param {string} userMessage - 사용자 입력 텍스트
 * @returns {Promise<{ content: string, recommendation: object|null, itinerary: array|null }>}
 */
exports.generateResponse = async (userId, userMessage) => { ... }
```

내부 함수 구조:

| 함수 | 역할 |
|------|------|
| `validateEnv()` | 4개 환경변수 존재 여부 검증, 누락 시 exit(1) |
| `embedText(text)` | `intfloat/multilingual-e5-base`로 768차원 벡터 반환 (로컬 실행) |
| `searchQdrant(vector)` | `labeling` 컬렉션 코사인 유사도 검색, score ≥ 0.5 필터링, 최대 5개 반환 |
| `buildSystemPrompt(docs)` | 역할 선언 + 검색된 문서(사업장명, 도로명전체주소, 영업상태명, 관광숙박업상세명, _text)를 포함한 시스템 프롬프트 생성 |
| `fetchChatHistory(userId)` | MongoDB에서 최근 10개 메시지 조회, 오류 시 빈 배열 반환 |
| `callGPT(systemPrompt, history, userMessage)` | GPT 호출 및 응답 파싱 |
| `parseGPTResponse(text)` | GPT 응답에서 content/recommendation/itinerary 추출 |

### 2. `controllers/chatController.js` — `sendMessage` 함수 추가

기존 `getChatHistory`, `saveMessage`, `clearChatHistory`는 변경 없음.

```javascript
// 추가되는 함수
/**
 * @desc    RAG 기반 AI 응답 생성 및 저장
 * @route   POST /api/chat/message
 * @access  Private
 */
exports.sendMessage = async (req, res) => { ... }
```

응답 형식:
```json
{
  "success": true,
  "userMessage": {
    "role": "user",
    "content": "제주도 2박3일 추천해줘",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "botMessage": {
    "role": "bot",
    "content": "제주도 2박3일 여행을 위한 추천입니다...",
    "recommendation": { "image": "...", "title": "...", "description": "...", "price": 180000 },
    "itinerary": [ { "name": "제주국제공항", ... } ],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. `routes/chatRoutes.js` — 라우트 추가

```javascript
// 기존 라우트 유지
router.get('/', getChatHistory);
router.post('/', saveMessage);
router.delete('/', clearChatHistory);

// 신규 추가
router.post('/message', sendMessage);
```

### 4. `scripts/seedQdrant.js` — **건너뜀 (데이터 이미 업로드 완료)**

Qdrant `labeling` 컬렉션에 88,589개의 한국 관광숙박업 공공데이터가 이미 768차원 벡터로 업로드되어 있다. 시딩 스크립트 실행은 불필요하며, 이 태스크는 사전 완료 상태로 처리한다.

### 5. `ConciergeScreen.tsx` — 수정

`handleSendQuery` 함수를 단순화한다:

```typescript
// 변경 전: setTimeout 목업 + saveMessageToBackend 분리 호출
// 변경 후: 단일 API 호출
const handleSendQuery = async (query: string) => {
  if (!query.trim() || isSending) return;

  const userMsg: Message = { id: Date.now().toString(), type: 'user', text: query };
  setMessages(prev => [...prev, userMsg]);
  setIsSending(true);  // 로딩 상태 활성화

  try {
    const response = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: query })
    });
    const data = await response.json();

    if (data.success) {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: data.botMessage.content,
        recommendation: data.botMessage.recommendation ?? undefined,
        itinerary: data.botMessage.itinerary ?? undefined,
      };
      setMessages(prev => [...prev, botMsg]);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    const errMsg: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      text: '응답을 받지 못했습니다. 다시 시도해주세요.',
    };
    setMessages(prev => [...prev, errMsg]);
    setTimeout(() => setIsSending(false), 3000);
    return;
  } finally {
    setIsSending(false);
  }
};
```

제거 대상:
- `saveMessageToBackend` 함수 전체
- `setTimeout` 목업 블록 전체

추가 대상:
- `isSending` state (`useState<boolean>(false)`)
- 로딩 중 `ActivityIndicator` 렌더링
- 전송 버튼 및 TextInput의 `disabled={isSending}` 처리

---

## Data Models

### 실제 Qdrant Payload 필드 구조

`labeling` 컬렉션의 각 포인트는 다음 payload 필드를 가진다:

| 필드명 | 설명 | 예시 |
|--------|------|------|
| `사업장명` | 숙박/관광시설 이름 | "제주 그랜드 호텔" |
| `개방서비스명` | 업종 분류 | "관광숙박업" |
| `관광숙박업상세명` | 세부 유형 | "관광호텔업", "가족호텔업" |
| `영업상태명` | 영업 상태 | "영업", "휴업" |
| `도로명전체주소` | 도로명 주소 | "제주특별자치도 제주시 ..." |
| `소재지전체주소` | 지번 주소 | "제주특별자치도 제주시 ..." |
| `소재지전화` | 전화번호 | "064-XXX-XXXX" |
| `지역구분명` | 지역 구분 | "제주시", "서귀포시" |
| `주변환경명` | 주변 환경 | "해변", "산" |
| `건물용도명` | 건물 용도 | "호텔" |
| `객실수` | 객실 수 | 120 |
| `영문상호명` | 영문 이름 | "Jeju Grand Hotel" |
| `_text` | 검색용 요약 텍스트 (핵심 RAG 컨텍스트 필드) | "제주 그랜드 호텔은 ..." |
| `_source` | 데이터 출처 | "공공데이터포털" |

### GPT 시스템 프롬프트 구조

```
당신은 한국 여행 전문 AI 컨시어지입니다. 아래 숙박/관광시설 정보를 참고하여 사용자에게 맞춤형 여행 상담을 제공하세요.

[참고 시설 정보]
1. {doc.payload.사업장명} ({doc.payload.관광숙박업상세명}) - {doc.payload._text}
   주소: {doc.payload.도로명전체주소} | 영업상태: {doc.payload.영업상태명}
...

응답 시 다음 JSON 형식을 사용하세요:
{
  "content": "여행 상담 응답 텍스트",
  "recommendation": {
    "image": "이미지 URL (없으면 null)",
    "title": "추천 상품명",
    "description": "상품 설명",
    "price": 숫자 (없으면 null)
  },
  "itinerary": [
    {
      "name": "장소명",
      "latitude": 위도,
      "longitude": 경도,
      "description": "설명",
      "category": "카테고리",
      "estimated_cost": 예상비용,
      "day": 일차,
      "order": 순서,
      "route_group": "그룹명"
    }
  ]
}
recommendation과 itinerary가 없으면 null로 설정하세요.
```

### ChatHistory 메시지 변환 (MongoDB → OpenAI API)

```javascript
// MongoDB role: 'user' | 'bot'
// OpenAI role: 'user' | 'assistant'
const historyMessages = recentMessages.map(msg => ({
  role: msg.role === 'bot' ? 'assistant' : 'user',
  content: msg.content
}));
```

### 환경변수 목록

| 변수명 | 용도 | 필수 |
|--------|------|------|
| `OPENAI_API_KEY` | GPT 응답 생성 전용 (임베딩 미사용) | ✅ |
| `QDRANT_URL` | Qdrant 클라우드 엔드포인트 | ✅ |
| `QDRANT_API_KEY` | Qdrant 인증 키 | ✅ |
| `QDRANT_COLLECTION` | 벡터 검색 대상 컬렉션명 (기본값: `labeling`) | ✅ |

### 신규 의존성

```json
{
  "openai": "^4.67.0",
  "@qdrant/js-client-rest": "^1.11.0",
  "@xenova/transformers": "^2.17.2"
}
```

- `openai`: GPT-4o-mini 응답 생성 전용 (임베딩 API 미사용)
- `@qdrant/js-client-rest`: Qdrant 벡터 검색
- `@xenova/transformers`: `intfloat/multilingual-e5-base` 모델 로컬 실행으로 768차원 임베딩 생성

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 누락된 환경변수명이 오류 메시지에 포함된다

*For any* subset of the four required environment variables (`OPENAI_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, `QDRANT_COLLECTION`) that is absent, the validation function's error output SHALL contain each missing variable's name.

**Validates: Requirements 1.2, 1.7**

---

### Property 2: 임베딩 벡터는 항상 768차원이다

*For any* non-empty string input, the `embedText` function SHALL return a numeric array of exactly 768 elements (using `intfloat/multilingual-e5-base` via `@xenova/transformers`, mocked in tests).

**Validates: Requirements 2.1**

---

### Property 3: 벡터 검색 결과 필터링 — score ≥ 0.5, 최대 5개

*For any* list of Qdrant search results with arbitrary score values, the filtering function SHALL return only results where `score >= 0.5`, and the returned list SHALL contain at most 5 items.

**Validates: Requirements 2.3**

---

### Property 4: 시스템 프롬프트는 항상 역할 선언을 포함한다

*For any* list of retrieved travel documents (including an empty list), the `buildSystemPrompt` function SHALL produce a string that contains the travel advisor role declaration.

**Validates: Requirements 3.2**

---

### Property 5: 검색된 모든 문서가 시스템 프롬프트에 포함된다

*For any* non-empty list of retrieved travel documents, the `buildSystemPrompt` function SHALL produce a string that contains each document's `사업장명` and `_text` fields.

**Validates: Requirements 3.1**

---

### Property 6: 대화 히스토리는 최근 10개로 제한된다

*For any* ChatHistory message array of length N, the messages passed to GPT SHALL be the last `min(N, 10)` messages in the original order.

**Validates: Requirements 3.3, 7.1**

---

### Property 7: ChatHistory 메시지 역할 변환 — 'bot' → 'assistant'

*For any* ChatHistory message array, the converted OpenAI messages array SHALL contain only `role: 'user'` or `role: 'assistant'` entries (never `role: 'bot'`), and each message's `content` SHALL be identical to the original.

**Validates: Requirements 7.2**

---

### Property 8: GPT 응답 파싱은 항상 세 필드를 반환한다

*For any* GPT response string (well-formed or malformed JSON), the `parseGPTResponse` function SHALL return an object with exactly three fields: `content` (string), `recommendation` (object or null), `itinerary` (array or null), and SHALL NOT throw an exception.

**Validates: Requirements 3.4, 3.6**

---

### Property 9: 공백 메시지는 항상 HTTP 400을 반환한다

*For any* string composed entirely of whitespace characters (spaces, tabs, newlines) or an empty string, the `sendMessage` controller SHALL return HTTP 400 with `{ success: false }`.

**Validates: Requirements 4.4**

---

### Property 10: 100개 초과 시 최근 100개만 유지된다

*For any* ChatHistory where the current message count plus 2 (new user + bot message pair) exceeds 100, after saving, the stored messages array SHALL have exactly 100 entries and SHALL consist of the most recent messages.

**Validates: Requirements 7.5**

---

## Error Handling

### RAG 서비스 오류 처리 전략

| 오류 상황 | 처리 방식 | 클라이언트 영향 |
|-----------|-----------|----------------|
| 환경변수 누락 | `process.exit(1)` (서버 시작 시) | 서버 미시작 |
| `@xenova/transformers` 임베딩 실패 | 오류 로깅 + 오류 응답 반환 | HTTP 500 |
| Qdrant 연결/검색 실패 | 오류 로깅 + 빈 컨텍스트로 계속 진행 | 응답 품질 저하 (정상 응답) |
| GPT API 실패 | 오류 로깅 + fallback 응답 반환 | 안내 메시지 표시 |
| GPT 응답 파싱 실패 | 해당 필드 null 처리 + 계속 진행 | 부분 응답 (content만) |
| ChatHistory 조회 실패 | 오류 로깅 + 빈 히스토리로 계속 진행 | 컨텍스트 없이 응답 |
| ChatHistory 저장 실패 | 오류 로깅 + AI 응답은 정상 반환 | 히스토리 미저장 |

### 컨트롤러 오류 처리

```javascript
// sendMessage 컨트롤러의 오류 처리 계층
try {
  // 1. 입력 검증 (400)
  // 2. RAG 서비스 호출
  // 3. ChatHistory 저장 (실패해도 응답은 반환)
  // 4. 성공 응답 반환
} catch (error) {
  // RAG 서비스 복구 불가 오류 → 500
  res.status(500).json({ success: false, message: error.message });
}
```

### 프론트엔드 오류 처리

- API 실패 시 "응답을 받지 못했습니다. 다시 시도해주세요." 봇 메시지 표시
- 오류 발생 시 3초 후 입력 재활성화 (UX 고려)
- 네트워크 오류와 서버 오류 모두 동일하게 처리

---

## Testing Strategy

### 단위 테스트 (Jest)

**`ragService.js` 테스트:**

```javascript
// 테스트 파일: tests/ragService.test.js
// 모든 외부 의존성(@xenova/transformers, Qdrant, MongoDB)은 Jest mock으로 대체

describe('validateEnv', () => {
  // Property 1: 누락된 환경변수명이 오류 메시지에 포함
  // SMOKE: 모든 변수 존재 시 정상 초기화
});

describe('embedText', () => {
  // Property 2: 임베딩 벡터는 항상 768차원 (multilingual-e5-base)
  // EXAMPLE: @xenova/transformers 실패 시 오류 반환
});

describe('searchQdrant', () => {
  // Property 3: score ≥ 0.5 필터링, 최대 5개
  // EDGE_CASE: 결과 0개 → 빈 배열 반환
  // EXAMPLE: Qdrant 연결 실패 → 빈 배열 반환
});

describe('buildSystemPrompt', () => {
  // Property 4: 항상 역할 선언 포함
  // Property 5: 검색된 모든 문서의 사업장명과 _text 포함
});

describe('fetchChatHistory', () => {
  // Property 6: 최근 10개 메시지만 반환
  // EDGE_CASE: ChatHistory 없음 → 빈 배열
  // EXAMPLE: MongoDB 오류 → 빈 배열
});

describe('parseGPTResponse', () => {
  // Property 7: 역할 변환 ('bot' → 'assistant')
  // Property 8: 항상 세 필드 반환, 예외 없음
});
```

**`chatController.js` 테스트:**

```javascript
// 테스트 파일: tests/chatController.test.js

describe('sendMessage', () => {
  // Property 9: 공백 메시지 → HTTP 400
  // EXAMPLE: 인증 없음 → HTTP 401 (미들웨어 테스트)
  // EXAMPLE: 정상 요청 → 200 + 올바른 응답 구조
  // EXAMPLE: ChatHistory 저장 실패 → AI 응답은 정상 반환
  // EXAMPLE: RAG 서비스 실패 → HTTP 500
});

describe('message trimming', () => {
  // Property 10: 100개 초과 시 최근 100개만 유지
});
```

### 프로퍼티 기반 테스트 (fast-check)

프로퍼티 기반 테스트 라이브러리로 **fast-check** (`^3.21.0`)를 사용한다. 각 프로퍼티 테스트는 최소 100회 반복 실행한다.

```javascript
// 테스트 파일: tests/ragService.property.test.js
const fc = require('fast-check');

// Feature: qdrant-rag-chatbot, Property 1: 누락된 환경변수명이 오류 메시지에 포함된다
test('missing env vars appear in error message', () => {
  fc.assert(fc.property(
    fc.subarray(['OPENAI_API_KEY', 'QDRANT_URL', 'QDRANT_API_KEY', 'QDRANT_COLLECTION'], { minLength: 1 }),
    (missingVars) => {
      const errorMsg = getValidationError(missingVars);
      return missingVars.every(v => errorMsg.includes(v));
    }
  ), { numRuns: 100 });
});

// Feature: qdrant-rag-chatbot, Property 2: 임베딩 벡터는 항상 768차원이다
test('embedding vector is always 768 dimensions', () => {
  fc.assert(fc.property(
    fc.string({ minLength: 1 }),
    async (text) => {
      // @xenova/transformers mock: 768차원 벡터 반환
      const mockEmbed = jest.fn().mockResolvedValue(new Array(768).fill(0));
      const vector = await embedText(text, mockEmbed);
      return vector.length === 768;
    }
  ), { numRuns: 100 });
});

// Feature: qdrant-rag-chatbot, Property 3: 벡터 검색 결과 필터링
test('search results filtered by score >= 0.5 and capped at 5', () => {
  fc.assert(fc.property(
    fc.array(fc.record({ score: fc.float({ min: 0, max: 1 }), payload: fc.object() })),
    (results) => {
      const filtered = filterSearchResults(results);
      return filtered.length <= 5 && filtered.every(r => r.score >= 0.5);
    }
  ), { numRuns: 100 });
});

// Feature: qdrant-rag-chatbot, Property 6: 대화 히스토리는 최근 10개로 제한된다
test('chat history capped at last 10 messages', () => {
  fc.assert(fc.property(
    fc.array(fc.record({ role: fc.constantFrom('user', 'bot'), content: fc.string() })),
    (history) => {
      const windowed = applyContextWindow(history, 10);
      const expected = history.slice(-10);
      return windowed.length === expected.length &&
        windowed.every((m, i) => m.content === expected[i].content);
    }
  ), { numRuns: 100 });
});

// Feature: qdrant-rag-chatbot, Property 7: 'bot' → 'assistant' 역할 변환
test('chat history role conversion preserves content and maps bot to assistant', () => {
  fc.assert(fc.property(
    fc.array(fc.record({
      role: fc.constantFrom('user', 'bot'),
      content: fc.string({ minLength: 1 })
    })),
    (messages) => {
      const converted = convertToOpenAIFormat(messages);
      return converted.every((m, i) =>
        (m.role === 'user' || m.role === 'assistant') &&
        m.role !== 'bot' &&
        m.content === messages[i].content
      );
    }
  ), { numRuns: 100 });
});

// Feature: qdrant-rag-chatbot, Property 8: GPT 응답 파싱은 항상 세 필드를 반환한다
test('parseGPTResponse always returns three fields without throwing', () => {
  fc.assert(fc.property(
    fc.string(),
    (responseText) => {
      let result;
      expect(() => { result = parseGPTResponse(responseText); }).not.toThrow();
      return typeof result.content === 'string' &&
        (result.recommendation === null || typeof result.recommendation === 'object') &&
        (result.itinerary === null || Array.isArray(result.itinerary));
    }
  ), { numRuns: 100 });
});

// Feature: qdrant-rag-chatbot, Property 9: 공백 메시지는 항상 HTTP 400을 반환한다
test('whitespace-only messages return HTTP 400', () => {
  fc.assert(fc.property(
    fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r')),
    async (whitespaceMsg) => {
      const res = await sendMessageController({ body: { message: whitespaceMsg }, user: mockUser });
      return res.statusCode === 400 && res.body.success === false;
    }
  ), { numRuns: 100 });
});

// Feature: qdrant-rag-chatbot, Property 10: 100개 초과 시 최근 100개만 유지된다
test('message history trimmed to last 100 after exceeding limit', () => {
  fc.assert(fc.property(
    fc.integer({ min: 99, max: 200 }),
    (existingCount) => {
      const messages = Array.from({ length: existingCount }, (_, i) => ({
        role: 'user', content: `msg ${i}`
      }));
      const trimmed = trimMessages([...messages, { role: 'user', content: 'new1' }, { role: 'bot', content: 'new2' }]);
      return trimmed.length === 100 &&
        trimmed[trimmed.length - 1].content === 'new2';
    }
  ), { numRuns: 100 });
});
```

### 통합 테스트

실제 Qdrant 및 OpenAI API를 사용하는 통합 테스트는 CI 환경에서 별도로 실행한다:

- `POST /api/chat/message` 엔드포인트 E2E 테스트 (실제 JWT 토큰 사용)
- Qdrant `labeling` 컬렉션 연결 및 768차원 벡터 검색 검증
- MongoDB ChatHistory 저장 및 조회 검증
