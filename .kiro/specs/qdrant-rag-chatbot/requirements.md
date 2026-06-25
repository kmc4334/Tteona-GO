# Requirements Document

## Introduction

DDUNA-GO 여행 쇼핑 앱에 Qdrant 벡터DB와 RAG(Retrieval-Augmented Generation) 파이프라인을 연동하여 AI 여행 상담 챗봇 시스템을 구축한다. 기존에 목업(setTimeout)으로 처리되던 AI 응답을 실제 OpenAI GPT API 기반의 지능형 응답으로 교체하고, 하드코딩된 키워드 매칭 일정 생성 로직을 Qdrant 벡터 검색 기반 RAG 파이프라인으로 대체한다. 모든 외부 서비스 설정은 환경변수로 관리하며, 기존 챗봇 UI(`ConciergeScreen.tsx`)의 변경을 최소화하고 백엔드 연동에 집중한다.

## Glossary

- **RAG_Service**: Qdrant 벡터 검색과 OpenAI GPT를 결합하여 AI 응답을 생성하는 백엔드 서비스 모듈 (`services/ragService.js`)
- **Chat_Controller**: `/api/chat/message` 엔드포인트를 처리하는 Express 컨트롤러
- **Qdrant_Client**: `@qdrant/js-client-rest` 패키지를 통해 Qdrant 클라우드에 연결하는 클라이언트 인스턴스
- **Embedding_Model**: `intfloat/multilingual-e5-base` 모델로, `@xenova/transformers` 패키지를 통해 로컬에서 실행되며 텍스트를 768차원 벡터로 변환하는 데 사용
- **GPT_Model**: OpenAI `gpt-4o-mini` 모델로, 검색된 문서와 대화 히스토리를 바탕으로 여행 상담 응답을 생성하는 모델
- **Vector_Search**: 사용자 쿼리의 임베딩 벡터와 Qdrant 컬렉션 내 문서 벡터 간의 코사인 유사도 기반 검색
- **Context_Window**: GPT에 전달되는 대화 히스토리의 최근 메시지 수 (기본값: 최근 10개)
- **Seed_Script**: 여행지 데이터를 Qdrant 컬렉션에 업로드하는 일회성 스크립트 (`scripts/seedQdrant.js`)
- **ConciergeScreen**: 챗봇 UI를 담당하는 React Native 화면 컴포넌트 (`src/screens/ConciergeScreen.tsx`)
- **ChatHistory**: 사용자별 대화 내역을 저장하는 MongoDB 모델
- **Recommendation**: AI가 추천하는 여행 상품 정보 (image, title, description, price 포함)
- **Itinerary**: AI가 생성하는 여행 일정 목록 (name, latitude, longitude, description, category, estimated_cost, day, order, route_group 포함)

## Requirements

### Requirement 1: 환경변수 기반 외부 서비스 설정

**User Story:** As a 개발자, I want 모든 외부 서비스 연결 정보를 환경변수로 관리하고 싶다, so that 코드에 민감한 정보가 하드코딩되지 않고 배포 환경별로 유연하게 설정할 수 있다.

#### Acceptance Criteria

