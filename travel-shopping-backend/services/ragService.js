'use strict';

const { OpenAI } = require('openai');
const { QdrantClient } = require('@qdrant/js-client-rest');
const ChatHistory = require('../models/ChatHistory');

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------

/**
 * Validates that all required environment variables are present.
 * Logs each missing variable name and exits with code 1 if any are absent.
 */
function validateEnv() {
  const required = [
    'OPENAI_API_KEY',
    'QDRANT_URL',
    'QDRANT_API_KEY',
    'QDRANT_COLLECTION',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `[ragService] 누락된 환경변수: ${missing.join(', ')}\n` +
      '서버를 시작하기 전에 위 환경변수를 설정하세요.'
    );
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Module-level initialization
// ---------------------------------------------------------------------------

validateEnv();

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const collectionName = process.env.QDRANT_COLLECTION || 'labeling';

// Lazy-initialized @xenova/transformers pipeline
let _embeddingPipeline = null;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns (and caches) the @xenova/transformers feature-extraction pipeline
 * for the intfloat/multilingual-e5-base model.
 *
 * @returns {Promise<Function>} The pipeline function
 */
async function getEmbeddingPipeline() {
  if (_embeddingPipeline) return _embeddingPipeline;

  const { pipeline, env } = await import('@xenova/transformers');

  // 원격 모델 다운로드 허용 및 캐시 경로 설정
  env.allowRemoteModels = true;
  env.allowLocalModels = true;
  env.cacheDir = require('path').join(require('os').homedir(), '.cache', 'xenova');

  console.log('[ragService] 임베딩 모델 로딩 시작: intfloat/multilingual-e5-base');
  console.log('[ragService] 첫 실행 시 HuggingFace에서 모델을 다운로드합니다 (약 500MB)...');

  _embeddingPipeline = await pipeline(
    'feature-extraction',
    'intfloat/multilingual-e5-base',
    {
      // quantized: false → model_quantized.onnx 대신 model.onnx 사용
      quantized: false,
      progress_callback: (progress) => {
        if (progress.status === 'downloading') {
          const pct = progress.progress ? progress.progress.toFixed(1) : '?';
          process.stdout.write(
            `\r[ragService] 다운로드 중: ${progress.file} — ${pct}%   `
          );
        } else if (progress.status === 'done') {
          console.log(`\n[ragService] 완료: ${progress.file}`);
        }
      },
    }
  );

  console.log('[ragService] ✅ 임베딩 모델 로딩 완료');
  return _embeddingPipeline;
}

// ---------------------------------------------------------------------------
// Exported utility functions
// ---------------------------------------------------------------------------

/**
 * Embeds the given text using the intfloat/multilingual-e5-base model
 * (local execution via @xenova/transformers).
 *
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} A 768-dimensional numeric vector
 * @throws {Error} If the embedding pipeline fails
 */
async function embedText(text) {
  const pipe = await getEmbeddingPipeline();

  // The model expects a "query:" prefix for retrieval queries.
  const output = await pipe(`query: ${text}`, {
    pooling: 'mean',
    normalize: true,
  });

  // output.data is a Float32Array; convert to a plain Array for Qdrant.
  const vector = Array.from(output.data);

  if (vector.length !== 768) {
    throw new Error(
      `[ragService] embedText: 예상 벡터 차원 768, 실제 ${vector.length}`
    );
  }

  return vector;
}

/**
 * Searches the Qdrant labeling collection using cosine similarity.
 * Filters results to score >= 0.5 and returns at most 5 documents.
 *
 * @param {number[]} vector - 768-dimensional query vector
 * @returns {Promise<Array>} Matching Qdrant search result objects (may be empty)
 */
async function searchQdrant(vector) {
  try {
    const results = await qdrantClient.search(collectionName, {
      vector,
      limit: 5,
      score_threshold: 0.5,
    });
    return results;
  } catch (error) {
    console.error('[ragService] Qdrant 검색 실패:', error.message || error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Stub functions — to be implemented in later tasks
// ---------------------------------------------------------------------------

/**
 * Builds the GPT system prompt from retrieved Qdrant documents.
 * Includes a travel advisor role declaration and formatted document context.
 *
 * @param {Array} docs - Qdrant search result objects
 * @returns {string} The complete system prompt string
 */
function buildSystemPrompt(docs) {
  const roleDeclaration =
    '당신은 한국 여행 전문 AI 컨시어지입니다. 아래 숙박/관광시설 정보를 참고하여 사용자에게 맞춤형 여행 상담을 제공하세요.';

  let contextSection = '';
  if (docs && docs.length > 0) {
    const docLines = docs.map((doc, index) => {
      const p = doc.payload || {};
      const name = p['사업장명'] || '';
      const address = p['도로명전체주소'] || '';
      const status = p['영업상태명'] || '';
      const category = p['관광숙박업상세명'] || '';
      const text = p['_text'] || '';
      return (
        `${index + 1}. ${name} (${category}) - ${text}\n` +
        `   주소: ${address} | 영업상태: ${status}`
      );
    });
    contextSection = '\n\n[참고 시설 정보]\n' + docLines.join('\n');
  }

  const responseFormat = `\n\n응답 시 다음 JSON 형식을 사용하세요:\n` +
    `{\n` +
    `  "content": "여행 상담 응답 텍스트",\n` +
    `  "recommendation": {\n` +
    `    "image": "이미지 URL (없으면 null)",\n` +
    `    "title": "추천 상품명",\n` +
    `    "description": "상품 설명",\n` +
    `    "price": 숫자 (없으면 null)\n` +
    `  },\n` +
    `  "itinerary": [\n` +
    `    {\n` +
    `      "name": "장소명",\n` +
    `      "latitude": 위도,\n` +
    `      "longitude": 경도,\n` +
    `      "description": "설명",\n` +
    `      "category": "카테고리",\n` +
    `      "estimated_cost": 예상비용,\n` +
    `      "day": 일차,\n` +
    `      "order": 순서,\n` +
    `      "route_group": "그룹명"\n` +
    `    }\n` +
    `  ]\n` +
    `}\n` +
    `recommendation과 itinerary가 없으면 null로 설정하세요.`;

  return roleDeclaration + contextSection + responseFormat;
}

/**
 * Fetches the most recent 10 messages from MongoDB ChatHistory for a user.
 * Returns an empty array if no history exists or on any error.
 *
 * @param {string} userId - MongoDB ObjectId string
 * @returns {Promise<Array>} Array of message objects (up to 10)
 */
async function fetchChatHistory(userId) {
  try {
    const record = await ChatHistory.findOne({ userId });
    if (!record || !record.messages || record.messages.length === 0) {
      return [];
    }
    // Return the last 10 messages
    return record.messages.slice(-10);
  } catch (error) {
    console.error('[ragService] ChatHistory 조회 실패:', error.message || error);
    return [];
  }
}

/**
 * Converts ChatHistory messages to OpenAI Chat Completion API format.
 * Maps role 'bot' → 'assistant'; keeps 'user' as-is. Preserves content.
 *
 * @param {Array} messages - Array of { role, content } objects from ChatHistory
 * @returns {Array} Array of { role, content } in OpenAI format
 */
function convertToOpenAIFormat(messages) {
  return messages.map((msg) => ({
    role: msg.role === 'bot' ? 'assistant' : msg.role,
    content: msg.content,
  }));
}

/**
 * Calls GPT-4o-mini with the given system prompt, history, and user message.
 * @param {string} systemPrompt
 * @param {Array} history - OpenAI-format message array
 * @param {string} userMessage
 * @returns {Promise<string>} Raw GPT response text
 */
async function callGPT(systemPrompt, history, userMessage) {
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ];

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('[ragService] GPT 호출 실패:', error.message || error);
    return '죄송합니다. 현재 AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
}

/**
 * Parses a GPT response string into { content, recommendation, itinerary }.
 * @param {string} text
 * @returns {{ content: string, recommendation: object|null, itinerary: Array|null }}
 */
function parseGPTResponse(text) {
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return { content: text, recommendation: null, itinerary: null };
    }

    const jsonSubstring = text.substring(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonSubstring);

    return {
      content: parsed.content ?? text,
      recommendation: parsed.recommendation ?? null,
      itinerary: parsed.itinerary ?? null,
    };
  } catch (_err) {
    return { content: text, recommendation: null, itinerary: null };
  }
}

/**
 * Full RAG pipeline: embed → search → fetchHistory → buildPrompt → callGPT → parse.
 * @param {string} userId
 * @param {string} userMessage
 * @returns {Promise<{ content: string, recommendation: object|null, itinerary: Array|null }>}
 */
async function generateResponse(userId, userMessage) {
  const vector = await embedText(userMessage);
  const docs = await searchQdrant(vector);
  const systemPrompt = buildSystemPrompt(docs);
  const rawHistory = await fetchChatHistory(userId);
  const history = convertToOpenAIFormat(rawHistory);
  const rawText = await callGPT(systemPrompt, history, userMessage);
  return parseGPTResponse(rawText);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Core utilities (task 2.1)
  validateEnv,
  embedText,
  searchQdrant,

  // Prompt & history helpers (task 3.1)
  buildSystemPrompt,
  fetchChatHistory,
  convertToOpenAIFormat,

  // GPT & pipeline (task 4.1)
  callGPT,
  parseGPTResponse,
  generateResponse,

  // Expose clients for testing
  _openaiClient: openaiClient,
  _qdrantClient: qdrantClient,
  _collectionName: collectionName,
};
