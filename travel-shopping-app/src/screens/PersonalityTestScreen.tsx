/* ══════════════════════════════════════════════
   screens/PersonalityTestScreen.tsx
   여행 성향 분석 퀴즈 화면
   ══════════════════════════════════════════════ */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';
import { Colors } from '../theme/colors';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { getQuestions, UserAnswers } from '../utils/personalityAnalyzer';

const { width } = Dimensions.get('window');

export const PersonalityTestScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const questions = getQuestions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswer = answers[currentQuestion.id] !== undefined;

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!hasAnswer) return;

    if (isLastQuestion) {
      navigation.navigate('PersonalityResult', { answers });
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={28} color="#1A1A1A" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>여행 성향 테스트</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.categoryText}>{currentQuestion.category}</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionBtn,
                  answers[currentQuestion.id] === option.value && styles.optionBtnSelected
                ]}
                onPress={() => handleAnswer(option.value)}
              >
                <Text style={[
                  styles.optionText,
                  answers[currentQuestion.id] === option.value && styles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnSecondary, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={20} color={currentIndex === 0 ? '#CCC' : '#4A90E2'} strokeWidth={2} />
          <Text style={[styles.navBtnText, styles.navBtnTextSecondary, currentIndex === 0 && styles.navBtnTextDisabled]}>
            이전
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnPrimary, !hasAnswer && styles.navBtnDisabled]}
          onPress={handleNext}
          disabled={!hasAnswer}
        >
          <Text style={[styles.navBtnText, styles.navBtnTextPrimary, !hasAnswer && styles.navBtnTextDisabled]}>
            {isLastQuestion ? '결과 보기' : '다음'}
          </Text>
          {!isLastQuestion && (
            <ChevronRight size={20} color={!hasAnswer ? '#CCC' : '#fff'} strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#FBFBFC',
  },
  questionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 25,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionBtn: {
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  optionBtnSelected: {
    backgroundColor: '#E8F4FF',
    borderColor: '#4A90E2',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A5568',
    lineHeight: 22,
  },
  optionTextSelected: {
    color: '#1A1A1A',
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 6,
  },
  navBtnPrimary: {
    backgroundColor: '#4A90E2',
  },
  navBtnSecondary: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  navBtnDisabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#F0F0F0',
  },
  navBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  navBtnTextPrimary: {
    color: '#fff',
  },
  navBtnTextSecondary: {
    color: '#4A90E2',
  },
  navBtnTextDisabled: {
    color: '#CCC',
  },
});
