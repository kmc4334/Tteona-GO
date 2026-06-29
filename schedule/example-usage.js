/* ══════════════════════════════════════════════
   일정 모듈 사용 예제
   ══════════════════════════════════════════════ */

// ============================================
// 1. 기본 설정
// ============================================

// 전역 상태 객체 (app.js에서 가져옴)
const state = {
  planInfo: null,
  planSchedule: [],
  fromPlanDay: null,
  selectedItems: [],
  // ... 기타 상태
};

// 카테고리 이모지 맵 (data.js에서 가져옴)
const CAT_EMOJI = {
  attraction: '🏛',
  restaurant: '🍽',
  cafe: '☕',
  accommodation: '🏨',
  activity: '🎡'
};

// 페이지 전환 함수 (app.js에서 가져옴)
function goToPage(pageName) {
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === pageName)
  );
  document.querySelectorAll('.page').forEach(p => 
    p.classList.remove('active')
  );
  document.getElementById(`page-${pageName}`).classList.add('active');
  window.scrollTo(0, 0);
}

// ============================================
// 2. 모듈 초기화
// ============================================

import { initScheduleModule } from './schedule/schedule-ui.js';

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  initScheduleModule(state, CAT_EMOJI, goToPage);
});

// ============================================
// 3. 개별 함수 사용 예제
// ============================================

// 3-1. 일정 생성
import { createSchedule } from './schedule/schedule.js';

function createNewScheduleExample() {
  const formData = {
    title: '제주도 3박 4일 힐링 여행',
    dest: '제주',
    start: '2026-07-01',
    end: '2026-07-04',
    people: '2',
    budget: '1000000',
    transport: '렌터카',
    memo: '날씨 좋을 때 가기'
  };

  const success = createSchedule(state, formData, {
    onSuccess: () => {
      console.log('일정 생성 완료!');
      // UI 업데이트 또는 페이지 전환
    }
  });

  if (success) {
    console.log('일정이 생성되었습니다:', state.planInfo);
  }
}

// 3-2. 장소 추가
import { addToSchedule } from './schedule/schedule.js';

function addPlaceToScheduleExample() {
  const place = {
    id: 'place_001',
    name: '성산일출봉',
    city: '제주',
    category: 'attraction',
    rating: 4.8,
    tags: ['자연', '일출', '유네스코'],
    img: '🏔️'
  };

  // Day 1에 장소 추가
  state.fromPlanDay = 0;

  const success = addToSchedule(state, place, {
    onSuccess: () => {
      console.log('장소 추가 완료!');
      state.fromPlanDay = null;
    }
  });

  if (success) {
    console.log('장소가 추가되었습니다:', state.planSchedule[0].slots);
  }
}

// 3-3. 여러 장소 한 번에 추가
import { addMultiplePlacesToSchedule } from './schedule/schedule.js';

function addMultiplePlacesExample() {
  const places = [
    {
      id: 'place_002',
      name: '카페 델문도',
      city: '제주',
      category: 'cafe',
      rating: 4.6
    },
    {
      id: 'place_003',
      name: '섭지코지',
      city: '제주',
      category: 'attraction',
      rating: 4.7
    }
  ];

  // Day 2에 여러 장소 추가
  const dayIdx = 1;

  addMultiplePlacesToSchedule(state, places, dayIdx, {
    onSuccess: () => {
      console.log('여러 장소 추가 완료!');
    }
  });
}

// 3-4. 장소 삭제
import { removeFromSchedule } from './schedule/schedule.js';

function removePlaceExample() {
  const dayIdx = 0;    // Day 1
  const slotIdx = 0;   // 첫 번째 장소

  removeFromSchedule(state, dayIdx, slotIdx, {
    onSuccess: () => {
      console.log('장소 삭제 완료!');
      // UI 재렌더링
    }
  });
}

// 3-5. 시간 업데이트
import { updateSlotTime } from './schedule/schedule.js';

function updateTimeExample() {
  const dayIdx = 0;
  const slotIdx = 0;
  const time = '09:00';

  const success = updateSlotTime(state, dayIdx, slotIdx, time);

  if (success) {
    console.log('시간이 업데이트되었습니다:', 
      state.planSchedule[dayIdx].slots[slotIdx].start_time
    );
  }
}

// 3-6. 일정 저장/불러오기
import { 
  savePlanToStorage, 
  loadPlanFromStorage, 
  clearPlanFromStorage 
} from './schedule/schedule.js';

function saveLoadExample() {
  // 저장
  savePlanToStorage(state);
  console.log('일정이 localStorage에 저장되었습니다');

  // 불러오기
  const loaded = loadPlanFromStorage(state);
  if (loaded) {
    console.log('일정을 불러왔습니다:', state.planInfo);
  }

  // 초기화
  clearPlanFromStorage(state);
  console.log('일정이 초기화되었습니다');
}

// 3-7. 일정표 렌더링
import { renderSchedule } from './schedule/schedule.js';

function renderScheduleExample() {
  renderSchedule(state, CAT_EMOJI, {
    updateUI: (data) => {
      // UI 업데이트
      if (data.title) {
        document.getElementById('schedule-title').textContent = data.title;
      }
      if (data.meta) {
        document.getElementById('schedule-meta').innerHTML = data.meta;
      }
    },
    renderDays: (dayCards) => {
      // Day 카드 렌더링
      console.log('렌더링할 일정:', dayCards);
    }
  });
}

