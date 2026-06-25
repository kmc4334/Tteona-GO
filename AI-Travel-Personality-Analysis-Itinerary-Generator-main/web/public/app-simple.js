/* 떠나GO - 간단한 테스트 버전 */

console.log('✅ app-simple.js 로드됨');
console.log('QUIZ_QUESTIONS:', typeof QUIZ_QUESTIONS, QUIZ_QUESTIONS?.length);

/* ══════════════════════════════════════════════
   토스트 알림 및 확인 다이얼로그 시스템
   ══════════════════════════════════════════════ */

// 토스트 알림 표시
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  const titles = {
    success: '성공',
    error: '오류',
    warning: '경고',
    info: '알림'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${titles[type] || titles.info}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">✕</button>
  `;
  
  container.appendChild(toast);
  
  // 닫기 버튼
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });
  
  // 자동 제거
  if (duration > 0) {
    setTimeout(() => {
      removeToast(toast);
    }, duration);
  }
  
  return toast;
}

function removeToast(toast) {
  toast.classList.add('removing');
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 300);
}

// 확인 다이얼로그 (콜백 방식)
function showConfirm(title, message, icon = '❓', onConfirm = null, onCancel = null, confirmText = '확인', cancelText = '취소') {
  const dialog = document.getElementById('confirm-dialog');
  const iconEl = document.getElementById('confirm-icon');
  const titleEl = document.getElementById('confirm-title');
  const messageEl = document.getElementById('confirm-message');
  const okBtn = document.getElementById('confirm-ok');
  const cancelBtn = document.getElementById('confirm-cancel');
  
  iconEl.textContent = icon;
  titleEl.textContent = title;
  messageEl.innerHTML = message.replace(/\n/g, '<br>');
  okBtn.textContent = confirmText;
  cancelBtn.textContent = cancelText;
  
  dialog.classList.remove('hidden');
  
  const handleOk = () => {
    dialog.classList.add('hidden');
    okBtn.removeEventListener('click', handleOk);
    cancelBtn.removeEventListener('click', handleCancel);
    if (onConfirm) onConfirm();
  };
  
  const handleCancel = () => {
    dialog.classList.add('hidden');
    okBtn.removeEventListener('click', handleOk);
    cancelBtn.removeEventListener('click', handleCancel);
    if (onCancel) onCancel();
  };
  
  okBtn.addEventListener('click', handleOk);
  cancelBtn.addEventListener('click', handleCancel);
}

// 선택 다이얼로그 (3개 옵션)
function showChoice(message, options = ['옵션1', '옵션2'], title = '선택', icon = '❓') {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirm-dialog');
    const iconEl = document.getElementById('confirm-icon');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const actionsEl = dialog.querySelector('.confirm-actions');
    
    iconEl.textContent = icon;
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // 버튼 재구성
    actionsEl.innerHTML = '';
    options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.className = 'btn ' + (index === options.length - 1 ? 'btn-primary' : 'btn-secondary');
      btn.textContent = option;
      btn.addEventListener('click', () => {
        dialog.classList.add('hidden');
        resolve(index);
      });
      actionsEl.appendChild(btn);
    });
    
    dialog.classList.remove('hidden');
  });
}

// 프롬프트 다이얼로그
function showPrompt(message, defaultValue = '', title = '입력') {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirm-dialog');
    const iconEl = document.getElementById('confirm-icon');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const actionsEl = dialog.querySelector('.confirm-actions');
    
    iconEl.textContent = '✏️';
    titleEl.textContent = title;
    messageEl.innerHTML = message + '<br><br><input type="text" id="prompt-input" class="form-input" value="' + defaultValue + '" style="width:100%;margin-top:8px;" />';
    
    dialog.classList.remove('hidden');
    
    // 입력창 포커스
    setTimeout(() => {
      const input = document.getElementById('prompt-input');
      if (input) input.focus();
    }, 100);
    
    // 버튼 재구성
    actionsEl.innerHTML = '';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = '취소';
    cancelBtn.addEventListener('click', () => {
      dialog.classList.add('hidden');
      resolve(null);
    });
    
    const okBtn = document.createElement('button');
    okBtn.className = 'btn btn-primary';
    okBtn.textContent = '확인';
    okBtn.addEventListener('click', () => {
      const input = document.getElementById('prompt-input');
      const value = input ? input.value : '';
      dialog.classList.add('hidden');
      resolve(value);
    });
    
    actionsEl.appendChild(cancelBtn);
    actionsEl.appendChild(okBtn);
    
    // Enter 키 처리
    const input = document.getElementById('prompt-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          okBtn.click();
        }
      });
    }
  });
}

console.log('✅ 토스트 알림 시스템 로드 완료');

// 전역 상태
const state = {
  quizAnswers: {},
  budget: 500000,
  travelTypeKey: null,
  selectionMode: false, // 다중 선택 모드
  selectedItems: [], // 선택된 장소 ID 배열
  targetDay: null // 추가할 Day 인덱스
};

// 페이지 전환
function goToPage(name) {
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === name));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page-${name}`);
  if (page) page.classList.add('active');
  window.scrollTo(0, 0);
}

document.querySelectorAll('.nav-btn').forEach(btn =>
  btn.addEventListener('click', () => goToPage(btn.dataset.page)));

// 퀴즈 렌더링
const TOTAL_STEPS = QUIZ_QUESTIONS.length + 1;
let currentStep = 0;

function renderQuiz() {
  console.log('🎯 renderQuiz 호출, step:', currentStep);
  
  const container = document.getElementById('quiz-container');
  const budgetStep = document.getElementById('budget-step');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');

  if (!container) {
    console.error('❌ quiz-container를 찾을 수 없습니다');
    return;
  }

  // 진행 바 업데이트
  const pct = ((currentStep + 1) / TOTAL_STEPS) * 100;
  fill.style.width = pct + '%';
  label.textContent = (currentStep + 1) + ' / ' + TOTAL_STEPS;
  btnPrev.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  btnNext.textContent = currentStep === TOTAL_STEPS - 1 ? '성향 분석 확인 →' : '다음 →';

  // 예산 단계
  if (currentStep === QUIZ_QUESTIONS.length) {
    container.innerHTML = '';
    budgetStep.classList.remove('hidden');
    return;
  }
  budgetStep.classList.add('hidden');

  // 질문 렌더링
  const q = QUIZ_QUESTIONS[currentStep];
  const saved = state.quizAnswers[q.id];

  let optionsHTML = '';
  q.options.forEach(opt => {
    const sel = saved === opt.value ? 'selected' : '';
    optionsHTML += '<button class="quiz-option ' + sel + '" data-val="' + opt.value + '">' + opt.label + '</button>';
  });

  container.innerHTML = '<div class="quiz-card">' +
    '<span class="quiz-category">' + q.category + '</span>' +
    '<div class="quiz-question">Q' + (currentStep + 1) + '. ' + q.question + '</div>' +
    '<div class="quiz-options">' + optionsHTML + '</div>' +
    '</div>';

  // 옵션 클릭 이벤트
  container.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      state.quizAnswers[q.id] = btn.dataset.val;
      container.querySelectorAll('.quiz-option').forEach(b => {
        if (b.dataset.val === btn.dataset.val) {
          b.classList.add('selected');
        } else {
          b.classList.remove('selected');
        }
      });
      console.log('✓ 답변 선택:', q.id, btn.dataset.val);
    });
  });
}

// 다음 버튼
document.getElementById('btn-next').addEventListener('click', () => {
  console.log('▶ 다음 버튼 클릭');
  if (currentStep < QUIZ_QUESTIONS.length) {
    if (!state.quizAnswers[QUIZ_QUESTIONS[currentStep].id]) {
      showToast('항목을 선택해주세요.', 'warning');
      return;
    }
    currentStep++;
    renderQuiz();
  } else {
    submitQuiz();
  }
});

// 퀴즈 제출 및 결과 표시
function submitQuiz() {
  console.log('📊 퀴즈 제출');
  
  // 오버레이 표시
  const overlay = document.getElementById('analyzing-overlay');
  overlay.classList.remove('hidden');
  
  // 유형 계산
  const typeKey = calcTravelType(state.quizAnswers);
  state.travelTypeKey = typeKey;
  
  // 1.5초 후 결과 표시
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
  document.getElementById('type-sub').textContent = typeInfo.sub;
  document.getElementById('type-name').textContent = '당신은 "' + typeInfo.name + '"입니다';
  document.getElementById('type-desc').textContent = typeInfo.desc;
  
  let tagsHTML = '';
  typeInfo.tags.forEach(t => {
    tagsHTML += '<span class="type-tag-chip">#' + t + '</span>';
  });
  document.getElementById('type-tags').innerHTML = tagsHTML;

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
    if (opt && opt.scores) {
      Object.entries(opt.scores).forEach(([k, v]) => {
        score[k] = (score[k] || 0) + v;
      });
    }
  });
  
  const topAxes = Object.entries(score)
    .filter(([k]) => axisLabels[k])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  
  const maxVal = topAxes[0] ? topAxes[0][1] : 1;
  
  let barsHTML = '';
  topAxes.forEach(([k, v]) => {
    const pct = Math.round(v / maxVal * 100);
    const width = (v / maxVal * 100).toFixed(1);
    barsHTML += '<div class="profile-bar-item">' +
      '<div class="profile-bar-label"><span>' + axisLabels[k] + '</span><span>' + pct + '%</span></div>' +
      '<div class="profile-bar-track">' +
      '<div class="profile-bar-fill" style="width:' + width + '%"></div>' +
      '</div></div>';
  });
  document.getElementById('profile-bars').innerHTML = barsHTML;

  // 같은 유형 추천 초기화
  renderSimilarRec('attraction');
}

// 같은 유형 추천 - 실제 장소 카드로 표시
function renderSimilarRec(cat) {
  const typeInfo = TRAVEL_TYPES[state.travelTypeKey];
  if (!typeInfo) return;
  
  const recNames = (typeInfo.rec || {})[cat] || [];
  const container = document.getElementById('similar-rec-list');
  
  // 추천 이름을 기반으로 PLACES_DB에서 실제 장소 찾기
  const places = [];
  
  recNames.forEach(name => {
    const found = PLACES_DB.find(p => 
      p.category === cat && (
        p.name.includes(name) || 
        name.includes(p.name) ||
        (p.tags && p.tags.some(tag => name.toLowerCase().includes(tag.toLowerCase()))) ||
        (p.city && name.includes(p.city))
      )
    );
    if (found && !places.some(pl => pl.id === found.id)) {
      places.push(found);
    }
  });
  
  // 카테고리에 맞는 장소가 부족하면 해당 카테고리에서 추가
  if (places.length < 4) {
    const additional = PLACES_DB
      .filter(p => p.category === cat && !places.some(pl => pl.id === p.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4 - places.length);
    places.push(...additional);
  }
  
  // 장소 카드 렌더링
  if (places.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);padding:16px 0;text-align:center;width:100%;">추천 장소가 없습니다.</p>';
    return;
  }
  
  let cardsHTML = '';
  places.forEach(place => {
    cardsHTML += makePlaceCard(place, false);
  });
  
  container.innerHTML = cardsHTML;
  
  // 카드 클릭 이벤트
  container.querySelectorAll('.item-card').forEach(card => {
    card.addEventListener('click', () => {
      console.log('성향 분석 결과 카드 클릭:', card.dataset.id);
      showDetail(card.dataset.id);
    });
  });
}

