/**
 * User query를 분석하여 구조화된 여행 일정 데이터를 생성하는 유틸리티
 */

const PREDEFINED_TRIPS = {
  "제주": [
    {
      "name": "제주국제공항",
      "latitude": 33.5113,
      "longitude": 126.4930,
      "description": "여행의 시작점",
      "category": "교통",
      "estimated_cost": 0,
      "day": 1,
      "order": 1,
      "route_group": "day1_route"
    },
    {
      "name": "자매국수",
      "latitude": 33.5122,
      "longitude": 126.5277,
      "description": "제주산 돼지고기가 듬뿍 올라간 고기국수 맛집",
      "category": "맛집",
      "estimated_cost": 10000,
      "day": 1,
      "order": 2,
      "route_group": "day1_route"
    },
    {
      "name": "함덕 해수욕장",
      "latitude": 33.5430,
      "longitude": 126.6692,
      "description": "에메랄드빛 바다와 서우봉 산책로",
      "category": "자연",
      "estimated_cost": 0,
      "day": 1,
      "order": 3,
      "route_group": "day1_route"
    },
    {
      "name": "성산일출봉",
      "latitude": 33.4585,
      "longitude": 126.9427,
      "description": "유네스코 세계자연유산, 장엄한 일출의 성지",
      "category": "자연",
      "estimated_cost": 5000,
      "day": 1,
      "order": 4,
      "route_group": "day1_route"
    },
    {
      "name": "비자림",
      "latitude": 33.4912,
      "longitude": 126.7712,
      "description": "천년의 세월을 간직한 비자나무 숲길 산책",
      "category": "자연",
      "estimated_cost": 3000,
      "day": 2,
      "order": 1,
      "route_group": "day2_route"
    },
    {
      "name": "월정리 카페거리",
      "latitude": 33.5552,
      "longitude": 126.7960,
      "description": "바다를 바라보며 즐기는 여유로운 커피 한 잔",
      "category": "카페",
      "estimated_cost": 15000,
      "day": 2,
      "order": 2,
      "route_group": "day2_route"
    }
  ],
  "부산": [
    {
      "name": "부산역",
      "latitude": 35.1152,
      "longitude": 129.0422,
      "description": "부산 여행의 관문",
      "category": "교통",
      "estimated_cost": 0,
      "day": 1,
      "order": 1,
      "route_group": "busan_day_1"
    },
    {
      "name": "해운대 해수욕장",
      "latitude": 35.1587,
      "longitude": 129.1604,
      "description": "대한민국 대표 해수욕장",
      "category": "자연",
      "estimated_cost": 0,
      "day": 1,
      "order": 2,
      "route_group": "busan_day_1"
    },
    {
      "name": "더베이 101",
      "latitude": 35.1564,
      "longitude": 129.1524,
      "description": "빌딩 숲 야경이 아름다운 복합문화공간",
      "category": "액티비티",
      "estimated_cost": 20000,
      "day": 1,
      "order": 3,
      "route_group": "busan_day_1"
    }
  ]
};

/**
 * 사용자 입력 쿼리를 바탕으로 일정 데이터를 생성합니다.
 * @param {string} query 
 * @returns {Array|null}
 */
exports.generateTravelData = (query) => {
  // 간단한 키워드 매칭 (나중에는 LLM API 호출로 대체 가능)
  for (const [key, itinerary] of Object.entries(PREDEFINED_TRIPS)) {
    if (query.includes(key)) {
      return itinerary;
    }
  }

  // 매칭되는 키워드가 없으면 null 반환하거나 기본 일정 반환
  return null;
};
