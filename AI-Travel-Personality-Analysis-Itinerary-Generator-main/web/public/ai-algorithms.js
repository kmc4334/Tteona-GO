/* ══════════════════════════════════════════════
   떠나GO AI 알고리즘 모듈
   Python 알고리즘의 JavaScript 구현
   ══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   1. 동적 성향 학습 AI
   ══════════════════════════════════════════════ */

class PreferenceAnalyzer {
  constructor() {
    this.tagWeights = {
      "힐링": 0.5,
      "자연": 0.3,
      "액티비티": 0.4,
      "야외": 0.35,
      "맛집": 0.3,
      "문화": 0.25,
      "야경": 0.2,
      "박물관": 0.25,
      "쇼핑": 0.2,
      "나이트라이프": 0.15,
      "감성": 0.3,
      "카페": 0.25
    };
    
    this.learningRate = 0.1; // α = 0.1
    this.changeThreshold = 0.1; // 성향 변화 감지 임계값
  }
  
  /**
   * 초기 성향 프로파일 생성
   */
  initializePreference(userId, travelTypeKey) {
    const profile = {};
    
    // 여행 유형에 따른 기본 태그 설정
    const typeTagMapping = {
      'cozy_healer': ['힐링', '자연', '카페'],
      'action_seeker': ['액티비티', '야외', '자연'],
      'local_gourmet': ['맛집', '문화', '쇼핑'],
      'trend_setter': ['감성', '카페', '야경'],
      'free_spirit': ['액티비티', '자연', '야외'],
      'master_planner': ['문화', '박물관', '관광'],
      'easy_going': ['맛집', '쇼핑', '카페'],
      'lone_wanderer': ['자연', '힐링', '문화']
    };
    
    const baseTags = typeTagMapping[travelTypeKey] || ['힐링', '자연', '맛집'];
    
    // 기본 태그에 가중치 부여
    baseTags.forEach(tag => {
      if (this.tagWeights[tag]) {
        profile[tag] = this.tagWeights[tag];
      }
    });
    
    // 벡터 정규화
    const vector = this.normalizeProfile(profile);
    
    return {
      userId,
      profile,
      vector,
      weights: this.generateWeights(vector, Object.keys(profile)),
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
  }
  
  /**
   * 사용자 행동 이벤트 기반 성향 업데이트
   */
  updatePreferenceFromEvent(currentProfile, event) {
    const profile = { ...currentProfile.profile };
    
    // 이벤트 타입별 가중치
    const eventWeights = {
      'view': 0.3,
      'click': 0.5,
      'favorite': 0.8,
      'purchase': 1.0
    };
    
    const weight = eventWeights[event.type] || 0.5;
    
    // 각 태그에 대해 학습률 적용 업데이트
    event.tags.forEach(tag => {
      const tagWeight = this.tagWeights[tag] || 0.2;
      const currentValue = profile[tag] || 0;
      profile[tag] = currentValue + (this.learningRate * weight * tagWeight);
    });
    
    // 벡터 정규화
    const vector = this.normalizeProfile(profile);
    const tagNames = Object.keys(profile);
    
    return {
      ...currentProfile,
      profile,
      vector,
      weights: this.generateWeights(vector, tagNames),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 성향 변화 감지
   */
  detectPreferenceChange(previousProfile, currentProfile) {
    const similarity = this.cosineSimilarity(
      previousProfile.vector,
      currentProfile.vector
    );
    
    const change = 1.0 - similarity;
    const changed = change > this.changeThreshold;
    
    const dominantShift = this.findDominantShift(
      previousProfile.profile,
      currentProfile.profile
    );
    
    return {
      changed,
      similarity,
      change,
      dominantShift
    };
  }
  
  /**
   * L1 정규화
   */
  normalizeProfile(profile) {
    const values = Object.values(profile);
    const total = values.reduce((sum, v) => sum + Math.abs(v), 0);
    
    if (total === 0) return values.map(() => 0);
    
    return values.map(v => v / total);
  }
  
  /**
   * 가중치 생성
   */
  generateWeights(vector, tagNames) {
    const weights = {};
    tagNames.forEach((tag, i) => {
      if (i < vector.length) {
        weights[tag] = vector[i] * 2.0; // 구별력 향상을 위한 스케일링
      }
    });
    return weights;
  }
  
  /**
   * 코사인 유사도 계산
   */
  cosineSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) return 1.0;
    
    return dotProduct / (norm1 * norm2);
  }
  
  /**
   * 가장 큰 변화가 있는 태그 찾기
   */
  findDominantShift(prevProfile, currentProfile) {
    let maxDiff = 0;
    let shiftTag = '';
    
    Object.keys(currentProfile).forEach(tag => {
      const currentVal = currentProfile[tag] || 0;
      const prevVal = prevProfile[tag] || 0;
      const diff = currentVal - prevVal;
      
      if (diff > maxDiff) {
        maxDiff = diff;
        shiftTag = tag;
      }
    });
    
    return shiftTag;
  }
}

/* ══════════════════════════════════════════════
   2. 일정 생성 AI - TSP 동선 최적화
   ══════════════════════════════════════════════ */

class RouteOptimizer {
  constructor() {
    this.EARTH_RADIUS_KM = 6371; // 지구 반지름 (km)
  }
  