// 탭 전환
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

// 지역 데이터
const REGION_DATA = {
  '수도권': { cities: ['서울','인천','수원','가평','양평','파주','용인','기타 수도권'], theme: '#도심여행 #호캉스 #근교드라이브' },
  '강원권': { cities: ['춘천','강릉','속초','양양','평창','정선','원주','기타 강원'], theme: '#동해바다 #서핑 #숲캉스 #겨울스포츠' },
  '충청권': { cities: ['대전','태안','보령','단양','제천','공주','부여','세종','기타 충청'], theme: '#패러글라이딩 #갯벌체험 #역사탐방' },
  '전라북부': { cities: ['전주','군산','부안','고창','기타 전북'], theme: '#한옥스테이 #전통미식 #감성여행' },
  '전라남부': { cities: ['여수','순천','목포','담양','보성','광주','기타 전남'], theme: '#여수밤바다 #남해안섬 #남도미식' },
  '경상북부': { cities: ['대구','경주','안동','포항','영덕','울릉','기타 경북'], theme: '#전통문화 #황리단길 #경주야경' },
  '경상남부': { cities: ['부산','울산','통영','거제','남해','하동','창원','기타 경남'], theme: '#오션뷰 #해양레저 #다도해투어' },
  '제주': { cities: ['제주시','서귀포시'], theme: '#제주독채 #이국적자연 #한라산' }
};

// 필터 상태
const filterState = {
  category: '',
  zone: '',
  city: '',
  priceMin: 0,
  priceMax: 500000
};

// 필터 패널 토글
const btnFilterToggle = document.getElementById('btn-filter-toggle');
if (btnFilterToggle) {
  btnFilterToggle.addEventListener('click', () => {
    const panel = document.getElementById('filter-panel');
    const arrow = document.getElementById('filter-arrow');
    const isOpen = !panel.classList.contains('hidden');
    panel.classList.toggle('hidden', isOpen);
    btnFilterToggle.classList.toggle('active', !isOpen);
    arrow.classList.toggle('open', !isOpen);
  });
}

// 카테고리 필터
document.querySelectorAll('.filter-chip[data-filter="category"]').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip[data-filter="category"]').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    filterState.category = chip.dataset.val;
    updateFilterBadge();
  });
});

// 지역 필터 - 광역 권역
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
  if (!zone) {
    container.classList.add('hidden');
    return;
  }
  
  const data = REGION_DATA[zone];
  if (!data) {
    container.classList.add('hidden');
    return;
  }
  
  container.classList.remove('hidden');
  
  let chipsHTML = '<button class="city-chip active" data-city="">전체 ' + zone + '</button>';
  data.cities.forEach(c => {
    chipsHTML += '<button class="city-chip" data-city="' + c + '">' + c + '</button>';
  });
  chipsHTML += '<span style="width:100%;font-size:.75rem;color:var(--muted);margin-top:4px;">' + data.theme + '</span>';
  
  container.innerHTML = chipsHTML;
  
  container.querySelectorAll('.city-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.city-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterState.city = chip.dataset.city;
      updateFilterBadge();
    });
  });
}

// 가격 필터
const priceMinSlider = document.getElementById('price-min-slider');
const priceMaxSlider = document.getElementById('price-max-slider');
const priceMinInput = document.getElementById('price-min-input');
const priceMaxInput = document.getElementById('price-max-input');
const priceRange = document.getElementById('price-slider-range');

function updatePriceUI() {
  const min = parseInt(priceMinSlider.value);
  const max = parseInt(priceMaxSlider.value);
  const total = 500000;
  const leftPct = (min / total) * 100;
  const rightPct = (max / total) * 100;
  priceRange.style.left = leftPct + '%';
  priceRange.style.width = (rightPct - leftPct) + '%';
  priceMinInput.value = min;
  priceMaxInput.value = max;
  filterState.priceMin = min;
  filterState.priceMax = max;
  updateFilterBadge();
}

priceMinSlider.addEventListener('input', () => {
  if (parseInt(priceMinSlider.value) > parseInt(priceMaxSlider.value)) {
    priceMinSlider.value = priceMaxSlider.value;
  }
  updatePriceUI();
});

priceMaxSlider.addEventListener('input', () => {
  if (parseInt(priceMaxSlider.value) < parseInt(priceMinSlider.value)) {
    priceMaxSlider.value = priceMinSlider.value;
  }
  updatePriceUI();
});

priceMinInput.addEventListener('input', () => {
  let v = Math.max(0, Math.min(parseInt(priceMinInput.value) || 0, filterState.priceMax));
  priceMinSlider.value = v;
  updatePriceUI();
});

priceMaxInput.addEventListener('input', () => {
  let v = Math.min(500000, Math.max(parseInt(priceMaxInput.value) || 0, filterState.priceMin));
  priceMaxSlider.value = v;
  updatePriceUI();
});

updatePriceUI();

// 필터 배지 업데이트
function updateFilterBadge() {
  let count = 0;
  if (filterState.category) count++;
  if (filterState.zone) count++;
  if (filterState.priceMin > 0 || filterState.priceMax < 500000) count++;
  
  const badge = document.getElementById('filter-badge');
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
}

// 필터 초기화
document.getElementById('btn-filter-reset').addEventListener('click', () => {
  filterState.category = '';
  filterState.zone = '';
  filterState.city = '';
  filterState.priceMin = 0;
  filterState.priceMax = 500000;
  
  document.querySelectorAll('.filter-chip[data-filter="category"]').forEach((c, i) => {
    c.classList.toggle('active', i === 0);
  });
  document.querySelectorAll('.region-zone').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });
  document.getElementById('region-cities').classList.add('hidden');
  
  priceMinSlider.value = 0;
  priceMaxSlider.value = 500000;
  updatePriceUI();
  updateFilterBadge();
});

// 필터 적용
document.getElementById('btn-filter-apply').addEventListener('click', () => {
  document.getElementById('filter-panel').classList.add('hidden');
  document.getElementById('btn-filter-toggle').classList.remove('active');
  document.getElementById('filter-arrow').classList.remove('open');
  doSearch();
});

// 추천 섹션 초기화
function initRecSections() {
  const typeKey = state.travelTypeKey || 'cozy_healer';
  const typeRec = TRAVEL_TYPES[typeKey].rec || {};
  const simNames = [...(typeRec.attraction || []), ...(typeRec.cafe || [])];
  const simPlaces = PLACES_DB.filter(p => 
    simNames.some(n => p.name.includes(n.slice(0, 3)))
  ).slice(0, 6);
  
  renderScrollRow('rec-similar-row', simPlaces.length ? simPlaces : PLACES_DB.slice(0, 6));
  renderScrollRow('rec-season-row', SEASON_RECS);
  renderScrollRow('rec-theme-row', THEME_RECS);
}

function renderScrollRow(id, places) {
  const el = document.getElementById(id);
  if (!el) return;
  
  let cardsHTML = '';
  places.forEach(place => {
    cardsHTML += makePlaceCard(place, state.selectionMode);
  });
  el.innerHTML = cardsHTML;
  
  el.querySelectorAll('.item-card').forEach(card => {
    card.addEventListener('click', () => {
      console.log('📍 카드 클릭됨, ID:', card.dataset.id, '선택모드:', state.selectionMode);
      if (state.selectionMode) {
        toggleSelection(card.dataset.id);
        updateSelectionUI();
      } else {
        showDetail(card.dataset.id);
      }
    });
  });
}

function makePlaceCard(place, selectable = false) {
  const bg = {
    attraction: '#EEF3FF',
    restaurant: '#FFF5F5',
    cafe: '#FFFAF0',
    accommodation: '#F0FFF4',
    activity: '#F0F4FF'
  }[place.category] || '#F4F6FB';
  
  const priceLabels = { free: '무료', cheap: '저렴', moderate: '보통', expensive: '고급' };
  const priceClasses = { free: 'price-free', cheap: 'price-cheap', moderate: 'price-moderate', expensive: 'price-expensive' };
  const priceKey = place.price || place.price_range || '';
  const priceLabel = priceLabels[priceKey] || '';
  const priceClass = priceClasses[priceKey] || '';
  
  const emoji = place.img || {
    attraction: '🏛',
    restaurant: '🍽',
    cafe: '☕',
    accommodation: '🏨',
    activity: '🎡'
  }[place.category] || '📍';
  
  let tagsHTML = '';
  if (place.tags) {
    place.tags.forEach(t => {
      tagsHTML += '<span class="item-tag">' + t + '</span>';
    });
  }
  
  const isSelected = state.selectedItems.some(item => item.id === place.id);
  const selectableClass = selectable ? ' selectable' : '';
  const selectedClass = isSelected ? ' selected' : '';
  
  let checkboxHTML = '';
  if (selectable) {
    checkboxHTML = '<div class="item-checkbox">' + (isSelected ? '✓' : '') + '</div>';
  }
  
  return '<div class="item-card' + selectableClass + selectedClass + '" data-id="' + place.id + '">' +
    checkboxHTML +
    '<div class="item-thumb" style="background:' + bg + '">' + emoji + '</div>' +
    '<div class="item-body">' +
    '<div class="item-name">' + place.name + '</div>' +
    '<div class="item-city">📍 ' + (place.city || '') + '</div>' +
    '<div class="item-tags">' + tagsHTML + '</div>' +
    '<div class="item-meta">' +
    '<span class="item-rating">★ ' + place.rating + '</span>' +
    (priceLabel ? '<span class="item-price ' + priceClass + '">' + priceLabel + '</span>' : '') +
    '</div></div></div>';
}

// 검색 기능
document.getElementById('btn-search').addEventListener('click', doSearch);
document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

// 키워드 칩
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.getElementById('search-input').value = chip.dataset.q;
    doSearch();
  });
});

function doSearch() {
  const query = document.getElementById('search-input').value.trim();
  
  document.getElementById('rec-sections').classList.add('hidden');
  document.getElementById('search-result-wrap').classList.remove('hidden');
  document.getElementById('search-result-title').textContent = query ? '"' + query + '" 검색 결과' : '전체 장소';
  
  // 가격 범위 매핑
  const PRICE_RANGE_MAP = { free: 0, cheap: 50000, moderate: 150000, expensive: 300000 };
  
  // 로컬 필터링
  let results = PLACES_DB.filter(p => {
    // 지역 필터
    if (filterState.city && p.city !== filterState.city) return false;
    if (filterState.zone && !filterState.city) {
      const zoneData = REGION_DATA[filterState.zone];
      if (zoneData && !zoneData.cities.some(c => p.city.includes(c) || c.includes(p.city))) {
        return false;
      }
    }
    
    // 카테고리 필터
    if (filterState.category && p.category !== filterState.category) return false;
    
    // 가격 필터
    const priceKey = p.price || p.price_range || '';
    const val = PRICE_RANGE_MAP[priceKey] !== undefined ? PRICE_RANGE_MAP[priceKey] : 100000;
    if (val < filterState.priceMin || val > filterState.priceMax) return false;
    
    // 검색어 필터
    if (query) {
      const q = query.toLowerCase();
      return p.name.toLowerCase().includes(q) || 
             p.city.toLowerCase().includes(q) || 
             (p.tags && p.tags.some(t => t.toLowerCase().includes(q)));
    }
    
    return true;
  });
  
  renderSearchGrid(results);
}

