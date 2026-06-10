/* ══════════════════════════════════════════════
   독립형 일정 관리 모듈 (schedule-standalone.js)
   ══════════════════════════════════════════════
   
   다른 프로젝트에 바로 복사해서 사용 가능한 완전 독립형 모듈
   
   사용법:
   const schedule = new ScheduleModule({
     storageKey: 'my_plan',
     onPageChange: (page) => console.log('Go to', page)
   });
   
   schedule.createPlan(formData);
   ══════════════════════════════════════════════ */

class ScheduleModule {
  constructor(config = {}) {
    // 설정
    this.config = {
      storageKey: config.storageKey || 'travel_schedule',
      categoryEmojis: config.categoryEmojis || {
        attraction: '🏛',
        restaurant: '🍽',
        cafe: '☕',
        accommodation: '🏨',
        activity: '🎡'
      },
      onPageChange: config.onPageChange || (() => {}),
      onStateChange: config.onStateChange || (() => {}),
      onError: config.onError || ((err) => console.error(err)),
    };
    
    // 내부 상태
    this.state = {
      planInfo: null,
      planSchedule: [],
      fromPlanDay: null,
      selectedItems: [],
    };
    
    // 초기화
    this.init();
  }
  
  /* ═══════════════════════════════════════════
     초기화
     ═══════════════════════════════════════════ */
  init() {
    this.loadFromStorage();
    this.attachEventListeners();
  }
  
  /* ═══════════════════════════════════════════
     localStorage 관리
     ═══════════════════════════════════════════ */
  saveToStorage() {
    if (!this.state.planInfo) return false;
    
    try {
      const planData = {
        info: this.state.planInfo,
        schedule: this.state.planSchedule,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(this.config.storageKey, JSON.stringify(planData));
      console.log('✅ 일정 저장 완료');
      return true;
    } catch (error) {
      this.config.onError('일정 저장 실패: ' + error.message);
      return false;
    }
  }
  
  loadFromStorage() {
    const saved = localStorage.getItem(this.config.storageKey);
    if (!saved) return false;
    
    try {
      const planData = JSON.parse(saved);
      this.state.planInfo = planData.info;
      this.state.planSchedule = planData.schedule;
      console.log('✅ 일정 불러오기 완료');
      this.config.onStateChange(this.state);
      return true;
    } catch (error) {
      this.config.onError('일정 불러오기 실패: ' + error.message);
      return false;
    }
  }
  
  clearStorage() {
    localStorage.removeItem(this.config.storageKey);
    this.state.planInfo = null;
    this.state.planSchedule = [];
    this.state.fromPlanDay = null;
    this.state.selectedItems = [];
    console.log('✅ 일정 초기화 완료');
    this.config.onStateChange(this.state);
  }
  
  /* ═══════════════════════════════════════════
     일정 생성
     ═══════════════════════════════════════════ */
  createPlan(formData) {
    const { title, dest, start, end, people, budget, transport, memo } = formData;
    
    // 유효성 검사
    if (!title || !dest || !start || !end) {
      this.config.onError('여행 제목, 여행지, 출발일, 도착일을 입력해주세요.');
      return false;
    }
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (endDate < startDate) {
      this.config.onError('도착일은 출발일 이후여야 합니다.');
      return false;
    }
    
    const days = Math.ceil((endDate - startDate) / 86400000) + 1;
    
    // 일정 정보 생성
    this.state.planInfo = {
      title,
      dest,
      start,
      end,
      days,
      people: people || '2',
      budget: budget || '',
      transport: transport || '자가용',
      memo: memo || '',
      createdAt: new Date().toISOString()
    };
    
    // 일정표 초기화
    this.state.planSchedule = Array.from({ length: days }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return {
        day: i + 1,
        date: d.toISOString().slice(0, 10),
        slots: []
      };
    });
    
    this.saveToStorage();
    this.config.onStateChange(this.state);
    
    console.log('✅ 일정 생성 완료:', this.state.planInfo);
    return true;
  }
  
