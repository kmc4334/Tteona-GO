/* ══════════════════════════════════════════════
   data.js — 떠나GO 데이터 정의
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
    rec: { attraction: ['유명 관광지', '복합 문화공간', '경복궁', '남산타워'], accommodation: ['비즈니스 호텔', '체인 호텔', '리조트'], activity: ['시티투어 버스', '문화 해설 투어', '예약제 체험'], cafe: ['예약 가능한 브런치 카페', '유명 디저트 카페'] },
    color: '#4F7EFF',
  },
  free_spirit: {
    key: 'free_spirit',
    emoji: '🎒',
    name: '자유로운 프로 방랑러',
    sub: 'The Free Spirit',
    desc: '새로운 장소와 예상치 못한 경험을 즐기는 유형입니다. 계획보다 현재 순간을 즐기며, 로컬 문화에 자연스럽게 스며드는 여행을 선호합니다.',
    tags: ['즉흥형', '모험추구', '활동형'],
    rec: { attraction: ['소도시 골목', '로컬 시장', '숨겨진 해변', '비밀 명소'], accommodation: ['게스트하우스', '에어비앤비', '호스텔'], activity: ['로컬 투어', '히치하이킹', '즉흥 액티비티'], cafe: ['로컬 카페', '골목 카페', '이색 카페'] },
    color: '#F6AD55',
  },
  cozy_healer: {
    key: 'cozy_healer',
    emoji: '🌿',
    name: '에너지를 충전하는 칩거형',
    sub: 'The Cozy Healer',
    desc: '쉼과 힐링 중심의 여행을 선호하는 유형입니다. 바쁜 일상에서 벗어나 자연과 함께 에너지를 충전하는 것을 가장 중요하게 생각합니다.',
    tags: ['계획형', '안전추구', '휴식형'],
    rec: { attraction: ['제주 협재해수욕장', '남해 독일마을', '순천만 습지', '오대산'], accommodation: ['풀빌라', '리조트', '스파 호텔', '오션뷰 펜션'], activity: ['스파', '요가', '명상', '온천'], cafe: ['오션뷰 카페', '산속 카페', '힐링 카페'] },
    color: '#48BB78',
  },
  trend_setter: {
    key: 'trend_setter',
    emoji: '📸',
    name: '트렌디한 감성 사냥꾼',
    sub: 'The Trend Setter',
    desc: '감성 공간과 SNS 핫플레이스를 선호하는 유형입니다. 아름다운 사진과 감성적인 순간을 포착하는 것을 즐기며, 트렌디한 장소를 발굴합니다.',
    tags: ['즉흥형', '안전추구', '감성형'],
    rec: { attraction: ['감천문화마을', '북촌한옥마을', '야경 명소', '포토 스팟'], accommodation: ['감성 숙소', '루프탑 호텔', '한옥 스테이'], activity: ['사진 투어', '야경 투어', '공예 체험'], cafe: ['감성 카페', '루프탑 카페', '한옥 카페', '디저트 카페'] },
    color: '#ED64A6',
  },
  action_seeker: {
    key: 'action_seeker',
    emoji: '🏃',
    name: '익스트림 중독 활동가',
    sub: 'The Action Seeker',
    desc: '몸을 움직이는 여행을 선호하는 유형입니다. 스릴 넘치는 액티비티와 도전적인 경험을 통해 여행의 즐거움을 극대화합니다.',
    tags: ['모험추구', '활동형'],
    rec: { attraction: ['한라산', '설악산', '해운대', '가평'], accommodation: ['리조트', '캠핑장', '글램핑'], activity: ['서핑', '패러글라이딩', '래프팅', 'ATV', '짚라인'], cafe: ['해변 카페', '아웃도어 카페'] },
    color: '#FC8181',
  },
  local_gourmet: {
    key: 'local_gourmet',
    emoji: '🍜',
    name: '로컬 헤리티지 미식가',
    sub: 'The Local Gourmet',
    desc: '지역 문화와 음식을 깊게 경험하는 유형입니다. 현지인이 즐기는 진짜 맛집을 찾아다니며, 음식을 통해 그 지역의 문화를 이해합니다.',
    tags: ['계획형', '모험추구', '미식형'],
    rec: { attraction: ['전통시장', '로컬 골목', '전주한옥마을', '광장시장'], accommodation: ['한옥 스테이', '로컬 게스트하우스'], activity: ['쿠킹 클래스', '야시장 투어', '전통주 체험'], cafe: ['전통 찻집', '로컬 카페', '디저트 카페'] },
    color: '#F6AD55',
  },
  easy_going: {
    key: 'easy_going',
    emoji: '🤝',
    name: '모두가 즐거운 평화주의자',
    sub: 'The Easy-Going Companion',
    desc: '누구와도 편하게 여행하는 유형입니다. 동행의 의견을 존중하며 모두가 즐거운 여행을 만들어가는 것을 중요하게 생각합니다.',
    tags: ['절충형', '순응형', '안정형'],
    rec: { attraction: ['테마파크', '가족 여행지', '유명 관광지'], accommodation: ['대형 리조트', '패밀리 호텔'], activity: ['단체 액티비티', '테마파크', '문화 체험'], cafe: ['대형 카페', '뷰 카페'] },
    color: '#68D391',
  },
  lone_wanderer: {
    key: 'lone_wanderer',
    emoji: '🧭',
    name: '고독한 사색가',
    sub: 'The Lone Wanderer',
    desc: '혼자만의 여행과 사색을 즐기는 유형입니다. 자신만의 페이스로 여행하며, 조용한 공간에서 깊은 사색과 자기 성찰을 즐깁니다.',
    tags: ['독립형', '모험추구형'],
    rec: { attraction: ['조용한 소도시', '독립서점', '사찰', '로컬 골목'], accommodation: ['템플스테이', '독채 숙소', '조용한 게스트하우스'], activity: ['템플스테이', '명상', '혼자 트레킹'], cafe: ['독립 서점 카페', '조용한 카페', '한옥 찻집'] },
    color: '#9F7AEA',
  },
};

/* ── 유형 판별 알고리즘 ──────────────────────── */
function calcTravelType(answers) {
  const score = {
    plan: 0, spontaneous: 0, adventure: 0, safe: 0,
    active: 0, rest: 0, social: 0, solo: 0,
    healing: 0, aesthetic: 0, food: 0, nature: 0,
    easygoing: 0,
  };

  QUIZ_QUESTIONS.forEach(q => {
    const ans = answers[q.id];
    if (!ans) return;
    const opt = q.options.find(o => o.value === ans);
    if (!opt) return;
    Object.entries(opt.scores).forEach(([k, v]) => { score[k] = (score[k] || 0) + v; });
  });

  // 8가지 유형 매핑 규칙
  const planScore = score.plan - score.spontaneous;
  const adventureScore = score.adventure - score.safe;
  const activeScore = score.active - score.rest;
  const socialScore = score.social - score.solo;

  // 우선순위 규칙으로 유형 결정
  if (score.easygoing >= 2 && socialScore >= 1) return 'easy_going';
  if (score.solo >= 3 && adventureScore >= 1) return 'lone_wanderer';
  if (score.food >= 3 && adventureScore >= 1) return 'local_gourmet';
  if (activeScore >= 3 && adventureScore >= 2) return 'action_seeker';
  if (score.aesthetic >= 3) return 'trend_setter';
  if (score.healing >= 3 && planScore >= 0) return 'cozy_healer';
  if (adventureScore >= 3 && planScore < 0) return 'free_spirit';
  if (planScore >= 3) return 'master_planner';

  // 점수 합산으로 최종 결정
  const typeScores = {
    master_planner: score.plan * 2 + score.safe,
    free_spirit: score.spontaneous * 2 + score.adventure,
    cozy_healer: score.healing * 2 + score.rest,
    trend_setter: score.aesthetic * 2,
    action_seeker: score.active * 2 + score.adventure,
    local_gourmet: score.food * 2 + score.adventure,
    easy_going: score.easygoing * 2 + score.social,
    lone_wanderer: score.solo * 2 + score.adventure,
  };
  return Object.entries(typeScores).sort((a, b) => b[1] - a[1])[0][0];
}