function renderSearchGrid(items) {
  const grid = document.getElementById('recommend-grid');
  
  if (!items.length) {
    grid.innerHTML = '<p style="color:var(--muted);padding:32px 0">검색 결과가 없습니다.</p>';
    return;
  }
  
  let cardsHTML = '';
  items.forEach(item => {
    cardsHTML += makePlaceCard(item, state.selectionMode);
  });
  grid.innerHTML = cardsHTML;
  
  grid.querySelectorAll('.item-card').forEach(card => {
    card.addEventListener('click', () => {
      console.log('🔎 검색 결과 카드 클릭됨, ID:', card.dataset.id, '선택모드:', state.selectionMode);
      if (state.selectionMode) {
        toggleSelection(card.dataset.id);
        updateSelectionUI();
      } else {
        showDetail(card.dataset.id);
      }
    });
  });
}

// 전체 보기
document.getElementById('btn-clear-search').addEventListener('click', () => {
  document.getElementById('search-result-wrap').classList.add('hidden');
  document.getElementById('rec-sections').classList.remove('hidden');
  document.getElementById('search-input').value = '';
  initRecSections();
});

// 추천 페이지 진입 시 초기화
document.querySelector('.nav-btn[data-page="recommend"]').addEventListener('click', () => {
  initRecSections();
});

// 이전 버튼
document.getElementById('btn-prev').addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--;
    renderQuiz();
  }
});

// 예산 슬라이더
const budgetSlider = document.getElementById('budget-slider');
const budgetInput = document.getElementById('budget-input');
const budgetDisplay = document.getElementById('budget-display');

function updateBudget(val) {
  state.budget = parseInt(val);
  budgetInput.value = val;
  budgetSlider.value = val;
  budgetDisplay.textContent = parseInt(val).toLocaleString('ko-KR') + '원';
}

budgetSlider.addEventListener('input', e => updateBudget(e.target.value));
budgetInput.addEventListener('input', e => {
  let v = Math.max(100000, Math.min(5000000, parseInt(e.target.value) || 100000));
  updateBudget(v);
});
updateBudget(500000);

/* ══════════════════════════════════════════════
   ④ 일정 페이지
   ══════════════════════════════════════════════ */

// 일정 상태
let planState = {
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  people: '2',
  transport: '자가용',
  memo: '',
  days: [], // [{ day: 1, date: '2026-05-20', slots: [{ id, name, time, category }] }]
  useAI: false, // AI 추천 사용 여부
  createdAt: null, // 생성 시간
  id: null // 일정 ID
};

// localStorage 키
const PLAN_STORAGE_KEY = 'tteonago_plan';
const LIBRARY_STORAGE_KEY = 'tteonago_library';
const FAVORITES_PLACES_KEY = 'tteonago_favorites_places';
const FAVORITES_PLANS_KEY = 'tteonago_favorites_plans';

// 일정 불러오기
function loadPlan() {
  try {
    const saved = localStorage.getItem(PLAN_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(planState, data);
      console.log('✅ 일정 불러오기 완료:', planState);
      
      // 폼 필드 복원
      if (planState.title) document.getElementById('plan-title').value = planState.title;
      if (planState.destination) document.getElementById('plan-destination').value = planState.destination;
      if (planState.startDate) document.getElementById('plan-start-date').value = planState.startDate;
      if (planState.endDate) document.getElementById('plan-end-date').value = planState.endDate;
      if (planState.people) document.getElementById('plan-people').value = planState.people;
      if (planState.transport) document.getElementById('plan-transport').value = planState.transport;
      if (planState.memo) document.getElementById('plan-memo').value = planState.memo;
      
      // 일정이 있으면 세부 일정 표시
      if (planState.days && planState.days.length > 0) {
        renderSchedule();
      }
    }
  } catch (e) {
    console.error('일정 불러오기 실패:', e);
  }
}

// 일정 저장
function savePlan() {
  try {
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(planState));
    console.log('💾 일정 저장 완료');
  } catch (e) {
    console.error('일정 저장 실패:', e);
  }
}

// 세부 일정 작성하기 버튼
document.getElementById('btn-create-schedule').addEventListener('click', () => {
  // 폼 데이터 수집
  planState.title = document.getElementById('plan-title').value.trim();
  planState.destination = document.getElementById('plan-destination').value.trim();
  planState.startDate = document.getElementById('plan-start-date').value;
  planState.endDate = document.getElementById('plan-end-date').value;
  planState.people = document.getElementById('plan-people').value;
  planState.transport = document.getElementById('plan-transport').value;
  planState.memo = document.getElementById('plan-memo').value.trim();
  planState.useAI = document.getElementById('use-ai-plan').checked;
  
  // 필수 필드 검증
  if (!planState.title) {
    showToast('여행 제목을 입력해주세요.', 'warning');
    return;
  }
  if (!planState.startDate || !planState.endDate) {
    showToast('출발일과 도착일을 선택해주세요.', 'warning');
    return;
  }
  
  // 날짜 검증
  const start = new Date(planState.startDate);
  const end = new Date(planState.endDate);
  if (start > end) {
    showToast('도착일은 출발일 이후여야 합니다.', 'error');
    return;
  }
  
  // Day 배열 생성 (기존 일정이 없을 때만)
  if (planState.days.length === 0) {
    const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    planState.days = [];
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      planState.days.push({
        day: i + 1,
        date: date.toISOString().split('T')[0],
        slots: []
      });
    }
    
    // AI 추천 사용 시 자동으로 일정 생성
    if (planState.useAI) {
      generateAIPlan();
    }
  }
  
  // ID 및 생성 시간 설정
  if (!planState.id) {
    planState.id = 'plan_' + Date.now();
    planState.createdAt = new Date().toISOString();
  }
  
  savePlan();
  renderSchedule();
  showToast('일정이 생성되었습니다!', 'success');
});

// 세부 일정 렌더링
function renderSchedule() {
  document.getElementById('plan-info-card').classList.add('hidden');
  const scheduleSection = document.getElementById('schedule-section');
  scheduleSection.classList.remove('hidden');
  
  // 라이브러리에 저장
  saveToLibrary();
  
  // 헤더
  document.getElementById('schedule-title').textContent = planState.title || '여행 일정';
  
  const start = new Date(planState.startDate);
  const end = new Date(planState.endDate);
  const dayCount = planState.days.length;
  
  document.getElementById('schedule-meta').innerHTML = 
    '<span>📍 ' + (planState.destination || '미정') + '</span>' +
    '<span>📅 ' + formatDate(start) + ' ~ ' + formatDate(end) + ' (' + dayCount + '일)</span>' +
    '<span>👥 ' + planState.people + '명</span>';
  
  // Day별 일정 카드
  const container = document.getElementById('day-schedules');
  let html = '';
  
  planState.days.forEach((day, idx) => {
    const dateObj = new Date(day.date);
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];
    
    html += '<div class="day-card" data-day="' + idx + '">' +
      '<div class="day-header">' +
      '<h4 class="day-title">Day ' + day.day + '</h4>' +
      '<span class="day-date">' + formatDate(dateObj) + ' (' + dayOfWeek + ')</span>' +
      '<button class="btn-icon btn-add-slot" data-day="' + idx + '" title="장소 추가">➕</button>' +
      '</div>' +
      '<div class="day-slots" id="day-slots-' + idx + '">';
    
    if (day.slots.length === 0) {
      html += '<div class="empty-slot">장소를 추가해보세요</div>';
    } else {
      day.slots.forEach((slot, slotIdx) => {
        html += renderSlot(slot, idx, slotIdx);
      });
    }
    
    html += '</div></div>';
  });
  
  container.innerHTML = html;
  
  // 이벤트 리스너 등록
  attachScheduleEvents();
}

// 슬롯 렌더링
function renderSlot(slot, dayIdx, slotIdx) {
  const bg = {
    attraction: '#EEF3FF',
    restaurant: '#FFF5F5',
    cafe: '#FFFAF0',
    accommodation: '#F0FFF4',
    activity: '#F0F4FF'
  }[slot.category] || '#F4F6FB';
  
  const emoji = {
    attraction: '🏛',
    restaurant: '🍽',
    cafe: '☕',
    accommodation: '🏨',
    activity: '🎡'
  }[slot.category] || '📍';
  
  return '<div class="slot-item" data-day="' + dayIdx + '" data-slot="' + slotIdx + '">' +
    '<div class="slot-thumb" style="background:' + bg + '">' + emoji + '</div>' +
    '<div class="slot-body">' +
    '<div class="slot-name">' + slot.name + '</div>' +
    '<div class="slot-time-input">' +
    '<label>⏰</label>' +
    '<input type="time" class="time-input" value="' + (slot.time || '') + '" data-day="' + dayIdx + '" data-slot="' + slotIdx + '" />' +
    '</div>' +
    '</div>' +
    '<div class="slot-actions">' +
    '<button class="btn-icon-small btn-add-before" data-day="' + dayIdx + '" data-slot="' + slotIdx + '" title="위에 추가">➕</button>' +
    '<button class="btn-icon-small btn-delete-slot" data-day="' + dayIdx + '" data-slot="' + slotIdx + '" title="삭제">➖</button>' +
    '</div>' +
    '</div>';
}

// 날짜 포맷팅
function formatDate(date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return m + '월 ' + d + '일';
}

// 일정 이벤트 리스너
function attachScheduleEvents() {
  // 장소 추가 버튼 (Day 헤더의 ➕)
  document.querySelectorAll('.btn-add-slot').forEach(btn => {
    btn.addEventListener('click', async () => {
      const dayIdx = parseInt(btn.dataset.day);
      
      // 다중 선택 모드 활성화 또는 직접 입력
      const choice = await showChoice(
        '장소를 어떻게 추가하시겠습니까?',
        ['취소', '직접 입력', '추천 페이지에서 선택'],
        '장소 추가',
        '📍'
      );
      
      if (choice === 2) {
        enableSelectionMode(dayIdx);
      } else if (choice === 1) {
        addSlotToDay(dayIdx);
      }
    });
  });
  
  // 슬롯 위에 추가 버튼
  document.querySelectorAll('.btn-add-before').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const dayIdx = parseInt(btn.dataset.day);
      const slotIdx = parseInt(btn.dataset.slot);
      
      const choice = await showChoice(
        '장소를 어떻게 추가하시겠습니까?',
        ['취소', '직접 입력', '추천 페이지에서 선택'],
        '장소 추가',
        '📍'
      );
      
      if (choice === 2) {
        enableSelectionMode(dayIdx, slotIdx);
      } else if (choice === 1) {
        addSlotToDay(dayIdx, slotIdx);
      }
    });
  });
  
  // 슬롯 삭제 버튼
  document.querySelectorAll('.btn-delete-slot').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const dayIdx = parseInt(btn.dataset.day);
      const slotIdx = parseInt(btn.dataset.slot);
      deleteSlot(dayIdx, slotIdx);
    });
  });
  
  // 시간 입력
  document.querySelectorAll('.time-input').forEach(input => {
    input.addEventListener('change', () => {
      const dayIdx = parseInt(input.dataset.day);
      const slotIdx = parseInt(input.dataset.slot);
      updateSlotTime(dayIdx, slotIdx, input.value);
    });
  });
}

