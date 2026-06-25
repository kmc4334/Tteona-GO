/* ══════════════════════════════════════════════
   떠나GO — app.js
   ══════════════════════════════════════════════ */

/* ── 전역 상태 ───────────────────────────────── */
const state = {
  quizAnswers: {},
  budget: 500000,
  travelTypeKey: null,
  preferences: null,
  favorites: JSON.parse(localStorage.getItem('ttaerago_favs') || '[]'),
  selectedItems: [],
  fromPlanDay: null,
  planInfo: null,
  planSchedule: [],
  currentDetail: null,
  prevPage: null,
};

/* ── localStorage 일정 관리 ───────────────────── */
function savePlanToStorage() {
  if (!state.planInfo) return;
  const planData = {
    info: state.planInfo,
    schedule: state.planSchedule,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem('ttaerago_plan', JSON.stringify(planData));
  console.log('✅ 일정 저장 완료');
}

function loadPlanFromStorage() {
  const saved = localStorage.getItem('ttaerago_plan');
  if (!saved) return false;
  try {
    const planData = JSON.parse(saved);
    state.planInfo = planData.info;
    state.planSchedule = planData.schedule;
    console.log('✅ 일정 불러오기 완료');
    return true;
  } catch (e) {
    console.error('❌ 일정 불러오기 실패:', e);
    return false;
  }
}

function clearPlanFromStorage() {
  localStorage.removeItem('ttaerago_plan');
  state.planInfo = null;
  state.planSchedule = [];
  console.log('✅ 일정 초기화 완료');
}

/* ── 페이지 전환 ──────────────────────────────── */
function goToPage(name) {
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === name));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${name}`).classList.add('active');
  window.scrollTo(0, 0);
}
document.querySelectorAll('.nav-btn').forEach(btn =>
  btn.addEventListener('click', () => goToPage(btn.dataset.page)));

/* ══════════════════════════════════════════════
   ① 퀴즈 (12문항 + 예산)
   ══════════════════════════════════════════════ */
console.log('🔍 퀴즈 모듈 로드 시작');
console.log('QUIZ_QUESTIONS:', typeof QUIZ_QUESTIONS, QUIZ_QUESTIONS?.length);

const TOTAL_STEPS = QUIZ_QUESTIONS.length + 1; // 12 + 예산
let currentStep = 0;

function renderQuiz() {
  console.log('🎯 renderQuiz 호출, currentStep:', currentStep);
  
  const container  = document.getElementById('quiz-container');
  const budgetStep = document.getElementById('budget-step');
  const btnPrev    = document.getElementById('btn-prev');
  const btnNext    = document.getElementById('btn-next');
  const fill       = document.getElementById('progress-fill');
  const label      = document.getElementById('progress-label');

  if (!container || !budgetStep || !btnPrev || !btnNext || !fill || !label) {
    console.error('❌ DOM 요소를 찾을 수 없습니다:', {
      container: !!container,
      budgetStep: !!budgetStep,
      btnPrev: !!btnPrev,
      btnNext: !!btnNext,
      fill: !!fill,
      label: !!label
    });
    return;
  }

  const pct = ((currentStep + 1) / TOTAL_STEPS) * 100;
  fill.style.width = pct + '%';
  label.textContent = `${currentStep + 1} / ${TOTAL_STEPS}`;
  btnPrev.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  btnNext.textContent = currentStep === TOTAL_STEPS - 1 ? '성향 분석 확인 →' : '다음 →';

  if (currentStep === QUIZ_QUESTIONS.length) {
    container.innerHTML = '';
    budgetStep.classList.remove('hidden');
    console.log('✅ 예산 단계 표시');
    return;
  }
  budgetStep.classList.add('hidden');

  const q = QUIZ_QUESTIONS[currentStep];
  console.log('📝 질문 렌더링:', q.id, q.question);
  const saved = state.quizAnswers[q.id];

  container.innerHTML = `
    <div class="quiz-card">
      <span class="quiz-category">${q.category}</span>
      <div class="quiz-question">Q${currentStep + 1}. ${q.question}</div>
      <div class="quiz-options">
        ${q.options.map(opt => {
          const sel = saved === opt.value;
          return `<button class="quiz-option ${sel ? 'selected' : ''}" data-val="${opt.value}">${opt.label}</button>`;
        }).join('')}
      </div>
    </div>`;

  container.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      state.quizAnswers[q.id] = btn.dataset.val;
      container.querySelectorAll('.quiz-option').forEach(b =>
        b.classList.toggle('selected', b.dataset.val === btn.dataset.val));
      console.log('✓ 답변 선택:', q.id, btn.dataset.val);
    });
  });
}

document.getElementById('btn-next').addEventListener('click', () => {
  console.log('▶ 다음 버튼 클릭');
  if (currentStep < QUIZ_QUESTIONS.length) {
    if (!state.quizAnswers[QUIZ_QUESTIONS[currentStep].id]) {
      alert('항목을 선택해주세요.'); return;
    }
    currentStep++;
    renderQuiz();
  } else {
    submitQuiz();
  }
});

document.getElementById('btn-prev').addEventListener('click', () => {
  console.log('◀ 이전 버튼 클릭');
  if (currentStep > 0) { currentStep--; renderQuiz(); }
});

// DOM이 완전히 로드된 후 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM 로드 완료, 초기 퀴즈 렌더링 시작');
    renderQuiz();
  });
} else {
  console.log('🚀 초기 퀴즈 렌더링 시작');
  renderQuiz();
}

/* ── 예산 슬라이더 ───────────────────────────── */
const budgetSlider  = document.getElementById('budget-slider');
const budgetInput   = document.getElementById('budget-input');
const budgetDisplay = document.getElementById('budget-display');

function updateBudgetUI(val) {
  state.budget = parseInt(val);
  budgetInput.value = val;
  budgetSlider.value = val;
  budgetDisplay.textContent = parseInt(val).toLocaleString('ko-KR') + '원';
  const pct = ((val - 100000) / (5000000 - 100000)) * 100;
  budgetSlider.style.background =
    `linear-gradient(to right, var(--primary) ${pct}%, var(--border) ${pct}%)`;
}
budgetSlider.addEventListener('input', e => updateBudgetUI(e.target.value));
budgetInput.addEventListener('input', e => {
  let v = Math.max(100000, Math.min(5000000, parseInt(e.target.value) || 100000));
  updateBudgetUI(v);
});
updateBudgetUI(500000);

/* ══════════════════════════════════════════════
   ② 성향 분석 제출 → 같은 페이지에 결과 표시
   ══════════════════════════════════════════════ */
async function submitQuiz() {
  // 오버레이 표시
  const overlay = document.getElementById('analyzing-overlay');
  overlay.classList.remove('hidden');
  window.scrollTo(0, 0);

  // 유형 계산
  const typeKey = calcTravelType(state.quizAnswers);
  state.travelTypeKey = typeKey;

  // API 호출 (실패해도 로컬 계산으로 진행)
  try {
    const typeInfo = TRAVEL_TYPES[typeKey];
    const payload = {
      user_id: 'user_' + Date.now(),
      travel_style: typeInfo.tags,
      budget: state.budget > 1500000 ? 'high' : state.budget > 500000 ? 'medium' : 'low',
      activity_level: ['action_seeker','free_spirit'].includes(typeKey) ? 'high'
        : ['cozy_healer','lone_wanderer'].includes(typeKey) ? 'low' : 'medium',
      food_interest: ['local_gourmet','free_spirit'].includes(typeKey),
      duration: 3,
    };
    const res = await fetch('/api/preference/init', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    state.preferences = await res.json();
  } catch { state.preferences = null; }

  // 1.5초 후 오버레이 제거 + 결과 표시
  setTimeout(() => {
    overlay.classList.add('hidden');
    showResult();
  }, 1500);
}

function showResult() {
  document.getElementById('quiz-section').classList.add('hidden');
  const resultSec = document.getElementById('result-section');
  resultSec.classList.remove('hidden');
  window.scrollTo(0, 0);

  const typeInfo = TRAVEL_TYPES[state.travelTypeKey];

  // 유형 카드
  document.getElementById('type-emoji').textContent = typeInfo.emoji;
  document.getElementById('type-sub').textContent   = typeInfo.sub;
  document.getElementById('type-name').textContent  = `당신은 "${typeInfo.name}"입니다`;
  document.getElementById('type-desc').textContent  = typeInfo.desc;
  document.getElementById('type-tags').innerHTML    =
    typeInfo.tags.map(t => `<span class="type-tag-chip">#${t}</span>`).join('');

  // 성향 축 바
  const axisLabels = {
    plan: '계획성', spontaneous: '즉흥성', adventure: '모험심',
    safe: '안전추구', active: '활동성', rest: '휴식선호',
    social: '사교성', solo: '독립성', healing: '힐링', aesthetic: '감성',
  };
  const score = {};
  QUIZ_QUESTIONS.forEach(q => {
    const ans = state.quizAnswers[q.id];
    const opt = q.options.find(o => o.value === ans);
    if (opt) Object.entries(opt.scores).forEach(([k, v]) => { score[k] = (score[k] || 0) + v; });
  });
  const topAxes = Object.entries(score)
    .filter(([k]) => axisLabels[k])
    .sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxVal = topAxes[0]?.[1] || 1;
  document.getElementById('profile-bars').innerHTML = topAxes.map(([k, v]) => `
    <div class="profile-bar-item">
      <div class="profile-bar-label"><span>${axisLabels[k]}</span><span>${Math.round(v/maxVal*100)}%</span></div>
      <div class="profile-bar-track">
        <div class="profile-bar-fill" style="width:${(v/maxVal*100).toFixed(1)}%"></div>
      </div>
    </div>`).join('');

  // 같은 유형 추천 초기화
  renderSimilarRec('attraction');
}

