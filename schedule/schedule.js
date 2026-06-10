/* ══════════════════════════════════════════════
   일정 관리 모듈 (schedule.js)
   완전 독립형 - 다른 프로젝트에 바로 사용 가능
   ══════════════════════════════════════════════ */

/**
 * 일정 모듈 메인 클래스
 * 모든 일정 관련 기능을 캡슐화
 */
class ScheduleManager {
  constructor(config = {}) {
    this.config = {
      storageKey: config.storageKey || 'ttaerago_plan',
      categoryEmojis: config.categoryEmojis || {
        attraction: '🏛',
        restaurant: '🍽',
        cafe: '☕',
        accommodation: '🏨',
        activity: '🎡'
      },
      onPageChange: config.onPageChange || null,
      onStateChange: config.onStateChange || null,
    };
    
    this.state = {
      planInfo: null,
      planSchedule: [],
      fromPlanDay: null,
      selectedItems: [],
    };
    
    this.init();
  }
  
  init() {
    this.loadFromStorage();
  }

/* ── localStorage 일정 관리 ───────────────────── */
  savePlanToStorage() {
    const state = this.state;
  if (!state.planInfo) return;
  const planData = {
    info: state.planInfo,
    schedule: state.planSchedule,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem('ttaerago_plan', JSON.stringify(planData));
  console.log('✅ 일정 저장 완료');
}

export function loadPlanFromStorage(state) {
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

export function clearPlanFromStorage(state) {
  localStorage.removeItem('ttaerago_plan');
  state.planInfo = null;
  state.planSchedule = [];
  console.log('✅ 일정 초기화 완료');
}

/* ── 일정 생성 ──────────────────────────────── */
export function createSchedule(state, formData, callbacks) {
  const { title, dest, start, end } = formData;
  
  if (!title || !dest || !start || !end) {
    alert('여행 제목, 여행지, 출발일, 도착일을 입력해주세요.');
    return false;
  }
  
  if (new Date(end) < new Date(start)) {
    alert('도착일은 출발일 이후여야 합니다.');
    return false;
  }

  const days = Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1;
  
  state.planInfo = {
    title,
    dest,
    start,
    end,
    days,
    people: formData.people,
    budget: formData.budget,
    transport: formData.transport,
    memo: formData.memo,
  };
  
  state.planSchedule = Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return { 
      day: i + 1, 
      date: d.toISOString().slice(0, 10), 
      slots: [] 
    };
  });
  
  savePlanToStorage(state);
  
  if (callbacks.onSuccess) {
    callbacks.onSuccess();
  }
  
  return true;
}

/* ── 일정표 렌더링 ──────────────────────────── */
export function renderSchedule(state, CAT_EMOJI, callbacks) {
  const info = state.planInfo;
  
  // UI 업데이트
  if (callbacks.updateUI) {
    callbacks.updateUI({
      hideInfoCard: true,
      showScheduleSection: true,
      title: `✈️ ${info.title}`,
      meta: `
        <span>📍 ${info.dest}</span>
        <span>📅 ${info.start} ~ ${info.end} (${info.days}일)</span>
        <span>👥 ${info.people}명</span>
        ${info.budget ? `<span>💰 ${info.budget}</span>` : ''}
        <span>🚗 ${info.transport}</span>`
    });
  }

  // Day 카드 생성
  const dayCards = state.planSchedule.map((day, di) => {
    const slots = day.slots.map((slot, si) => ({
      dayIndex: di,
      slotIndex: si,
      time: slot.start_time || '',
      icon: slot.img || CAT_EMOJI[slot.category] || '📍',
      name: slot.name,
      city: slot.city || '',
      duration: slot.duration || null
    }));

    return {
      day: day.day,
      date: day.date,
      dayIndex: di,
      slots
    };
  });

  if (callbacks.renderDays) {
    callbacks.renderDays(dayCards);
  }

  return dayCards;
}

/* ── 장소 추가 ──────────────────────────────── */
export function addToSchedule(state, place, callbacks) {
  const dayIdx = state.fromPlanDay;
  
  if (dayIdx === null || dayIdx === undefined || !state.planSchedule[dayIdx]) {
    return false;
  }
  
  state.planSchedule[dayIdx].slots.push(place);
  savePlanToStorage(state);
  
  state.fromPlanDay = null;
  
  if (callbacks.onSuccess) {
    callbacks.onSuccess();
  }
  
  return true;
}

/* ── 여러 장소 추가 ──────────────────────────── */
export function addMultiplePlacesToSchedule(state, places, dayIdx, callbacks) {
  if (dayIdx === null || dayIdx === undefined || !state.planSchedule[dayIdx]) {
    return false;
  }
  
  state.planSchedule[dayIdx].slots.push(...places);
  savePlanToStorage(state);
  
  if (callbacks.onSuccess) {
    callbacks.onSuccess();
  }
  
  return true;
}

/* ── 장소 삭제 ──────────────────────────────── */
export function removeFromSchedule(state, dayIdx, slotIdx, callbacks) {
  if (!state.planSchedule[dayIdx] || !state.planSchedule[dayIdx].slots[slotIdx]) {
    return false;
  }
  
  state.planSchedule[dayIdx].slots.splice(slotIdx, 1);
  savePlanToStorage(state);
  
  if (callbacks.onSuccess) {
    callbacks.onSuccess();
  }
  
  return true;
}

/* ── 시간 업데이트 ──────────────────────────── */
export function updateSlotTime(state, dayIdx, slotIdx, time) {
  if (!state.planSchedule[dayIdx] || !state.planSchedule[dayIdx].slots[slotIdx]) {
    return false;
  }
  
  state.planSchedule[dayIdx].slots[slotIdx].start_time = time;
  savePlanToStorage(state);
  
  return true;
}

/* ── 일정 초기화 ─────────────────────────────── */
export function resetScheduleForm(callbacks) {
  if (callbacks.clearForm) {
    callbacks.clearForm();
  }
}
