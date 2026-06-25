import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { ChevronLeft, Bell, Shield, CircleHelp, User, Lock, Mail, FileText, UserX } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth, API_BASE } from '../store/AuthContext';
import { RootStackParamList } from '../types/travelTypes';

export const SettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout, token } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    const doDelete = async () => {
      setDeleting(true);
      try {
        const res = await fetch(`${API_BASE}/auth/delete`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          if (Platform.OS === 'web') {
            window.alert('탈퇴 완료: 그동안 떠나GO를 이용해주셔서 감사합니다.');
          } else {
            Alert.alert('탈퇴 완료', '그동안 떠나GO를 이용해주셔서 감사합니다.');
          }
          logout();
        } else {
          if (Platform.OS === 'web') {
            window.alert('오류: ' + (data.message || '탈퇴에 실패했습니다.'));
          } else {
            Alert.alert('오류', data.message || '탈퇴에 실패했습니다.');
          }
        }
      } catch (e) {
        if (Platform.OS === 'web') {
          window.alert('오류: 네트워크 오류가 발생했습니다.');
        } else {
          Alert.alert('오류', '네트워크 오류가 발생했습니다.');
        }
      } finally {
        setDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        '정말 탈퇴하시겠어요?\n탈퇴 시 모든 데이터가 영구 삭제되며 복구할 수 없습니다.'
      );
      if (confirmed) doDelete();
    } else {
      Alert.alert(
        '회원 탈퇴',
        '정말 탈퇴하시겠어요?\n탈퇴 시 모든 데이터(장바구니, 채팅 기록, 패키지 등)가 영구 삭제되며 복구할 수 없습니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '탈퇴하기', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>일반 설정</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconBot}><Bell color={Colors.accent} size={20} /></View>
            <Text style={styles.actionText}>알림 설정</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconBot}><Shield color={Colors.accent} size={20} /></View>
            <Text style={styles.actionText}>개인정보 취급방침</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconBot}><CircleHelp color={Colors.accent} size={20} /></View>
            <Text style={styles.actionText}>고객센터</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 관리</Text>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('PersonalInfo')}>
            <View style={styles.actionIconBot}><FileText color={Colors.accent} size={20} /></View>
            <Text style={styles.actionText}>개인정보 확인</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ChangeName')}>
            <View style={styles.actionIconBot}><User color={Colors.accent} size={20} /></View>
            <Text style={styles.actionText}>이름 변경</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ChangeEmail')}>
            <View style={styles.actionIconBot}><Mail color={Colors.accent} size={20} /></View>
            <Text style={styles.actionText}>이메일 변경</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ChangePassword')}>
            <View style={styles.actionIconBot}><Lock color={Colors.accent} size={20} /></View>
            <Text style={styles.actionText}>비밀번호 변경</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={logout}
          >
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={Colors.error || '#e53e3e'} />
            ) : (
              <>
                <UserX color={Colors.error || '#e53e3e'} size={18} style={{ marginRight: 8 }} />
                <Text style={styles.deleteText}>회원 탈퇴</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
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
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl * 2 },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: { 
    fontSize: Typography.sizes.md, 
    fontWeight: Typography.weights.bold, 
    color: Colors.textSecondary, 
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIconBot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium, color: Colors.text },
  logoutButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  logoutText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.md,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: '#fff0f0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcc',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteText: {
    color: Colors.error || '#e53e3e',
    fontSize: Typography.sizes.md,
    fontWeight: '700',
  },
});