// 슬롯 추가 (임시 장소)
async function addSlotToDay(dayIdx, insertIdx = null) {
  const slotName = await showPrompt('장소 이름을 입력하세요:', '', '장소 추가');
  if (!slotName || !slotName.trim()) return;
  
  // 카테고리 선택
  const categoryChoice = await showChoice(
    '카테고리를 선택하세요:',
    ['취소', '관광지', '맛집', '카페', '숙소', '액티비티'],
    '카테고리 선택',
    '🏷️'
  );
  
  if (categoryChoice === 0) return;
  
  const categoryMap = {
    1: 'attraction',
    2: 'restaurant',
    3: 'cafe',
    4: 'accommodation',
    5: 'activity'
  };
  const category = categoryMap[categoryChoice] || 'attraction';
  if (['attraction', 'activity', 'accommodation'].includes(category)) {
    const budgetInput = await showPrompt('1인당 예산을 입력하세요 (원):\n(나중에 입력하려면 취소를 누르세요)', '', '예산 입력');
    if (budgetInput) {
      budget = parseInt(budgetInput) || 0;
    }
  }
  
  const newSlot = {
    id: 'slot_' + Date.now(),
    name: slotName.trim(),
    time: '',
    category: category
  };
  
  if (insertIdx !== null) {
    planState.days[dayIdx].slots.splice(insertIdx, 0, newSlot);
  } else {
    planState.days[dayIdx].slots.push(newSlot);
  }
  
  savePlan();
  renderSchedule();
  showToast('장소가 추가되었습니다!', 'success');
}

// 슬롯 삭제
function deleteSlot(dayIdx, slotIdx) {
  const slot = planState.days[dayIdx].slots[slotIdx];
  if (!confirm('"' + slot.name + '"을(를) 삭제하시겠습니까?')) return;
  
  planState.days[dayIdx].slots.splice(slotIdx, 1);
  savePlan();
  renderSchedule();
}

// 슬롯 시간 업데이트
function updateSlotTime(dayIdx, slotIdx, time) {
  planState.days[dayIdx].slots[slotIdx].time = time;
  savePlan();
  console.log('⏰ 시간 업데이트:', dayIdx, slotIdx, time);
}

// 일정 초기화
document.getElementById('btn-clear-plan').addEventListener('click', () => {
  //if (!confirm('모든 일정을 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
  
  // 라이브러리에 저장
  if (planState.id && planState.title) {
    saveToLibrary();
  }
  
  // 상태 초기화
  planState.title = '';
  planState.destination = '';
  planState.startDate = '';
  planState.endDate = '';
  planState.people = '2';
  planState.transport = '자가용';
  planState.memo = '';
  planState.days = [];
  planState.useAI = false;
  planState.id = null;
  planState.createdAt = null;
  
  // localStorage 삭제
  localStorage.removeItem(PLAN_STORAGE_KEY);
  
  // 폼 초기화
  document.getElementById('plan-title').value = '';
  document.getElementById('plan-destination').value = '';
  document.getElementById('plan-start-date').value = '';
  document.getElementById('plan-end-date').value = '';
  document.getElementById('plan-people').value = '2';
  document.getElementById('plan-transport').value = '자가용';
  document.getElementById('plan-memo').value = '';
  document.getElementById('use-ai-plan').checked = false;
  
  // UI 초기화
  document.getElementById('schedule-section').classList.add('hidden');
  document.getElementById('plan-info-card').classList.remove('hidden');
  
  //alert('일정이 초기화되었습니다.');
});

/* ══════════════════════════════════════════════
   AI 일정 생성 기능 (AI 알고리즘 적용)
   ══════════════════════════════════════════════ */

function generateAIPlan() {
  console.log('🤖 AI 일정 생성 시작 (알고리즘 적용)');
  
  const typeKey = state.travelTypeKey || 'cozy_healer';
  const typeInfo = TRAVEL_TYPES[typeKey];
  const destination = planState.destination.toLowerCase();
  
  // 1. 여행지에 맞는 장소 필터링
  let availablePlaces = PLACES_DB.filter(p => {
    if (destination.includes(p.city.toLowerCase())) return true;
    if (destination.includes(p.region.toLowerCase())) return true;
    return false;
  });
  
  if (availablePlaces.length === 0) {
    availablePlaces = PLACES_DB;
  }
  
  // 2. 성향에 맞는 장소 우선 선택 (추천 점수 기반)
  const recNames = Object.values(typeInfo.rec || {}).flat();
  let preferredPlaces = availablePlaces.filter(p => 
    recNames.some(name => p.name.includes(name) || name.includes(p.name))
  );
  
  // 충분한 장소가 없으면 전체에서 선택
  if (preferredPlaces.length < 10) {
    preferredPlaces = availablePlaces;
  }
  
  // 3. 사용자 성향 프로파일 가져오기 또는 생성
  let userPreference = state.userPreference;
  if (!userPreference && window.travelAI) {
    userPreference = window.travelAI.initUserPreference('user_' + Date.now(), typeKey);
    state.userPreference = userPreference;
    console.log('👤 사용자 성향 프로파일 생성:', userPreference);
  }
  
  // 4. AI 알고리즘으로 일정 생성
  if (window.travelAI && preferredPlaces.length > 0) {
    try {
      const aiResult = window.travelAI.generateSchedule(
        preferredPlaces,
        planState.days.length,
        userPreference
      );
      
      console.log('🎯 AI 일정 생성 결과:', aiResult);
      
      // AI가 생성한 일정을 planState에 적용
      aiResult.schedule.forEach((daySchedule, dayIdx) => {
        if (dayIdx < planState.days.length) {
          // 기존 슬롯 초기화
          planState.days[dayIdx].slots = daySchedule.slots.map(slot => ({
            ...slot,
            id: 'slot_' + Date.now() + '_' + Math.random()
          }));
        }
      });
      
      // 최적화 정보 표시
      showToast(`AI 일정 생성 완료! 총 이동거리: ${aiResult.totalDistance.toFixed(1)}km`, 'success');
      console.log('✅ AI 일정 생성 완료 - TSP 최적화 적용됨');
      
    } catch (error) {
      console.error('❌ AI 일정 생성 실패:', error);
      // 폴백: 기존 방식 사용
      generateAIPlanFallback();
    }
  } else {
    // AI 미사용 시 기존 방식
    generateAIPlanFallback();
  }
}

// 폴백 함수 (AI 실패 시)
function generateAIPlanFallback() {
  console.log('⚠️ AI 미사용 - 기본 방식으로 일정 생성');
  
  const typeKey = state.travelTypeKey || 'cozy_healer';
  const typeInfo = TRAVEL_TYPES[typeKey];
  const destination = planState.destination.toLowerCase();
  
  let availablePlaces = PLACES_DB.filter(p => {
    if (destination.includes(p.city.toLowerCase())) return true;
    if (destination.includes(p.region.toLowerCase())) return true;
    return false;
  });
  
  if (availablePlaces.length === 0) {
    availablePlaces = PLACES_DB;
  }
  
  const recNames = Object.values(typeInfo.rec || {}).flat();
  const preferredPlaces = availablePlaces.filter(p => 
    recNames.some(name => p.name.includes(name) || name.includes(p.name))
  );
  
  planState.days.forEach((day, idx) => {
    const slotsPerDay = idx === 0 || idx === planState.days.length - 1 ? 3 : 4;
    const categories = ['attraction', 'cafe', 'restaurant', 'activity', 'attraction'];
    const selectedPlaces = [];
    
    for (let i = 0; i < slotsPerDay; i++) {
      const cat = categories[i % categories.length];
      const pool = (preferredPlaces.length > 0 ? preferredPlaces : availablePlaces)
        .filter(p => p.category === cat && !selectedPlaces.some(s => s.id === p.id));
      
      if (pool.length > 0) {
        const randomPlace = pool[Math.floor(Math.random() * pool.length)];
        selectedPlaces.push(randomPlace);
      }
    }
    
    const startHour = 9;
    selectedPlaces.forEach((place, slotIdx) => {
      const hour = startHour + (slotIdx * 3);
      const time = hour.toString().padStart(2, '0') + ':00';
      
      let budget = 0;
      if (['attraction', 'activity', 'accommodation'].includes(place.category)) {
        const priceMap = {
          'free': 0,
          'cheap': 10000,
          'moderate': 30000,
          'expensive': 50000
        };
        budget = priceMap[place.price || place.price_range] || 15000;
      }
      
      day.slots.push({
        id: 'slot_' + Date.now() + '_' + Math.random(),
        name: place.name,
        budget: budget,
        time: time,
        category: place.category,
        placeId: place.id
      });
    });
  });
  
  console.log('✅ 기본 일정 생성 완료');
}

// 일정 페이지 진입 시 불러오기
document.querySelector('.nav-btn[data-page="plan"]').addEventListener('click', () => {
  loadPlan();
});

/* ══════════════════════════════════════════════
   라이브러리 기능 (작성한 일정 모아보기)
   ══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   라이브러리 기능 (완전히 새로 구현)
   ══════════════════════════════════════════════ */

// 라이브러리에서 일정 목록 가져오기
function getLibraryPlans() {
  try {
    const saved = localStorage.getItem(LIBRARY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('라이브러리 불러오기 실패:', e);
    return [];
  }
}

// 라이브러리에 일정 저장
function saveToLibrary() {
  if (!planState.id || !planState.title) {
    console.log('⚠️ 저장할 일정 정보 부족');
    return;
  }
  
  const plans = getLibraryPlans();
  
  // 기존 일정 찾기
  const existingIdx = plans.findIndex(p => p.id === planState.id);
  
  const planData = {
    id: planState.id,
    title: planState.title,
    destination: planState.destination,
    startDate: planState.startDate,
    endDate: planState.endDate,
    people: planState.people,
    transport: planState.transport,
    memo: planState.memo,
    days: JSON.parse(JSON.stringify(planState.days)),
    createdAt: planState.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (existingIdx >= 0) {
    plans[existingIdx] = planData;
    console.log('📚 기존 일정 업데이트:', planData.title);
  } else {
    plans.unshift(planData);
    console.log('📚 새 일정 저장:', planData.title);
  }
  
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(plans));
    console.log('✅ 라이브러리 저장 완료');
  } catch (e) {
    console.error('❌ 라이브러리 저장 실패:', e);
  }
}