  /**
   * Haversine 공식으로 두 지점 간 거리 계산 (km)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    // 입력값 검증
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      console.warn('⚠️ 좌표값 누락:', { lat1, lon1, lat2, lon2 });
      return 0;
    }
    
    const toRad = (deg) => deg * Math.PI / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return this.EARTH_RADIUS_KM * c;
  }
  
  /**
   * Greedy Nearest Neighbor로 TSP 근사 해결
   */
  optimizeRoute(places) {
    if (!places || places.length <= 1) return places;
    
    const visited = new Set();
    const result = [];
    
    // 첫 번째 장소부터 시작
    let currentIdx = 0;
    visited.add(currentIdx);
    result.push(places[currentIdx]);
    
    // 가장 가까운 미방문 장소를 반복적으로 선택
    while (result.length < places.length) {
      let nearestIdx = -1;
      let minDistance = Infinity;
      
      const current = places[currentIdx];
      
      for (let i = 0; i < places.length; i++) {
        if (visited.has(i)) continue;
        
        const candidate = places[i];
        
        // 좌표 추출 (lat/lng 또는 latitude/longitude 지원)
        const currentLat = current.lat || current.latitude;
        const currentLng = current.lng || current.longitude;
        const candLat = candidate.lat || candidate.latitude;
        const candLng = candidate.lng || candidate.longitude;
        
        if (!currentLat || !currentLng || !candLat || !candLng) {
          console.warn('⚠️ 좌표 누락:', current.name, candidate.name);
          continue;
        }
        
        const distance = this.calculateDistance(
          currentLat,
          currentLng,
          candLat,
          candLng
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestIdx = i;
        }
      }
      
      if (nearestIdx === -1) break;
      
      visited.add(nearestIdx);
      result.push(places[nearestIdx]);
      currentIdx = nearestIdx;
    }
    
    return result;
  }
  
  /**
   * 전체 경로의 총 거리 계산
   */
  calculateTotalDistance(places) {
    if (!places || places.length < 2) return 0;
    
    let total = 0;
    for (let i = 0; i < places.length - 1; i++) {
      const p1 = places[i];
      const p2 = places[i + 1];
      
      const lat1 = p1.lat || p1.latitude;
      const lng1 = p1.lng || p1.longitude;
      const lat2 = p2.lat || p2.latitude;
      const lng2 = p2.lng || p2.longitude;
      
      if (lat1 && lng1 && lat2 && lng2) {
        total += this.calculateDistance(lat1, lng1, lat2, lng2);
      }
    }
    return total;
  }
}

/* ══════════════════════════════════════════════
   3. 일정 생성 AI - 스케줄링
   ══════════════════════════════════════════════ */

class ScheduleGenerator {
  constructor() {
    this.optimizer = new RouteOptimizer();
    this.morningStart = 9;
    this.afternoonStart = 12;
    this.eveningStart = 18;
    this.dayEnd = 21;
  }
  
  /**
   * 전체 일정 생성
   */
  generateItinerary(places, days, preferences) {
    console.log('🤖 AI 일정 생성 시작:', { places: places.length, days, preferences });
    
    // 1단계: 지역별 클러스터링
    const clusters = this.clusterByLocation(places);
    console.log('📍 클러스터링 완료:', clusters.length, '개 그룹');
    
    // 2단계: 날짜별 분배
    const dayAssignments = this.distributeAcrossDays(clusters, days);
    console.log('📅 날짜별 분배 완료');
    
    // 3단계: 각 날짜별로 동선 최적화 및 스케줄링
    const schedule = [];
    let totalDistance = 0;
    
    dayAssignments.forEach((dayPlaces, dayIdx) => {
      // 동선 최적화
      const optimizedPlaces = this.optimizer.optimizeRoute(dayPlaces);
      console.log(`📍 Day ${dayIdx + 1} 동선 최적화 완료:`, optimizedPlaces.length, '개 장소');
      
      // 성향 기반 밀도 조절
      const adjustedPlaces = this.adjustDensity(optimizedPlaces, preferences);
      console.log(`⚙️ Day ${dayIdx + 1} 밀도 조절:`, adjustedPlaces.length, '개 선택');
      
      // 시간 슬롯 배정
      const slots = this.createTimeSlots(adjustedPlaces);
      
      // 거리 계산
      const dayDistance = this.optimizer.calculateTotalDistance(adjustedPlaces);
      totalDistance += dayDistance;
      
      schedule.push({
        day: dayIdx + 1,
        places: adjustedPlaces,
        slots: slots,
        distance: dayDistance
      });
    });
    
    console.log('✅ AI 일정 생성 완료 - 총 거리:', totalDistance.toFixed(2), 'km');
    
    return {
      schedule,
      totalDistance,
      optimizationApplied: true
    };
  }

  /**
   * 지역별 클러스터링
   */
  clusterByLocation(places) {
    const clusters = {};
    
    places.forEach(place => {
      const key = place.city || place.region || 'unknown';
      if (!clusters[key]) {
        clusters[key] = [];
      }
      clusters[key].push(place);
    });
    
    return Object.values(clusters);
  }
  
