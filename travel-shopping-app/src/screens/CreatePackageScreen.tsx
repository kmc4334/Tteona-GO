import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert, Platform, Modal } from 'react-native';
import { Plus, Trash2, Calendar as CalendarIcon, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/colors';
import { useNotifications } from '../store/NotificationContext';
import personalityTypes from '../data/personalityTypes.json';

type TabType = 'create' | 'library';

interface DaySchedule {
  day: number;
  date: string;
  slots: ScheduleSlot[];
}

interface ScheduleSlot {
  id: string;
  name: string;
  city: string;
  category: string;
  start_time: string;
  duration?: number;
  img?: string;
}

interface PlanInfo {
  title: string;
  dest: string;
  start: string;
  end: string;
  days: number;
  people: string;
  budget: string;
  transport: string;
  memo: string;
}

export const CreatePackageScreen: React.FC = () => {
  console.log('🎯 CreatePackageScreen rendering...');
  const navigation = useNavigation();
  const { addNotification } = useNotifications();
  
  // 카테고리 이모지 (schedule.js와 동일)
  const CAT_EMOJI: Record<string, string> = {
    attraction: '🏛',
    restaurant: '🍽',
    cafe: '☕',
    accommodation: '🏨',
    activity: '🎡',
    '관광지': '🏛',
    '맛집': '🍽',
    '식당': '🍽',
    '카페': '☕',
    '숙소': '🏨',
    '체험': '🎡',
  };
  
  // 탭
  const [activeTab, setActiveTab] = useState<TabType>('create');
  
  // 폼 데이터
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startDateText, setStartDateText] = useState('');
  const [endDateText, setEndDateText] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [people, setPeople] = useState('');
  const [transport, setTransport] = useState('');
  const [memo, setMemo] = useState('');
  const [useAI, setUseAI] = useState(false);
  
  // 일정 데이터 (schedule.js 구조 참고)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);
  
  // 라이브러리
  const [savedPlans, setSavedPlans] = useState<any[]>([]);

  useEffect(() => {
    loadSavedPlans();
  }, []);

  const loadSavedPlans = async () => {
    try {
      const saved = await AsyncStorage.getItem('travel_plans');
      if (saved) setSavedPlans(JSON.parse(saved));
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  // 날짜 포맷
  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // 날짜 선택
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    console.log('📅 출발일 선택:', event.type, selectedDate);
    
    const currentDate = selectedDate || startDate;
    
    // Android는 즉시 닫기
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    
    // 취소한 경우
    if (event.type === 'dismissed') {
      setShowStartPicker(false);
      return;
    }
    
    // 날짜 선택 완료
    if (event.type === 'set' && selectedDate) {
      console.log('✅ 출발일 변경:', formatDate(selectedDate));
      setStartDate(selectedDate);
      setStartDateText(formatDate(selectedDate));
      
      // 출발일이 도착일보다 늦으면 도착일도 함께 변경
      if (selectedDate > endDate) {
        setEndDate(selectedDate);
        setEndDateText(formatDate(selectedDate));
      }
      
      // iOS는 수동으로 닫기
      if (Platform.OS === 'ios') {
        setShowStartPicker(false);
      }
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    console.log('📅 도착일 선택:', event.type, selectedDate);
    
    const currentDate = selectedDate || endDate;
    
    // Android는 즉시 닫기
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    
    // 취소한 경우
    if (event.type === 'dismissed') {
      setShowEndPicker(false);
      return;
    }
    
    // 날짜 선택 완료
    if (event.type === 'set' && selectedDate) {
      // 도착일이 출발일보다 이전인지 체크
      if (selectedDate < startDate) {
        console.log('❌ 도착일이 출발일보다 이전');
        Alert.alert('알림', '도착일은 출발일 이후여야 합니다.');
        setShowEndPicker(false);
        return;
      }
      
      console.log('✅ 도착일 변경:', formatDate(selectedDate));
      setEndDate(selectedDate);
      setEndDateText(formatDate(selectedDate));
      
      // iOS는 수동으로 닫기
      if (Platform.OS === 'ios') {
        setShowEndPicker(false);
      }
    }
  };

  // 일정 생성 (schedule.js의 createSchedule 참고)
  const handleCreateSchedule = () => {
    if (!title.trim()) {
      Alert.alert('알림', '여행 제목을 입력해주세요.');
      return;
    }
    if (!destination.trim()) {
      Alert.alert('알림', '여행지를 입력해주세요.');
      return;
    }

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    
    if (new Date(endDateStr) < new Date(startDateStr)) {
      Alert.alert('알림', '도착일은 출발일 이후여야 합니다.');
      return;
    }

    const diffTime = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // planInfo 생성 (schedule.js 구조)
    const newPlanInfo: PlanInfo = {
      title,
      dest: destination,
      start: startDateStr,
      end: endDateStr,
      days,
      people: people || '2',
      budget: '',
      transport: transport || '자가용',
      memo: memo || '',
    };
    
    setPlanInfo(newPlanInfo);

    if (useAI) {
      Alert.alert(
        '🤖 AI 일정 생성',
        'AI가 자동으로 일정을 생성합니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: 'AI 생성', onPress: () => generateAISchedule(newPlanInfo) }
        ]
      );
    } else {
      createEmptySchedule(newPlanInfo);
    }
  };

  // 빈 일정표 생성 (schedule.js 구조 참고)
  const createEmptySchedule = (info: PlanInfo) => {
    const schedules: DaySchedule[] = Array.from({ length: info.days }, (_, i) => {
      const d = new Date(info.start);
      d.setDate(d.getDate() + i);
      return {
        day: i + 1,
        date: d.toISOString().slice(0, 10),
        slots: []
      };
    });
    
    setDaySchedules(schedules);
    setShowSchedule(true);
    addNotification({ title: '일정 생성', message: `${info.days}일 일정표 생성 완료`, type: 'info' });
  };

  // AI 일정 생성 (schedule.js 구조에 맞춰 개선)
  const generateAISchedule = async (info: PlanInfo) => {
    let personalityName = '인기 여행지';
    try {
      const key = await AsyncStorage.getItem('personalityType');
      if (key && (personalityTypes as any)[key]) {
        personalityName = (personalityTypes as any)[key].name;
      }
    } catch {}

    const places = getPlacesForDestination(info.dest);
    const schedules: DaySchedule[] = [];
    
    for (let i = 0; i < info.days; i++) {
      const d = new Date(info.start);
      d.setDate(d.getDate() + i);
      
      const slots: ScheduleSlot[] = [
        { 
          id: `${i}_1`, 
          start_time: '09:00', 
          name: i === 0 ? `${info.dest} 도착` : '호텔 출발', 
          city: info.dest, 
          category: 'accommodation',
          duration: 30
        },
        { 
          id: `${i}_2`, 
          start_time: '10:00', 
          name: places.morning[i % places.morning.length], 
          city: info.dest, 
          category: 'attraction',
          duration: 120 
        },
        { 
          id: `${i}_3`, 
          start_time: '12:30', 
          name: places.lunch[i % places.lunch.length], 
          city: info.dest, 
          category: 'restaurant',
          duration: 60 
        },
        { 
          id: `${i}_4`, 
          start_time: '14:30', 
          name: places.afternoon[i % places.afternoon.length], 
          city: info.dest, 
          category: 'cafe',
          duration: 120 
        },
        { 
          id: `${i}_5`, 
          start_time: '17:30', 
          name: `${info.dest} 석양`, 
          city: info.dest, 
          category: 'activity',
          duration: 60 
        },
        { 
          id: `${i}_6`, 
          start_time: '19:00', 
          name: places.dinner[i % places.dinner.length], 
          city: info.dest, 
          category: 'restaurant',
          duration: 90 
        }
      ];
      
      schedules.push({ 
        day: i + 1, 
        date: d.toISOString().slice(0, 10), 
        slots 
      });
    }
    
    setDaySchedules(schedules);
    setShowSchedule(true);
    addNotification({ 
      title: '🤖 AI 일정 생성', 
      message: `${personalityName} 기반 ${info.days}일 일정 생성 완료`, 
      type: 'info' 
    });
  };

  const getPlacesForDestination = (dest: string) => {
    const d = dest.toLowerCase();
    if (d.includes('제주')) return { morning: ['성산일출봉', '한라산', '협재해변', '만장굴'], lunch: ['흑돼지', '올레국수', '해녀의집'], afternoon: ['천지연폭포', '테디베어박물관', '민속촌'], dinner: ['해산물', '고기국수', '전복요리'] };
    if (d.includes('부산')) return { morning: ['해운대', '감천마을', '광안리', '태종대'], lunch: ['자갈치시장', '돼지국밥', '밀면'], afternoon: ['해동용궁사', '송도', '영화의전당'], dinner: ['회', '복어', '곰장어'] };
    return { morning: [`${dest} 관광지`], lunch: [`${dest} 맛집`], afternoon: [`${dest} 카페`], dinner: [`${dest} 저녁`] };
  };

  // 슬롯 추가 (schedule.js의 addToSchedule 참고)
  const addSlot = (dayIndex: number) => {
    const updated = [...daySchedules];
    updated[dayIndex].slots.push({
      id: Date.now().toString(),
      start_time: '09:00',
      name: '새 일정',
      city: planInfo?.dest || destination,
      category: 'attraction',
    });
    setDaySchedules(updated);
  };

  // 슬롯 삭제 (schedule.js의 removeFromSchedule 참고)
  const removeSlot = (dayIndex: number, slotId: string) => {
    const updated = [...daySchedules];
    updated[dayIndex].slots = updated[dayIndex].slots.filter(s => s.id !== slotId);
    setDaySchedules(updated);
  };

  // 시간 업데이트 (schedule.js의 updateSlotTime 참고)
  const updateSlotTime = (dayIndex: number, slotId: string, time: string) => {
    const updated = [...daySchedules];
    const slot = updated[dayIndex].slots.find(s => s.id === slotId);
    if (slot) slot.start_time = time;
    setDaySchedules(updated);
  };

  // 슬롯 이름 업데이트
  const updateSlotName = (dayIndex: number, slotId: string, name: string) => {
    const updated = [...daySchedules];
    const slot = updated[dayIndex].slots.find(s => s.id === slotId);
    if (slot) slot.name = name;
    setDaySchedules(updated);
  };

  // 카테고리 이모지 가져오기
  const getCategoryEmoji = (category: string): string => {
    return CAT_EMOJI[category] || CAT_EMOJI[category.toLowerCase()] || '📍';
  };

  // 저장 (schedule.js의 savePlanToStorage 구조 참고)
  const handleSavePlan = async () => {
    if (daySchedules.every(d => d.slots.length === 0)) {
      Alert.alert('알림', '일정을 한 개 이상 추가해주세요!');
      return;
    }

    if (!planInfo) {
      Alert.alert('오류', '일정 정보가 없습니다.');
      return;
    }

    try {
      const planData = {
        id: Date.now().toString(),
        info: planInfo,
        schedule: daySchedules,
        savedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const saved = await AsyncStorage.getItem('travel_plans');
      const plans = saved ? JSON.parse(saved) : [];
      plans.unshift(planData);
      await AsyncStorage.setItem('travel_plans', JSON.stringify(plans));

      addNotification({ title: '저장 완료', message: `'${planInfo.title}' 일정 저장`, type: 'info' });
      Alert.alert('성공', '저장되었습니다!', [{ 
        text: '확인', 
        onPress: () => { 
          loadSavedPlans(); 
          setActiveTab('library'); 
        }
      }]);
    } catch {
      Alert.alert('오류', '저장 실패');
    }
  };

  // 초기화 (schedule.js의 clearPlanFromStorage 참고)
  const handleClearPlan = () => {
    Alert.alert('초기화', '일정을 초기화하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '초기화', style: 'destructive', onPress: () => {
        setShowSchedule(false);
        setDaySchedules([]);
        setPlanInfo(null);
        setTitle('');
        setDestination('');
        setStartDate(new Date());
        setEndDate(new Date());
        setStartDateText('');
        setEndDateText('');
        setPeople('');
        setTransport('');
        setMemo('');
        setUseAI(false);
        addNotification({ title: '초기화', message: '일정 초기화 완료', type: 'info' });
      }}
    ]);
  };

  // 저장된 일정 삭제
  const deleteSavedPlan = async (planId: string) => {
    try {
      const saved = await AsyncStorage.getItem('travel_plans');
      if (saved) {
        const plans = JSON.parse(saved).filter((p: any) => p.id !== planId);
        await AsyncStorage.setItem('travel_plans', JSON.stringify(plans));
        setSavedPlans(plans);
        addNotification({ title: '삭제', message: '일정 삭제 완료', type: 'info' });
      }
    } catch {}
  };

  // 저장된 일정 불러오기 (schedule.js의 loadPlanFromStorage 참고)
  const loadSavedPlan = (plan: any) => {
    Alert.alert('불러오기', `'${plan.info.title}' 일정을 불러오시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: '불러오기', onPress: () => {
        // planInfo 복원
        const info = plan.info;
        setPlanInfo(info);
        setTitle(info.title);
        setDestination(info.dest);
        setStartDate(new Date(info.start));
        setEndDate(new Date(info.end));
        setStartDateText(info.start);
        setEndDateText(info.end);
        setPeople(info.people || '2');
        setTransport(info.transport || '자가용');
        setMemo(info.memo || '');
        
        // schedule 복원
        setDaySchedules(plan.schedule);
        setShowSchedule(true);
        setActiveTab('create');
        
        addNotification({ 
          title: '불러오기', 
          message: `'${info.title}' 불러오기 완료`, 
          type: 'info' 
        });
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>여행 일정 작성</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'create' && styles.tabActive]} onPress={() => setActiveTab('create')}>
          <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>📝 일정 작성</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'library' && styles.tabActive]} onPress={() => setActiveTab('library')}>
          <Text style={[styles.tabText, activeTab === 'library' && styles.tabTextActive]}>📚 라이브러리</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {activeTab === 'create' && (
          <View style={styles.content}>
            {!showSchedule ? (
              <View style={styles.formCard}>
                <Text style={styles.cardTitle}>🗺️ 여행 계획 작성</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>여행 제목</Text>
                  <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="예: 부산 2박 3일" placeholderTextColor="#999" />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>여행지</Text>
                  <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="예: 부산, 제주" placeholderTextColor="#999" />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>출발일</Text>
                    <TouchableOpacity 
                      style={styles.dateInputContainer} 
                      onPress={() => setShowStartPicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dateInputText}>
                        {startDateText || formatDate(startDate)}
                      </Text>
                      <View style={styles.calendarBtn}>
                        <CalendarIcon size={20} color={Colors.primary} />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.label}>도착일</Text>
                    <TouchableOpacity 
                      style={styles.dateInputContainer} 
                      onPress={() => setShowEndPicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dateInputText}>
                        {endDateText || formatDate(endDate)}
                      </Text>
                      <View style={styles.calendarBtn}>
                        <CalendarIcon size={20} color={Colors.primary} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>인원</Text>
                    <TextInput style={styles.input} value={people} onChangeText={setPeople} placeholder="2" placeholderTextColor="#999" keyboardType="numeric" />
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.label}>교통수단</Text>
                    <TextInput style={styles.input} value={transport} onChangeText={setTransport} placeholder="자가용, 기차 등" placeholderTextColor="#999" />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>메모</Text>
                  <TextInput style={[styles.input, styles.textArea]} value={memo} onChangeText={setMemo} placeholder="메모..." placeholderTextColor="#999" multiline numberOfLines={4} />
                </View>

                <TouchableOpacity style={styles.aiOptionBox} onPress={() => setUseAI(!useAI)} activeOpacity={0.7}>
                  <View style={styles.checkboxContainer}>
                    <View style={[styles.checkbox, useAI && styles.checkboxChecked]}>
                      {useAI && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.aiTextContainer}>
                      <Text style={styles.aiTitle}>🤖 AI 추천 여행 일정</Text>
                      <Text style={styles.aiSubtitle}>여행 성향에 맞춰 AI가 자동으로 일정을 추천합니다</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.createButton} onPress={handleCreateSchedule} activeOpacity={0.7}>
                  <Text style={styles.createButtonText}>세부 일정 작성하기 →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.scheduleHeader}>
                  <Text style={styles.scheduleTitle}>{planInfo?.title || title}</Text>
                  <Text style={styles.scheduleMeta}>
                    📍 {planInfo?.dest || destination} · 
                    � {planInfo?.start || formatDate(startDate)} ~ {planInfo?.end || formatDate(endDate)} ({planInfo?.days || 0}일) · 
                    �👥 {planInfo?.people || people}명 · 
                    🚗 {planInfo?.transport || transport}
                  </Text>
                  <View style={styles.scheduleActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleClearPlan}>
                      <Trash2 size={16} color="#FF6B6B" />
                      <Text style={[styles.actionBtnText, { color: '#FF6B6B' }]}>초기화</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={handleSavePlan}>
                      <Text style={styles.actionBtnTextPrimary}>💾 저장</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {daySchedules.map((day, dayIndex) => (
                  <View key={day.day} style={styles.dayCard}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayTitle}>Day {day.day} — {day.date}</Text>
                    </View>
                    <View style={styles.dayBody}>
                      {day.slots.map((slot) => (
                        <View key={slot.id} style={styles.slotItem}>
                          <TextInput 
                            style={styles.timeInput} 
                            value={slot.start_time} 
                            onChangeText={(text) => updateSlotTime(dayIndex, slot.id, text)} 
                            placeholder="09:00" 
                          />
                          <Text style={styles.slotIcon}>{getCategoryEmoji(slot.category)}</Text>
                          <View style={styles.slotInfo}>
                            <TextInput 
                              style={styles.slotNameInput} 
                              value={slot.name} 
                              onChangeText={(text) => updateSlotName(dayIndex, slot.id, text)} 
                              placeholder="장소 이름" 
                            />
                            <Text style={styles.slotMeta}>📍 {slot.city} · {slot.category}</Text>
                            {slot.duration && <Text style={styles.slotDuration}>⏱ {slot.duration}분</Text>}
                          </View>
                          <TouchableOpacity onPress={() => removeSlot(dayIndex, slot.id)}>
                            <X size={20} color="#999" />
                          </TouchableOpacity>
                        </View>
                      ))}
                      <TouchableOpacity style={styles.addSlotBtn} onPress={() => addSlot(dayIndex)}>
                        <Plus size={20} color={Colors.primary} />
                        <Text style={styles.addSlotText}>장소 추가</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'library' && (
          <View style={styles.content}>
            <View style={styles.libraryHeader}>
              <Text style={styles.libraryTitle}>📚 저장된 여행 일정</Text>
              <Text style={styles.librarySubtitle}>작성한 여행 일정을 모아볼 수 있습니다</Text>
            </View>

            {savedPlans.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>작성된 여행 일정이 없습니다.{'\n'}일정 작성 탭에서 새로운 여행을 계획해보세요!</Text>
              </View>
            ) : (
              savedPlans.map((plan) => (
                <TouchableOpacity key={plan.id} style={styles.planCard} onPress={() => loadSavedPlan(plan)} activeOpacity={0.7}>
                  <Text style={styles.planTitle}>{plan.info?.title || plan.title}</Text>
                  <Text style={styles.planMeta}>
                    📍 {plan.info?.dest || plan.destination} · 
                    📅 {plan.info?.start || plan.startDate} ~ {plan.info?.end || plan.endDate}
                  </Text>
                  <Text style={styles.planDetail}>
                    👥 {plan.info?.people || plan.people}명 · 
                    🚗 {plan.info?.transport || plan.transport}
                  </Text>
                  {plan.schedule && (
                    <Text style={styles.planSlots}>
                      📋 총 {plan.schedule.reduce((sum: number, day: any) => sum + day.slots.length, 0)}개 일정
                    </Text>
                  )}
                  <TouchableOpacity style={styles.deletePlanBtn} onPress={(e) => {
                    e.stopPropagation();
                    Alert.alert('삭제', '이 일정을 삭제하시겠습니까?', [
                      { text: '취소', style: 'cancel' }, 
                      { text: '삭제', style: 'destructive', onPress: () => deleteSavedPlan(plan.id) }
                    ]);
                  }}>
                    <Trash2 size={16} color="#FF6B6B" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* DatePicker Modals */}
      {showStartPicker && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showStartPicker}
            onRequestClose={() => setShowStartPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                    <Text style={styles.modalButton}>취소</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>출발일 선택</Text>
                  <TouchableOpacity onPress={() => {
                    setShowStartPicker(false);
                  }}>
                    <Text style={[styles.modalButton, styles.modalButtonPrimary]}>완료</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="spinner"
                  onChange={onStartDateChange}
                  minimumDate={new Date()}
                  textColor={Colors.text}
                  style={styles.datePicker}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onStartDateChange}
            minimumDate={new Date()}
          />
        )
      )}

      {showEndPicker && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showEndPicker}
            onRequestClose={() => setShowEndPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                    <Text style={styles.modalButton}>취소</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>도착일 선택</Text>
                  <TouchableOpacity onPress={() => {
                    setShowEndPicker(false);
                  }}>
                    <Text style={[styles.modalButton, styles.modalButtonPrimary]}>완료</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="spinner"
                  onChange={onEndDateChange}
                  minimumDate={startDate}
                  textColor={Colors.text}
                  style={styles.datePicker}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={onEndDateChange}
            minimumDate={startDate}
          />
        )
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 2, borderBottomColor: '#E0E0E0' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 15, fontWeight: '600', color: '#999' },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  container: { flex: 1 },
  content: { padding: 20 },
  formCard: { backgroundColor: '#fff', padding: 24, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20 },
  formRow: { flexDirection: 'row', marginBottom: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 10, padding: 14, fontSize: 15, color: '#1A1A1A', backgroundColor: '#fff' },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingLeft: 14,
    paddingVertical: 14,
  },
  dateInputText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  calendarBtn: {
    paddingHorizontal: 12,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  createButton: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  aiOptionBox: { padding: 16, backgroundColor: '#F0F4FF', borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.primary, borderRadius: 12, marginVertical: 16 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#CCC', borderRadius: 6, marginRight: 12, marginTop: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  aiTextContainer: { flex: 1 },
  aiTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  aiSubtitle: { fontSize: 13, color: '#666', lineHeight: 18 },
  scheduleHeader: { marginBottom: 24 },
  scheduleTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
  scheduleMeta: { fontSize: 14, color: '#666', marginBottom: 16 },
  scheduleActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E0E0E0', gap: 6 },
  actionBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
  actionBtnTextPrimary: { fontSize: 14, fontWeight: '700', color: '#fff' },
  dayCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  dayHeader: { backgroundColor: Colors.primary, padding: 16 },
  dayTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  dayBody: { padding: 16 },
  slotItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 14, borderRadius: 12, marginBottom: 12, gap: 12 },
  timeInput: { width: 80, padding: 10, borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 8, fontSize: 14, textAlign: 'center', backgroundColor: '#fff' },
  slotIcon: { fontSize: 28 },
  slotInfo: { flex: 1 },
  slotNameInput: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 4, padding: 0 },
  slotMeta: { fontSize: 13, color: '#999' },
  slotDuration: { fontSize: 12, color: Colors.primary, marginTop: 2 },
  addSlotBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: '#E0E0E0', borderRadius: 12, gap: 8, backgroundColor: '#fff' },
  addSlotText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  libraryHeader: { marginBottom: 24 },
  libraryTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
  librarySubtitle: { fontSize: 15, color: '#666' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 15, color: '#999', textAlign: 'center', lineHeight: 24 },
  planCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, position: 'relative', borderWidth: 1, borderColor: '#F0F0F0' },
  planTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  planMeta: { fontSize: 14, color: '#666', marginBottom: 4 },
  planDetail: { fontSize: 13, color: '#999', marginBottom: 4 },
  planSlots: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 8 },
  deletePlanBtn: { position: 'absolute', top: 16, right: 16, padding: 8 },
  // Modal styles for iOS DatePicker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalButton: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalButtonPrimary: {
    color: Colors.primary,
    fontWeight: '600',
  },
  datePicker: {
    height: 200,
    backgroundColor: '#fff',
  },
});

export default CreatePackageScreen;
