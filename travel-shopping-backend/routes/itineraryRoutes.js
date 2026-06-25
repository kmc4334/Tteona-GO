const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { embedText, searchQdrant, callGPT } = require('../services/ragService');

// ─── 일정 생성 전용 시스템 프롬프트 ─────────────────────────────────────────
function buildItinerarySystemPrompt(docs, days, travelType, tags, budget) {
  const role =
    '당신은 한국 여행 전문 AI 플래너입니다. 사용자의 여행 성향과 Qdrant에서 검색된 실제 시설 데이터를 바탕으로 구체적이고 실용적인 여행 일정을 생성합니다.';

  // Qdrant 검색 결과 컨텍스트
  let context = '';
  if (docs && docs.length > 0) {
    const lines = docs.map((doc, i) => {
      const p = doc.payload || {};
      const name = p['사업장명'] || '';
      const addr = p['도로명전체주소'] || '';
      const status = p['영업상태명'] || '';
      const cat = p['관광숙박업상세명'] || '';
      const text = p['_text'] || '';
      return `${i + 1}. ${name} (${cat}) - ${text} | 주소: ${addr} | ${status}`;
    });
    context = '\n\n[검색된 실제 시설 정보 - 이 장소들을 우선 활용하세요]\n' + lines.join('\n');
  }

  const userInfo = `
[사용자 정보]
- 여행 성향 유형: ${travelType || '미설정'}
- 관심 태그: ${tags && tags.length ? tags.join(', ') : '없음'}
- 예산 수준: ${budget || '보통'}
- 여행 일수: ${days}일`;

  const format = `

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "title": "여행 제목",
  "summary": "한 줄 여행 요약",
  "schedule": [
    {
      "day": 1,
      "date_label": "1일차",
      "theme": "이 날의 테마",
      "slots": [
        {
          "time": "09:00",
          "name": "장소명",
          "description": "장소 설명 (2줄 이내)",
          "category": "attraction | restaurant | cafe | accommodation | activity",
          "duration_min": 120,
          "price_range": "free | cheap | moderate | expensive",
          "tip": "여행 팁 (선택사항)"
        }
      ]
    }
  ],
  "total_tips": ["전체 여행 팁1", "전체 여행 팁2"]
}

규칙:
- 하루에 3~5개 슬롯
- 시간 순서대로 배치
- 검색된 실제 시설 정보를 최대한 반영
- 사용자 성향에 맞는 장소 선정
- 식사(점심/저녁)는 반드시 포함`;

  return role + userInfo + context + format;
}

// ─── GPT 응답 파싱 ────────────────────────────────────────────────────────────
function parseItineraryResponse(text) {
  try {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first === -1 || last === -1) throw new Error('JSON not found');
    return JSON.parse(text.substring(first, last + 1));
  } catch (e) {
    console.error('[itinerary] parse error:', e.message);
    return null;
  }
}

/**
 * POST /api/itinerary/generate
 * GPT-4o-mini + RAG 기반 AI 여행 일정 생성
 */
router.post('/generate', protect, async (req, res) => {
  try {
    const { days = 2, destination = '제주도' } = req.body;
    const user = req.user;

    // 사용자 성향 정보
    const personality = user.travelPersonality || {};
    const travelType = personality.type || '';
    const tags = personality.tags || [];
    const budget = personality.scores?.healing > 0.5 ? '여유있게' : '적당하게';

    // RAG: 목적지 + 성향 태그로 Qdrant 검색
    const query = `${destination} ${tags.join(' ')} 여행 추천 ${travelType}`;
    let docs = [];
    try {
      const vector = await embedText(query);
      docs = await searchQdrant(vector);
    } catch (e) {
      console.warn('[itinerary] RAG 검색 실패, GPT만 사용:', e.message);
    }

    // GPT 호출
    const systemPrompt = buildItinerarySystemPrompt(docs, days, travelType, tags, budget);
    const userMessage = `${destination} ${days}박${days + 1}일 여행 일정을 만들어주세요. 내 성향: ${travelType || '일반'}, 관심사: ${tags.join(', ') || '없음'}`;

    const rawText = await callGPT(systemPrompt, [], userMessage);
    console.log('[itinerary] GPT raw response:', rawText.substring(0, 300));
    const itinerary = parseItineraryResponse(rawText);

    if (!itinerary) {
      return res.status(500).json({ success: false, message: 'AI 일정 파싱에 실패했습니다.' });
    }

    res.json({ success: true, itinerary });
  } catch (err) {
    console.error('[itinerary/generate]', err.message);
    res.status(500).json({ success: false, message: '일정 생성에 실패했습니다.', error: err.message });
  }
});

module.exports = router;