/* ── 장소 DB ─────────────────────────────────── */
const PLACES_DB = [
  { id:'p001', name:'해운대 해변', category:'attraction', city:'부산', region:'부산', tags:['해변','자연','감성'], rating:4.8, price:'free', duration:120, desc:'부산을 대표하는 해수욕장으로, 아름다운 백사장과 에메랄드빛 바다가 펼쳐집니다.', address:'부산광역시 해운대구 해운대해변로 264', lat:35.1587, lng:129.1604, hours:'24시간', phone:'051-749-7601', img:'🏖' },
  { id:'p002', name:'감천문화마을', category:'attraction', city:'부산', region:'부산', tags:['감성','문화','야외'], rating:4.7, price:'free', duration:90, desc:'알록달록한 색깔의 집들이 계단식으로 늘어선 부산의 대표 감성 명소입니다.', address:'부산광역시 사하구 감내2로 203', lat:35.0975, lng:129.0103, hours:'09:00-18:00', phone:'051-204-1444', img:'🎨' },
  { id:'p003', name:'광안리 해변', category:'attraction', city:'부산', region:'부산', tags:['야경','해변','감성'], rating:4.6, price:'free', duration:100, desc:'광안대교의 화려한 야경으로 유명한 해변입니다.', address:'부산광역시 수영구 광안해변로 219', lat:35.1531, lng:129.1186, hours:'24시간', phone:'051-610-4251', img:'🌉' },
  { id:'p004', name:'성산일출봉', category:'attraction', city:'제주', region:'제주', tags:['자연','야외','힐링'], rating:4.9, price:'cheap', duration:150, desc:'유네스코 세계자연유산으로 지정된 제주의 대표 명소입니다.', address:'제주특별자치도 서귀포시 성산읍 일출로 284-12', lat:33.4580, lng:126.9425, hours:'07:00-20:00', phone:'064-783-0959', img:'🌋' },
  { id:'p005', name:'협재해수욕장', category:'attraction', city:'제주', region:'제주', tags:['해변','힐링','자연'], rating:4.7, price:'free', duration:120, desc:'에메랄드빛 바다와 하얀 모래사장이 아름다운 제주 서쪽의 해수욕장입니다.', address:'제주특별자치도 제주시 한림읍 협재리 2497-1', lat:33.3942, lng:126.2394, hours:'24시간', phone:'064-728-3394', img:'🏝' },
  { id:'p006', name:'경복궁', category:'attraction', city:'서울', region:'서울', tags:['문화','역사','야외'], rating:4.7, price:'cheap', duration:180, desc:'조선 왕조의 정궁으로, 한국의 전통 건축미를 감상할 수 있습니다.', address:'서울특별시 종로구 사직로 161', lat:37.5796, lng:126.9770, hours:'09:00-18:00', phone:'02-3700-3900', img:'🏯' },
  { id:'p007', name:'북촌한옥마을', category:'attraction', city:'서울', region:'서울', tags:['감성','문화','조용'], rating:4.5, price:'free', duration:90, desc:'600년 역사를 간직한 한옥 마을로, 전통과 현대가 공존하는 서울의 감성 명소입니다.', address:'서울특별시 종로구 계동길 37', lat:37.5826, lng:126.9830, hours:'24시간', phone:'02-2133-1371', img:'🏘' },
  { id:'p008', name:'남산타워', category:'attraction', city:'서울', region:'서울', tags:['야경','감성','자연'], rating:4.6, price:'moderate', duration:120, desc:'서울 야경의 상징인 남산타워입니다. 전망대에서 서울 전경을 360도로 감상할 수 있습니다.', address:'서울특별시 용산구 남산공원길 105', lat:37.5512, lng:126.9882, hours:'10:00-23:00', phone:'02-3455-9277', img:'🗼' },
  { id:'p009', name:'전주한옥마을', category:'attraction', city:'전주', region:'전주', tags:['문화','감성','맛집'], rating:4.8, price:'free', duration:180, desc:'700여 채의 한옥이 모여 있는 전통 마을입니다.', address:'전라북도 전주시 완산구 기린대로 99', lat:35.8150, lng:127.1530, hours:'24시간', phone:'063-282-1330', img:'🏡' },
  { id:'p010', name:'여수 밤바다', category:'attraction', city:'여수', region:'여수', tags:['야경','감성','자연'], rating:4.9, price:'free', duration:120, desc:'노래로도 유명한 여수의 아름다운 밤바다입니다.', address:'전라남도 여수시 돌산읍 돌산로', lat:34.7604, lng:127.6622, hours:'24시간', phone:'061-659-1819', img:'🌊' },
  { id:'p011', name:'오션뷰 카페 블루', category:'cafe', city:'강릉', region:'강릉', tags:['카페','감성','바다뷰'], rating:4.6, price:'cheap', duration:60, desc:'강릉 바다가 한눈에 보이는 오션뷰 카페입니다.', address:'강원도 강릉시 강문동 해안로 123', lat:37.7749, lng:128.9384, hours:'09:00-21:00', phone:'033-123-4567', img:'☕' },
  { id:'p012', name:'한옥 찻집 고요', category:'cafe', city:'전주', region:'전주', tags:['카페','문화','감성'], rating:4.7, price:'cheap', duration:60, desc:'전주한옥마을 내 위치한 전통 찻집입니다.', address:'전라북도 전주시 완산구 은행로 55', lat:35.8155, lng:127.1535, hours:'10:00-20:00', phone:'063-234-5678', img:'🍵' },
  { id:'p013', name:'루프탑 카페 스카이', category:'cafe', city:'서울', region:'서울', tags:['카페','야경','감성'], rating:4.5, price:'moderate', duration:90, desc:'서울 도심의 야경을 감상할 수 있는 루프탑 카페입니다.', address:'서울특별시 마포구 홍익로 123', lat:37.5563, lng:126.9236, hours:'12:00-24:00', phone:'02-345-6789', img:'🌃' },
  { id:'p014', name:'제주 서핑 스쿨', category:'activity', city:'제주', region:'제주', tags:['액티비티','야외','자연'], rating:4.8, price:'moderate', duration:180, desc:'제주 중문 해변에서 즐기는 서핑 체험입니다.', address:'제주특별자치도 서귀포시 중문관광로 72번길', lat:33.2441, lng:126.4120, hours:'09:00-18:00', phone:'064-456-7890', img:'🏄' },
  { id:'p015', name:'강원 래프팅', category:'activity', city:'강원', region:'강원', tags:['액티비티','자연','야외'], rating:4.7, price:'moderate', duration:240, desc:'한탄강에서 즐기는 스릴 넘치는 래프팅 체험입니다.', address:'강원도 철원군 동송읍 한탄강로 1234', lat:38.1234, lng:127.3456, hours:'09:00-17:00', phone:'033-567-8901', img:'🚣' },
  { id:'p016', name:'부산 오션뷰 호텔', category:'accommodation', city:'부산', region:'부산', tags:['숙소','바다뷰','감성'], rating:4.7, price:'expensive', duration:0, desc:'해운대 해변 바로 앞에 위치한 오션뷰 호텔입니다.', address:'부산광역시 해운대구 해운대해변로 296', lat:35.1590, lng:129.1610, hours:'체크인 15:00', phone:'051-789-0123', img:'🏨' },
  { id:'p017', name:'제주 풀빌라 리조트', category:'accommodation', city:'제주', region:'제주', tags:['숙소','힐링','감성'], rating:4.9, price:'expensive', duration:0, desc:'프라이빗 풀이 딸린 제주 감성 풀빌라입니다.', address:'제주특별자치도 서귀포시 안덕면 산록남로 1234', lat:33.3012, lng:126.3456, hours:'체크인 15:00', phone:'064-890-1234', img:'🏊' },
  { id:'p018', name:'전주 한옥 스테이', category:'accommodation', city:'전주', region:'전주', tags:['숙소','문화','감성'], rating:4.8, price:'moderate', duration:0, desc:'전주한옥마을 내 위치한 전통 한옥 숙소입니다.', address:'전라북도 전주시 완산구 교동 123', lat:35.8160, lng:127.1540, hours:'체크인 15:00', phone:'063-901-2345', img:'🏯' },
];

