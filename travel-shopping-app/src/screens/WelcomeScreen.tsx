import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';

export const WelcomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.headerSpacer} />
          
          <View style={styles.textContainer}>
            <Text style={styles.slogan}>나만의 여행을</Text>
            <Text style={styles.slogan}>쇼핑하듯 직접 만들어보세요</Text>
            <Text style={styles.subSlogan}>복잡한 계획 없이, 쉽고 완벽하게</Text>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.primaryButtonText}>시작하기</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.secondaryButtonText}>로그인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  containerSplash: {
    flex: 1,
    backgroundColor: '#FFFFFF', // 흰색 배경
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLarge: {
    width: 400,
    height: 133,
  },
  bottomContent: {
    paddingBottom: Spacing.xl,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  copyright: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A0A0A0', // 연한 회색 텍스트
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  headerSpacer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingBottom: Spacing.xl,
  },
  logo: {
    width: 240, // 온보딩 화면에서는 크기를 약간 조절
    height: 80,
  },
  textContainer: {
    flex: 2,
    justifyContent: 'center',
  },
  slogan: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 4,
    lineHeight: 48,
  },
  subSlogan: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginTop: Spacing.sm,
    fontWeight: '600',
  },
  actionContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xl,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
  },
  secondaryButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: Typography.sizes.md,
    fontWeight: '600',
  },
});
