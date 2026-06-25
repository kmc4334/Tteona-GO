/* ══════════════════════════════════════════════
   personality-data.js
   여행 성향 분석 - 데이터 정의
   ══════════════════════════════════════════════ */

/* ── 12문항 퀴즈 ─────────────────────────────── */
const QUIZ_QUESTIONS = [
  {
    id: 'q1', axis: 'plan',
    category: '일정 및 계획성',
    question: '여행을 떠나기 전, 나의 준비 스타일은?',
    type: 'single',
    options: [
      { label: '📋 분 단위로 동선과 Plan B까지 짜야 마음이 편하다', value: 'A', scores: { plan: 2, safe: 1 } },
      { label: '📌 큰 틀만 정하고 세부 일정은 현지에서 정한다', value: 'B', scores: { plan: 1, adventure: 1 } },
      { label: '🎲 비행기 표와 첫날 숙소만 있으면 일단 출발한다', value: 'C', scores: { spontaneous: 2, adventure: 1 } },
    ]
  },
  {
    id: 'q2', axis: 'plan',
    category: '일정 및 계획성',
    question: '가려던 맛집이 갑자기 문을 닫았다! 이때 나의 반응은?',
    type: 'single',
    options: [
      { label: '🗂 미리 찾아둔 후보 식당으로 이동한다', value: 'A', scores: { plan: 2, safe: 1 } },
      { label: '🚶 근처 아무 식당이나 들어가 새로운 곳을 도전한다', value: 'B', scores: { spontaneous: 2, adventure: 1 } },
    ]
  },
  {
    id: 'q3', axis: 'adventure',
    category: '장소 및 모험심',
    question: '내가 더 선호하는 여행지 스타일은?',
    type: 'single',
    options: [
      { label: '🏙 인프라가 잘 갖춰진 유명 관광지', value: 'A', scores: { safe: 2, plan: 1 } },
      { label: '🌿 숨겨진 소도시와 자연 여행지', value: 'B', scores: { adventure: 2, nature: 1 } },
    ]
  },
  {
    id: 'q4', axis: 'adventure',
    category: '장소 및 모험심',
    question: '여행지에서 로컬 음식을 마주했을 때 나는?',
    type: 'single',
    options: [
      { label: '🍔 익숙하고 무난한 음식을 찾는다', value: 'A', scores: { safe: 2 } },
      { label: '🍱 처음 보는 현지 음식도 기꺼이 도전한다', value: 'B', scores: { adventure: 2, food: 1 } },
    ]
  },
  {
    id: 'q5', axis: 'active',
    category: '활동성 및 에너지',
    question: '내가 꿈꾸는 이상적인 여행의 하루는?',
    type: 'single',
    options: [
      { label: '🛋 숙소와 카페에서 여유롭게 쉬기', value: 'A', scores: { rest: 2, healing: 1 } },
      { label: '🏄 관광지와 액티비티를 하루 종일 즐기기', value: 'B', scores: { active: 2, adventure: 1 } },
    ]
  },
  {
    id: 'q6', axis: 'active',
    category: '활동성 및 에너지',
    question: '여행 중 이동 수단을 선택할 때 나는?',
    type: 'single',
    options: [
      { label: '🚗 편안한 이동 수단을 선호한다', value: 'A', scores: { rest: 1, safe: 1 } },
      { label: '🚶 대중교통과 도보 이동도 여행의 일부라고 생각한다', value: 'B', scores: { active: 1, adventure: 1 } },
    ]
  },
  {
    id: 'q7', axis: 'social',
    category: '동행 및 사교성',
    question: '여행지에서 새로운 사람을 만난다면?',
    type: 'single',
    options: [
      { label: '🙂 가벼운 인사만 하고 내 일정에 집중한다', value: 'A', scores: { solo: 2, plan: 1 } },
      { label: '🤝 쉽게 친해지고 대화를 나눈다', value: 'B', scores: { social: 2, adventure: 1 } },
    ]
  },
  {
    id: 'q8', axis: 'social',
    category: '동행 및 사교성',
    question: '여행 중 의견 조율이 필요할 때 나는?',
    type: 'single',
    options: [
      { label: '💬 내가 원하는 방향을 명확하게 제안한다', value: 'A', scores: { plan: 1, solo: 1 } },
      { label: '🤗 동행의 의견에 맞춰주는 편이다', value: 'B', scores: { social: 2, easygoing: 1 } },
    ]
  },
  {
    id: 'q9', axis: 'value',
    category: '소비 및 가치관',
    question: '여행 예산에서 가장 아끼고 싶지 않은 부분은?',
    type: 'single',
    options: [
      { label: '🏨 숙소와 분위기 좋은 공간', value: 'A', scores: { healing: 2, aesthetic: 1 } },
      { label: '🎡 액티비티와 새로운 경험', value: 'B', scores: { active: 2, adventure: 1 } },
    ]
  },
  {
    id: 'q10', axis: 'value',
    category: '소비 및 가치관',
    question: '여행 후 가장 기억에 남는 것은?',
    type: 'single',
    options: [
      { label: '📸 사진과 감성적인 순간', value: 'A', scores: { aesthetic: 2, healing: 1 } },
      { label: '🌍 현지 분위기와 경험', value: 'B', scores: { adventure: 2, food: 1 } },
    ]
  },
  {
    id: 'q11', axis: 'stability',
    category: '정서적 안정성',
    question: '여행 짐을 쌀 때 나의 스타일은?',
    type: 'single',
    options: [
      { label: '🧳 혹시 몰라 이것저것 많이 챙긴다', value: 'A', scores: { safe: 2, plan: 1 } },
      { label: '🎒 꼭 필요한 것만 가볍게 챙긴다', value: 'B', scores: { spontaneous: 2, adventure: 1 } },
    ]
  },
  {
    id: 'q12', axis: 'stability',
    category: '정서적 안정성',
    question: '갑작스러운 폭우로 일정이 틀어졌을 때 나는?',
    type: 'single',
    options: [
      { label: '😰 스트레스를 크게 받는다', value: 'A', scores: { safe: 2, plan: 1 } },
      { label: '🌂 새로운 실내 코스로 유연하게 바꾼다', value: 'B', scores: { spontaneous: 2, easygoing: 1 } },
    ]
  },
];

