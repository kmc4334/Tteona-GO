/* ══════════════════════════════════════════════
   AI 챗봇 모듈 (chatbot.js)
   일정 페이지와 함께 사용하는 AI 추천 챗봇
   ══════════════════════════════════════════════ */

class ChatbotModule {
  constructor(scheduleModule, placesDB, config = {}) {
    this.scheduleModule = scheduleModule;
    this.placesDB = placesDB || [];
    
    this.config = {
      apiEndpoint: config.apiEndpoint || null,
      onError: config.onError || ((err) => console.error(err)),
      categoryEmojis: config.categoryEmojis || {
        attraction: '🏛',
        restaurant: '🍽',
        cafe: '☕',
        accommodation: '🏨',
        activity: '🎡'
      }
    };
    
    this.state = {
      messages: [],
      recommendedPlaces: [],
      selectedPlaces: [],
      isOpen: false
    };
    
    this.init();
  }
  
  init() {
    this.attachEventListeners();
  }
  
  /* ═══════════════════════════════════════════
     이벤트 리스너
     ═══════════════════════════════════════════ */
  attachEventListeners() {
    // 챗봇 열기
    const openBtn = document.getElementById('btn-open-chatbot');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.open());
    }
    
    // 챗봇 닫기
    const closeBtn = document.getElementById('btn-close-chatbot');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    
    const overlay = document.getElementById('chatbot-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.close());
    }
    
    // 메시지 전송
    const sendBtn = document.getElementById('btn-send-message');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }
    
    const input = document.getElementById('chatbot-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }
    
    // 장소 추가
    const addBtn = document.getElementById('btn-add-chatbot-places');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addSelectedPlaces());
    }
  }
  
  /* ═══════════════════════════════════════════
     챗봇 열기/닫기
     ═══════════════════════════════════════════ */
  open() {
    const modal = document.getElementById('chatbot-modal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    this.state.isOpen = true;
    
    setTimeout(() => {
      const input = document.getElementById('chatbot-input');
      if (input) input.focus();
    }, 100);
  }
  
  close() {
    const modal = document.getElementById('chatbot-modal');
    if (!modal) return;
    
    modal.classList.add('hidden');
    this.state.isOpen = false;
  }
  
  /* ═══════════════════════════════════════════
     메시지 처리
     ═══════════════════════════════════════════ */
  sendMessage() {
    const input = document.getElementById('chatbot-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    this.addMessage('user', message);
    input.value = '';
    
    this.showLoading();
    
    setTimeout(() => {
      this.processMessage(message);
    }, 1000);
  }
  
  addMessage(type, content) {
    const container = document.getElementById('chatbot-messages');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    
    messageDiv.innerHTML = `
      <div class="chat-avatar">${type === 'user' ? '👤' : '🤖'}</div>
      <div class="chat-bubble">${content}</div>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
    
    this.state.messages.push({ type, content, timestamp: new Date().toISOString() });
  }
  
  showLoading() {
    const container = document.getElementById('chatbot-messages');
    if (!container) return;
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message bot';
    loadingDiv.id = 'loading-message';
    
    loadingDiv.innerHTML = `
      <div class="chat-avatar">🤖</div>
      <div class="chat-bubble loading">
        <span></span><span></span><span></span>
      </div>
    `;
    
    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;
  }
  
  removeLoading() {
    const loading = document.getElementById('loading-message');
    if (loading) loading.remove();
  }
  
  /* ═══════════════════════════════════════════
     메시지 처리 및 장소 추천
     ═══════════════════════════════════════════ */
  async processMessage(message) {
    this.removeLoading();
    
    // 일정 정보 가져오기
    const schedule = this.scheduleModule.getSchedule();
    const planInfo = this.scheduleModule.getPlanInfo();
    
    if (!planInfo) {
      this.addMessage('bot', '먼저 여행 일정을 작성해주세요!');
      return;
    }
    
    // 방문 지역 추출
    const visitedCities = new Set();
    const visitedPlaces = [];
    
    schedule.forEach(day => {
      day.slots.forEach(slot => {
        visitedCities.add(slot.city);
        visitedPlaces.push(slot.name);
      });
    });
    
    const cities = Array.from(visitedCities);
    
    // API 호출 또는 로컬 검색
    let places = [];
    
    if (this.config.apiEndpoint) {
      // 실제 AI API 호출
      places = await this.callAI(message, planInfo, schedule, cities);
    } else {
      // 로컬 검색
      places = this.searchLocal(message, cities, visitedPlaces);
    }
    
    if (places.length === 0) {
      this.addMessage('bot', '검색 결과가 없어요. 다른 키워드로 시도해보세요!');
      return;
    }
    
    this.addMessage('bot', `${places.length}개의 장소를 찾았어요! 아래에서 선택해주세요.`);
    this.showRecommendations(places);
  }
  
  async callAI(message, planInfo, schedule, cities) {
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          planInfo,
          schedule,
          cities
        })
      });
      
      const data = await response.json();
      return data.places || [];
    } catch (error) {
      this.config.onError('AI API 호출 실패: ' + error.message);
      return this.searchLocal(message, cities, []);
    }
  }
  
  searchLocal(message, cities, visitedPlaces) {
    const keywords = message.toLowerCase();
    
    // 메시지에서 지역 추출
    let targetCity = null;
    cities.forEach(city => {
      if (keywords.includes(city.toLowerCase())) {
        targetCity = city;
      }
    });
    
    const searchCities = targetCity ? [targetCity] : cities;
    
    // 장소 검색
    let places = this.placesDB.filter(place => {
      // 지역 필터
      if (searchCities.length > 0) {
        if (!searchCities.some(city => place.city.includes(city))) {
          return false;
        }
      }
      
      // 이미 방문한 장소 제외
      if (visitedPlaces.includes(place.name)) {
        return false;
      }
      
      // 키워드 매칭
      return place.name.toLowerCase().includes(keywords) ||
             (place.tags || []).some(t => t.toLowerCase().includes(keywords)) ||
             place.category.toLowerCase().includes(keywords);
    });
    
    // 결과가 없으면 인기 장소 추천
    if (places.length === 0 && searchCities.length > 0) {
      places = this.placesDB.filter(place =>
        searchCities.some(city => place.city.includes(city)) &&
        !visitedPlaces.includes(place.name)
      ).sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    
    return places.slice(0, 5);
  }
  
  /* ═══════════════════════════════════════════
     추천 장소 표시 및 선택
     ═══════════════════════════════════════════ */
  showRecommendations(places) {
    this.state.recommendedPlaces = places;
    this.state.selectedPlaces = [];
    
    const recSection = document.getElementById('chatbot-recommendations');
    const recList = document.getElementById('chatbot-rec-list');
    
    if (!recSection || !recList) return;
    
    recSection.classList.remove('hidden');
    
    recList.innerHTML = places.map(place => {
      const bg = {
        attraction: '#EEF3FF',
        restaurant: '#FFF5F5',
        cafe: '#FFFAF0',
        accommodation: '#F0FFF4',
        activity: '#F0F4FF'
      }[place.category] || '#F4F6FB';
      
      const emoji = this.config.categoryEmojis[place.category] || '📍';
      
      return `
        <div class="chatbot-rec-item" data-place-id="${place.id}">
          <div class="chatbot-rec-checkbox"></div>
          <div class="chatbot-rec-thumb" style="background:${bg}">${emoji}</div>
          <div class="chatbot-rec-info">
            <div class="chatbot-rec-name">${place.name}</div>
            <div class="chatbot-rec-meta">📍 ${place.city} · ⭐ ${place.rating || 'N/A'}</div>
          </div>
        </div>
      `;
    }).join('');
    
    // 클릭 이벤트
    recList.querySelectorAll('.chatbot-rec-item').forEach(item => {
      item.addEventListener('click', () => {
        this.togglePlace(item.dataset.placeId);
      });
    });
    
    this.updateSelectionCount();
  }
  
  togglePlace(placeId) {
    const place = this.state.recommendedPlaces.find(p => p.id === placeId);
    if (!place) return;
    
    const idx = this.state.selectedPlaces.findIndex(p => p.id === placeId);
    
    if (idx === -1) {
      this.state.selectedPlaces.push(place);
    } else {
      this.state.selectedPlaces.splice(idx, 1);
    }
    
    // UI 업데이트
    const item = document.querySelector(`.chatbot-rec-item[data-place-id="${placeId}"]`);
    if (item) {
      item.classList.toggle('selected');
      const checkbox = item.querySelector('.chatbot-rec-checkbox');
      checkbox.textContent = item.classList.contains('selected') ? '✓' : '';
    }
    
    this.updateSelectionCount();
  }
  
  updateSelectionCount() {
    const countEl = document.getElementById('chatbot-selected-count');
    if (countEl) {
      countEl.textContent = `${this.state.selectedPlaces.length}개 선택됨`;
    }
  }
  
  /* ═══════════════════════════════════════════
     선택한 장소 일정에 추가
     ═══════════════════════════════════════════ */
  addSelectedPlaces() {
    if (this.state.selectedPlaces.length === 0) {
      alert('장소를 선택해주세요.');
      return;
    }
    
    const schedule = this.scheduleModule.getSchedule();
    
    // 날짜 선택
    const dayOptions = schedule.map((day, idx) =>
      `${idx + 1}. Day ${day.day} (${day.date})`
    ).join('\n');
    
    const dayChoice = prompt(
      '어느 날짜에 추가하시겠습니까?\n\n' + dayOptions + '\n\n번호를 입력하세요:',
      '1'
    );
    
    const dayIdx = parseInt(dayChoice) - 1;
    
    if (dayIdx < 0 || dayIdx >= schedule.length) {
      alert('올바른 날짜를 선택해주세요.');
      return;
    }
    
    // 장소 추가
    const success = this.scheduleModule.addMultiplePlaces(dayIdx, this.state.selectedPlaces);
    
    if (success) {
      alert(`${this.state.selectedPlaces.length}개의 장소가 Day ${dayIdx + 1}에 추가되었습니다!`);
      
      // 상태 초기화
      this.state.selectedPlaces = [];
      this.state.recommendedPlaces = [];
      
      const recSection = document.getElementById('chatbot-recommendations');
      if (recSection) recSection.classList.add('hidden');
      
      this.close();
    }
  }
  
  /* ═══════════════════════════════════════════
     유틸리티
     ═══════════════════════════════════════════ */
  clearMessages() {
    const container = document.getElementById('chatbot-messages');
    if (container) {
      // 첫 환영 메시지 제외하고 모두 삭제
      const messages = container.querySelectorAll('.chat-message');
      messages.forEach((msg, idx) => {
        if (idx > 0) msg.remove();
      });
    }
    this.state.messages = [];
  }
  
  reset() {
    this.clearMessages();
    this.state.recommendedPlaces = [];
    this.state.selectedPlaces = [];
    
    const recSection = document.getElementById('chatbot-recommendations');
    if (recSection) recSection.classList.add('hidden');
  }
}

/* ══════════════════════════════════════════════
   Export
   ══════════════════════════════════════════════ */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatbotModule;
}
