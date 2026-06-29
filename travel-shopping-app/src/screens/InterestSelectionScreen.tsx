import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useNavigation } from '@react-navigation/native';

const INTERESTS = [
  { id: 'beach', label: '해변/휴양', icon: '🏖️' },
  { id: 'city', label: '도심 투어', icon: '🏙️' },
  { id: 'nature', label: '자연/힐링', icon: '🌲' },
  { id: 'food', label: '맛집 탐방', icon: '🍜' },
  { id: 'activity', label: '액티비티/체험', icon: '🏄‍♂️' },
  { id: 'history', label: '역사/문화', icon: '🏛️' },
  { id: 'shopping', label: '쇼핑몰', icon: '🛍️' },
  { id: 'nightlife', label: '유흥/나이트라이프', icon: '🍹' },
];

export const InterestSelectionScreen = () => {
  const navigation = useNavigation();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleToggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    navigation.navigate('TravelPreferences' as never);
  };

  const isNextEnabled = selectedInterests.length >= 3;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <Text style={styles.title}>어떤 여행을 좋아하시나요?</Text>
          <Text style={styles.subtitle}>관심사를 3개 이상 선택해주세요.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <TouchableOpacity
                  key={interest.id}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => handleToggleInterest(interest.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cardIcon}>{interest.icon}</Text>
                  <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                    {interest.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.nextButton, !isNextEnabled && styles.nextButtonDisabled]}
            disabled={!isNextEnabled}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>다음으로 ({selectedInterests.length}/3)</Text>
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
    paddingBottom: Spacing.md,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '15', // light blue tint
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  cardLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: Colors.primary,
    fontWeight: '800',
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