// 라이브러리 렌더링
function renderLibrary() {
  console.log('📚 라이브러리 렌더링 시작');
  
  const emptyState = document.getElementById('library-empty');
  const grid = document.getElementById('library-grid');
  
  if (!emptyState || !grid) {
    console.error('❌ 라이브러리 요소를 찾을 수 없습니다');
    return;
  }
  
  const plans = getLibraryPlans();
  console.log('📚 저장된 일정 개수:', plans.length);
  
  if (plans.length === 0) {
    emptyState.classList.remove('hidden');
    emptyState.style.display = 'block';
    grid.classList.add('hidden');
    grid.style.display = 'none';
    return;
  }
  
  emptyState.classList.add('hidden');
  emptyState.style.display = 'none';
  grid.classList.remove('hidden');
  grid.style.display = 'grid';
  
  // 일정 카드 HTML 생성
  let cardsHTML = '';
  plans.forEach(plan => {
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const dayCount = plan.days ? plan.days.length : 0;
    const slotCount = plan.days ? plan.days.reduce((sum, day) => sum + (day.slots ? day.slots.length : 0), 0) : 0;
    
    cardsHTML += `
      <div class="library-card" data-plan-id="${plan.id}" style="cursor: pointer;">
        <div class="library-card-header">
          <h3 class="library-card-title">${plan.title}</h3>
        </div>
        <div class="library-card-meta">
          <span>📍 ${plan.destination || '미정'}</span>
          <span>📅 ${formatDate(start)} ~ ${formatDate(end)}</span>
        </div>
        <div class="library-card-info">
          <span>${dayCount}일 일정</span>
          <span>•</span>
          <span>${slotCount}개 장소</span>
        </div>
      </div>
    `;
  });
  
  grid.innerHTML = cardsHTML;
  
  // 이벤트 리스너 등록 - 카드 클릭 시 바로 팝업 열기
  grid.querySelectorAll('.library-card').forEach(card => {
    card.addEventListener('click', () => {
      openPlanDetail(card.dataset.planId);
    });
  });
  
  console.log('✅ 라이브러리 렌더링 완료');
}

// 라이브러리에서 일정 삭제
function deletePlanFromLibrary(planId) {
  const plans = getLibraryPlans();
  const plan = plans.find(p => p.id === planId);
  
  if (!plan) {
    showToast('일정을 찾을 수 없습니다.', 'error');
    return;
  }
  
  showConfirm(
    `"${plan.title}" 일정을 삭제하시겠습니까?`,
    '이 작업은 되돌릴 수 없습니다.',
    '🗑️',
    () => {
      const filteredPlans = plans.filter(p => p.id !== planId);
      
      try {
        localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(filteredPlans));
        console.log('✅ 일정 삭제 완료');
        
        // 현재 일정이 삭제된 일정이면 초기화
        if (planState.id === planId) {
          clearCurrentPlan();
        }
        
        renderLibrary();
        showToast('일정이 삭제되었습니다.', 'success');
      } catch (e) {
        console.error('❌ 일정 삭제 실패:', e);
        showToast('일정 삭제에 실패했습니다.', 'error');
      }
    }
  );
}

console.log('✅ 라이브러리 모듈 로드 완료');

/* ══════════════════════════════════════════════
   ⑤ 즐겨찾기 페이지 (장소 / 일정 2분류)
   ══════════════════════════════════════════════ */

// 즐겨찾기 상태
const favoritesState = {
  places: [], // 장소 즐겨찾기
  plans: []   // 일정 즐겨찾기
};

// 즐겨찾기 불러오기
function loadFavorites() {
  try {
    const savedPlaces = localStorage.getItem(FAVORITES_PLACES_KEY);
    const savedPlans = localStorage.getItem(FAVORITES_PLANS_KEY);
    
    if (savedPlaces) {
      favoritesState.places = JSON.parse(savedPlaces);
      console.log('✅ 장소 즐겨찾기 불러오기 완료:', favoritesState.places.length + '개');
    }
    if (savedPlans) {
      favoritesState.plans = JSON.parse(savedPlans);
      console.log('✅ 일정 즐겨찾기 불러오기 완료:', favoritesState.plans.length + '개');
    }
  } catch (e) {
    console.error('즐겨찾기 불러오기 실패:', e);
  }
}

// 즐겨찾기 저장
function saveFavoritesPlaces() {
  try {
    localStorage.setItem(FAVORITES_PLACES_KEY, JSON.stringify(favoritesState.places));
    console.log('💾 장소 즐겨찾기 저장 완료');
  } catch (e) {
    console.error('장소 즐겨찾기 저장 실패:', e);
  }
}

function saveFavoritesPlans() {
  try {
    localStorage.setItem(FAVORITES_PLANS_KEY, JSON.stringify(favoritesState.plans));
    console.log('💾 일정 즐겨찾기 저장 완료');
  } catch (e) {
    console.error('일정 즐겨찾기 저장 실패:', e);
  }
}

// 장소 즐겨찾기 추가
function addToFavorites(placeId) {
  const place = PLACES_DB.find(p => p.id === placeId);
  if (!place) {
    console.error('장소를 찾을 수 없습니다:', placeId);
    return;
  }
  
  // 이미 있는지 확인
  if (favoritesState.places.some(item => item.id === placeId)) {
    alert('이미 즐겨찾기에 추가된 장소입니다.');
    return;
  }
  
  favoritesState.places.push({
    id: place.id,
    name: place.name,
    category: place.category,
    city: place.city,
    rating: place.rating,
    price: place.price,
    tags: place.tags,
    img: place.img
  });
  
  saveFavoritesPlaces();
  alert('즐겨찾기에 추가되었습니다!');
}

// 장소 즐겨찾기 제거
function removeFromFavorites(placeId) {
  const idx = favoritesState.places.findIndex(item => item.id === placeId);
  if (idx === -1) return;
  
  if (!confirm('"' + favoritesState.places[idx].name + '"을(를) 즐겨찾기에서 제거하시겠습니까?')) return;
  
  favoritesState.places.splice(idx, 1);
  saveFavoritesPlaces();
  renderFavoritesPlaces();
}

// 일정 즐겨찾기 추가
function addPlanToFavorites(plan) {
  if (favoritesState.plans.some(p => p.id === plan.id)) return;
  
  favoritesState.plans.push(JSON.parse(JSON.stringify(plan)));
  saveFavoritesPlans();
}

// 일정 즐겨찾기 제거
function removePlanFromFavorites(planId) {
  favoritesState.plans = favoritesState.plans.filter(p => p.id !== planId);
  saveFavoritesPlans();
}

// 탭 전환
document.querySelectorAll('.fav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.fav-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    const type = tab.dataset.type;
    document.querySelectorAll('.fav-section').forEach(s => s.classList.add('hidden'));
    
    if (type === 'places') {
      document.getElementById('favorites-places-section').classList.remove('hidden');
      renderFavoritesPlaces();
    } else {
      document.getElementById('favorites-plans-section').classList.remove('hidden');
      renderFavoritesPlans();
    }
  });
});

// 장소 즐겨찾기 렌더링
function renderFavoritesPlaces() {
  const emptyState = document.getElementById('favorites-places-empty');
  const grid = document.getElementById('favorites-places-grid');
  
  if (favoritesState.places.length === 0) {
    emptyState.classList.remove('hidden');
    grid.classList.add('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  grid.classList.remove('hidden');
  
  let cardsHTML = '';
  favoritesState.places.forEach(item => {
    const place = PLACES_DB.find(p => p.id === item.id) || item;
    cardsHTML += makePlaceCard(place, false);
  });
  
  grid.innerHTML = cardsHTML;
  
  // 카드 클릭 이벤트
  grid.querySelectorAll('.item-card').forEach(card => {
    card.addEventListener('click', () => {
      console.log('즐겨찾기 카드 클릭:', card.dataset.id);
      showDetail(card.dataset.id);
    });
  });
}

// 일정 즐겨찾기 렌더링
function renderFavoritesPlans() {
  const emptyState = document.getElementById('favorites-plans-empty');
  const grid = document.getElementById('favorites-plans-grid');
  
  // 라이브러리에서 즐겨찾기된 일정 가져오기
  const plans = getLibraryPlans();
  const favPlans = plans.filter(p => p.isFavorite);
  
  if (favPlans.length === 0) {
    emptyState.classList.remove('hidden');
    grid.classList.add('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  grid.classList.remove('hidden');
  
  let cardsHTML = '';
  favPlans.forEach(plan => {
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const dayCount = plan.days.length;
    const slotCount = plan.days.reduce((sum, day) => sum + day.slots.length, 0);
    
    cardsHTML += '<div class="library-card" data-id="' + plan.id + '">' +
      '<div class="library-card-header">' +
      '<h3 class="library-card-title">' + plan.title + '</h3>' +
      '<button class="btn-icon btn-fav-plan active" data-id="' + plan.id + '" title="즐겨찾기 해제">❤️</button>' +
      '</div>' +
      '<div class="library-card-meta">' +
      '<span>📍 ' + plan.destination + '</span>' +
      '<span>📅 ' + formatDate(start) + ' ~ ' + formatDate(end) + '</span>' +
      '</div>' +
      '<div class="library-card-info">' +
      '<span>' + dayCount + '일 일정</span>' +
      '<span>•</span>' +
      '<span>' + slotCount + '개 장소</span>' +
      (plan.useAI ? '<span class="ai-badge">🤖 AI 추천</span>' : '') +
      '</div>' +
      '<div class="library-card-actions">' +
      '<button class="btn btn-secondary btn-sm" onclick="loadPlanFromLibrary(\'' + plan.id + '\')">불러오기</button>' +
      '</div>' +
      '</div>';
  });
  
  grid.innerHTML = cardsHTML;
  
  // 즐겨찾기 버튼 이벤트
  grid.querySelectorAll('.btn-fav-plan').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlanFavorite(btn.dataset.id);
      renderFavoritesPlans(); // 재렌더링
    });
  });
}

// 즐겨찾기 페이지 진입 시 렌더링
document.querySelector('.nav-btn[data-page="favorites"]').addEventListener('click', () => {
  loadFavorites();
  renderFavoritesPlaces(); // 기본은 장소 탭
});

/* ══════════════════════════════════════════════
   ⑥ 장소 세부 페이지
   ══════════════════════════════════════════════ */

let currentDetailId = null;