function renderSimilarRec(cat) {
  const typeInfo = TRAVEL_TYPES[state.travelTypeKey];
  if (!typeInfo) return;
  
  const recNames = (typeInfo.rec || {})[cat] || [];
  
  // 추천 이름을 기반으로 PLACES_DB에서 실제 장소 찾기
  const places = [];
  
  // 1단계: 정확한 이름 매칭 또는 부분 매칭
  recNames.forEach(name => {
    const found = PLACES_DB.find(p => 
      p.category === cat && (
        p.name.includes(name) || 
        name.includes(p.name) ||
        p.tags.some(tag => name.toLowerCase().includes(tag.toLowerCase())) ||
        p.city.includes(name)
      )
    );
    if (found && !places.some(pl => pl.id === found.id)) {
      places.push(found);
    }
  });
  
  // 2단계: 카테고리에 맞는 장소가 부족하면 해당 카테고리에서 추가
  if (places.length < 4) {
    const additional = PLACES_DB
      .filter(p => p.category === cat && !places.some(pl => pl.id === p.id))
      .sort((a, b) => b.rating - a.rating) // 평점 높은 순
      .slice(0, 4 - places.length);
    places.push(...additional);
  }
  
  // 3단계: 여전히 부족하면 시즌/테마 추천에서 가져오기
  if (places.length < 4) {
    const seasonTheme = [...SEASON_RECS, ...THEME_RECS]
      .filter(p => p.category === cat && !places.some(pl => pl.id === p.id))
      .slice(0, 4 - places.length);
    places.push(...seasonTheme);
  }
  
  // 장소 카드 렌더링
  const container = document.getElementById('similar-rec-list');
  if (places.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);padding:16px 0;text-align:center;width:100%;">추천 장소가 없습니다.</p>';
    return;
  }
  
  container.innerHTML = places.map(place => makePlaceCard(place, true)).join('');
  
  // 카드 클릭 이벤트
  container.querySelectorAll('.item-card').forEach(card => {
    card.addEventListener('click', () => openDetail(card.dataset.id, 'home'));
  });
}

