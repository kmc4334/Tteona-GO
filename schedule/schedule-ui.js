/* ══════════════════════════════════════════════
   일정 UI 모듈 (schedule-ui.js)
   ══════════════════════════════════════════════ */

import {
  savePlanToStorage,
  loadPlanFromStorage,
  clearPlanFromStorage,
  createSchedule,
  renderSchedule,
  addToSchedule,
  addMultiplePlacesToSchedule,
  removeFromSchedule,
  updateSlotTime,
  resetScheduleForm
} from './schedule.js';

/* ── DOM 요소 참조 ───────────────────────────── */
const elements = {
  // 폼 입력
  planTitle: () => document.getElementById('plan-title'),
  planDestination: () => document.getElementById('plan-destination'),
  planStartDate: () => document.getElementById('plan-start-date'),
  planEndDate: () => document.getElementById('plan-end-date'),
  planPeople: () => document.getElementById('plan-people'),
  planBudget: () => document.getElementById('plan-budget'),
  planTransport: () => document.getElementById('plan-transport'),
  planMemo: () => document.getElementById('plan-memo'),
  
  // 버튼
  btnCreateSchedule: () => document.getElementById('btn-create-schedule'),
  btnClearPlan: () => document.getElementById('btn-clear-plan'),
  btnAddToPlan: () => document.getElementById('btn-add-to-plan'),
  
  // 섹션
  planInfoCard: () => document.getElementById('plan-info-card'),
  scheduleSection: () => document.getElementById('schedule-section'),
  scheduleTitle: () => document.getElementById('schedule-title'),
  scheduleMeta: () => document.getElementById('schedule-meta'),
  daySchedules: () => document.getElementById('day-schedules'),
  
  // 기타
  planFooter: () => document.getElementById('plan-footer'),
  selectedCount: () => document.getElementById('selected-count'),
};

/* ── 일정 생성 이벤트 ────────────────────────── */
export function initScheduleCreateHandler(state, CAT_EMOJI, goToPageCallback) {
  const btn = elements.btnCreateSchedule();
  if (!btn) return;
  
  btn.addEventListener('click', () => {
    const formData = {
      title: elements.planTitle()?.value.trim(),
      dest: elements.planDestination()?.value.trim(),
      start: elements.planStartDate()?.value,
      end: elements.planEndDate()?.value,
      people: elements.planPeople()?.value,
      budget: elements.planBudget()?.value,
      transport: elements.planTransport()?.value,
      memo: elements.planMemo()?.value,
    };
    
    const success = createSchedule(state, formData, {
      onSuccess: () => {
        renderScheduleUI(state, CAT_EMOJI, goToPageCallback);
      }
    });
  });
}

/* ── 일정표 UI 렌더링 ────────────────────────── */
export function renderScheduleUI(state, CAT_EMOJI, goToPageCallback) {
  renderSchedule(state, CAT_EMOJI, {
    updateUI: (data) => {
      if (data.hideInfoCard) {
        elements.planInfoCard()?.classList.add('hidden');
      }
      if (data.showScheduleSection) {
        elements.scheduleSection()?.classList.remove('hidden');
      }
      if (data.title) {
        const titleEl = elements.scheduleTitle();
        if (titleEl) titleEl.textContent = data.title;
      }
      if (data.meta) {
        const metaEl = elements.scheduleMeta();
        if (metaEl) metaEl.innerHTML = data.meta;
      }
    },
    renderDays: (dayCards) => {
      const container = elements.daySchedules();
      if (!container) return;
      
      container.innerHTML = dayCards.map(day => `
        <div class="day-card">
          <div class="day-header"><span>Day ${day.day} — ${day.date}</span></div>
          <div class="day-body" id="day-body-${day.dayIndex}">
            ${day.slots.map(slot => `
              <div class="slot-item">
                <div class="slot-time-wrap">
                  <input type="time" class="slot-time-input" 
                    data-day="${slot.dayIndex}" 
                    data-slot="${slot.slotIndex}" 
                    value="${slot.time}" 
                    placeholder="시간" />
                </div>
                <div class="slot-icon">${slot.icon}</div>
                <div class="slot-info">
                  <div class="slot-name">${slot.name}</div>
                  <div class="slot-meta">
                    <span>📍 ${slot.city}</span>
                    ${slot.duration ? `<span>⏱ ${slot.duration}분</span>` : ''}
                  </div>
                </div>
                <button class="slot-delete-btn" 
                  data-day="${slot.dayIndex}" 
                  data-slot="${slot.slotIndex}" 
                  title="삭제">🗑️</button>
              </div>
            `).join('')}
            <button class="add-slot-btn" data-day="${day.dayIndex}">+ 장소 추가하기</button>
          </div>
        </div>
      `).join('');
      
      // 이벤트 리스너 등록
      attachScheduleEventListeners(state, CAT_EMOJI, goToPageCallback);
    }
  });
}