// 세부 페이지 표시
function showDetail(placeId) {
  console.log('🔍 showDetail 호출됨, placeId:', placeId);
  
  const place = PLACES_DB.find(p => p.id === placeId);
  if (!place) {
    console.error('❌ 장소를 찾을 수 없습니다:', placeId);
    alert('장소 정보를 찾을 수 없습니다.');
    return;
  }
  
  console.log('✅ 장소 찾음:', place.name);
  currentDetailId = placeId;
  
  // 페이지 전환
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-detail').classList.add('active');
  
  // 세부 정보 렌더링
  const container = document.getElementById('detail-content');
  
  const bg = {
    attraction: '#EEF3FF',
    restaurant: '#FFF5F5',
    cafe: '#FFFAF0',
    accommodation: '#F0FFF4',
    activity: '#F0F4FF'
  }[place.category] || '#F4F6FB';
  
  const emoji = place.img || {
    attraction: '🏛',
    restaurant: '🍽',
    cafe: '☕',
    accommodation: '🏨',
    activity: '🎡'
  }[place.category] || '📍';
  
  const priceLabels = { free: '무료', cheap: '저렴', moderate: '보통', expensive: '고급' };
  const priceKey = place.price || place.price_range || '';
  const priceLabel = priceLabels[priceKey] || '정보 없음';
  
  const categoryLabels = {
    attraction: '🏛 여행지',
    restaurant: '🍽 맛집',
    cafe: '☕ 카페',
    accommodation: '🏨 숙소',
    activity: '🎡 액티비티'
  };
  
  let tagsHTML = '';
  if (place.tags) {
    place.tags.forEach(t => {
      tagsHTML += '<span class="detail-tag">' + t + '</span>';
    });
  }
  
  const isFavorite = favoritesState && favoritesState.places ? favoritesState.places.some(item => item.id === placeId) : false;
  
  container.innerHTML = '<div class="detail-card">' +
    '<div class="detail-hero" style="background:' + bg + '">' +
    '<div class="detail-emoji">' + emoji + '</div>' +
    '</div>' +
    '<div class="detail-body">' +
    '<div class="detail-category">' + (categoryLabels[place.category] || '') + '</div>' +
    '<h2 class="detail-name">' + place.name + '</h2>' +
    '<div class="detail-meta">' +
    '<span class="detail-rating">★ ' + place.rating + '</span>' +
    '<span class="detail-price">' + priceLabel + '</span>' +
    '</div>' +
    '<div class="detail-tags">' + tagsHTML + '</div>' +
    '<p class="detail-desc">' + (place.desc || '설명이 없습니다.') + '</p>' +
    '<div class="detail-info-grid">' +
    '<div class="detail-info-item">' +
    '<div class="detail-info-label">📍 위치</div>' +
    '<div class="detail-info-value">' + (place.address || place.city || '정보 없음') + '</div>' +
    '</div>' +
    '<div class="detail-info-item">' +
    '<div class="detail-info-label">⏰ 운영시간</div>' +
    '<div class="detail-info-value">' + (place.hours || '정보 없음') + '</div>' +
    '</div>' +
    '<div class="detail-info-item">' +
    '<div class="detail-info-label">📞 연락처</div>' +
    '<div class="detail-info-value">' + (place.phone || '정보 없음') + '</div>' +
    '</div>' +
    '<div class="detail-info-item">' +
    '<div class="detail-info-label">⏱ 소요시간</div>' +
    '<div class="detail-info-value">' + (place.duration ? place.duration + '분' : '정보 없음') + '</div>' +
    '</div>' +
    '</div>' +
    '<div class="detail-actions">' +
    '<button class="btn btn-secondary" id="btn-toggle-favorite">' + (isFavorite ? '❤️ 즐겨찾기 해제' : '🤍 즐겨찾기 추가') + '</button>' +
    '<button class="btn btn-primary" id="btn-add-to-schedule">일정에 추가 →</button>' +
    '</div>' +
    '</div>' +
    '</div>';
  
  // 이벤트 리스너
  document.getElementById('btn-toggle-favorite').addEventListener('click', () => {
    if (isFavorite) {
      removeFromFavorites(placeId);
    } else {
      addToFavorites(placeId);
    }
    showDetail(placeId); // 재렌더링
  });
  
  document.getElementById('btn-add-to-schedule').addEventListener('click', () => {
    alert('일정 추가 기능은 다음 단계에서 구현됩니다.');
  });
}

// 뒤로 버튼
document.getElementById('btn-back-detail').addEventListener('click', () => {
  document.getElementById('page-detail').classList.remove('active');
  document.getElementById('page-recommend').classList.add('active');
});

/* ══════════════════════════════════════════════
   ⑦ 카드 다중 선택 기능
   ══════════════════════════════════════════════ */

// 선택 토글
// 선택 토글
function toggleSelection(placeId) {
  const place = PLACES_DB.find(p => p.id === placeId) || 
                SEASON_RECS.find(p => p.id === placeId) || 
                THEME_RECS.find(p => p.id === placeId);
  
  if (!place) return;
  
  const idx = state.selectedItems.findIndex(item => item.id === placeId);
  if (idx === -1) {
    state.selectedItems.push(place);
  } else {
    state.selectedItems.splice(idx, 1);
  }
}

// 선택 UI 업데이트
function updateSelectionUI() {
  // 카드 선택 상태 업데이트
  document.querySelectorAll('.item-card').forEach(card => {
    const isSelected = state.selectedItems.some(item => item.id === card.dataset.id);
    card.classList.toggle('selected', isSelected);
    const checkbox = card.querySelector('.item-checkbox');
    if (checkbox) {
      checkbox.textContent = isSelected ? '✓' : '';
    }
  });
  
  // 선택 카운트 업데이트
  const countEl = document.getElementById('selected-count');
  if (countEl) {
    countEl.textContent = state.selectedItems.length + '개 선택됨';
  }
}

// 선택 모드 활성화 (일정 페이지에서 호출)
function enableSelectionMode(dayIdx, insertIdx = null) {
  state.selectionMode = true;
  state.selectedItems = [];
  state.targetDay = dayIdx;
  state.targetInsertIdx = insertIdx; // 삽입 위치 저장
  
  // 추천 페이지로 이동
  goToPage('recommend');
  
  // 푸터 표시
  const footer = document.getElementById('plan-footer');
  if (footer) {
    footer.classList.remove('hidden');
  }
  
  // 카드 재렌더링
  if (document.getElementById('rec-sections').classList.contains('hidden')) {
    doSearch(); // 검색 결과가 있으면 재렌더링
  } else {
    initRecSections(); // 추천 섹션 재렌더링
  }
}

// 선택 모드 비활성화
function disableSelectionMode() {
  state.selectionMode = false;
  state.selectedItems = [];
  state.targetDay = null;
  state.targetInsertIdx = null;
  
  // 푸터 숨김
  const footer = document.getElementById('plan-footer');
  if (footer) {
    footer.classList.add('hidden');
  }
  
  // 카드 재렌더링
  if (document.getElementById('rec-sections').classList.contains('hidden')) {
    doSearch();
  } else {
    initRecSections();
  }
}

// 일정에 추가 버튼
const btnAddToPlan = document.getElementById('btn-add-to-plan');
if (btnAddToPlan) {
  btnAddToPlan.addEventListener('click', () => {
    if (state.selectedItems.length === 0) {
      alert('장소를 선택해주세요.');
      return;
    }
    
    if (state.targetDay === null) {
      alert('일정 정보가 없습니다.');
      return;
    }
    
    // 선택된 장소를 일정에 추가
    state.selectedItems.forEach(place => {
      console.log('📍 추가할 장소:', place);
      
      // 예산 계산 (입장료가 있는 카테고리만)
      let budget = 0;
      if (['attraction', 'activity', 'accommodation'].includes(place.category)) {
        const priceMap = {
          'free': 0,
          'cheap': 10000,
          'moderate': 30000,
          'expensive': 50000
        };
        budget = priceMap[place.price || place.price_range] || 0;
      }
      
      console.log('💰 예산:', budget);
      
      const newSlot = {
        id: 'slot_' + Date.now() + '_' + Math.random(),
        name: place.name,
        budget: budget,
        time: '',
        category: place.category,
        placeId: place.id
      };
      
      // 삽입 위치가 지정되어 있으면 해당 위치에 삽입
      if (state.targetInsertIdx !== null) {
        planState.days[state.targetDay].slots.splice(state.targetInsertIdx, 0, newSlot);
      } else {
        planState.days[state.targetDay].slots.push(newSlot);
      }
    });
    
    savePlan();
    disableSelectionMode();
    goToPage('plan');
    renderSchedule();
    
    alert(state.selectedItems.length + '개 장소가 일정에 추가되었습니다!');
  });
}

// DOM 로드 후 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM 로드 완료');
    renderQuiz();
    loadPlan();
    loadFavorites();
  });
} else {
  console.log('🚀 즉시 실행');
  renderQuiz();
  loadPlan();
  loadFavorites();
}


/* ══════════════════════════════════════════════
   AI 챗봇 기능
   ══════════════════════════════════════════════ */

const chatbotState = {
  messages: [],
  recommendedPlaces: [],
  selectedPlaces: [],
  isOpen: false
};

// 챗봇 열기
document.getElementById('btn-open-chatbot').addEventListener('click', () => {
  openChatbot();
});

// 챗봇 닫기
document.getElementById('btn-close-chatbot').addEventListener('click', () => {
  closeChatbot();
});

document.getElementById('chatbot-overlay').addEventListener('click', () => {
  closeChatbot();
});

function openChatbot() {
  const modal = document.getElementById('chatbot-modal');
  modal.classList.remove('hidden');
  chatbotState.isOpen = true;
  
  // 입력창 포커스
  setTimeout(() => {
    document.getElementById('chatbot-input').focus();
  }, 100);
}

function closeChatbot() {
  const modal = document.getElementById('chatbot-modal');
  modal.classList.add('hidden');
  chatbotState.isOpen = false;
}

// 메시지 전송
document.getElementById('btn-send-message').addEventListener('click', () => {
  sendMessage();
});

document.getElementById('chatbot-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const input = document.getElementById('chatbot-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  // 사용자 메시지 추가
  addChatMessage('user', message);
  input.value = '';
  
  // 로딩 표시
  showChatLoading();
  
  // AI 응답 시뮬레이션 (실제로는 API 호출)
  setTimeout(() => {
    processChatMessage(message);
  }, 1000);
}

