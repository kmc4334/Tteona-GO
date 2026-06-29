import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Users,
  Wallet,
  Car,
  FileText,
  Sparkles,
  RefreshCw
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useSchedule, DaySchedule, SlotItem } from '../store/ScheduleContext';
import { ScheduleChatbotModal } from './ScheduleChatbotModal';

const CATEGORY_EMOJIS: Record<string, string> = {
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
  '교통': '🚗',
  '교통수단': '🚗'
};

const getCategoryEmoji = (category: string) => {
  return CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS[category.toLowerCase()] || '📍';
};

export const ScheduleScreen = () => {
  const {
    scheduleState,
    loading,
    createSchedule,
    removePlace,
    updatePlaceTime,
    clearSchedule
  } = useSchedule();

  // Form State
  const [title, setTitle] = useState('');
  const [dest, setDest] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [people, setPeople] = useState('2');
  const [budget, setBudget] = useState('');
  const [transport, setTransport] = useState('자가용');
  const [memo, setMemo] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null);

  const handleCreate = async () => {
    if (!title.trim() || !dest.trim() || !start.trim() || !end.trim()) {
      Alert.alert('알림', '필수 입력 항목(* 표시)을 모두 채워주세요.');
      return;
    }

    setIsSubmitting(true);
    const success = await createSchedule({
      title,
      dest,
      start,
      end,
      people,
      budget,
      transport,
      memo
    });

    setIsSubmitting(false);

    if (success) {
      // Clear Form Fields
      setTitle('');
      setDest('');
      setStart('');
      setEnd('');
      setPeople('2');
      setBudget('');
      setTransport('자가용');
      setMemo('');
    }
  };

  const handleReset = () => {
    Alert.alert(
      '일정 초기화',
      '정말로 일정을 삭제하고 새로 작성하시겠습니까? 모든 데이터가 초기화됩니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => clearSchedule() }
      ]
    );
  };

  const handleDeletePlace = (dayIdx: number, slotIdx: number, placeName: string) => {
    Alert.alert(
      '장소 삭제',
      `'${placeName}' 장소를 일정에서 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => removePlace(dayIdx, slotIdx) }
      ]
    );
  };

  const openChatbotForDay = (dayIdx: number) => {
    setActiveDayIdx(dayIdx);
    setChatbotVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>일정을 불러오는 중입니다...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── 1. Create Schedule Form view (If no schedule)
  if (!scheduleState || !scheduleState.info) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>여행 일정 작성</Text>
        </View>
        <ScrollView style={styles.container} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          <View style={styles.introCard}>
            <CalendarIcon color={Colors.primary} size={36} />
            <Text style={styles.introTitle}>나만의 특별한 여행 일정 만들기</Text>
            <Text style={styles.introDesc}>날짜와 세부 사항을 설정해 일자별 완벽한 루트를 만들어보세요.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formLabel}>여행 제목 <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="예: 제주도 3박4일 가족 여행"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.formLabel}>여행지 <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="예: 제주"
              value={dest}
              onChangeText={setDest}
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.formLabel}>출발일 <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={start}
                  onChangeText={setStart}
                />
              </View>
              <View style={{ width: Spacing.md }} />
              <View style={styles.flex1}>
                <Text style={styles.formLabel}>도착일 <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={end}
                  onChangeText={setEnd}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.formLabel}>인원 수</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예: 2"
                  keyboardType="numeric"
                  value={people}
                  onChangeText={setPeople}
                />
              </View>
              <View style={{ width: Spacing.md }} />
              <View style={styles.flex1}>
                <Text style={styles.formLabel}>총 예산</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예: 800000"
                  keyboardType="numeric"
                  value={budget}
                  onChangeText={setBudget}
                />
              </View>
            </View>

            <Text style={styles.formLabel}>이동 수단</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 자가용, KTX, 버스"
              value={transport}
              onChangeText={setTransport}
            />

            <Text style={styles.formLabel}>메모</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="여행 시 주의점이나 계획을 적어보세요."
              multiline
              numberOfLines={4}
              value={memo}
              onChangeText={setMemo}
            />

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.secondary} />
              ) : (
                <Text style={styles.submitButtonText}>일정 생성하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 2. Display Schedule view (If schedule exists)
  const { info, schedule } = scheduleState;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>나의 여행 일정</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <RefreshCw color={Colors.error} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Plan Header Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{info.title}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MapPin size={14} color={Colors.primary} />
              <Text style={styles.infoText}>{info.dest}</Text>
            </View>
            <View style={styles.infoItem}>
              <CalendarIcon size={14} color={Colors.primary} />
              <Text style={styles.infoText}>
                {info.start} ~ {info.end} ({info.days}일간)
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Users size={14} color={Colors.primary} />
              <Text style={styles.infoText}>{info.people}명</Text>
            </View>
            <View style={styles.infoItem}>
              <Car size={14} color={Colors.primary} />
              <Text style={styles.infoText}>{info.transport}</Text>
            </View>
            {info.budget ? (
              <View style={styles.infoItem}>
                <Wallet size={14} color={Colors.primary} />
                <Text style={styles.infoText}>{Number(info.budget).toLocaleString()}원</Text>
              </View>
            ) : null}
            {info.memo ? (
              <View style={[styles.infoItem, styles.fullWidth]}>
                <FileText size={14} color={Colors.primary} />
                <Text style={styles.infoText} numberOfLines={2}>{info.memo}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Timeline by Day */}
        <View style={styles.timelineContainer}>
          {schedule.map((day: DaySchedule, dayIdx: number) => (
            <View key={`day-card-${dayIdx}`} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>Day {day.day}</Text>
                <Text style={styles.dayHeaderDate}>{day.date}</Text>
              </View>

              <View style={styles.slotsContainer}>
                {day.slots && day.slots.length > 0 ? (
                  day.slots.map((slot: SlotItem, slotIdx: number) => (
                    <View key={`slot-${dayIdx}-${slotIdx}`} style={styles.slotCard}>
                      {/* Time Input/Display */}
                      <View style={styles.timeInputContainer}>
                        <Clock size={12} color={Colors.primary} />
                        <TextInput
                          style={styles.timeInput}
                          placeholder="시간"
                          value={slot.start_time || ''}
                          onChangeText={(text) => {
                            // Local time update triggers on blur, but we can update live
                            // Wait, it is simple to update place time
                            updatePlaceTime(dayIdx, slotIdx, text);
                          }}
                        />
                      </View>

                      {/* Icon */}
                      <Text style={styles.slotEmoji}>{getCategoryEmoji(slot.category)}</Text>

                      {/* Details */}
                      <View style={styles.slotDetails}>
                        <Text style={styles.slotName}>{slot.name}</Text>
                        <View style={styles.slotMetaRow}>
                          <Text style={styles.slotCity}>📍 {slot.city || '정보 없음'}</Text>
                          {slot.duration ? (
                            <Text style={styles.slotDuration}>⏱ {slot.duration}분</Text>
                          ) : null}
                        </View>
                      </View>

                      {/* Delete */}
                      <TouchableOpacity
                        onPress={() => handleDeletePlace(dayIdx, slotIdx, slot.name)}
                        style={styles.deleteButton}
                      >
                        <Trash2 color={Colors.textSecondary} size={18} />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptySlots}>
                    <Text style={styles.emptySlotsText}>이날 채워진 일정이 없습니다.</Text>
                  </View>
                )}

                {/* Add spot button */}
                <TouchableOpacity
                  style={styles.addSpotButton}
                  onPress={() => openChatbotForDay(dayIdx)}
                >
                  <Plus size={16} color={Colors.primary} />
                  <Text style={styles.addSpotButtonText}>장소 추천/추가</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating AI recommendation helper button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => openChatbotForDay(0)}
      >
        <Sparkles size={22} color={Colors.secondary} />
        <Text style={styles.floatingButtonText}>AI 추천</Text>
      </TouchableOpacity>

      {/* Chatbot Recommendation Assistant Modal */}
      <ScheduleChatbotModal
        visible={chatbotVisible}
        onClose={() => setChatbotVisible(false)}
        initialDayIdx={activeDayIdx !== null ? activeDayIdx : 0}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.textSecondary,
    fontSize: Typography.sizes.md,
  },
  header: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  resetButton: {
    padding: Spacing.sm,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  formContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  introCard: {
    backgroundColor: Colors.secondary,
    padding: Spacing.lg,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  introTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  introDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: Colors.secondary,
    padding: Spacing.lg,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  formLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  required: {
    color: Colors.error,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  infoCard: {
    backgroundColor: Colors.secondary,
    padding: Spacing.lg,
    borderRadius: 20,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  timelineContainer: {
    marginTop: Spacing.xs,
  },
  dayCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dayHeaderText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  dayHeaderDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.semibold,
  },
  slotsContainer: {},
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    width: 76,
  },
  timeInput: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 4,
    flex: 1,
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  slotEmoji: {
    fontSize: 22,
    marginHorizontal: Spacing.sm,
  },
  slotDetails: {
    flex: 1,
  },
  slotName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  slotMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  slotCity: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  slotDuration: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  emptySlots: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptySlotsText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
  },
  addSpotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
  addSpotButtonText: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginLeft: 6,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  floatingButtonText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing.xs,
  },
});