/* ── 8가지 여행 유형 ─────────────────────────── */
const TRAVEL_TYPES = {
  master_planner: {
    key: 'master_planner',
    emoji: '🗺️',
    name: '철두철미한 인간 엑셀',
    sub: 'The Master Planner',
    desc: '동선 효율과 일정 완성도를 중요하게 생각하는 유형입니다. 꼼꼼한 계획으로 알찬 여행을 만들어가며, 예상치 못한 상황에도 Plan B가 준비되어 있습니다.',
    tags: ['계획형', '안전추구', '활동형'],
    rec: { 
      attraction: ['유명 관광지', '복합 문화공간', '경복궁', '남산타워'], 
      accommodation: ['비즈니스 호텔', '체인 호텔', '리조트'], 
      activity: ['시티투어 버스', '문화 해설 투어', '예약제 체험'], 
      cafe: ['예약 가능한 브런치 카페', '유명 디저트 카페'] 
    },
    color: '#4F7EFF',
    psychologicalBasis: 'Big Five의 높은 성실성(Conscientiousness), Plog의 Psychocentric 성향',
    characteristics: [
      '세밀한 일정 계획 선호',
      '리스크 최소화 추구',
      '효율적인 동선 중시',
      '예약과 사전 준비 철저'
    ]
  },
  free_spirit: {
    key: 'free_spirit',
    emoji: '🎒',
    name: '자유로운 프로 방랑러',
    sub: 'The Free Spirit',
    desc: '새로운 장소와 예상치 못한 경험을 즐기는 유형입니다. 계획보다 현재 순간을 즐기며, 로컬 문화에 자연스럽게 스며드는 여행을 선호합니다.',
    tags: ['즉흥형', '모험추구', '활동형'],
    rec: { 
      attraction: ['소도시 골목', '로컬 시장', '숨겨진 해변', '비밀 명소'], 
      accommodation: ['게스트하우스', '에어비앤비', '호스텔'], 
      activity: ['로컬 투어', '히치하이킹', '즉흥 액티비티'], 
      cafe: ['로컬 카페', '골목 카페', '이색 카페'] 
    },
    color: '#F6AD55',
    psychologicalBasis: 'Big Five의 높은 개방성(Openness), Plog의 Allocentric 성향',
    characteristics: [
      '즉흥적 의사결정',
      '새로운 경험 추구',
      '유연한 일정 선호',
      '현지 문화 몰입'
    ]
  },
  cozy_healer: {
    key: 'cozy_healer',
    emoji: '🌿',
    name: '에너지를 충전하는 칩거형',
    sub: 'The Cozy Healer',
    desc: '쉼과 힐링 중심의 여행을 선호하는 유형입니다. 바쁜 일상에서 벗어나 자연과 함께 에너지를 충전하는 것을 가장 중요하게 생각합니다.',
    tags: ['계획형', '안전추구', '휴식형'],
    rec: { 
      attraction: ['제주 협재해수욕장', '남해 독일마을', '순천만 습지', '오대산'], 
      accommodation: ['풀빌라', '리조트', '스파 호텔', '오션뷰 펜션'], 
      activity: ['스파', '요가', '명상', '온천'], 
      cafe: ['오션뷰 카페', '산속 카페', '힐링 카페'] 
    },
    color: '#48BB78',
    psychologicalBasis: 'Crompton의 휴식과 이완(Relaxation) 동기, 낮은 활동성',
    characteristics: [
      '휴식 중심 일정',
      '자연 친화적',
      '느린 템포 선호',
      '재충전 목적'
    ]
  },
  trend_setter: {
    key: 'trend_setter',
    emoji: '📸',
    name: '트렌디한 감성 사냥꾼',
    sub: 'The Trend Setter',
    desc: '감성 공간과 SNS 핫플레이스를 선호하는 유형입니다. 아름다운 사진과 감성적인 순간을 포착하는 것을 즐기며, 트렌디한 장소를 발굴합니다.',
    tags: ['즉흥형', '안전추구', '감성형'],
    rec: { 
      attraction: ['감천문화마을', '북촌한옥마을', '야경 명소', '포토 스팟'], 
      accommodation: ['감성 숙소', '루프탑 호텔', '한옥 스테이'], 
      activity: ['사진 투어', '야경 투어', '공예 체험'], 
      cafe: ['감성 카페', '루프탑 카페', '한옥 카페', '디저트 카페'] 
    },
    color: '#ED64A6',
    psychologicalBasis: 'VALS의 Innovators, 높은 심미성(Aesthetic) 추구',
    characteristics: [
      '시각적 아름다움 중시',
      '트렌드 민감',
      'SNS 공유 활발',
      '감성적 경험 추구'
    ]
  },
  action_seeker: {
    key: 'action_seeker',
    emoji: '🏃',
    name: '익스트림 중독 활동가',
    sub: 'The Action Seeker',
    desc: '몸을 움직이는 여행을 선호하는 유형입니다. 스릴 넘치는 액티비티와 도전적인 경험을 통해 여행의 즐거움을 극대화합니다.',
    tags: ['모험추구', '활동형'],
    rec: { 
      attraction: ['한라산', '설악산', '해운대', '가평'], 
      accommodation: ['리조트', '캠핑장', '글램핑'], 
      activity: ['서핑', '패러글라이딩', '래프팅', 'ATV', '짚라인'], 
      cafe: ['해변 카페', '아웃도어 카페'] 
    },
    color: '#FC8181',
    psychologicalBasis: 'Crompton의 새로운 경험(Novelty) 동기, 높은 활동성',
    characteristics: [
      '신체 활동 선호',
      '스릴 추구',
      '도전적 경험',
      '에너지 넘침'
    ]
  },
  local_gourmet: {
    key: 'local_gourmet',
    emoji: '🍜',
    name: '로컬 헤리티지 미식가',
    sub: 'The Local Gourmet',
    desc: '지역 문화와 음식을 깊게 경험하는 유형입니다. 현지인이 즐기는 진짜 맛집을 찾아다니며, 음식을 통해 그 지역의 문화를 이해합니다.',
    tags: ['계획형', '모험추구', '미식형'],
    rec: { 
      attraction: ['전통시장', '로컬 골목', '전주한옥마을', '광장시장'], 
      accommodation: ['한옥 스테이', '로컬 게스트하우스'], 
      activity: ['쿠킹 클래스', '야시장 투어', '전통주 체험'], 
      cafe: ['전통 찻집', '로컬 카페', '디저트 카페'] 
    },
    color: '#F6AD55',
    psychologicalBasis: 'Crompton의 교육과 학습(Education) 동기, 문화 몰입',
    characteristics: [
      '음식 중심 여행',
      '현지 문화 탐구',
      '맛집 리서치 철저',
      '미식 경험 중시'
    ]
  },
  easy_going: {
    key: 'easy_going',
    emoji: '🤝',
    name: '모두가 즐거운 평화주의자',
    sub: 'The Easy-Going Companion',
    desc: '누구와도 편하게 여행하는 유형입니다. 동행의 의견을 존중하며 모두가 즐거운 여행을 만들어가는 것을 중요하게 생각합니다.',
    tags: ['절충형', '순응형', '안정형'],
    rec: { 
      attraction: ['테마파크', '가족 여행지', '유명 관광지'], 
      accommodation: ['대형 리조트', '패밀리 호텔'], 
      activity: ['단체 액티비티', '테마파크', '문화 체험'], 
      cafe: ['대형 카페', '뷰 카페'] 
    },
    color: '#68D391',
    psychologicalBasis: 'Big Five의 높은 친화성(Agreeableness), 사회적 조화 추구',
    characteristics: [
      '타협과 조율 능력',
      '그룹 여행 적합',
      '갈등 회피',
      '포용적 태도'
    ]
  },
  lone_wanderer: {
    key: 'lone_wanderer',
    emoji: '🧭',
    name: '고독한 사색가',
    sub: 'The Lone Wanderer',
    desc: '혼자만의 여행과 사색을 즐기는 유형입니다. 자신만의 페이스로 여행하며, 조용한 공간에서 깊은 사색과 자기 성찰을 즐깁니다.',
    tags: ['독립형', '모험추구형'],
    rec: { 
      attraction: ['조용한 소도시', '독립서점', '사찰', '로컬 골목'], 
      accommodation: ['템플스테이', '독채 숙소', '조용한 게스트하우스'], 
      activity: ['템플스테이', '명상', '혼자 트레킹'], 
      cafe: ['독립 서점 카페', '조용한 카페', '한옥 찻집'] 
    },
    color: '#9F7AEA',
    psychologicalBasis: 'Crompton의 자아 탐색(Self-exploration) 동기, 높은 독립성',
    characteristics: [
      '혼자 여행 선호',
      '내적 성찰',
      '자유로운 일정',
      '조용한 환경 추구'
    ]
  },
};

// 모듈 내보내기 (Node.js 환경)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUIZ_QUESTIONS, TRAVEL_TYPES };
}
