import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useNavigation } from '@react-navigation/native';
import { useAuth, API_BASE } from '../store/AuthContext';

export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('새 비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    setErrorMessage('');
    try {
      const response = await fetch(`${API_BASE}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      Alert.alert('성공', '비밀번호가 변경되었습니다.');
      navigation.goBack();
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const isFormValid = currentPassword && newPassword && confirmPassword;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>비밀번호 변경</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.instructions}>
            주기적인 비밀번호 변경을 통해 계정을 안전하게 보호하세요.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="현재 비밀번호"
              placeholderTextColor={Colors.textSecondary}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호"
              placeholderTextColor={Colors.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호 확인"
              placeholderTextColor={Colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity 
            style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={!isFormValid}
          >
            <Text style={styles.saveButtonText}>변경하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text },
  backButton: { padding: Spacing.xs },
  container: { flex: 1 },
  content: { padding: Spacing.xl, flex: 1 },
  instructions: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
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
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
  },
});
