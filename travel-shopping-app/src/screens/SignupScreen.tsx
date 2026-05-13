import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useAuth, API_BASE } from '../store/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const SignupScreen = () => {
  const { signup } = useAuth();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const handleSendVerification = async () => {
    setErrorMessage('');
    if (!email.includes('@')) {
      setErrorMessage('유효한 이메일을 입력해주세요.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsEmailSent(true);
        alert('인증번호가 발송되었습니다. 콘솔 또는 이메일을 확인해주세요.');
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('인증번호 발송 중 오류가 발생했습니다.');
    }
  };

  const handleVerifyCode = async () => {
    setErrorMessage('');
    try {
      const response = await fetch(`${API_BASE}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsEmailVerified(true);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('인증 확인 중 오류가 발생했습니다.');
    }
  };

  const handleSignup = async () => {
    setErrorMessage('');
    
    if (!isEmailVerified) {
      setErrorMessage('이메일 인증을 완료해주세요.');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (!name || !email || !password) {
      setErrorMessage('모든 필드(이름, 이메일, 비밀번호)를 입력해 주세요.');
      return;
    }

    try {
      await signup(name, nickname || name, email, password);
      // Backend request succeeded; navigate to onboarding
      navigation.navigate('ProfileSetup' as never);
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
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>새로운 여행의 시작을 준비해보세요.</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="이름"
              placeholderTextColor={Colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
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

          <View style={styles.inputContainerRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="이메일"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isEmailVerified}
            />
            {!isEmailVerified && (
              <TouchableOpacity 
                style={styles.verifyButtonSmall} 
                onPress={handleSendVerification}
              >
                <Text style={styles.verifyButtonTextSmall}>인증번호 전송</Text>
              </TouchableOpacity>
            )}
            {isEmailVerified && <Text style={{ color: Colors.success, marginLeft: 8 }}>✅ 인증 완료</Text>}
          </View>

          {isEmailSent && !isEmailVerified && (
            <View style={styles.inputContainerRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="인증번호 (123456)"
                placeholderTextColor={Colors.textSecondary}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
              />
              <TouchableOpacity 
                style={styles.verifyButtonSmall} 
                onPress={handleVerifyCode}
              >
                <Text style={styles.verifyButtonTextSmall}>확인</Text>
              </TouchableOpacity>
            </View>
          )}

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

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="비밀번호 확인"
              placeholderTextColor={Colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>가입하기</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>이미 계정이 있으신가요? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginText}>로그인</Text>
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
    color: Colors.accent,
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
  inputContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 56,
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
  verifyButtonSmall: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    marginLeft: Spacing.sm,
  },
  verifyButtonTextSmall: {
    color: Colors.primary,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  signupButton: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonText: {
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
  loginText: {
    color: Colors.accent,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
});
