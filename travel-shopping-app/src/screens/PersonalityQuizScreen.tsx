import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { analyzePersonality, getQuestions } from '../utils/personalityAnalyzer';
import type { UserAnswers } from '../types/personalityTypes';

const questions = getQuestions();

export const PersonalityQuizScreen = () => {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (isLast) {
      // 분석 완료 → 결과 화면으로
      const result = analyzePersonality(newAnswers);
      navigation.navigate('PersonalityResult' as never, { result } as never);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>여행 성향 분석</Text>
        <Text style={styles.counter}>{currentIndex + 1} / {questions.length}</Text>
      </View>

      {/* 진행 바 */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 카테고리 */}
        <Text style={styles.category}>{currentQuestion.category}</Text>

        {/* 질문 */}
        <Text style={styles.question}>{currentQuestion.question}</Text>

        {/* 선택지 */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.75}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  backText: { fontSize: 22, color: Colors.text },
  headerLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
    color: Colors.text,
  },
  counter: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressBg: {
    height: 6,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  content: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  category: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  question: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 32,
    marginBottom: Spacing.xxl,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: Spacing.sm,
  },
  optionCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '15',
  },
  optionText: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
    lineHeight: 24,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