function addChatMessage(type, content) {
  const messagesContainer = document.getElementById('chatbot-messages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message ' + type;
  
  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar';
  avatar.textContent = type === 'user' ? '👤' : '🤖';
  
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = content;
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  chatbotState.messages.push({ type, content });
}

function showChatLoading() {
  const messagesContainer = document.getElementById('chatbot-messages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message bot';
  messageDiv.id = 'loading-message';
  
  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar';
  avatar.textContent = '🤖';
  
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble loading';
  bubble.innerHTML = '<span></span><span></span><span></span>';
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeChatLoading() {
  const loadingMsg = document.getElementById('loading-message');
  if (loadingMsg) {
    loadingMsg.remove();
  }
}

// 메시지 처리 (실제로는 API 호출)
function processChatMessage(message) {
  removeChatLoading();
  
  // 현재 일정에서 방문 지역 추출
  const visitedCities = new Set();
  const visitedPlaces = [];
  
  planState.days.forEach(day => {
    day.slots.forEach(slot => {
      if (slot.placeId) {
        const place = PLACES_DB.find(p => p.id === slot.placeId);
        if (place) {
          visitedCities.add(place.city);
          visitedPlaces.push({
            name: place.name,
            city: place.city,
            category: place.category,
            day: day.day
          });
        }
      }
    });
  });
  
  const citiesArray = Array.from(visitedCities);
  
  // TODO: 실제 AI API 호출
  // const response = await fetch('/api/chatbot/recommend', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ 
  //     message, 
  //     userType: state.travelTypeKey,
  //     destination: planState.destination,
  //     people: planState.people,
  //     budget: planState.budget,
  //     visitedCities: citiesArray,
  //     visitedPlaces: visitedPlaces,
  //     schedule: planState.days.map(day => ({
  //       day: day.day,
  //       date: day.date,
  //       places: day.slots.map(slot => ({
  //         name: slot.name,
  //         category: slot.category,
  //         time: slot.time
  //       }))
  //     }))
  //   })
  // });
  // const data = await response.json();
  
  // 임시: 일정표 기반 로컬 검색
  const keywords = message.toLowerCase();
  let places = [];
  
  // 1. 메시지에서 특정 지역 언급 확인
  let targetCity = null;
  citiesArray.forEach(city => {
    if (keywords.includes(city.toLowerCase())) {
      targetCity = city;
    }
  });
  
  // 2. 특정 지역이 없으면 일정표의 모든 지역에서 검색
  const searchCities = targetCity ? [targetCity] : citiesArray;
  
  if (searchCities.length === 0) {
    // 일정에 장소가 없으면 목적지 기반 검색
    const dest = planState.destination.toLowerCase();
    places = PLACES_DB.filter(p => 
      p.city.toLowerCase().includes(dest) &&
      (p.name.toLowerCase().includes(keywords) ||
       p.tags.some(t => t.toLowerCase().includes(keywords)) ||
       p.category.toLowerCase().includes(keywords))
    );
  } else {
    // 일정표의 지역 기반 검색
    places = PLACES_DB.filter(p => {
      // 방문 지역 내에서만 검색
      if (!searchCities.some(city => p.city.includes(city))) return false;
      
      // 이미 일정에 있는 장소는 제외
      if (visitedPlaces.some(vp => vp.name === p.name)) return false;
      
      // 키워드 매칭
      return p.name.toLowerCase().includes(keywords) ||
             p.tags.some(t => t.toLowerCase().includes(keywords)) ||
             p.category.toLowerCase().includes(keywords);
    });
  }
  
  // 결과가 없으면 방문 지역의 인기 장소 추천
  if (places.length === 0 && searchCities.length > 0) {
    places = PLACES_DB.filter(p => 
      searchCities.some(city => p.city.includes(city)) &&
      !visitedPlaces.some(vp => vp.name === p.name)
    ).sort((a, b) => b.rating - a.rating).slice(0, 5);
    
    const cityNames = searchCities.join(', ');
    addChatMessage('bot', `${cityNames} 지역의 인기 장소를 추천해드릴게요!`);
  } else if (places.length === 0) {
    places = PLACES_DB.slice(0, 5);
    addChatMessage('bot', '검색 결과가 없어서 인기 장소를 추천해드릴게요!');
  } else {
    places = places.slice(0, 5);
    const locationInfo = targetCity ? `${targetCity} 지역의` : '일정 지역 내';
    addChatMessage('bot', `${locationInfo} ${places.length}개의 장소를 찾았어요! 아래에서 선택해주세요.`);
  }
  
  // 추천 장소 표시
  showRecommendedPlaces(places);
}

function showRecommendedPlaces(places) {
  chatbotState.recommendedPlaces = places;
  chatbotState.selectedPlaces = [];
  
  const recSection = document.getElementById('chatbot-recommendations');
  const recList = document.getElementById('chatbot-rec-list');
  
  recSection.classList.remove('hidden');
  
  recList.innerHTML = places.map(place => {
    const bg = {
      attraction: '#EEF3FF',
      restaurant: '#FFF5F5',
      cafe: '#FFFAF0',
      accommodation: '#F0FFF4',
      activity: '#F0F4FF'
    }[place.category] || '#F4F6FB';
    
    const emoji = {
      attraction: '🏛',
      restaurant: '🍽',
      cafe: '☕',
      accommodation: '🏨',
      activity: '🎡'
    }[place.category] || '📍';
    
    return `
      <div class="chatbot-rec-item" data-place-id="${place.id}">
        <div class="chatbot-rec-checkbox"></div>
        <div class="chatbot-rec-thumb" style="background:${bg}">${emoji}</div>
        <div class="chatbot-rec-info">
          <div class="chatbot-rec-name">${place.name}</div>
          <div class="chatbot-rec-meta">📍 ${place.city} · ⭐ ${place.rating}</div>
        </div>
      </div>
    `;
  }).join('');
  
  // 클릭 이벤트
  recList.querySelectorAll('.chatbot-rec-item').forEach(item => {
    item.addEventListener('click', () => {
      toggleChatbotPlace(item.dataset.placeId);
    });
  });
  
  updateChatbotSelectionCount();
}

function toggleChatbotPlace(placeId) {
  const place = chatbotState.recommendedPlaces.find(p => p.id === placeId);
  if (!place) return;
  
  const idx = chatbotState.selectedPlaces.findIndex(p => p.id === placeId);
  if (idx === -1) {
    chatbotState.selectedPlaces.push(place);
  } else {
    chatbotState.selectedPlaces.splice(idx, 1);
  }
  
  // UI 업데이트
  const item = document.querySelector(`.chatbot-rec-item[data-place-id="${placeId}"]`);
  if (item) {
    item.classList.toggle('selected');
    const checkbox = item.querySelector('.chatbot-rec-checkbox');
    checkbox.textContent = item.classList.contains('selected') ? '✓' : '';
  }
  
  updateChatbotSelectionCount();
}

function updateChatbotSelectionCount() {
  const countEl = document.getElementById('chatbot-selected-count');
  countEl.textContent = chatbotState.selectedPlaces.length + '개 선택됨';
}

// 선택한 장소 일정에 추가
document.getElementById('btn-add-chatbot-places').addEventListener('click', () => {
  if (chatbotState.selectedPlaces.length === 0) {
    alert('장소를 선택해주세요.');
    return;
  }
  
  // 어느 날짜에 추가할지 선택
  const dayOptions = planState.days.map((day, idx) => 
    `${idx + 1}. Day ${day.day} (${day.date})`
  ).join('\n');
  
  const dayChoice = prompt('어느 날짜에 추가하시겠습니까?\n\n' + dayOptions + '\n\n번호를 입력하세요:', '1');
  const dayIdx = parseInt(dayChoice) - 1;
  
  if (dayIdx < 0 || dayIdx >= planState.days.length) {
    alert('올바른 날짜를 선택해주세요.');
    return;
  }
  
  // 선택한 장소들을 일정에 추가
  chatbotState.selectedPlaces.forEach(place => {
    // 예산 계산
    let budget = 0;
    if (['attraction', 'activity', 'accommodation'].includes(place.category)) {
      const priceMap = {
        'free': 0,
        'cheap': 10000,
        'moderate': 30000,
        'expensive': 50000
      };
      budget = priceMap[place.price || place.price_range] || 15000;
    }
    
    planState.days[dayIdx].slots.push({
      id: 'slot_' + Date.now() + '_' + Math.random(),
      name: place.name,
      budget: budget,
      time: '',
      category: place.category,
      placeId: place.id
    });
  });
  
  savePlan();
  renderSchedule();
  
  // 챗봇 닫기
  closeChatbot();
  
  // 성공 메시지
  alert(chatbotState.selectedPlaces.length + '개의 장소가 Day ' + (dayIdx + 1) + '에 추가되었습니다!');
  
  // 상태 초기화
  chatbotState.selectedPlaces = [];
  chatbotState.recommendedPlaces = [];
  document.getElementById('chatbot-recommendations').classList.add('hidden');
});

console.log('✅ AI 챗봇 모듈 로드 완료');


/* ══════════════════════════════════════════════
   라이브러리 일정 상세보기 팝업
   ══════════════════════════════════════════════ */

let currentViewingPlan = null;

// 일정 상세보기 열기
function openPlanDetail(planId) {
  const plans = getLibraryPlans();
  const plan = plans.find(p => p.id === planId);
  if (!plan) {
    showToast('일정을 찾을 수 없습니다.', 'error');
    return;
  }
  
  currentViewingPlan = plan;
  
  const modal = document.getElementById('plan-detail-modal');
  modal.classList.remove('hidden');
  
  renderPlanDetail(plan);
}

// 일정 상세보기 닫기
function closePlanDetail() {
  const modal = document.getElementById('plan-detail-modal');
  modal.classList.add('hidden');
  currentViewingPlan = null;
}

document.getElementById('btn-close-plan-detail').addEventListener('click', closePlanDetail);
document.getElementById('plan-detail-overlay').addEventListener('click', closePlanDetail);

// 수정하기 버튼 핸들러 (전역 함수)
window.handleEditPlan = function() {
  console.log('✅✅✅ 수정하기 버튼 클릭됨!');
  
  if (!currentViewingPlan) {
    console.error('❌ currentViewingPlan이 없습니다');
    showToast('수정할 일정을 찾을 수 없습니다.', 'error');
    return;
  }
  
  console.log('📝 수정할 일정:', currentViewingPlan.title);
  
  // 현재 작업 중인 일정이 있으면 즉시 저장
  if (planState.id && planState.days.length > 0 && planState.id !== currentViewingPlan.id) {
    console.log('💾 기존 일정 자동 저장');
    saveToLibrary();
    showToast('기존 일정이 저장되었습니다.', 'success', 2000);
  }
  
  // 수정할 일정 로드
  console.log('📋 일정 로드 시작');
  planState = JSON.parse(JSON.stringify(currentViewingPlan));
  console.log('✅ planState 로드 완료:', planState);
  
  // 팝업 닫기
  closePlanDetail();
  
  // 일정 작성 탭으로 전환
  console.log('🔄 일정 작성 탭으로 전환 시작');
  switchPlanTab('create');
  
  // 약간의 딜레이 후 폼 채우기 및 렌더링
  setTimeout(() => {
    console.log('📝 폼 채우기 시작');
    
    // 폼 채우기
    document.getElementById('plan-title').value = planState.title || '';
    document.getElementById('plan-destination').value = planState.destination || '';
    document.getElementById('plan-start-date').value = planState.startDate || '';
    document.getElementById('plan-end-date').value = planState.endDate || '';
    document.getElementById('plan-people').value = planState.people || '2';
    document.getElementById('plan-transport').value = planState.transport || '자가용';
    document.getElementById('plan-memo').value = planState.memo || '';
    
    console.log('✅ 폼 채우기 완료');
    
    // 일정표 렌더링
    renderSchedule();
    console.log('✅ 일정표 렌더링 완료');
    
    // 안내 팝업 표시
    showToast('일정을 수정할 수 있습니다. 수정 후 자동으로 저장됩니다!', 'info', 3000);
  }, 200);
};

// 삭제하기 버튼 핸들러 (전역 함수)
window.handleDeletePlan = function() {
  console.log('🗑️ 삭제 버튼 클릭됨!');
  
  if (!currentViewingPlan) return;
  
  showConfirm(
    `"${currentViewingPlan.title}" 일정을 삭제하시겠습니까?`,
    '삭제된 일정은 복구할 수 없습니다.',
    '🗑️',
    () => {
      const plans = getLibraryPlans();
      const filteredPlans = plans.filter(p => p.id !== currentViewingPlan.id);
      
      try {
        localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(filteredPlans));
        
        if (planState.id === currentViewingPlan.id) {
          localStorage.removeItem(PLAN_STORAGE_KEY);
          planState = {
            id: null,
            title: '',
            destination: '',
            startDate: '',
            endDate: '',
            people: '2',
            transport: '자가용',
            memo: '',
            useAI: false,
            days: [],
            createdAt: null
          };
        }
        
        closePlanDetail();
        renderLibrary();
        showToast('일정이 삭제되었습니다.', 'success');
      } catch (e) {
        console.error('❌ 삭제 실패:', e);
        showToast('일정 삭제에 실패했습니다.', 'error');
      }
    }
  );
};

// 일정 상세 렌더링
function renderPlanDetail(plan) {
  // 제목
  document.getElementById('plan-detail-title').textContent = plan.title || '여행 일정';
  
  // 정보
  const infoHTML = `
    <div class="plan-info-item">
      <div class="plan-info-label">📍 여행지</div>
      <div class="plan-info-value">${plan.destination || '미정'}</div>
    </div>
    <div class="plan-info-item">
      <div class="plan-info-label">📅 기간</div>
      <div class="plan-info-value">${formatDateRange(plan.startDate, plan.endDate)}</div>
    </div>
    <div class="plan-info-item">
      <div class="plan-info-label">👥 인원</div>
      <div class="plan-info-value">${plan.people}명</div>
    </div>
    <div class="plan-info-item">
      <div class="plan-info-label">� 교통수단</div>
      <div class="plan-info-value">${plan.transport || '미정'}</div>
    </div>
    ${plan.memo ? `
    <div class="plan-info-item" style="grid-column: 1 / -1;">
      <div class="plan-info-label">📝 메모</div>
      <div class="plan-info-value">${plan.memo}</div>
    </div>
    ` : ''}
  `;
  document.getElementById('plan-detail-info').innerHTML = infoHTML;
  
  // Day별 일정
  let daysHTML = '';
  if (plan.days && plan.days.length > 0) {
    plan.days.forEach(day => {
      const dateObj = new Date(day.date);
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];
      
      daysHTML += `
        <div class="plan-detail-day">
          <div class="plan-detail-day-header">
            <div class="plan-detail-day-title">Day ${day.day}</div>
            <div class="plan-detail-day-date">${formatDate(dateObj)} (${dayOfWeek})</div>
          </div>
          <div class="plan-detail-slots">
      `;
      
      if (day.slots && day.slots.length > 0) {
        day.slots.forEach(slot => {
          const bg = {
            attraction: '#EEF3FF',
            restaurant: '#FFF5F5',
            cafe: '#FFFAF0',
            accommodation: '#F0FFF4',
            activity: '#F0F4FF'
          }[slot.category] || '#F4F6FB';
          
          const emoji = {
            attraction: '🏛',
            restaurant: '🍽',
            cafe: '☕',
            accommodation: '🏨',
            activity: '🎡'
          }[slot.category] || '📍';
          
          daysHTML += `
            <div class="plan-detail-slot">
              <div class="plan-detail-slot-thumb" style="background:${bg}">${emoji}</div>
              <div class="plan-detail-slot-info">
                <div class="plan-detail-slot-name">${slot.name}</div>
                ${slot.description ? `<div class="plan-detail-slot-desc">${slot.description}</div>` : ''}
                <div class="plan-detail-slot-meta">
                  ${slot.time ? `<span class="plan-detail-slot-time">⏰ ${slot.time}</span>` : ''}
                </div>
              </div>
            </div>
          `;
        });
      } else {
        daysHTML += '<div class="plan-detail-empty">등록된 장소가 없습니다</div>';
      }
      
      daysHTML += `
          </div>
        </div>
      `;
    });
  } else {
    daysHTML = '<div class="plan-detail-empty">일정이 없습니다</div>';
  }
  
  document.getElementById('plan-detail-days').innerHTML = daysHTML;
}

// 날짜 범위 포맷팅
function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '미정';
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return `${formatDate(start)} ~ ${formatDate(end)} (${dayCount}일)`;
}

