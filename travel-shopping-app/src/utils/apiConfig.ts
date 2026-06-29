/**
 * API 설정 파일
 * 환경 변수에서 API 엔드포인트를 가져옵니다
 */

// Backend Express Server
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.0.12:5000';

// Python FastAPI Server (AI/Data Processing)
export const FASTAPI_BASE_URL = process.env.EXPO_PUBLIC_FASTAPI_BASE_URL || 'http://192.168.0.12:8000';

// OpenAI API
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

// Qdrant Vector Database
export const QDRANT_CONFIG = {
  url: process.env.EXPO_PUBLIC_QDRANT_URL || '',
  apiKey: process.env.EXPO_PUBLIC_QDRANT_API_KEY || '',
  collection: process.env.EXPO_PUBLIC_QDRANT_COLLECTION || 'labeling',
};

// Kakao Map API
export const KAKAO_MAP_API_KEY = process.env.EXPO_PUBLIC_KAKAO_MAP_API_KEY || '';

/**
 * API 엔드포인트 헬퍼 함수
 */
export const getApiUrl = (path: string): string => {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const getFastApiUrl = (path: string): string => {
  return `${FASTAPI_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * 환경 설정 검증
 */
export const validateConfig = () => {
  const warnings: string[] = [];

  if (!KAKAO_MAP_API_KEY) {
    warnings.push('⚠️  KAKAO_MAP_API_KEY가 설정되지 않았습니다.');
  }

  if (!OPENAI_API_KEY) {
    warnings.push('⚠️  OPENAI_API_KEY가 설정되지 않았습니다. AI 기능이 제한될 수 있습니다.');
  }

  if (!QDRANT_CONFIG.url || !QDRANT_CONFIG.apiKey) {
    warnings.push('⚠️  Qdrant 설정이 완료되지 않았습니다. AI 추천 기능이 제한될 수 있습니다.');
  }

  if (warnings.length > 0) {
    console.log('\n=== 환경 변수 검증 ===');
    warnings.forEach(warning => console.log(warning));
    console.log('======================\n');
  } else {
    console.log('✅ 모든 환경 변수가 정상적으로 설정되었습니다.');
  }

  return warnings.length === 0;
};

// 개발 환경에서 설정 출력
if (__DEV__) {
  console.log('\n=== API 설정 ===');
  console.log('Backend API:', API_BASE_URL);
  console.log('FastAPI:', FASTAPI_BASE_URL);
  console.log('Kakao Map Key:', KAKAO_MAP_API_KEY ? '✓ 설정됨' : '✗ 미설정');
  console.log('OpenAI Key:', OPENAI_API_KEY ? '✓ 설정됨' : '✗ 미설정');
  console.log('Qdrant URL:', QDRANT_CONFIG.url ? '✓ 설정됨' : '✗ 미설정');
  console.log('================\n');
}