document.querySelectorAll('.sim-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.sim-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderSimilarRec(tab.dataset.cat);
  });
});

// 다시 검사하기
document.getElementById('btn-retry').addEventListener('click', () => {
  currentStep = 0;
  state.quizAnswers = {};
  state.travelTypeKey = null;
  document.getElementById('result-section').classList.add('hidden');
  document.getElementById('quiz-section').classList.remove('hidden');
  renderQuiz();
  window.scrollTo(0, 0);
});

// 여행 계획 작성하기
document.getElementById('btn-go-plan').addEventListener('click', () => goToPage('plan'));

/* ══════════════════════════════════════════════
   ③ 추천 페이지
   ══════════════════════════════════════════════ */
const THUMB_BG    = { attraction:'#EEF3FF', restaurant:'#FFF5F5', cafe:'#FFFAF0', accommodation:'#F0FFF4', activity:'#F0F4FF' };
const PRICE_CLASS = { free:'price-free', cheap:'price-cheap', moderate:'price-moderate', expensive:'price-expensive' };
const PRICE_LABEL = { free:'무료', cheap:'저렴', moderate:'보통', expensive:'고급' };
const CAT_EMOJI   = { attraction:'🏛', restaurant:'🍽', cafe:'☕', accommodation:'🏨', activity:'🎡' };

/* ── 지역 2-Depth 데이터 ─────────────────────── */
const REGION_DATA = {
  '수도권':  { cities: ['서울','인천','수원','가평','양평','파주','용인','기타 수도권'], theme: '#도심여행 #호캉스 #근교드라이브' },
  '강원권':  { cities: ['춘천','강릉','속초','양양','평창','정선','원주','기타 강원'], theme: '#동해바다 #서핑 #숲캉스 #겨울스포츠' },
  '충청권':  { cities: ['대전','태안','보령','단양','제천','공주','부여','세종','기타 충청'], theme: '#패러글라이딩 #갯벌체험 #역사탐방' },
  '전라북부': { cities: ['전주','군산','부안','고창','기타 전북'], theme: '#한옥스테이 #전통미식 #감성여행' },
  '전라남부': { cities: ['여수','순천','목포','담양','보성','광주','기타 전남'], theme: '#여수밤바다 #남해안섬 #남도미식' },
  '경상북부': { cities: ['대구','경주','안동','포항','영덕','울릉','기타 경북'], theme: '#전통문화 #황리단길 #경주야경' },
  '경상남부': { cities: ['부산','울산','통영','거제','남해','하동','창원','기타 경남'], theme: '#오션뷰 #해양레저 #다도해투어' },
  '제주':    { cities: ['제주시','서귀포시'], theme: '#제주독채 #이국적자연 #한라산' },
};

