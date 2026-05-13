import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { useBudget } from '../store/BudgetContext';
import { ArrowLeft, Wallet } from 'lucide-react-native';

const BUDGET_OPTIONS = [
  { id: 'low', label: '가성비 여행' },
  { id: 'medium', label: '적당한 여행' },
  { id: 'high', label: '럭셔리 호캉스' },
];

const COMPANION_OPTIONS = [
  { id: 'solo', label: '나 홀로' },
  { id: 'friends', label: '친구와 함께' },
  { id: 'couple', label: '연인과 함께' },
  { id: 'family', label: '가족과 함께' },
];

export const TravelPreferencesScreen = () => {
  const navigation = useNavigation();
  const { totalBudget, setTotalBudget } = useBudget();
  const [selectedCompanion, setSelectedCompanion] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState(totalBudget > 0 ? totalBudget.toString() : '');

  const handleNext = () => {
    const amount = parseInt(budgetInput.replace(/[^0-9]/g, '')) || 0;
    setTotalBudget(amount);
    navigation.navigate('AIReview' as never);
  };

  const isNextEnabled = budgetInput.length > 0 && selectedCompanion;

  const renderOptions = (options: any[], selected: string | null, onSelect: (id: string) => void) => {
    return (
      <View style={styles.pillContainer}>
        {options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => onSelect(option.id)}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <Text style={styles.title}>여행 스타일을 알려주세요</Text>
          <Text style={styles.subtitle}>거의 다 왔어요! 딱 맞는 여행을 찾아드릴게요.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 총 예산은 얼마인가요?</Text>
            <View style={styles.budgetInputWrapper}>
              <Wallet color={Colors.primary} size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.budgetInput}
                placeholder="예: 500,000"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                value={budgetInput}
                onChangeText={setBudgetInput}
              />
              <Text style={styles.currencyText}>원</Text>
            </View>
            <Text style={styles.inputGuide}>인원수와 기간에 적절한 예상을 입력해 주세요.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>누구와 함께 가나요?</Text>
            {renderOptions(COMPANION_OPTIONS, selectedCompanion, setSelectedCompanion)}
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.nextButton, !isNextEnabled && styles.nextButtonDisabled]}
            disabled={!isNextEnabled}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>추천 결과 보기 ✨</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: 0,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.secondary,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  pillSelected: {
    backgroundColor: Colors.accent + '20',
    borderColor: Colors.accent,
  },
  pillText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  budgetInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    height: 64,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  budgetInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  currencyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
  },
  inputGuide: {
    marginTop: Spacing.sm,
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: 90,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextButton: {
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
  nextButtonDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
  },
});
