import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';
import { ChevronRight, Plane, Map, Compass } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: '나만의 여행을\n쇼핑하듯 직접!',
    description: '복잡한 패키지 대신,\n내가 원하는 일정만 골라 담으세요.',
    icon: <Plane size={100} color={Colors.primary} />,
    bgColor: '#F0F7FF',
  },
  {
    id: 2,
    title: '현지 전문가가\n추천하는 핫플레이스',
    description: '광고가 아닌 진짜 숨은 맛집과\n특별한 장소를 발견해보세요.',
    icon: <Map size={100} color={Colors.primary} />,
    bgColor: '#F5F5FF',
  },
  {
    id: 3,
    title: 'AI 컨시어지와\n함께하는 스마트 투어',
    description: '궁금한 건 언제든 물어보세요.\n당신만을 위한 가이드가 대기 중입니다.',
    icon: <Compass size={100} color={Colors.primary} />,
    bgColor: '#F0FFF7',
  },
];

export const IntroScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('Signup');
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: slide.bgColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {slide.icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                currentSlide === i ? styles.dotActive : null
              ]} 
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentSlide === SLIDES.length - 1 ? '시작하기' : '다음으로'}
          </Text>
          <ChevronRight color={Colors.secondary} size={20} style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLink} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>이미 계정이 있으신가요? <Text style={styles.loginBold}>로그인</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.md,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: Spacing.lg,
  },
  nextButtonText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
  },
  loginBold: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
