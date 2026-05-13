import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'lucide-react-native';
import { useAuth } from '../store/AuthContext';

export const ProfileSetupScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname || '');

  const handleContinue = () => {
    navigation.navigate('InterestSelection' as never);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>프로필 설정</Text>
          <Text style={styles.subtitle}>앱에서 사용할 프로필을 만들어주세요.</Text>

          <View style={styles.imageUploadContainer}>
            <View style={styles.imageCircle}>
              <Camera color={Colors.textSecondary} size={32} />
            </View>
            <Text style={styles.imageUploadText}>사진 추가 (선택)</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="닉네임"
              placeholderTextColor={Colors.textSecondary}
              value={nickname}
              onChangeText={setNickname}
            />
          </View>

          <View style={styles.spacer} />

          <TouchableOpacity 
            style={[styles.continueButton, !nickname && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!nickname}
          >
            <Text style={styles.continueButtonText}>계속하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl * 1.5,
  },
  imageUploadContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  imageCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  imageUploadText: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 56,
    justifyContent: 'center',
  },
  input: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  spacer: {
    flex: 1,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
});