  /**
   * Round-robin 방식으로 날짜별 분배
   */
  distributeAcrossDays(clusters, days) {
    const dayAssignments = Array.from({ length: days }, () => []);
    
    let dayIdx = 0;
    clusters.forEach(cluster => {
      cluster.forEach(place => {
        dayAssignments[dayIdx % days].push(place);
      });
      dayIdx++;
    });
    
    return dayAssignments;
  }
  
  /**
   * 성향 기반 일정 밀도 조절
   */
  adjustDensity(places, preferences) {
    if (!preferences || places.length === 0) return places;
    
    const healingScore = preferences['힐링'] || 0;
    const activityScore = preferences['액티비티'] || 0;
    
    let density;
    if (healingScore > activityScore) {
      // 힐링 선호: 적은 일정
      density = 0.5 + (0.3 * (1 - healingScore));
    } else {
      // 액티비티 선호: 많은 일정
      density = 0.7 + (0.2 * activityScore);
    }
    
    // 최소 3개, 최대 7개
    const maxItems = Math.max(3, Math.min(7, Math.round(8 * density)));
    
    console.log(`  밀도 계산: ${density.toFixed(2)} → ${maxItems}개 장소`);
    
    // 평점 높은 순으로 정렬 후 상위 N개 선택
    const sorted = [...places].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted.slice(0, Math.min(maxItems, places.length));
  }
  
  /**
   * 시간 슬롯 자동 배정
   */
  createTimeSlots(places) {
    const slots = [];
    let currentHour = this.morningStart;
    
    places.forEach((place, idx) => {
      // 장소 타입별 체류 시간 (시간 단위)
      const durationMap = {
        'attraction': 2,
        'restaurant': 1.5,
        'cafe': 1,
        'activity': 3,
        'accommodation': 0,
        'shopping': 2
      };
      
      const duration = durationMap[place.category] || 1.5;
      const endHour = Math.min(currentHour + duration, this.dayEnd);
      
      // 예산 계산 (price 또는 price_range 지원)
      const priceMap = {
        'free': 0,
        'cheap': 10000,
        'moderate': 30000,
        'expensive': 50000
      };
      const priceValue = place.price_range || place.price || 'moderate';
      const budget = priceMap[priceValue] || 15000;
      
      slots.push({
        id: `slot_${Date.now()}_${idx}`,
        name: place.name,
        time: `${String(Math.floor(currentHour)).padStart(2, '0')}:${String(Math.round((currentHour % 1) * 60)).padStart(2, '0')}`,
        endTime: `${String(Math.floor(endHour)).padStart(2, '0')}:00`,
        duration: Math.round(duration * 60), // 분 단위
        category: place.category,
        budget: budget,
        placeId: place.id
      });
      
      // 다음 활동 시작 시간 (이동 및 휴식 시간 1시간 추가)
      currentHour = endHour + 1;
      
      // 하루 종료 시간 초과 시 중단
      if (currentHour >= this.dayEnd) return;
    });
    
    return slots;
  }
}

/* ══════════════════════════════════════════════
   4. 통합 AI 시스템
   ══════════════════════════════════════════════ */

class TravelAI {
  constructor() {
    this.preferenceAnalyzer = new PreferenceAnalyzer();
    this.scheduleGenerator = new ScheduleGenerator();
  }
  
  /**
   * 사용자 성향 초기화
   */
  initUserPreference(userId, travelTypeKey) {
    return this.preferenceAnalyzer.initializePreference(userId, travelTypeKey);
  }
  
  /**
   * 행동 기반 성향 업데이트
   */
  updateUserPreference(currentProfile, eventType, tags) {
    const event = { type: eventType, tags };
    return this.preferenceAnalyzer.updatePreferenceFromEvent(currentProfile, event);
  }
  
  /**
   * 성향 변화 확인
   */
  checkPreferenceChange(oldProfile, newProfile) {
    return this.preferenceAnalyzer.detectPreferenceChange(oldProfile, newProfile);
  }
  
  /**
   * AI 일정 생성
   */
  generateSchedule(places, days, userPreference) {
    const preferences = userPreference?.weights || {};
    return this.scheduleGenerator.generateItinerary(places, days, preferences);
  }
  
  /**
   * 코사인 유사도로 장소 추천 점수 계산
   */
  calculateRecommendationScore(place, userPreference) {
    if (!userPreference || !place.tags) return 0;
    
    const userTags = Object.keys(userPreference.profile);
    const placeTags = place.tags;
    
    // 공통 태그 개수 기반 점수
    let score = 0;
    placeTags.forEach(tag => {
      if (userPreference.profile[tag]) {
        score += userPreference.profile[tag];
      }
    });
    
    return score;
  }
}

// 전역 AI 인스턴스 생성
if (typeof window !== 'undefined') {
  window.TravelAI = TravelAI;
  window.travelAI = new TravelAI();
  console.log('✅ 떠나GO AI 시스템 로드 완료');
}
