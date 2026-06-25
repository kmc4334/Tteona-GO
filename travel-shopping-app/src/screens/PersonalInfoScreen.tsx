import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ChevronLeft, User, Mail, Phone, Calendar } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../store/AuthContext';

export const PersonalInfoScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '정보 없음';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인정보 확인</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <User color={Colors.primary} size={20} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>이름</Text>
              <Text style={styles.value}>{user?.name || '정보 없음'}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <User color={Colors.primary} size={20} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>닉네임</Text>
              <Text style={styles.value}>{user?.nickname || '정보 없음'}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Mail color={Colors.primary} size={20} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>이메일</Text>
              <Text style={styles.value}>{user?.email || '정보 없음'}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Phone color={Colors.primary} size={20} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>전화번호</Text>
              <Text style={styles.value}>{user?.phoneNumber || '미등록'}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Calendar color={Colors.primary} size={20} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>가입일</Text>
              <Text style={styles.value}>{formatDate(user?.createdAt)}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.editRequestButton}
          onPress={() => Alert.alert('알림', '정보 수정은 설정 메뉴의 개별 변경 기능을 이용해 주세요.')}
        >
          <Text style={styles.editRequestText}>정보 수정하기</Text>
        </TouchableOpacity>
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
  content: { padding: Spacing.md, paddingTop: Spacing.xl },
  infoCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  editRequestButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  editRequestText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  }
});