const SEASON_RECS = [
  { id:'s001', name:'제주 유채꽃 여행', category:'attraction', city:'제주', tags:['자연','감성'], rating:4.9, price:'free', img:'🌼', desc:'봄철 제주의 노란 유채꽃밭이 장관을 이룹니다.' },
  { id:'s002', name:'강릉 바다 여행', category:'attraction', city:'강릉', tags:['해변','힐링'], rating:4.7, price:'free', img:'🌊', desc:'동해의 푸른 바다와 강릉 커피거리를 함께 즐겨보세요.' },
  { id:'s003', name:'경주 벚꽃 여행', category:'attraction', city:'경주', tags:['문화','감성'], rating:4.8, price:'cheap', img:'🌸', desc:'천년 고도 경주에서 벚꽃과 역사를 함께 즐기세요.' },
  { id:'s004', name:'남해 힐링 여행', category:'attraction', city:'남해', tags:['자연','힐링'], rating:4.6, price:'free', img:'🌿', desc:'남해의 아름다운 자연 속에서 완전한 힐링을 경험하세요.' },
];

const THEME_RECS = [
  { id:'t001', name:'숲캉스 패키지', category:'activity', city:'강원', tags:['힐링','자연'], rating:4.8, price:'moderate', img:'🌲', desc:'강원도 깊은 숲속에서 즐기는 힐링 캠핑 패키지입니다.' },
  { id:'t002', name:'감성 카페 투어', category:'cafe', city:'서울', tags:['감성','카페'], rating:4.7, price:'cheap', img:'☕', desc:'서울 핫플 감성 카페를 한 번에 즐기는 투어입니다.' },
  { id:'t003', name:'지역 맛집 투어', category:'restaurant', city:'부산', tags:['맛집','문화'], rating:4.9, price:'cheap', img:'🍜', desc:'부산 현지인이 추천하는 숨은 맛집 투어입니다.' },
  { id:'t004', name:'해양 스포츠 패키지', category:'activity', city:'제주', tags:['액티비티','야외'], rating:4.8, price:'moderate', img:'🏄', desc:'서핑, 스노클링, 제트스키를 한 번에 즐기는 패키지입니다.' },
];
