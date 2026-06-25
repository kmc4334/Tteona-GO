import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useAuth } from '../store/AuthContext';
import { API_BASE } from '../store/AuthContext';
import type { AnalysisResult } from '../types/personalityTypes';

export const PersonalityResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, completeOnboarding, updateUser, user } = useAuth();
  const result = (route.params as any)?.result as AnalysisResult;

  if (!result) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ textAlign: 'center', marginTop: 100, color: Colors.textSecondary }}>
          결과를 불러올 수 없습니다.
        </Text>
      </SafeAreaView>
    );
  }

  const { typeData, axisScores } = result;

  const handleNext = async () => {
    // 백엔드에 성향 저장
    try {
      await fetch(`${API_BASE}/preference/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          travelType: result.type,
          scores: result.scores,
          axisScores: result.axisScores,
          tags: typeData.tags,
        }),
      });
    } catch (e) {
      // 저장 실패해도 진행
      console.warn('[PersonalityResult] preference save failed:', e);
    }

    // 다음 온보딩 단계로
    navigation.navigate('TravelPreferences' as never);
  };

  // 축 점수 바 렌더
  const renderAxisBar = (label: string, score: number, maxAbs = 4) => {
    const normalized = Math.min(Math.abs(score) / maxAbs, 1);
    const isPositive = score >= 0;
    return (
      <View style={styles.axisRow} key={label}>
        <Text style={styles.axisLabel}>{label}</Text>
        <View style={styles.axisBg}>
          <View
            style={[
              styles.axisFill,
              { width: `${normalized * 100}%`, backgroundColor: isPositive ? Colors.accent : Colors.primary },
            ]}
          />
        </View>
        <Text style={styles.axisScore}>{score > 0 ? `+${score}` : score}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* 결과 카드 */}
        <View style={[styles.resultCard, { borderColor: typeData.color }]}>
          <Text style={styles.emoji}>{typeData.emoji}</Text>
          <Text style={[styles.typeName, { color: typeData.color }]}>{typeData.name}</Text>
          <Text style={styles.typeSub}>{typeData.sub}</Text>
          <Text style={styles.typeDesc}>{typeData.desc}</Text>

          {/* 태그 */}
          <View style={styles.tagRow}>
            {typeData.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: typeData.color + '20', borderColor: typeData.color }]}>
                <Text style={[styles.tagText, { color: typeData.color }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 축 점수 */}
        <View style={styles.axisSection}>
          <Text style={styles.sectionTitle}>📊 성향 분석</Text>
          {renderAxisBar('계획성', axisScores.plan)}
          {renderAxisBar('모험심', axisScores.adventure)}
          {renderAxisBar('활동성', axisScores.active)}
          {renderAxisBar('사교성', axisScores.social)}
        </View>

        {/* 추천 */}
        <View style={styles.recSection}>
          <Text style={styles.sectionTitle}>🎯 맞춤 추천</Text>
          <View style={styles.recGrid}>
            <RecBlock title="🏛 관광지" items={typeData.rec.attraction} />
            <RecBlock title="🏨 숙소" items={typeData.rec.accommodation} />
            <RecBlock title="🎡 액티비티" items={typeData.rec.activity} />
            <RecBlock title="☕ 카페" items={typeData.rec.cafe} />
          </View>
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>다음으로 →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const RecBlock = ({ title, items }: { title: string; items: string[] }) => (
  <View style={styles.recBlock}>
    <Text style={styles.recTitle}>{title}</Text>
    {items.slice(0, 3).map((item) => (
      <Text key={item} style={styles.recItem}>• {item}</Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 60 },
  resultCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: Spacing.xl,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emoji: { fontSize: 56, marginBottom: Spacing.sm },
  typeName: { fontSize: 24, fontWeight: '900', marginBottom: 4, textAlign: 'center' },
  typeSub: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  typeDesc: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.sm },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  tagText: { fontSize: Typography.sizes.sm, fontWeight: '700' },
  axisSection: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  axisRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  axisLabel: { width: 60, fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  axisBg: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', marginHorizontal: Spacing.sm },
  axisFill: { height: 8, borderRadius: 4 },
  axisScore: { width: 32, fontSize: Typography.sizes.sm, color: Colors.text, fontWeight: 'bold', textAlign: 'right' },
  recSection: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  recGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  recBlock: { width: '48%', marginBottom: Spacing.md },
  recTitle: { fontSize: Typography.sizes.sm, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  recItem: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  nextBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: { color: Colors.secondary, fontSize: Typography.sizes.lg, fontWeight: 'bold' },
});