  /* ═══════════════════════════════════════════
     장소 관리
     ═══════════════════════════════════════════ */
  addPlace(dayIndex, place) {
    if (dayIndex < 0 || dayIndex >= this.state.planSchedule.length) {
      this.config.onError('잘못된 Day 인덱스입니다.');
      return false;
    }
    
    this.state.planSchedule[dayIndex].slots.push({
      ...place,
      start_time: place.start_time || '',
      addedAt: new Date().toISOString()
    });
    
    this.saveToStorage();
    this.config.onStateChange(this.state);
    
    console.log(`✅ Day ${dayIndex + 1}에 장소 추가:`, place.name);
    return true;
  }
  
  addMultiplePlaces(dayIndex, places) {
    if (dayIndex < 0 || dayIndex >= this.state.planSchedule.length) {
      this.config.onError('잘못된 Day 인덱스입니다.');
      return false;
    }
    
    places.forEach(place => {
      this.state.planSchedule[dayIndex].slots.push({
        ...place,
        start_time: place.start_time || '',
        addedAt: new Date().toISOString()
      });
    });
    
    this.saveToStorage();
    this.config.onStateChange(this.state);
    
    console.log(`✅ Day ${dayIndex + 1}에 ${places.length}개 장소 추가`);
    return true;
  }
  
  removePlace(dayIndex, slotIndex) {
    if (dayIndex < 0 || dayIndex >= this.state.planSchedule.length) {
      this.config.onError('잘못된 Day 인덱스입니다.');
      return false;
    }
    
    const day = this.state.planSchedule[dayIndex];
    if (slotIndex < 0 || slotIndex >= day.slots.length) {
      this.config.onError('잘못된 슬롯 인덱스입니다.');
      return false;
    }
    
    const removed = day.slots.splice(slotIndex, 1)[0];
    
    this.saveToStorage();
    this.config.onStateChange(this.state);
    
    console.log(`✅ Day ${dayIndex + 1}에서 장소 삭제:`, removed.name);
    return true;
  }
  
  updatePlaceTime(dayIndex, slotIndex, time) {
    if (dayIndex < 0 || dayIndex >= this.state.planSchedule.length) {
      return false;
    }
    
    const day = this.state.planSchedule[dayIndex];
    if (slotIndex < 0 || slotIndex >= day.slots.length) {
      return false;
    }
    
    day.slots[slotIndex].start_time = time;
    
    this.saveToStorage();
    this.config.onStateChange(this.state);
    
    return true;
  }
  
  movePlaceToDay(fromDayIndex, slotIndex, toDayIndex) {
    if (fromDayIndex < 0 || fromDayIndex >= this.state.planSchedule.length ||
        toDayIndex < 0 || toDayIndex >= this.state.planSchedule.length) {
      return false;
    }
    
    const fromDay = this.state.planSchedule[fromDayIndex];
    const toDay = this.state.planSchedule[toDayIndex];
    
    if (slotIndex < 0 || slotIndex >= fromDay.slots.length) {
      return false;
    }
    
    const place = fromDay.slots.splice(slotIndex, 1)[0];
    toDay.slots.push(place);
    
    this.saveToStorage();
    this.config.onStateChange(this.state);
    
    console.log(`✅ 장소를 Day ${fromDayIndex + 1}에서 Day ${toDayIndex + 1}로 이동`);
    return true;
  }
  
  /* ═══════════════════════════════════════════
     데이터 조회
     ═══════════════════════════════════════════ */
  getPlanInfo() {
    return this.state.planInfo;
  }
  
  getSchedule() {
    return this.state.planSchedule;
  }
  
  getDay(dayIndex) {
    if (dayIndex < 0 || dayIndex >= this.state.planSchedule.length) {
      return null;
    }
    return this.state.planSchedule[dayIndex];
  }
  
  getPlace(dayIndex, slotIndex) {
    const day = this.getDay(dayIndex);
    if (!day || slotIndex < 0 || slotIndex >= day.slots.length) {
      return null;
    }
    return day.slots[slotIndex];
  }
  
  getTotalPlaces() {
    return this.state.planSchedule.reduce((sum, day) => sum + day.slots.length, 0);
  }
  
  hasPlan() {
    return this.state.planInfo !== null;
  }
  
