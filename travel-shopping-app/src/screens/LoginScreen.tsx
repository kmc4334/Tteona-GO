import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useAuth } from '../store/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';

export const LoginScreen = () => {
  const { login } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      await login(email, password);
      // login method will set isAuthenticated to true, which will navigate automatically
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>환영합니다!</Text>
          <Text style={styles.subtitle}>떠나 GO 가이드와 함께 여행을 시작해보세요.</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {errorMessage ? (
            <Text style={{ color: Colors.error, marginBottom: Spacing.sm, marginLeft: Spacing.xs }}>
              {errorMessage}
            </Text>
          ) : null}

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>아직 계정이 없으신가요? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
              <Text style={styles.signupText}>회원가입</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  inputContainer: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 56,
    justifyContent: 'center',
  },
  input: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.md,
  },
  signupText: {
    color: Colors.primary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
});