/* ── 필터 상태 ───────────────────────────────── */
const filterState = {
  category: '',
  zone: '',
  city: '',
  priceMin: 0,
  priceMax: 500000,
};

/* ── 필터 패널 토글 ──────────────────────────── */
document.getElementById('btn-filter-toggle').addEventListener('click', () => {
  const panel = document.getElementById('filter-panel');
  const btn   = document.getElementById('btn-filter-toggle');
  const arrow = document.getElementById('filter-arrow');
  const isOpen = !panel.classList.contains('hidden');
  panel.classList.toggle('hidden', isOpen);
  btn.classList.toggle('active', !isOpen);
  arrow.classList.toggle('open', !isOpen);
});

/* ── 카테고리 필터 칩 ────────────────────────── */
document.querySelectorAll('.filter-chip[data-filter="category"]').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip[data-filter="category"]').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    filterState.category = chip.dataset.val;
    updateFilterBadge();
  });
});

/* ── 지역 1단계: 광역 권역 ───────────────────── */
document.querySelectorAll('.region-zone').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.region-zone').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterState.zone = btn.dataset.zone;
    filterState.city = '';
    renderCityChips(btn.dataset.zone);
    updateFilterBadge();
  });
});

function renderCityChips(zone) {
  const container = document.getElementById('region-cities');
  if (!zone) { container.classList.add('hidden'); return; }
  const data = REGION_DATA[zone];
  if (!data) { container.classList.add('hidden'); return; }
  container.classList.remove('hidden');
  container.innerHTML = `
    <button class="city-chip active" data-city="">전체 ${zone}</button>
    ${data.cities.map(c => `<button class="city-chip" data-city="${c}">${c}</button>`).join('')}
    <span style="width:100%;font-size:.75rem;color:var(--muted);margin-top:4px;">${data.theme}</span>`;
  container.querySelectorAll('.city-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.city-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterState.city = chip.dataset.city;
      updateFilterBadge();
    });
  });
}

/* ── 가격 범위 슬라이더 ──────────────────────── */
const priceMinSlider = document.getElementById('price-min-slider');
const priceMaxSlider = document.getElementById('price-max-slider');
const priceMinInput  = document.getElementById('price-min-input');
const priceMaxInput  = document.getElementById('price-max-input');
const priceRange     = document.getElementById('price-slider-range');

function updatePriceUI() {
  const min = parseInt(priceMinSlider.value);
  const max = parseInt(priceMaxSlider.value);
  const total = 500000;
  const leftPct  = (min / total) * 100;
  const rightPct = (max / total) * 100;
  priceRange.style.left  = leftPct + '%';
  priceRange.style.width = (rightPct - leftPct) + '%';
  priceMinInput.value = min;
  priceMaxInput.value = max;
  filterState.priceMin = min;
  filterState.priceMax = max;
  updateFilterBadge();
}

priceMinSlider.addEventListener('input', () => {
  if (parseInt(priceMinSlider.value) > parseInt(priceMaxSlider.value))
    priceMinSlider.value = priceMaxSlider.value;
  updatePriceUI();
});
priceMaxSlider.addEventListener('input', () => {
  if (parseInt(priceMaxSlider.value) < parseInt(priceMinSlider.value))
    priceMaxSlider.value = priceMinSlider.value;
  updatePriceUI();
});
priceMinInput.addEventListener('input', () => {
  let v = Math.max(0, Math.min(parseInt(priceMinInput.value)||0, filterState.priceMax));
  priceMinSlider.value = v; updatePriceUI();
});
priceMaxInput.addEventListener('input', () => {
  let v = Math.min(500000, Math.max(parseInt(priceMaxInput.value)||0, filterState.priceMin));
  priceMaxSlider.value = v; updatePriceUI();
});
updatePriceUI();

/* ── 필터 배지 업데이트 ──────────────────────── */
function updateFilterBadge() {
  let count = 0;
  if (filterState.category) count++;
  if (filterState.zone) count++;
  if (filterState.priceMin > 0 || filterState.priceMax < 500000) count++;
  const badge = document.getElementById('filter-badge');
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
}

/* ── 필터 초기화 ─────────────────────────────── */
document.getElementById('btn-filter-reset').addEventListener('click', () => {
  filterState.category = '';
  filterState.zone = '';
  filterState.city = '';
  filterState.priceMin = 0;
  filterState.priceMax = 500000;
  document.querySelectorAll('.filter-chip[data-filter="category"]').forEach((c,i) => c.classList.toggle('active', i===0));
  document.querySelectorAll('.region-zone').forEach((b,i) => b.classList.toggle('active', i===0));
  document.getElementById('region-cities').classList.add('hidden');
  priceMinSlider.value = 0; priceMaxSlider.value = 500000; updatePriceUI();
  updateFilterBadge();
});

