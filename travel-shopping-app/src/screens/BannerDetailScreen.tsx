import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';
import { ArrowLeft, Sparkles, Target, Calendar, MessageCircle, CheckCircle, TrendingUp, Heart, Users } from 'lucide-react-native';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

type BannerDetailRouteProp = RouteProp<{ BannerDetail: { type: 'chatbot' | 'personality' | 'itinerary' } }, 'BannerDetail'>;

// 각 기능별 데이터
const FEATURE_DATA = {
  chatbot: {
    emoji: '🤖',
    title: 'AI 챗봇 추천',
    subtitle: '대화하듯 편하게 물어보세요',
    gradient: ['#f093fb', '#f5576c'],
    backgroundColor: '#FFF0F6',
    accentColor: '#f5576c',
    description: 'AI 챗봇이 당신의 여행 취향과 상황에 맞는 최적의 장소를 추천해드립니다. 마치 친구와 대화하듯 편하게 물어보세요!',
    features: [
      {
        icon: MessageCircle,
        title: '자연스러운 대화',
        desc: '복잡한 메뉴 없이 대화만으로 원하는 정보를 얻을 수 있어요',
      },
      {
        icon: Target,
        title: '맞춤형 추천',
        desc: '예산, 일정, 취향을 고려한 딱 맞는 장소를 추천해드려요',
      },
      {
        icon: Sparkles,
        title: '실시간 답변',
        desc: 'OpenAI 기반 AI가 즉시 응답하여 빠르게 계획을 세울 수 있어요',
      },
    ],
    navigateTo: 'Concierge',
  },
  personality: {
    emoji: '🎯',
    title: '여행 성향 분석',
    subtitle: '나만의 여행 스타일을 발견하세요',
    gradient: ['#4facfe', '#00f2fe'],
    backgroundColor: '#E6F7FF',
    accentColor: '#00f2fe',
    description: '12가지 질문으로 당신의 여행 성향을 분석하고, 8가지 유형 중 가장 잘 맞는 여행 스타일을 찾아드립니다.',
    features: [
      {
        icon: CheckCircle,
        title: '12가지 질문',
        desc: '간단한 12개 질문으로 당신의 여행 성향을 정확히 분석해요',
      },
      {
        icon: Users,
        title: '8가지 유형',
        desc: '철두철미형, 자유여행형, 힐링형 등 다양한 여행 유형 제공',
      },
      {
        icon: Heart,
        title: '맞춤 추천',
        desc: '분석 결과를 바탕으로 당신에게 딱 맞는 여행지를 추천해요',
      },
    ],
    navigateTo: 'PersonalityTest',
  },
  itinerary: {
    emoji: '📅',
    title: 'AI 일정 생성',
    subtitle: '최적의 여행 일정을 자동으로',
    gradient: ['#43e97b', '#38f9d7'],
    backgroundColor: '#E6FFF9',
    accentColor: '#38f9d7',
    description: '여행 목적지와 기간만 입력하면 AI가 최적의 동선과 일정을 자동으로 생성해드립니다.',
    features: [
      {
        icon: Calendar,
        title: '자동 일정 생성',
        desc: '목적지와 날짜만 입력하면 AI가 최적의 일정을 만들어요',
      },
      {
        icon: TrendingUp,
        title: '최적 동선',
        desc: '이동 시간과 거리를 고려한 효율적인 여행 경로를 제안해요',
      },
      {
        icon: Sparkles,
        title: '실시간 조정',
        desc: '일정을 수정하면 AI가 즉시 최적화된 대안을 제시해요',
      },
    ],
    navigateTo: 'CreatePackage',
  },
};

export const BannerDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<BannerDetailRouteProp>();
  const { type } = route.params;

  const data = FEATURE_DATA[type];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: data.backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={data.backgroundColor} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1A1A1A" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>기능 소개</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: data.accentColor }]}>
          <Text style={styles.heroEmoji}>{data.emoji}</Text>
          <Text style={styles.heroTitle}>{data.title}</Text>
          <Text style={styles.heroSubtitle}>{data.subtitle}</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{data.description}</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>주요 기능</Text>
          {data.features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIconWrapper, { backgroundColor: data.backgroundColor }]}>
                  <FeatureIcon size={24} color={data.accentColor} strokeWidth={2} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Call to Action Buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.tryBtn, { backgroundColor: data.accentColor }]}
            onPress={() => {
              if (type === 'itinerary') {
                // AI 일정 생성 - 패키지 탭으로 이동
                (navigation as any).navigate('Main', { screen: 'Package' });
              } else {
                // 다른 기능들은 기존대로
                (navigation as any).navigate(data.navigateTo);
              }
            }}
          >
            <Text style={styles.tryBtnText}>사용해보기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelBtnText}>나가기</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  container: {
    flex: 1,
  },
  heroSection: {
    paddingVertical: 50,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 30,
  },
  heroEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#4A5568',
    fontWeight: '500',
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    fontWeight: '500',
  },
  ctaSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tryBtn: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  tryBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  cancelBtn: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#718096',
  },
});
