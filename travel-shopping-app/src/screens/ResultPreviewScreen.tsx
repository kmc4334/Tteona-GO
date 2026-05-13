import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useAuth } from '../store/AuthContext';

const MOCK_RECOMMENDATIONS = [
  {
    id: 'r1',
    title: '제주도 푸른 바다 휴양 패키지',
    location: '제주 애월읍',
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80&w=600',
    price: 350000,
    tags: ['해변', '호캉스', '휴식'],
  },
  {
    id: 'r2',
    title: '도심 속 럭셔리 스테이',
    location: '서울 강남',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=600',
    price: 420000,
    tags: ['도심 투어', '쇼핑', '맛집'],
  }
];

export const ResultPreviewScreen = () => {
  const { completeOnboarding } = useAuth(); // We'll use completeOnboarding to simulate completing onboarding and setting auth = true

  const handleStartExploring = async () => {
    // Finish onboarding: trigger auth state to true so AppNavigator switches to Main Tabs.
    await completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.title}>취향 저격 맞춤 여행</Text>
          <Text style={styles.subtitle}>선택하신 정보를 바탕으로 가장 추천하는 패키지입니다.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {MOCK_RECOMMENDATIONS.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardLocation}>📍 {item.location}</Text>

                <View style={styles.tagsRow}>
                  {item.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.priceText}>₩{item.price.toLocaleString()}부터</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartExploring}
          >
            <Text style={styles.startButtonText}>앱 시작하기 🚀</Text>
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
    lineHeight: 22,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: 0,
  },
  card: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardInfo: {
    padding: Spacing.lg,
  },
  cardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  tag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  tagText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  priceText: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.accent,
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: 80,
    backgroundColor: Colors.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startButton: {
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
  startButtonText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
  },
});
