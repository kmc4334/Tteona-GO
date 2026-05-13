import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useNavigation } from '@react-navigation/native';
import { useAuth, API_BASE } from '../store/AuthContext';

export const ChangeEmailScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      updateUser(data.user);
      Alert.alert('성공', '이메일 주소가 변경되었습니다.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이메일 변경</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.instructions}>
            새로운 이메일 주소와 현재 비밀번호를 입력해주세요. 변경 후에는 새로운 이메일로 로그인해야 합니다.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="새로운 이메일 주소"
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
              placeholder="현재 비밀번호 확인"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, (!email || !password) && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={!email || !password}
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
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
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