1. WHEN 서버가 시작될 때, THE RAG_Service SHALL `OPENAI_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, `QDRANT_COLLECTION` 환경변수가 모두 존재하는지 검증한다.
2. IF 위 환경변수 중 하나라도 누락된 경우, THEN THE RAG_Service SHALL 누락된 변수명을 포함한 오류 메시지를 콘솔에 출력하고 프로세스를 0이 아닌 종료 코드로 종료한다.
3. THE RAG_Service SHALL `OPENAI_API_KEY` 환경변수를 사용하여 OpenAI 클라이언트를 초기화한다.
4. THE RAG_Service SHALL `QDRANT_URL`, `QDRANT_API_KEY` 환경변수를 사용하여 Qdrant_Client를 초기화하며, 연결 시도 타임아웃은 10초를 초과하지 않는다.
5. THE RAG_Service SHALL `QDRANT_COLLECTION` 환경변수를 사용하여 벡터 검색 대상 컬렉션명을 설정한다.
6. IF 환경변수가 존재하더라도 실제 서비스 연결에 실패한 경우(잘못된 API 키, 도달 불가 URL 등), THEN THE RAG_Service SHALL 오류 메시지를 콘솔에 출력하고 프로세스를 0이 아닌 종료 코드로 종료한다.
7. THE Seed_Script SHALL 동일한 환경변수(`QDRANT_URL`, `QDRANT_API_KEY`, `QDRANT_COLLECTION`, `OPENAI_API_KEY`)를 사용하여 Qdrant에 연결하며, 누락 시 오류 메시지를 출력하고 종료한다.

---

### Requirement 2: Qdrant 벡터 검색 기반 여행지 문서 검색

**User Story:** As a 챗봇 시스템, I want 사용자 쿼리를 벡터로 변환하여 Qdrant에서 관련 여행지 문서를 검색하고 싶다, so that 하드코딩된 키워드 매칭 대신 의미론적으로 유사한 여행지 정보를 찾을 수 있다.

#### Acceptance Criteria

1. WHEN 사용자 메시지가 수신되면, THE RAG_Service SHALL Embedding_Model을 사용하여 해당 메시지를 768차원 벡터로 변환한다.
2. WHEN 임베딩 벡터가 생성되면, THE RAG_Service SHALL Qdrant_Client를 통해 `QDRANT_COLLECTION` 컬렉션에서 코사인 유사도 기반 Vector_Search를 수행한다.
3. WHEN Vector_Search가 완료되면, THE RAG_Service SHALL 코사인 유사도 점수가 0.5 이상인 결과 중 상위 최대 5개의 여행지 문서를 컨텍스트로 사용한다.
4. IF Qdrant 연결에 실패한 경우, THEN THE RAG_Service SHALL 오류를 콘솔에 로깅하고 빈 컨텍스트로 GPT 응답 생성을 계속 진행한다.
5. IF Vector_Search 결과가 0개인 경우, THEN THE RAG_Service SHALL 빈 컨텍스트로 GPT 응답 생성을 계속 진행한다.
6. IF OpenAI Embeddings API 호출에 실패한 경우, THEN THE RAG_Service SHALL 임베딩 실패를 나타내는 오류 메시지를 콘솔에 로깅하고 벡터 검색을 수행하지 않은 채 오류 응답을 반환한다.

---

### Requirement 3: GPT 기반 여행 상담 응답 생성

**User Story:** As a 사용자, I want AI 여행 상담사로부터 실제 지능형 응답을 받고 싶다, so that 단순 키워드 매칭이 아닌 맥락을 이해한 여행 추천과 상담을 받을 수 있다.

#### Acceptance Criteria

1. WHEN Vector_Search 결과가 1개 이상인 경우, THE RAG_Service SHALL 검색된 여행지 문서를 시스템 프롬프트의 컨텍스트 섹션에 포함하여 GPT_Model에 전달한다.
2. THE RAG_Service SHALL 시스템 프롬프트에 여행 상담사 역할 선언과 검색된 여행지 정보를 모두 포함하여 GPT_Model에 전달한다.
3. THE RAG_Service SHALL Context_Window 범위 내의 최근 대화 히스토리를 GPT_Model에 전달하여 대화 맥락을 유지한다.
4. WHEN GPT_Model이 응답을 생성하면, THE RAG_Service SHALL 응답 텍스트, Recommendation 객체(없으면 null), Itinerary 배열(없으면 null)을 포함한 구조화된 결과를 반환한다.
5. IF GPT API 호출에 실패한 경우, THEN THE RAG_Service SHALL 오류를 콘솔에 로깅하고 오류 안내 텍스트와 함께 `{ content: string, recommendation: null, itinerary: null }` 형태의 응답을 반환한다.
6. IF GPT 응답에서 Recommendation 또는 Itinerary 파싱에 실패한 경우, THEN THE RAG_Service SHALL 해당 필드를 null로 설정하고 나머지 응답 처리를 계속 진행한다.

---

### Requirement 4: POST /api/chat/message 엔드포인트

**User Story:** As a 프론트엔드 앱, I want 단일 API 호출로 사용자 메시지를 전송하고 AI 응답을 받고 싶다, so that 목업 setTimeout 로직을 제거하고 실제 AI 응답을 화면에 표시할 수 있다.

#### Acceptance Criteria

1. THE Chat_Controller SHALL `POST /api/chat/message` 경로에서 `protect` 미들웨어를 통해 JWT 인증이 완료된 사용자의 요청만 처리한다.
2. IF 인증되지 않은 요청인 경우, THEN THE Chat_Controller SHALL HTTP 401 상태 코드를 반환한다.
3. WHEN `POST /api/chat/message` 요청이 수신되면, THE Chat_Controller SHALL 요청 본문에서 `message` 필드를 추출한다.
4. IF `message` 필드가 누락되었거나 공백만 포함된 문자열인 경우, THEN THE Chat_Controller SHALL HTTP 400 상태 코드와 `{ success: false, message: "message 필드는 필수입니다." }` 응답을 반환한다.
5. WHEN 유효한 메시지가 수신되면, THE Chat_Controller SHALL RAG_Service를 호출하여 AI 응답을 생성한다.
6. WHEN AI 응답이 생성되면, THE Chat_Controller SHALL 사용자 메시지와 AI 응답 메시지를 ChatHistory MongoDB 모델에 저장한다.
7. THE Chat_Controller SHALL `{ success: true, userMessage: { role: 'user', content: string, timestamp: Date }, botMessage: { role: 'bot', content: string, recommendation: Recommendation|null, itinerary: Itinerary[]|null, timestamp: Date } }` 형태의 응답을 반환한다.
8. IF ChatHistory 저장 중 오류가 발생한 경우, THEN THE Chat_Controller SHALL 오류를 콘솔에 로깅하되 AI 응답은 정상적으로 클라이언트에 반환한다.
9. IF RAG_Service 호출 중 복구 불가능한 오류가 발생한 경우, THEN THE Chat_Controller SHALL HTTP 500 상태 코드와 `{ success: false, message: string }` 응답을 반환한다.

---

### Requirement 5: 프론트엔드 실제 API 연동

**User Story:** As a 사용자, I want 챗봇 화면에서 실제 AI 응답을 받고 싶다, so that 목업 데이터가 아닌 Qdrant RAG 기반의 실제 여행 상담 응답을 확인할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 메시지를 전송하면, THE ConciergeScreen SHALL `Authorization: Bearer <token>` 헤더와 함께 `{ message: string }` 형태로 `POST /api/chat/message`에 요청을 보낸다.
2. WHILE API 응답을 기다리는 동안, THE ConciergeScreen SHALL 채팅 영역에 로딩 인디케이터(ActivityIndicator)를 표시하고 전송 버튼과 TextInput을 비활성화한다.
3. WHEN API 응답이 수신되면, THE ConciergeScreen SHALL `botMessage.content`, `botMessage.recommendation`(null이 아닌 경우), `botMessage.itinerary`(null이 아닌 경우)를 기존 메시지 구조에 맞게 화면에 표시한다.
4. IF API 호출에 실패한 경우, THEN THE ConciergeScreen SHALL "응답을 받지 못했습니다. 다시 시도해주세요." 텍스트를 봇 메시지로 표시하고, 전송 버튼과 TextInput을 3초 후 재활성화한다.
5. THE ConciergeScreen SHALL 기존 `setTimeout` 목업 응답 로직과 `saveMessageToBackend` 함수를 제거하고, 새 엔드포인트가 저장을 일괄 처리하도록 한다.

---

### Requirement 6: Qdrant 데이터 시딩 스크립트

**User Story:** As a 개발자, I want 여행지 데이터를 Qdrant 컬렉션에 업로드하는 스크립트를 실행하고 싶다, so that RAG 파이프라인이 검색할 수 있는 여행지 벡터 데이터를 준비할 수 있다.

#### Acceptance Criteria

1. THE Seed_Script SHALL `scripts/seedQdrant.js` 경로에 위치하며 `node scripts/seedQdrant.js` 명령으로 실행 가능하다.
2. WHEN 스크립트가 시작되면, THE Seed_Script SHALL `QDRANT_URL`, `QDRANT_API_KEY`, `QDRANT_COLLECTION`, `OPENAI_API_KEY` 환경변수가 모두 존재하는지 검증하고, 누락 시 오류 메시지를 출력하고 종료 코드 1로 종료한다.
3. THE Seed_Script SHALL 스크립트 내부에 정의된 여행지 문서 배열을 데이터 소스로 사용한다.
4. WHEN 스크립트가 실행되면, THE Seed_Script SHALL 각 여행지 문서에 대해 Embedding_Model을 사용하여 임베딩 벡터를 생성한다.
5. THE Seed_Script SHALL 생성된 벡터와 여행지 메타데이터(name, location, description, category, tags)를 `QDRANT_COLLECTION` 컬렉션에 업로드한다.
6. IF `QDRANT_COLLECTION` 컬렉션이 존재하지 않는 경우, THEN THE Seed_Script SHALL 벡터 차원 768, 코사인 거리 메트릭으로 컬렉션을 자동 생성한 후 데이터를 업로드한다.
7. IF 업로드할 문서가 0개인 경우, THEN THE Seed_Script SHALL 업로드를 건너뛰고 해당 사실을 콘솔에 출력한 후 종료 코드 0으로 종료한다.
8. WHEN 업로드가 완료되면, THE Seed_Script SHALL 업로드된 문서 수와 성공 여부를 콘솔에 출력하고 종료 코드 0으로 종료한다.
9. IF 업로드 중 오류가 발생한 경우, THEN THE Seed_Script SHALL 오류 메시지를 콘솔에 출력하고 종료 코드 1로 종료한다.

---

### Requirement 7: 대화 히스토리 컨텍스트 관리

**User Story:** As a 사용자, I want 챗봇이 이전 대화 내용을 기억하고 싶다, so that 연속적인 여행 상담 대화에서 맥락이 유지된다.

#### Acceptance Criteria

1. WHEN RAG_Service가 GPT 응답을 생성할 때, THE RAG_Service SHALL MongoDB ChatHistory에서 해당 사용자의 최근 Context_Window(10개) 메시지를 조회하여 GPT 요청에 포함한다.
2. THE RAG_Service SHALL ChatHistory의 메시지를 OpenAI Chat Completion API의 `messages` 배열 형식(`{ role: 'user'|'assistant', content: string }`)으로 변환하여 전달한다.
3. IF 사용자의 ChatHistory가 존재하지 않는 경우, THEN THE RAG_Service SHALL 빈 대화 히스토리로 GPT 요청을 진행한다.
4. IF MongoDB ChatHistory 조회 중 오류가 발생한 경우, THEN THE RAG_Service SHALL 오류를 콘솔에 로깅하고 빈 대화 히스토리로 GPT 요청을 진행한다.
5. WHEN Chat_Controller가 새 메시지 쌍(사용자 + 봇)을 ChatHistory에 저장할 때, IF 저장 후 총 메시지 수가 100개를 초과하는 경우, THEN THE Chat_Controller SHALL 가장 오래된 메시지부터 삭제하여 최근 100개만 유지한다.