// ============================================
// 4. 실전 워크플로우 예제
// ============================================

// 4-1. 완전한 일정 생성 플로우
async function completeScheduleWorkflow() {
  console.log('=== 일정 생성 워크플로우 시작 ===');

  // 1단계: 일정 기본 정보 생성
  const formData = {
    title: '부산 2박 3일',
    dest: '부산',
    start: '2026-08-01',
    end: '2026-08-03',
    people: '2',
    budget: '800000',
    transport: '기차',
    memo: '해변 중심 여행'
  };

  createSchedule(state, formData, {
    onSuccess: () => {
      console.log('✅ 1단계: 일정 생성 완료');
    }
  });

  // 2단계: Day 1에 장소 추가
  const day1Places = [
    { id: 'p1', name: '해운대 해수욕장', category: 'attraction', city: '부산' },
    { id: 'p2', name: '더베이101', category: 'cafe', city: '부산' },
    { id: 'p3', name: '광안리 해수욕장', category: 'attraction', city: '부산' }
  ];

  addMultiplePlacesToSchedule(state, day1Places, 0, {
    onSuccess: () => {
      console.log('✅ 2단계: Day 1 장소 추가 완료');
    }
  });

  // 3단계: Day 2에 장소 추가
  const day2Places = [
    { id: 'p4', name: '감천문화마을', category: 'attraction', city: '부산' },
    { id: 'p5', name: '자갈치시장', category: 'restaurant', city: '부산' }
  ];

  addMultiplePlacesToSchedule(state, day2Places, 1, {
    onSuccess: () => {
      console.log('✅ 3단계: Day 2 장소 추가 완료');
    }
  });

  // 4단계: 시간 설정
  updateSlotTime(state, 0, 0, '09:00');  // Day 1 첫 장소
  updateSlotTime(state, 0, 1, '12:00');  // Day 1 두 번째 장소
  updateSlotTime(state, 0, 2, '18:00');  // Day 1 세 번째 장소
  console.log('✅ 4단계: 시간 설정 완료');

  // 5단계: 저장
  savePlanToStorage(state);
  console.log('✅ 5단계: 일정 저장 완료');

  console.log('=== 워크플로우 완료 ===');
  console.log('최종 일정:', state.planSchedule);
}

// 4-2. 일정 수정 플로우
function editScheduleWorkflow() {
  console.log('=== 일정 수정 워크플로우 ===');

  // 기존 일정 불러오기
  const loaded = loadPlanFromStorage(state);
  
  if (!loaded) {
    console.log('저장된 일정이 없습니다');
    return;
  }

  // 장소 추가
  const newPlace = {
    id: 'p_new',
    name: '송정 해수욕장',
    category: 'attraction',
    city: '부산'
  };

  addToSchedule(state, newPlace, {
    onSuccess: () => {
      console.log('✅ 장소 추가 완료');
      savePlanToStorage(state);
    }
  });

  // 장소 삭제 (Day 1의 두 번째 장소)
  removeFromSchedule(state, 0, 1, {
    onSuccess: () => {
      console.log('✅ 장소 삭제 완료');
      savePlanToStorage(state);
    }
  });
}

// ============================================
// 5. 에러 처리 예제
// ============================================

function errorHandlingExample() {
  // 잘못된 데이터로 일정 생성 시도
  const invalidData = {
    title: '',  // 빈 제목
    dest: '부산',
    start: '2026-08-10',
    end: '2026-08-05',  // 종료일이 시작일보다 빠름
  };

  const result = createSchedule(state, invalidData, {
    onSuccess: () => {
      console.log('성공');
    }
  });

  if (!result) {
    console.log('일정 생성 실패 - 유효성 검사 통과 못함');
  }

  // 존재하지 않는 Day에 장소 추가 시도
  state.fromPlanDay = 999;  // 존재하지 않는 Day
  const place = { id: 'p1', name: 'Test' };
  
  const success = addToSchedule(state, place, {
    onSuccess: () => {
      console.log('성공');
    }
  });

  if (!success) {
    console.log('장소 추가 실패 - 잘못된 Day 인덱스');
  }
}

// ============================================
// 6. 테스트용 유틸리티 함수
// ============================================

function debugScheduleState() {
  console.log('=== 현재 일정 상태 ===');
  console.log('planInfo:', state.planInfo);
  console.log('planSchedule:', state.planSchedule);
  console.log('fromPlanDay:', state.fromPlanDay);
  console.log('selectedItems:', state.selectedItems);
  
  // localStorage 확인
  const stored = localStorage.getItem('ttaerago_plan');
  console.log('localStorage:', stored ? JSON.parse(stored) : null);
}

// 샘플 데이터로 일정 채우기
function fillWithSampleData() {
  completeScheduleWorkflow();
  debugScheduleState();
}

// ============================================
// 7. 내보내기 (테스트용)
// ============================================

export {
  createNewScheduleExample,
  addPlaceToScheduleExample,
  addMultiplePlacesExample,
  removePlaceExample,
  updateTimeExample,
  saveLoadExample,
  renderScheduleExample,
  completeScheduleWorkflow,
  editScheduleWorkflow,
  errorHandlingExample,
  debugScheduleState,
  fillWithSampleData
};