/* ── 일정표 이벤트 리스너 ────────────────────── */
function attachScheduleEventListeners(state, CAT_EMOJI, goToPageCallback) {
  // 시간 입력 이벤트
  document.querySelectorAll('.slot-time-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const dayIdx = parseInt(e.target.dataset.day);
      const slotIdx = parseInt(e.target.dataset.slot);
      updateSlotTime(state, dayIdx, slotIdx, e.target.value);
    });
  });

  // 슬롯 삭제 이벤트
  document.querySelectorAll('.slot-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dayIdx = parseInt(btn.dataset.day);
      const slotIdx = parseInt(btn.dataset.slot);
      
      if (confirm('이 장소를 일정에서 삭제하시겠습니까?')) {
        removeFromSchedule(state, dayIdx, slotIdx, {
          onSuccess: () => {
            renderScheduleUI(state, CAT_EMOJI, goToPageCallback);
          }
        });
      }
    });
  });

  // 장소 추가 버튼
  document.querySelectorAll('.add-slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.fromPlanDay = parseInt(btn.dataset.day);
      elements.planFooter()?.classList.remove('hidden');
      elements.selectedCount().textContent = '0개 선택됨';
      state.selectedItems = [];
      goToPageCallback('recommend');
    });
  });
}

/* ── 장소 추가 버튼 핸들러 ───────────────────── */
export function initAddToPlanHandler(state, CAT_EMOJI, goToPageCallback) {
  const btn = elements.btnAddToPlan();
  if (!btn) return;
  
  btn.addEventListener('click', () => {
    if (!state.selectedItems.length) return;
    
    const dayIdx = state.fromPlanDay;
    
    addMultiplePlacesToSchedule(state, state.selectedItems, dayIdx, {
      onSuccess: () => {
        state.selectedItems = [];
        state.fromPlanDay = null;
        elements.planFooter()?.classList.add('hidden');
        goToPageCallback('plan');
        renderScheduleUI(state, CAT_EMOJI, goToPageCallback);
      }
    });
  });
}

/* ── 일정 페이지 네비게이션 핸들러 ───────────── */
export function initPlanPageNavigationHandler(state, CAT_EMOJI, goToPageCallback) {
  const navBtn = document.querySelector('.nav-btn[data-page="plan"]');
  if (!navBtn) return;
  
  navBtn.addEventListener('click', () => {
    // 저장된 일정 불러오기
    if (!state.planSchedule.length) {
      const loaded = loadPlanFromStorage(state);
      if (loaded && state.planInfo) {
        elements.planInfoCard()?.classList.add('hidden');
        elements.scheduleSection()?.classList.remove('hidden');
        renderScheduleUI(state, CAT_EMOJI, goToPageCallback);
      }
    } else if (state.planInfo) {
      // 이미 일정이 있으면 일정표 표시
      elements.planInfoCard()?.classList.add('hidden');
      elements.scheduleSection()?.classList.remove('hidden');
    }
  });
}

/* ── 일정 초기화 핸들러 ──────────────────────── */
export function initClearPlanHandler(state) {
  // 이벤트 위임 방식
  document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-clear-plan') {
      if (confirm('일정을 초기화하시겠습니까? 모든 데이터가 삭제됩니다.')) {
        clearPlanFromStorage(state);
        
        elements.scheduleSection()?.classList.add('hidden');
        elements.planInfoCard()?.classList.remove('hidden');
        
        // 입력 필드 초기화
        resetScheduleForm({
          clearForm: () => {
            if (elements.planTitle()) elements.planTitle().value = '';
            if (elements.planDestination()) elements.planDestination().value = '';
            if (elements.planStartDate()) elements.planStartDate().value = '';
            if (elements.planEndDate()) elements.planEndDate().value = '';
            if (elements.planPeople()) elements.planPeople().value = '2';
            if (elements.planBudget()) elements.planBudget().value = '';
            if (elements.planTransport()) elements.planTransport().value = '자가용';
            if (elements.planMemo()) elements.planMemo().value = '';
          }
        });
      }
    }
  });
}

/* ── 초기화 함수 ─────────────────────────────── */
export function initScheduleModule(state, CAT_EMOJI, goToPageCallback) {
  // 저장된 일정 불러오기
  loadPlanFromStorage(state);
  
  // 이벤트 핸들러 등록
  initScheduleCreateHandler(state, CAT_EMOJI, goToPageCallback);
  initAddToPlanHandler(state, CAT_EMOJI, goToPageCallback);
  initPlanPageNavigationHandler(state, CAT_EMOJI, goToPageCallback);
  initClearPlanHandler(state);
  
  console.log('✅ 일정 모듈 초기화 완료');
}