/* ── 필터 적용 ───────────────────────────────── */
document.getElementById('btn-filter-apply').addEventListener('click', () => {
  document.getElementById('filter-panel').classList.add('hidden');
  document.getElementById('btn-filter-toggle').classList.remove('active');
  document.getElementById('filter-arrow').classList.remove('open');
  doSearch();
});

/* ── 가격 범위 → price 키 변환 ───────────────── */
const PRICE_RANGE_MAP = { free: 0, cheap: 50000, moderate: 150000, expensive: 300000 };
function priceInRange(place) {
  const priceKey = place.price || place.price_range || '';
  const val = PRICE_RANGE_MAP[priceKey] ?? 100000;
  return val >= filterState.priceMin && val <= filterState.priceMax;
}

function makePlaceCard(place, scrollMode = false) {
  const bg = THUMB_BG[place.category] || '#F4F6FB';
  const priceKey = place.price || place.price_range || '';
  const pc = PRICE_CLASS[priceKey] || '';
  const pl = PRICE_LABEL[priceKey] || '';
  const em = place.img || CAT_EMOJI[place.category] || '📍';
  const isSelected = state.selectedItems.some(item => item.id === place.id);
  const selectClass = isSelected ? 'selected' : '';
  const showCheckbox = state.fromPlanDay !== null && state.fromPlanDay !== undefined;
  
  return `
    <div class="item-card ${selectClass}" data-id="${place.id}">
      ${showCheckbox ? `<div class="item-checkbox">${isSelected ? '✓' : ''}</div>` : ''}
      <div class="item-thumb" style="background:${bg}">${em}</div>
      <div class="item-body">
        <div class="item-name">${place.name}</div>
        <div class="item-city">📍 ${place.city || ''}</div>
        <div class="item-tags">${(place.tags||[]).map(t=>`<span class="item-tag">${t}</span>`).join('')}</div>
        <div class="item-meta">
          <span class="item-rating">★ ${place.rating}</span>
          ${pl ? `<span class="item-price ${pc}">${pl}</span>` : ''}
        </div>
      </div>
    </div>`;
}

function initRecSections() {
  const typeKey = state.travelTypeKey || 'cozy_healer';
  const typeRec = TRAVEL_TYPES[typeKey]?.rec || {};
  const simNames = [...(typeRec.attraction||[]), ...(typeRec.cafe||[])];
  const simPlaces = PLACES_DB.filter(p => simNames.some(n => p.name.includes(n.slice(0,3)))).slice(0,6);
  renderScrollRow('rec-similar-row', simPlaces.length ? simPlaces : PLACES_DB.slice(0,6));
  renderScrollRow('rec-season-row', SEASON_RECS);
  renderScrollRow('rec-theme-row', THEME_RECS);
}

function renderScrollRow(id, places) {
  const el = document.getElementById(id);
  el.innerHTML = places.map(p => makePlaceCard(p, true)).join('');
  el.querySelectorAll('.item-card').forEach(card => {
    card.addEventListener('click', () => {
      const placeId = card.dataset.id;
      // 일정 추가 모드인 경우 다중 선택
      if (state.fromPlanDay !== null && state.fromPlanDay !== undefined) {
        const place = findPlace(placeId);
        if (!place) return;
        const idx = state.selectedItems.findIndex(item => item.id === placeId);
        if (idx >= 0) {
          state.selectedItems.splice(idx, 1);
        } else {
          state.selectedItems.push(place);
        }
        document.getElementById('selected-count').textContent = `${state.selectedItems.length}개 선택됨`;
        renderScrollRow(id, places); // 재렌더링
      } else {
        openDetail(placeId, 'recommend');
      }
    });
  });
}

document.querySelector('.nav-btn[data-page="recommend"]').addEventListener('click', () => {
  initRecSections();
  if (!state.fromPlanDay && state.fromPlanDay !== 0)
    document.getElementById('plan-footer').classList.add('hidden');
});

document.querySelectorAll('.chip').forEach(chip =>
  chip.addEventListener('click', () => {
    document.getElementById('search-input').value = chip.dataset.q;
    doSearch();
  }));

document.getElementById('btn-search').addEventListener('click', doSearch);
document.getElementById('search-input').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