  /* ═══════════════════════════════════════════
     UI 렌더링 (HTML 생성)
     ═══════════════════════════════════════════ */
  renderScheduleHTML() {
    if (!this.state.planInfo) {
      return '<p>일정이 없습니다.</p>';
    }
    
    const info = this.state.planInfo;
    const metaHTML = `
      <span>📍 ${info.dest}</span>
      <span>📅 ${info.start} ~ ${info.end} (${info.days}일)</span>
      <span>👥 ${info.people}명</span>
      ${info.budget ? `<span>💰 ${info.budget}</span>` : ''}
      <span>🚗 ${info.transport}</span>
    `;
    
    const daysHTML = this.state.planSchedule.map((day, di) => `
      <div class="day-card" data-day-index="${di}">
        <div class="day-header">
          <span>Day ${day.day} — ${day.date}</span>
        </div>
        <div class="day-body">
          ${day.slots.map((slot, si) => this.renderSlotHTML(di, si, slot)).join('')}
          <button class="add-slot-btn" data-day="${di}">+ 장소 추가하기</button>
        </div>
      </div>
    `).join('');
    
    return `
      <div class="schedule-header">
        <h3>✈️ ${info.title}</h3>
        <div class="schedule-meta">${metaHTML}</div>
      </div>
      <div class="day-schedules">${daysHTML}</div>
    `;
  }
  
  renderSlotHTML(dayIndex, slotIndex, slot) {
    const emoji = slot.img || this.config.categoryEmojis[slot.category] || '📍';
    
    return `
      <div class="slot-item" data-day="${dayIndex}" data-slot="${slotIndex}">
        <div class="slot-time-wrap">
          <input type="time" 
                 class="slot-time-input" 
                 data-day="${dayIndex}" 
                 data-slot="${slotIndex}" 
                 value="${slot.start_time || ''}" 
                 placeholder="시간" />
        </div>
        <div class="slot-icon">${emoji}</div>
        <div class="slot-info">
          <div class="slot-name">${slot.name}</div>
          <div class="slot-meta">
            <span>📍 ${slot.city || ''}</span>
            ${slot.duration ? `<span>⏱ ${slot.duration}분</span>` : ''}
          </div>
        </div>
        <button class="slot-delete-btn" 
                data-day="${dayIndex}" 
                data-slot="${slotIndex}" 
                title="삭제">🗑️</button>
      </div>
    `;
  }
  
