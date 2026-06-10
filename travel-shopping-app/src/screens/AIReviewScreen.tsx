import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, RefreshCw, Share2 } from 'lucide-react-native';
import { useBudget } from '../store/BudgetContext';
import { useAuth } from '../store/AuthContext';

const MOCK_AI_PLAN = [
  {
    day: 1,
    title: '제주 자연 로드',
    items: [
      { time: '10:00', title: '제주 국제공항 도착', desc: '렌터카 픽업 및 여행 시작' },
      { time: '12:00', title: '애월항 점심 식사', desc: '해물 라면 및 바다 경치 감상' },
      { time: '14:30', title: '한담해안산책로', desc: '에메랄드빛 바다 옆 산책 코스' },
      { time: '18:00', title: '숙소 체크인 (그랜드 하얏트)', desc: '공항 근처 럭셔리 스테이' },
    ]
  },
  {
    day: 2,
    title: '동쪽 감성 투어',
    items: [
      { time: '09:00', title: '성산일출봉 등반', desc: '동쪽 끝 절경 감상' },
      { time: '13:00', title: '성세기 해변 피크닉', desc: '김녕 성세기 해변 휴식' },
      { time: '16:00', title: '비자림 숲길 걷기', desc: '피톤치드 가득한 힐링 코스' },
    ]
  }
];

export const AIReviewScreen = () => {
  const navigation = useNavigation();
  const { totalBudget } = useBudget();
  const { completeOnboarding, isOnboarded } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSatisfied = () => {
    if (isOnboarded) {
      navigation.navigate('Main' as never);
    } else {
      // completeOnboarding() sets isOnboarded=true → AppNavigator automatically switches to Main
      completeOnboarding();
    }
  };

  const handleReplan = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleShare = () => {
    showAlert('공유하기', '여행 일정이 플랫폼에 공유되었습니다! 500P가 적립됩니다.');
  };

  const showAlert = (title: string, message: string) => {
    alert(`${title}: ${message}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 일정 설계 검토</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Share2 color={Colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Budget Overview */}
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetLabel}>총 예산 설정</Text>
              <Text style={styles.budgetValue}>₩{totalBudget.toLocaleString()}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: '45%' }]} /> 
            </View>
            <View style={styles.budgetFooter}>
              <Text style={styles.budgetStatus}>예상 경비(숙소포함): ₩{(totalBudget * 0.45).toLocaleString()}</Text>
              <Text style={styles.budgetPercent}>45%</Text>
            </View>
          </View>

          <View style={styles.introSection}>
            <Text style={styles.introTitle}>당신을 위한 최적의 여행 전문가 플랜</Text>
            <Text style={styles.introDesc}>입력하신 예산과 성향을 분석하여 이동 거리와 만족도를 모두 잡은 코스입니다.</Text>
          </View>

          {/* Timeline */}
          {MOCK_AI_PLAN.map((dayPlan, idx) => (
            <View key={idx} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>Day {dayPlan.day}</Text>
                </View>
                <Text style={styles.dayPlanTitle}>{dayPlan.title}</Text>
              </View>

              {dayPlan.items.map((item, i) => (
                <View key={i} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <Text style={styles.timeText}>{item.time}</Text>
                    <View style={styles.timelineLine} />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.replanButton} onPress={handleReplan} disabled={loading}>
          <RefreshCw color={Colors.primary} size={20} style={{ marginRight: 8 }} />
          <Text style={styles.replanText}>{loading ? '재설계 중...' : '다시 추천'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleSatisfied}>
          <Text style={styles.confirmText}>이대로 계획 확정 ✨</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
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
  backButton: { padding: Spacing.xs },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 120 },
  budgetCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  budgetLabel: { color: Colors.secondary, opacity: 0.8, fontSize: 14 },
  budgetValue: { color: Colors.secondary, fontSize: 24, fontWeight: '800' },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetStatus: { color: Colors.secondary, fontSize: 12, opacity: 0.9 },
  budgetPercent: { color: Colors.accent, fontWeight: 'bold' },
  
  introSection: { marginBottom: Spacing.xl, paddingHorizontal: 4 },
  introTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  introDesc: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },

  daySection: { marginBottom: Spacing.xxl },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  dayBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: Spacing.sm,
  },
  dayBadgeText: { color: Colors.secondary, fontWeight: '800', fontSize: 12 },
  dayPlanTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },

  timelineItem: { flexDirection: 'row', marginBottom: Spacing.lg },
  timelineLeft: { alignItems: 'center', marginRight: Spacing.md, width: 50 },
  timeText: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  timelineLine: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: 4 },
  timelineContent: {
    flex: 1,
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  itemTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  itemDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  replanButton: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  replanText: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
  confirmButton: {
    flex: 2,
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: { color: Colors.secondary, fontWeight: '800', fontSize: 16 },
});
