import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, RefreshCw, Share2 } from 'lucide-react-native';
import { useBudget } from '../store/BudgetContext';
import { useAuth, API_BASE } from '../store/AuthContext';

interface TimeSlot {
  time: string;
  name: string;
  description: string;
  category: string;
  duration_min: number;
  price_range: string;
  tip?: string;
}

interface DaySchedule {
  day: number;
  date_label: string;
  theme: string;
  slots: TimeSlot[];
}

interface Itinerary {
  title: string;
  summary: string;
  schedule: DaySchedule[];
  total_tips: string[];
}

export const AIReviewScreen = () => {
  const navigation = useNavigation();
  const { totalBudget } = useBudget();
  const { completeOnboarding, isOnboarded, token, user } = useAuth();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItinerary = async () => {
    setLoading(true);
    setError(null);
    try {
      const personality = user?.travelPersonality;
      const tags = personality?.tags || [];

      const res = await fetch(`${API_BASE}/itinerary/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          days: 2,
          destination: '제주도',
          preferences: tags.reduce((acc: any, tag: string) => { acc[tag] = 0.7; return acc; }, {}),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setItinerary(data.itinerary);
      } else {
        throw new Error(data.message || '일정 생성 실패');
      }
    } catch (e: any) {
      console.error('[AIReview] fetch error:', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItinerary();
  }, []);

  const handleSatisfied = () => {
    if (isOnboarded) {
      navigation.navigate('Main' as never);
    } else {
      completeOnboarding();
    }
  };

  const handleReplan = () => {
    fetchItinerary();
  };

  const priceRangeLabel: Record<string, string> = {
    free: '무료', cheap: '저렴', moderate: '보통', expensive: '고급',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 일정 설계 검토</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* 예산 카드 */}
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetLabel}>총 예산 설정</Text>
              <Text style={styles.budgetValue}>₩{totalBudget.toLocaleString()}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: '45%' }]} />
            </View>
            <View style={styles.budgetFooter}>
              <Text style={styles.budgetStatus}>예상 경비: ₩{(totalBudget * 0.45).toLocaleString()}</Text>
              <Text style={styles.budgetPercent}>45%</Text>
            </View>
          </View>

          {/* 로딩 */}
          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingText}>AI가 최적 일정을 생성하는 중...</Text>
            </View>
          )}

          {/* 에러 */}
          {!loading && error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>일정 생성 실패: {error}</Text>
              <TouchableOpacity onPress={fetchItinerary} style={styles.retryBtn}>
                <Text style={styles.retryText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 일정 */}
          {!loading && !error && itinerary && (
            <>
              <View style={styles.introSection}>
                <Text style={styles.introTitle}>{itinerary.title || 'AI 맞춤 여행 플랜'}</Text>
                <Text style={styles.introDesc}>{itinerary.summary || ''}</Text>
              </View>

              {(itinerary.schedule ?? []).map((dayPlan) => (
                <View key={dayPlan.day} style={styles.daySection}>
                  <View style={styles.dayHeader}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>{dayPlan.date_label}</Text>
                    </View>
                    <Text style={styles.dayPlanTitle}>{dayPlan.theme}</Text>
                  </View>

                  {(dayPlan.slots ?? []).map((slot, i) => (
                    <View key={i} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <Text style={styles.timeText}>{slot.time}</Text>
                        {i < (dayPlan.slots ?? []).length - 1 && (
                          <View style={styles.timelineLine} />
                        )}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.itemTitle}>{slot.name}</Text>
                        <Text style={styles.itemDesc}>{slot.description}</Text>
                        <View style={styles.itemMeta}>
                          <Text style={styles.metaChip}>⏱ {slot.duration_min}분</Text>
                          <Text style={styles.metaChip}>💰 {priceRangeLabel[slot.price_range] || slot.price_range}</Text>
                        </View>
                        {slot.tip ? (
                          <Text style={styles.slotNote}>💡 {slot.tip}</Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ))}

              {(itinerary.total_tips ?? []).length > 0 && (
                <View style={styles.tipsSection}>
                  <Text style={styles.tipsTitle}>✈️ 여행 팁</Text>
                  {itinerary.total_tips.map((tip, i) => (
                    <Text key={i} style={styles.tipItem}>• {tip}</Text>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.replanButton} onPress={handleReplan} disabled={loading}>
          <RefreshCw color={Colors.primary} size={20} style={{ marginRight: 8 }} />
          <Text style={styles.replanText}>{loading ? '생성 중...' : '다시 추천'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmButton, loading && { opacity: 0.5 }]}
          onPress={handleSatisfied}
          disabled={loading}
        >
          <Text style={styles.confirmText}>이대로 확정 ✨</Text>
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
  progressBar: { height: '100%', backgroundColor: Colors.accent, borderRadius: 4 },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetStatus: { color: Colors.secondary, fontSize: 12, opacity: 0.9 },
  budgetPercent: { color: Colors.accent, fontWeight: 'bold' },
  loadingBox: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 16, fontSize: Typography.sizes.md, color: Colors.textSecondary },
  errorBox: { alignItems: 'center', paddingVertical: 40 },
  errorText: { color: Colors.error || '#e53e3e', fontSize: Typography.sizes.md, textAlign: 'center', marginBottom: 16 },
  retryBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: 12,
  },
  retryText: { color: Colors.secondary, fontWeight: 'bold' },
  introSection: { marginBottom: Spacing.xl },
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
  dayPlanTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textSecondary },
  timelineItem: { flexDirection: 'row', marginBottom: Spacing.lg },
  timelineLeft: { alignItems: 'center', marginRight: Spacing.md, width: 50 },
  timeText: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  timelineLine: { flex: 1, width: 2, backgroundColor: Colors.border },
  timelineContent: {
    flex: 1,
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  itemTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  itemDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 8 },
  itemMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip: {
    fontSize: 11,
    color: Colors.primary,
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: '600',
  },
  slotNote: { fontSize: 12, color: Colors.accent, marginTop: 6, fontStyle: 'italic' },
  tipsSection: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  tipsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  tipItem: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
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