  /* ═══════════════════════════════════════════
     이벤트 리스너 (DOM에 자동 연결)
     ═══════════════════════════════════════════ */
  attachEventListeners() {
    // 일정 생성 버튼
    const createBtn = document.getElementById('btn-create-schedule');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.handleCreateSchedule());
    }
    
    // 일정 초기화 버튼
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-clear-plan') {
        this.handleClearPlan();
      }
    });
    
    // 장소 추가 버튼 (일정에 추가)
    const addToPlanBtn = document.getElementById('btn-add-to-plan');
    if (addToPlanBtn) {
      addToPlanBtn.addEventListener('click', () => this.handleAddToPlan());
    }
    
    // 페이지 네비게이션
    const planNavBtn = document.querySelector('.nav-btn[data-page="plan"]');
    if (planNavBtn) {
      planNavBtn.addEventListener('click', () => this.handlePlanPageOpen());
    }
  }
  
  handleCreateSchedule() {
    const formData = {
      title: this.getElementValue('plan-title'),
      dest: this.getElementValue('plan-destination'),
      start: this.getElementValue('plan-start-date'),
      end: this.getElementValue('plan-end-date'),
      people: this.getElementValue('plan-people'),
      budget: this.getElementValue('plan-budget'),
      transport: this.getElementValue('plan-transport'),
      memo: this.getElementValue('plan-memo'),
    };
    
    if (this.createPlan(formData)) {
      this.renderToDOM();
      this.hideElement('plan-info-card');
      this.showElement('schedule-section');
    }
  }
  
  handleClearPlan() {
    if (!confirm('일정을 초기화하시겠습니까? 모든 데이터가 삭제됩니다.')) {
      return;
    }
    
    this.clearStorage();
    this.showElement('plan-info-card');
    this.hideElement('schedule-section');
    
    // 폼 초기화
    this.setElementValue('plan-title', '');
    this.setElementValue('plan-destination', '');
    this.setElementValue('plan-start-date', '');
    this.setElementValue('plan-end-date', '');
    this.setElementValue('plan-people', '2');
    this.setElementValue('plan-budget', '');
    this.setElementValue('plan-transport', '자가용');
    this.setElementValue('plan-memo', '');
  }
  
  handleAddToPlan() {
    if (this.state.selectedItems.length === 0) return;
    
    const dayIndex = this.state.fromPlanDay;
    if (dayIndex !== null && dayIndex !== undefined) {
      this.addMultiplePlaces(dayIndex, this.state.selectedItems);
      this.state.selectedItems = [];
      this.state.fromPlanDay = null;
      
      this.hideElement('plan-footer');
      this.config.onPageChange('plan');
      this.renderToDOM();
    }
  }
  
  handlePlanPageOpen() {
    if (!this.state.planSchedule.length) {
      const loaded = this.loadFromStorage();
      if (loaded && this.state.planInfo) {
        this.hideElement('plan-info-card');
        this.showElement('schedule-section');
        this.renderToDOM();
      }
    } else if (this.state.planInfo) {
      this.hideElement('plan-info-card');
      this.showElement('schedule-section');
    }
  }
  
  /* ═══════════════════════════════════════════
     DOM 조작 헬퍼 함수
     ═══════════════════════════════════════════ */
  renderToDOM() {
    const container = document.getElementById('day-schedules');
    if (!container) return;
    
    container.innerHTML = this.renderScheduleHTML();
    this.attachDynamicEventListeners();
  }
  
  attachDynamicEventListeners() {
    // 시간 입력 이벤트
    document.querySelectorAll('.slot-time-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const dayIdx = parseInt(e.target.dataset.day);
        const slotIdx = parseInt(e.target.dataset.slot);
        this.updatePlaceTime(dayIdx, slotIdx, e.target.value);
      });
    });
    
    // 슬롯 삭제 이벤트
    document.querySelectorAll('.slot-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dayIdx = parseInt(btn.dataset.day);
        const slotIdx = parseInt(btn.dataset.slot);
        
        if (confirm('이 장소를 일정에서 삭제하시겠습니까?')) {
          this.removePlace(dayIdx, slotIdx);
          this.renderToDOM();
        }
      });
    });
    
    // 장소 추가 버튼
    document.querySelectorAll('.add-slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.fromPlanDay = parseInt(btn.dataset.day);
        this.showElement('plan-footer');
        this.setElementText('selected-count', '0개 선택됨');
        this.state.selectedItems = [];
        this.config.onPageChange('recommend');
      });
    });
  }
  
  getElementValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  
  setElementValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }
  
  setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  
  showElement(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  }
  
  hideElement(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }
  
  /* ═══════════════════════════════════════════
     데이터 내보내기/가져오기
     ═══════════════════════════════════════════ */
  exportToJSON() {
    return JSON.stringify({
      info: this.state.planInfo,
      schedule: this.state.planSchedule,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
  
  importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this.state.planInfo = data.info;
      this.state.planSchedule = data.schedule;
      this.saveToStorage();
      this.config.onStateChange(this.state);
      console.log('✅ 일정 가져오기 완료');
      return true;
    } catch (error) {
      this.config.onError('일정 가져오기 실패: ' + error.message);
      return false;
    }
  }
}

/* ══════════════════════════════════════════════
   전역 export (ES6 모듈)
   ══════════════════════════════════════════════ */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScheduleModule;
}

/* ══════════════════════════════════════════════
   사용 예제
   ══════════════════════════════════════════════ */
/*

// 1. 인스턴스 생성
const mySchedule = new ScheduleModule({
  storageKey: 'my_travel_plan',
  onPageChange: (page) => {
    console.log('페이지 이동:', page);
  },
  onStateChange: (state) => {
    console.log('상태 변경:', state);
  },
  onError: (message) => {
    alert(message);
  }
});

// 2. 일정 생성
mySchedule.createPlan({
  title: '부산 2박 3일',
  dest: '부산',
  start: '2026-08-01',
  end: '2026-08-03',
  people: '2',
  budget: '800000',
  transport: '기차',
  memo: '해변 중심'
});

// 3. 장소 추가
mySchedule.addPlace(0, {
  id: 'place_001',
  name: '해운대 해수욕장',
  city: '부산',
  category: 'attraction',
  rating: 4.8
});

// 4. HTML 렌더링
document.getElementById('schedule-container').innerHTML = 
  mySchedule.renderScheduleHTML();

// 5. 데이터 내보내기
const jsonData = mySchedule.exportToJSON();
console.log(jsonData);

*/