async function doSearch() {
  const query = document.getElementById('search-input').value.trim();

  document.getElementById('rec-sections').classList.add('hidden');
  document.getElementById('search-result-wrap').classList.remove('hidden');
  document.getElementById('search-result-title').textContent = query ? `"${query}" 검색 결과` : '전체 장소';
  document.getElementById('recommend-loading').classList.remove('hidden');
  document.getElementById('recommend-grid').innerHTML = '';

  try {
    const res = await fetch('/api/recommend/search', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query, 
        preferences: state.preferences?.weights || {}, 
        filters: { 
          region: filterState.city || filterState.zone, 
          category: filterState.category, 
          price_min: filterState.priceMin,
          price_max: filterState.priceMax
        } 
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    renderSearchGrid(data.items || []);
  } catch {
    // 로컬 필터링 폴백
    let results = PLACES_DB.filter(p => {
      // 지역 필터
      if (filterState.city && p.city !== filterState.city) return false;
      if (filterState.zone && !filterState.city) {
        const zoneData = REGION_DATA[filterState.zone];
        if (zoneData && !zoneData.cities.some(c => p.city.includes(c) || c.includes(p.city))) return false;
      }
      // 카테고리 필터
      if (filterState.category && p.category !== filterState.category) return false;
      // 가격 필터
      if (!priceInRange(p)) return false;
      // 검색어 필터
      if (query) {
        const q = query.toLowerCase();
        return p.name.toLowerCase().includes(q) || 
               p.city.toLowerCase().includes(q) || 
               (p.tags||[]).some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
    renderSearchGrid(results);
  } finally {
    document.getElementById('recommend-loading').classList.add('hidden');
  }
}

function renderSearchGrid(items) {
  const grid = document.getElementById('recommend-grid');
  if (!items.length) { grid.innerHTML = '<p style="color:var(--muted);padding:32px 0">검색 결과가 없습니다.</p>'; return; }
  grid.innerHTML = items.map(item => {
    const place = PLACES_DB.find(p => p.id === item.id) || { ...item, img: CAT_EMOJI[item.category] || '📍' };
    return makePlaceCard(place);
  }).join('');
  grid.querySelectorAll('.item-card').forEach(card => {
    card.addEventListener('click', () => {
      const placeId = card.dataset.id;
      // 일정 추가 모드인 경우 다중 선택
      if (state.fromPlanDay !== null && state.fromPlanDay !== undefined) {
        const place = findPlace(placeId);
        if (!place) return;
        const idx = state.selectedItems.findIndex(item => item.id === placeId);
        if (idx >= 0) {
          state.selectedItems.splice(idx, 1);
        } else {
          state.selectedItems.push(place);
        }
        document.getElementById('selected-count').textContent = `${state.selectedItems.length}개 선택됨`;
        renderSearchGrid(items); // 재렌더링
      } else {
        openDetail(placeId, 'recommend');
      }
    });
  });
}

document.getElementById('btn-clear-search').addEventListener('click', () => {
  document.getElementById('search-result-wrap').classList.add('hidden');
  document.getElementById('rec-sections').classList.remove('hidden');
  document.getElementById('search-input').value = '';
  initRecSections();
});

/* ══════════════════════════════════════════════
   ④ 장소 세부 페이지
   ══════════════════════════════════════════════ */
function findPlace(id) {
  return PLACES_DB.find(p => p.id === id)
    || SEASON_RECS.find(p => p.id === id)
    || THEME_RECS.find(p => p.id === id);
}

function openDetail(id, fromPage) {
  const place = findPlace(id);
  if (!place) return;
  state.currentDetail = place;
  state.prevPage = fromPage;
  renderDetail(place);
  goToPage('detail');
}

function renderDetail(place) {
  const isFav = state.favorites.some(f => f.id === place.id);
  const bg = THUMB_BG[place.category] || '#F4F6FB';
  const em = place.img || CAT_EMOJI[place.category] || '📍';
  const priceKey = place.price || place.price_range || '';
  const pc = PRICE_CLASS[priceKey] || '';
  const pl = PRICE_LABEL[priceKey] || '';
  const canAddToPlan = state.fromPlanDay !== null && state.fromPlanDay !== undefined;

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-thumb" style="background:${bg}">${em}</div>
    <div class="detail-header">
      <div>
        <div class="detail-title">${place.name}</div>
        <div class="detail-city">📍 ${place.city || ''} · ${CAT_EMOJI[place.category] || ''} ${place.category || ''}</div>
      </div>
      <button class="fav-btn ${isFav ? 'active' : ''}" id="fav-btn-detail">${isFav ? '❤️' : '🤍'}</button>
    </div>
    <div class="detail-tags">
      ${(place.tags||[]).map(t=>`<span class="detail-tag">${t}</span>`).join('')}
      ${pl ? `<span class="detail-tag ${pc}">${pl}</span>` : ''}
    </div>
    <p class="detail-desc">${place.desc || ''}</p>
    <div class="detail-info-grid">
      <div class="detail-info-item"><div class="detail-info-label">📍 주소</div><div class="detail-info-value">${place.address || '-'}</div></div>
      <div class="detail-info-item"><div class="detail-info-label">⏰ 운영시간</div><div class="detail-info-value">${place.hours || '-'}</div></div>
      <div class="detail-info-item"><div class="detail-info-label">📞 전화</div><div class="detail-info-value">${place.phone || '-'}</div></div>
      <div class="detail-info-item"><div class="detail-info-label">⭐ 평점</div><div class="detail-info-value">${place.rating || '-'}</div></div>
    </div>
    <div class="detail-map">🗺 지도 위치 (${place.lat || '-'}, ${place.lng || '-'})</div>
    <div class="detail-actions">
      <button class="btn btn-secondary" id="btn-detail-fav">${isFav ? '❤️ 즐겨찾기 해제' : '🤍 즐겨찾기 추가'}</button>
      ${canAddToPlan ? `<button class="btn btn-primary" id="btn-detail-add">+ 일정에 추가</button>` : ''}
    </div>`;

  document.getElementById('fav-btn-detail').addEventListener('click', () => toggleFav(place));
  document.getElementById('btn-detail-fav').addEventListener('click', () => toggleFav(place));
  const addBtn = document.getElementById('btn-detail-add');
  if (addBtn) addBtn.addEventListener('click', () => addToSchedule(place));
}

document.getElementById('btn-back-detail').addEventListener('click', () =>
  goToPage(state.prevPage || 'recommend'));

/* ══════════════════════════════════════════════
   ⑤ 즐겨찾기
   ══════════════════════════════════════════════ */
function toggleFav(place) {
  const idx = state.favorites.findIndex(f => f.id === place.id);
  if (idx >= 0) state.favorites.splice(idx, 1);
  else state.favorites.push(place);
  localStorage.setItem('ttaerago_favs', JSON.stringify(state.favorites));
  renderDetail(place);
  renderFavorites();
}

function renderFavorites() {
  const grid  = document.getElementById('favorites-grid');
  const empty = document.getElementById('favorites-empty');
  if (!state.favorites.length) {
    empty.classList.remove('hidden'); grid.innerHTML = ''; return;
  }
  empty.classList.add('hidden');
  grid.innerHTML = state.favorites.map(p => makePlaceCard(p)).join('');
  grid.querySelectorAll('.item-card').forEach(card =>
    card.addEventListener('click', () => openDetail(card.dataset.id, 'favorites')));
}

document.querySelector('.nav-btn[data-page="favorites"]').addEventListener('click', renderFavorites);

/* ══════════════════════════════════════════════
   ⑥ 일정 페이지
   ══════════════════════════════════════════════ */
document.getElementById('btn-create-schedule').addEventListener('click', () => {
  const title = document.getElementById('plan-title').value.trim();
  const dest  = document.getElementById('plan-destination').value.trim();
  const start = document.getElementById('plan-start-date').value;
  const end   = document.getElementById('plan-end-date').value;
  if (!title || !dest || !start || !end) { alert('여행 제목, 여행지, 출발일, 도착일을 입력해주세요.'); return; }
  if (new Date(end) < new Date(start)) { alert('도착일은 출발일 이후여야 합니다.'); return; }

  const days = Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1;
  state.planInfo = {
    title, dest, start, end, days,
    people: document.getElementById('plan-people').value,
    budget: document.getElementById('plan-budget').value,
    transport: document.getElementById('plan-transport').value,
    memo: document.getElementById('plan-memo').value,
  };
  state.planSchedule = Array.from({ length: days }, (_, i) => {
    const d = new Date(start); d.setDate(d.getDate() + i);
    return { day: i + 1, date: d.toISOString().slice(0, 10), slots: [] };
  });
  savePlanToStorage(); // 저장
  renderSchedule();
});

function renderSchedule() {
  const info = state.planInfo;
  document.getElementById('plan-info-card').classList.add('hidden');
  const sec = document.getElementById('schedule-section');
  sec.classList.remove('hidden');

  document.getElementById('schedule-title').textContent = `✈️ ${info.title}`;
  document.getElementById('schedule-meta').innerHTML = `
    <span>📍 ${info.dest}</span>
    <span>📅 ${info.start} ~ ${info.end} (${info.days}일)</span>
    <span>👥 ${info.people}명</span>
    ${info.budget ? `<span>💰 ${info.budget}</span>` : ''}
    <span>🚗 ${info.transport}</span>`;

  document.getElementById('day-schedules').innerHTML = state.planSchedule.map((day, di) => `
    <div class="day-card">
      <div class="day-header"><span>Day ${day.day} — ${day.date}</span></div>
      <div class="day-body" id="day-body-${di}">
        ${day.slots.map((slot, si) => `
          <div class="slot-item">
            <div class="slot-time-wrap">
              <input type="time" class="slot-time-input" data-day="${di}" data-slot="${si}" value="${slot.start_time || ''}" placeholder="시간" />
            </div>
            <div class="slot-icon">${slot.img || CAT_EMOJI[slot.category] || '📍'}</div>
            <div class="slot-info">
              <div class="slot-name">${slot.name}</div>
              <div class="slot-meta">
                <span>📍 ${slot.city || ''}</span>
                ${slot.duration ? `<span>⏱ ${slot.duration}분</span>` : ''}
              </div>
            </div>
            <button class="slot-delete-btn" data-day="${di}" data-slot="${si}" title="삭제">🗑️</button>
          </div>`).join('')}
        <button class="add-slot-btn" data-day="${di}">+ 장소 추가하기</button>
      </div>
    </div>`).join('');

  // 시간 입력 이벤트
  document.querySelectorAll('.slot-time-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const dayIdx = parseInt(e.target.dataset.day);
      const slotIdx = parseInt(e.target.dataset.slot);
      if (state.planSchedule[dayIdx] && state.planSchedule[dayIdx].slots[slotIdx]) {
        state.planSchedule[dayIdx].slots[slotIdx].start_time = e.target.value;
        savePlanToStorage();
      }
    });
  });

  // 슬롯 삭제 이벤트
  document.querySelectorAll('.slot-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dayIdx = parseInt(btn.dataset.day);
      const slotIdx = parseInt(btn.dataset.slot);
      if (confirm('이 장소를 일정에서 삭제하시겠습니까?')) {
        state.planSchedule[dayIdx].slots.splice(slotIdx, 1);
        savePlanToStorage();
        renderSchedule();
      }
    });
  });

  // 장소 추가 버튼
  document.querySelectorAll('.add-slot-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      state.fromPlanDay = parseInt(btn.dataset.day);
      document.getElementById('plan-footer').classList.remove('hidden');
      document.getElementById('selected-count').textContent = '0개 선택됨';
      state.selectedItems = [];
      goToPage('recommend');
      initRecSections();
    }));
}

function addToSchedule(place) {
  const dayIdx = state.fromPlanDay;
  if (dayIdx === null || dayIdx === undefined || !state.planSchedule[dayIdx]) return;
  state.planSchedule[dayIdx].slots.push(place);
  savePlanToStorage(); // 저장
  state.fromPlanDay = null;
  document.getElementById('plan-footer').classList.add('hidden');
  goToPage('plan');
  renderSchedule();
}

document.getElementById('btn-add-to-plan').addEventListener('click', () => {
  if (!state.selectedItems.length) return;
  const dayIdx = state.fromPlanDay;
  if (dayIdx !== null && dayIdx !== undefined && state.planSchedule[dayIdx]) {
    state.planSchedule[dayIdx].slots.push(...state.selectedItems);
    savePlanToStorage(); // 저장
  }
  state.selectedItems = [];
  state.fromPlanDay = null;
  document.getElementById('plan-footer').classList.add('hidden');
  goToPage('plan');
  renderSchedule();
});

document.querySelector('.nav-btn[data-page="plan"]').addEventListener('click', () => {
  // 저장된 일정 불러오기
  if (!state.planSchedule.length) {
    const loaded = loadPlanFromStorage();
    if (loaded && state.planInfo) {
      document.getElementById('plan-info-card').classList.add('hidden');
      document.getElementById('schedule-section').classList.remove('hidden');
      renderSchedule();
    }
  } else if (state.planInfo) {
    // 이미 일정이 있으면 일정표 표시
    document.getElementById('plan-info-card').classList.add('hidden');
    document.getElementById('schedule-section').classList.remove('hidden');
  }
});

// 일정 초기화 버튼 (이벤트 위임 방식)
document.addEventListener('click', (e) => {
  if (e.target.id === 'btn-clear-plan') {
    if (confirm('일정을 초기화하시겠습니까? 모든 데이터가 삭제됩니다.')) {
      clearPlanFromStorage();
      document.getElementById('schedule-section').classList.add('hidden');
      document.getElementById('plan-info-card').classList.remove('hidden');
      // 입력 필드 초기화
      document.getElementById('plan-title').value = '';
      document.getElementById('plan-destination').value = '';
      document.getElementById('plan-start-date').value = '';
      document.getElementById('plan-end-date').value = '';
      document.getElementById('plan-people').value = '2';
      document.getElementById('plan-budget').value = '';
      document.getElementById('plan-transport').value = '자가용';
      document.getElementById('plan-memo').value = '';
    }
  }
});

/* ══════════════════════════════════════════════
   초기 실행
   ══════════════════════════════════════════════ */

/* ── 일정 초기화 버튼 ─────────────────────────── */
document.getElementById('btn-clear-plan').addEventListener('click', () => {
  if (!confirm('일정을 초기화하시겠습니까? 저장된 모든 일정이 삭제됩니다.')) return;
  clearPlanFromStorage();
  document.getElementById('plan-info-card').classList.remove('hidden');
  document.getElementById('schedule-section').classList.add('hidden');
  // 입력 필드 초기화
  document.getElementById('plan-title').value = '';
  document.getElementById('plan-dest').value = '';
  document.getElementById('plan-start-date').value = '';
  document.getElementById('plan-end-date').value = '';
  document.getElementById('plan-people').value = '2';
  document.getElementById('plan-budget').value = '';
  document.getElementById('plan-transport').value = '자동차';
  document.getElementById('plan-memo').value = '';
  //alert('일정이 초기화되었습니다.');
});

/* ── 초기 실행 ───────────────────────────────── */
loadPlanFromStorage(); // 저장된 일정 불러오기
renderFavorites();
initRecSections();