console.log('✅ 라이브러리 상세보기 모듈 로드 완료');


/* ══════════════════════════════════════════════
   일정 탭 전환 및 자동 저장
   ══════════════════════════════════════════════ */

// 탭 전환
document.querySelectorAll('.plan-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.dataset.tab;
    console.log('📑 탭 전환:', targetTab);
    switchPlanTab(targetTab);
  });
});

function switchPlanTab(tabName) {
  console.log('🔄 switchPlanTab 호출:', tabName);
  
  // 탭 버튼 활성화
  document.querySelectorAll('.plan-tab').forEach(t => {
    const isActive = t.dataset.tab === tabName;
    t.classList.toggle('active', isActive);
    console.log('탭 버튼:', t.dataset.tab, '활성:', isActive);
  });
  
  // 탭 컨텐츠 활성화
  const createTab = document.getElementById('plan-tab-create');
  const libraryTab = document.getElementById('plan-tab-library');
  
  if (!createTab || !libraryTab) {
    console.error('❌ 탭 요소를 찾을 수 없습니다');
    return;
  }
  
  if (tabName === 'create') {
    createTab.classList.add('active');
    createTab.classList.remove('hidden');
    libraryTab.classList.remove('active');
    libraryTab.classList.add('hidden');
    console.log('✅ 일정 작성 탭 활성화');
  } else if (tabName === 'library') {
    createTab.classList.remove('active');
    createTab.classList.add('hidden');
    libraryTab.classList.add('active');
    libraryTab.classList.remove('hidden');
    console.log('✅ 라이브러리 탭 활성화');
    console.log('📚 라이브러리 요소:', libraryTab);
    console.log('📚 라이브러리 클래스:', libraryTab.className);
    // 라이브러리 렌더링
    renderLibrary();
  }
}

// 일정 페이지 진입 시
document.addEventListener('DOMContentLoaded', () => {
  const planNavBtn = document.querySelector('.nav-btn[data-page="plan"]');
  if (planNavBtn) {
    planNavBtn.addEventListener('click', () => {
      console.log('📍 일정 페이지 진입');
      // 라이브러리로 이동 플래그가 없으면 일정 작성 탭 표시
      if (!window._navigateToLibrary) {
        setTimeout(() => {
          switchPlanTab('create');
        }, 100);
      }
    });
  }
  
  // 초기 로드 시 일정 작성 탭 활성화
  const createTab = document.getElementById('plan-tab-create');
  const libraryTab = document.getElementById('plan-tab-library');
  if (createTab && libraryTab) {
    createTab.classList.add('active');
    createTab.classList.remove('hidden');
    libraryTab.classList.remove('active');
    libraryTab.classList.add('hidden');
    console.log('✅ 초기 로드: 일정 작성 탭 활성화');
  }
});

// 일정 완료 시 자동 저장 및 초기화
function completePlanAndSave() {
  if (!planState.id || planState.days.length === 0) {
    showToast('저장할 일정이 없습니다.', 'warning');
    return; // 저장할 일정이 없음
  }
  
  // 라이브러리에 저장
  saveToLibrary();
  
  console.log('✅ 일정이 라이브러리에 저장되었습니다.');
  
  // 일정 초기화
  clearCurrentPlan();
  
  // 라이브러리 탭으로 전환
  switchPlanTab('library');
  
  showToast('일정이 저장되었습니다!', 'success');
}

// 현재 일정 초기화
function clearCurrentPlan() {
  planState = {
    id: null,
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    people: '2',
    transport: '자가용',
    memo: '',
    useAI: false,
    days: [],
    createdAt: null
  };
  
  // localStorage에서 현재 일정 삭제
  localStorage.removeItem(PLAN_STORAGE_KEY);
  
  // UI 초기화
  document.getElementById('plan-info-card').classList.remove('hidden');
  document.getElementById('schedule-section').classList.add('hidden');
  
  // 폼 초기화
  document.getElementById('plan-title').value = '';
  document.getElementById('plan-destination').value = '';
  document.getElementById('plan-start-date').value = '';
  document.getElementById('plan-end-date').value = '';
  document.getElementById('plan-people').value = '2';
  document.getElementById('plan-transport').value = '자가용';
  document.getElementById('plan-memo').value = '';
  document.getElementById('use-ai-plan').checked = false;
}

// 일정 초기화 버튼에 완료 후 저장 옵션 추가
const originalClearBtn = document.getElementById('btn-clear-plan');
if (originalClearBtn) {
  originalClearBtn.removeEventListener('click', originalClearBtn.clickHandler);
  originalClearBtn.addEventListener('click', () => {
    showConfirm(
      '일정을 어떻게 하시겠습니까?',
      '',
      '💾',
      () => {
        // 저장 후 초기화
        completePlanAndSave();
      },
      () => {
        // 저장 없이 초기화 (두 번째 확인)
        showConfirm(
          '저장하지 않고 초기화하시겠습니까?',
          '이 작업은 되돌릴 수 없습니다.',
          '⚠️',
          () => {
            clearCurrentPlan();
            switchPlanTab('create');
            showToast('일정이 초기화되었습니다.', 'info');
          }
        );
      },
      '저장',
      '초기화'
    );
  });
}

// 페이지 떠날 때 자동 저장 (beforeunload 이벤트)
window.addEventListener('beforeunload', (e) => {
  if (planState.id && planState.days.length > 0) {
    saveToLibrary();
    console.log('✅ 페이지 종료 전 일정 자동 저장');
  }
});

// 다른 페이지로 이동 시 자동 저장
const originalGoToPage = goToPage;
goToPage = function(name) {
  // 일정 페이지를 떠날 때 자동 저장
  const currentPage = document.querySelector('.page.active').id.replace('page-', '');
  if (currentPage === 'plan' && name !== 'plan') {
    if (planState.id && planState.days.length > 0) {
      saveToLibrary();
      console.log('✅ 페이지 이동 전 일정 자동 저장');
    }
  }
  
  originalGoToPage(name);
};

console.log('✅ 일정 탭 전환 및 자동 저장 모듈 로드 완료');


// 전역 함수로 등록 (디버깅용)
window.switchPlanTab = switchPlanTab;
window.testLibraryTab = function() {
  console.log('🧪 라이브러리 탭 테스트');
  switchPlanTab('library');
};

// 즐겨찾기에서 라이브러리로 이동하는 함수
window.goToLibraryTab = function() {
  console.log('📚 라이브러리 탭으로 이동 시작');
  
  // 페이지 전환 전에 플래그 설정
  window._navigateToLibrary = true;
  
  // 1. 일정 페이지로 이동
  goToPage('plan');
  
  // 2. 페이지 전환 완료 후 라이브러리 탭으로 전환
  setTimeout(() => {
    console.log('🔄 라이브러리 탭 전환 시도');
    switchPlanTab('library');
    window._navigateToLibrary = false;
  }, 300);
};

console.log('✅ 탭 전환 함수 전역 등록 완료');
console.log('📝 테스트: window.testLibraryTab() 호출');
