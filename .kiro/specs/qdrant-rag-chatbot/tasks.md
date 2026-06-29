# Implementation Plan: Qdrant RAG Chatbot

## Overview

목업(setTimeout) 기반 AI 챗봇을 Qdrant 벡터 DB + OpenAI GPT RAG 파이프라인으로 전환한다.
백엔드에 `ragService.js`와 `POST /api/chat/message` 엔드포인트를 추가하고,
프론트엔드 `ConciergeScreen.tsx`의 목업 로직을 실제 API 호출로 교체한다.

## Tasks

- [x] 1. 백엔드 의존성 설치 및 환경변수 설정
  - `travel-shopping-backend/package.json`에 `openai@^4.67.0`, `@qdrant/js-client-rest@^1.11.0`, `@xenova/transformers@^2.17.2` 추가
  - `travel-shopping-backend/.env.example`에 `OPENAI_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, `QDRANT_COLLECTION` 항목 추가 (QDRANT_COLLECTION 기본값: `labeling`)
  - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [x] 2. `services/ragService.js` 핵심 유틸리티 함수 구현
  - [x] 2.1 `validateEnv`, `embedText`, `searchQdrant` 함수 구현
    - `validateEnv()`: 4개 환경변수 존재 여부 검증, 누락 시 변수명 포함 오류 메시지 출력 후 `process.exit(1)`
    - `embedText(text)`: `@xenova/transformers`의 `intfloat/multilingual-e5-base` 모델로 768차원 벡터 반환 (로컬 실행, OpenAI 임베딩 API 미사용)
    - `searchQdrant(vector)`: `labeling` 컬렉션 코사인 유사도 검색, score ≥ 0.5 필터링, 최대 5개 반환; Qdrant 실패 시 빈 배열 반환
    - 모듈 로드 시 `validateEnv()` 호출 및 OpenAI/Qdrant 클라이언트 초기화
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.6_

  - [ ]* 2.2 Property 1 테스트 작성 — 누락된 환경변수명이 오류 메시지에 포함된다
    - **Property 1: 누락된 환경변수명이 오류 메시지에 포함된다**
    - **Validates: Requirements 1.2, 1.7**
    - `tests/ragService.property.test.js`에 fast-check 기반 테스트 작성
    - `fc.subarray`로 임의의 누락 변수 조합 생성, 각 변수명이 오류 메시지에 포함되는지 검증

  - [ ]* 2.3 Property 2 테스트 작성 — 임베딩 벡터는 항상 768차원이다
    - **Property 2: 임베딩 벡터는 항상 768차원이다**
    - **Validates: Requirements 2.1**
    - `@xenova/transformers`를 Jest mock으로 대체하여 임의 문자열 입력에 대해 반환 벡터 길이가 768인지 검증

  - [ ]* 2.4 Property 3 테스트 작성 — 벡터 검색 결과 필터링 (score ≥ 0.5, 최대 5개)
    - **Property 3: 벡터 검색 결과 필터링 — score ≥ 0.5, 최대 5개**
    - **Validates: Requirements 2.3**
    - 임의 score 값을 가진 결과 배열에 대해 필터링 함수가 조건을 항상 만족하는지 검증

- [x] 3. `services/ragService.js` 프롬프트 및 히스토리 함수 구현
  - [x] 3.1 `buildSystemPrompt`, `fetchChatHistory`, `convertToOpenAIFormat` 함수 구현
    - `buildSystemPrompt(docs)`: 역할 선언 + 검색된 문서(`doc.payload.사업장명`, `doc.payload.도로명전체주소`, `doc.payload.영업상태명`, `doc.payload.관광숙박업상세명`, `doc.payload._text`) 포함 시스템 프롬프트 생성; 빈 배열도 처리
    - `fetchChatHistory(userId)`: MongoDB ChatHistory에서 최근 10개 메시지 조회; 없거나 오류 시 빈 배열 반환
    - `convertToOpenAIFormat(messages)`: `role: 'bot'` → `role: 'assistant'` 변환, content 보존
    - _Requirements: 3.1, 3.2, 3.3, 7.1, 7.2, 7.3, 7.4_

  - [ ]* 3.2 Property 4 테스트 작성 — 시스템 프롬프트는 항상 역할 선언을 포함한다
    - **Property 4: 시스템 프롬프트는 항상 역할 선언을 포함한다**
    - **Validates: Requirements 3.2**
    - 임의 문서 배열(빈 배열 포함)에 대해 `buildSystemPrompt` 결과가 역할 선언 문자열을 포함하는지 검증

  - [ ]* 3.3 Property 5 테스트 작성 — 검색된 모든 문서가 시스템 프롬프트에 포함된다
    - **Property 5: 검색된 모든 문서가 시스템 프롬프트에 포함된다**
    - **Validates: Requirements 3.1**
    - 비어있지 않은 임의 문서 배열에 대해 각 문서의 `사업장명`과 `_text`가 프롬프트에 포함되는지 검증

  - [ ]* 3.4 Property 6 테스트 작성 — 대화 히스토리는 최근 10개로 제한된다
    - **Property 6: 대화 히스토리는 최근 10개로 제한된다**
    - **Validates: Requirements 3.3, 7.1**
    - 임의 길이의 메시지 배열에 대해 Context_Window 적용 결과가 `min(N, 10)`개이고 순서가 유지되는지 검증

  - [ ]* 3.5 Property 7 테스트 작성 — 'bot' → 'assistant' 역할 변환
    - **Property 7: ChatHistory 메시지 역할 변환 — 'bot' → 'assistant'**
    - **Validates: Requirements 7.2**
    - 임의 role/content 조합에 대해 변환 후 `role: 'bot'`이 없고 content가 동일한지 검증

- [x] 4. `services/ragService.js` GPT 호출 및 응답 파싱 구현
  - [x] 4.1 `callGPT`, `parseGPTResponse`, `generateResponse` 함수 구현
    - `callGPT(systemPrompt, history, userMessage)`: GPT-4o-mini 호출; 실패 시 오류 로깅 후 fallback 응답 반환
    - `parseGPTResponse(text)`: GPT 응답에서 `content`, `recommendation`, `itinerary` 추출; 파싱 실패 시 해당 필드 null 처리, 예외 미발생
    - `generateResponse(userId, userMessage)`: 전체 RAG 파이프라인 조합 (embed → search → fetchHistory → buildPrompt → callGPT → parse)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 4.2 Property 8 테스트 작성 — GPT 응답 파싱은 항상 세 필드를 반환한다
    - **Property 8: GPT 응답 파싱은 항상 세 필드를 반환한다**
    - **Validates: Requirements 3.4, 3.6**
    - 임의 문자열(정상 JSON, 비정상 JSON 포함)에 대해 `parseGPTResponse`가 예외 없이 `content`, `recommendation`, `itinerary` 세 필드를 반환하는지 검증

- [ ] 5. Checkpoint — 핵심 서비스 테스트 통과 확인
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. `controllers/chatController.js`에 `sendMessage` 함수 추가
  - [x] 6.1 `sendMessage` 컨트롤러 함수 구현
    - `message` 필드 누락 또는 공백 시 HTTP 400 + `{ success: false, message: "message 필드는 필수입니다." }` 반환
    - `ragService.generateResponse(userId, message)` 호출
    - 사용자 메시지 + 봇 메시지를 ChatHistory에 저장; 저장 실패 시 오류 로깅 후 응답은 정상 반환
    - 저장 후 총 메시지 수가 100개 초과 시 오래된 메시지 삭제하여 최근 100개 유지
    - 성공 시 `{ success: true, userMessage, botMessage }` 반환; RAG 서비스 복구 불가 오류 시 HTTP 500 반환
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 7.5_

  - [ ]* 6.2 Property 9 테스트 작성 — 공백 메시지는 항상 HTTP 400을 반환한다
    - **Property 9: 공백 메시지는 항상 HTTP 400을 반환한다**
    - **Validates: Requirements 4.4**
    - `tests/chatController.property.test.js`에 fast-check 기반 테스트 작성
    - `fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'))`로 공백 문자열 생성, HTTP 400 + `success: false` 검증

  - [ ]* 6.3 Property 10 테스트 작성 — 100개 초과 시 최근 100개만 유지된다
    - **Property 10: 100개 초과 시 최근 100개만 유지된다**
    - **Validates: Requirements 7.5**
    - 99~200개 기존 메시지에 새 메시지 쌍 추가 후 트리밍 결과가 정확히 100개이고 최신 메시지가 포함되는지 검증

  - [ ]* 6.4 `chatController.js` 단위 테스트 작성
    - `tests/chatController.test.js`에 Jest 기반 테스트 작성
    - 정상 요청 → 200 + 올바른 응답 구조 검증
    - ChatHistory 저장 실패 → AI 응답은 정상 반환 검증
    - RAG 서비스 실패 → HTTP 500 검증
    - _Requirements: 4.7, 4.8, 4.9_

- [x] 7. `routes/chatRoutes.js`에 신규 라우트 추가
  - 기존 라우트(`GET /`, `POST /`, `DELETE /`) 유지
  - `router.post('/message', sendMessage)` 추가 및 `sendMessage` import
  - _Requirements: 4.1_

- [x] 8. `scripts/seedQdrant.js` 시딩 스크립트 — **건너뜀 (데이터 이미 Qdrant에 업로드 완료)**
  - Qdrant `labeling` 컬렉션에 88,589개의 한국 관광숙박업 공공데이터가 768차원 벡터로 이미 업로드되어 있으므로 이 태스크는 생략한다.
  - _Requirements: 6.1~6.9, 1.7 (사전 완료)_

- [x] 9. `ConciergeScreen.tsx` 실제 API 연동으로 교체
  - [x] 9.1 `handleSendQuery` 함수 리팩토링
    - `saveMessageToBackend` 함수 전체 제거
    - `setTimeout` 목업 블록 전체 제거
    - `isSending` state (`useState<boolean>(false)`) 추가
    - `POST /api/chat/message`에 `Authorization: Bearer <token>` 헤더와 `{ message: string }` body로 단일 API 호출
    - API 응답에서 `botMessage.content`, `botMessage.recommendation`, `botMessage.itinerary`를 기존 메시지 구조에 맞게 화면에 표시
    - API 실패 시 "응답을 받지 못했습니다. 다시 시도해주세요." 봇 메시지 표시 후 3초 후 입력 재활성화
    - _Requirements: 5.1, 5.3, 5.4, 5.5_

  - [x] 9.2 로딩 UI 추가
    - API 응답 대기 중 채팅 영역에 `ActivityIndicator` 표시
    - `isSending` 상태에 따라 전송 버튼과 `TextInput` 비활성화 처리
    - _Requirements: 5.2_

- [ ] 10. Final Checkpoint — 전체 테스트 통과 및 통합 확인
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- `*` 표시 태스크는 선택적이며 MVP를 위해 건너뛸 수 있음
- 각 태스크는 특정 요구사항을 참조하여 추적 가능성 확보
- 프로퍼티 기반 테스트는 fast-check (`^3.21.0`) 사용, 최소 100회 반복 실행
- 단위 테스트는 Jest 사용, 모든 외부 의존성(OpenAI, Qdrant, MongoDB)은 mock으로 대체
- 기존 `GET /api/chat`, `POST /api/chat`, `DELETE /api/chat` 엔드포인트와 ChatHistory 모델은 변경 없음
- `ConciergeScreen.tsx` UI 구조 변경 최소화, `handleSendQuery` 내부 로직만 교체

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5", "4.1"] },
    { "id": 4, "tasks": ["4.2", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "6.4", "7"] },
    { "id": 6, "tasks": ["9.1"] },
    { "id": 7, "tasks": ["9.2"] }
  ]
}
```
