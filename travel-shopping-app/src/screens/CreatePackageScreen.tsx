import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert } from 'react-native';
import { ArrowLeft, GripVertical, X, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { usePackage } from '../store/PackageContext';
import { useNotifications } from '../store/NotificationContext';

export const CreatePackageScreen = () => {
  const navigation = useNavigation();
  const { packageItems, removeFromPackage, packageName, setPackageName, savePackage, clearPackage } = usePackage();
  const { addNotification } = useNotifications();
  const [isSaving, setIsSaving] = useState(false);

  const renderDay = (dayNum: number) => {
    const dayItems = packageItems.filter(item => item.day === dayNum);
    return (
      <View key={`day-${dayNum}`} style={styles.dayContainer}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>Day {dayNum}</Text>
        </View>
        {dayItems.length === 0 ? (
          <View style={styles.emptyDayBox}>
            <Text style={styles.emptyDayText}>+ 상세 페이지에서 일정을 추가해주세요</Text>
          </View>
        ) : (
          dayItems.map(item => (
            <View key={item.id} style={styles.timelineCard}>
              <GripVertical color="#CBD5E0" size={20} />
              <View style={styles.timelineInfo}>
                <View style={styles.timeRow}>
                  <Clock color={Colors.primary} size={12} />
                  <Text style={styles.timeSlot}>{item.timeSlot}</Text>
                </View>
                <Text style={styles.timelineTitle}>{item.title}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromPackage(item.id)} style={styles.removeButton}>
                <X color={Colors.textSecondary} size={18} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    );
  };

  const handleSavePackage = async () => {

    if (packageItems.length === 0) {
      Alert.alert('알림', '일정을 한 개 이상 추가해주세요!');
      return;
    }

    setIsSaving(true);
    try {
      const success = await savePackage();
      if (success) {
        addNotification({
          title: '패키지 저장 완료',
          message: `'${packageName}' 패키지가 성공적으로 저장되었습니다.`,
          type: 'info',
        });
        Alert.alert('성공', '패키지가 저장되었습니다! 내 활동에서 확인하실 수 있습니다.', [
          { text: '확인', onPress: () => {
            clearPackage();
            navigation.navigate('MyActivity' as never);
          }}
        ]);
      } else {
        throw new Error('저장에 실패했습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>나만의 패키지 만들기</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <TextInput
              style={styles.packageTitleInput}
              value={packageName}
              onChangeText={setPackageName}
              placeholder="패키지 이름을 입력하세요"
            />
            <View style={styles.dateRow}>
              <CalendarIcon color={Colors.textSecondary} size={14} />
              <Text style={styles.dateText}>여행 일정을 구성해보세요</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressStepActive}>
              <Text style={styles.progressTextActive}>일정 구성</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStepInactive}>
              <Text style={styles.progressTextInactive}>완료</Text>
            </View>
          </View>

          <View style={styles.timelineSection}>
            {[1, 2, 3].map(day => renderDay(day))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
          onPress={handleSavePackage}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? '저장 중...' : '패키지 저장 및 예약하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { padding: Spacing.xs },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 100 },
  titleSection: {
    backgroundColor: Colors.secondary,
    padding: Spacing.lg,
    borderRadius: 20,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  packageTitleInput: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 14, color: Colors.textSecondary, marginLeft: 6 },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  progressStepActive: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  progressStepInactive: {
    backgroundColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  progressTextActive: { color: Colors.secondary, fontSize: 12, fontWeight: '700' },
  progressTextInactive: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  progressDivider: { flex: 1, height: 2, backgroundColor: Colors.border, marginHorizontal: 12 },
  timelineSection: { marginTop: Spacing.sm },
  dayContainer: { marginBottom: Spacing.xl },
  dayHeader: {
    backgroundColor: Colors.accent + '20',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  dayTitle: { color: Colors.primary, fontWeight: '800', fontSize: 13 },
  timelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineInfo: { flex: 1, marginLeft: 12 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  timeSlot: { fontSize: 12, color: Colors.primary, fontWeight: '700', marginLeft: 4 },
  timelineTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  removeButton: { padding: 4 },
  emptyDayBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  emptyDayText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: Colors.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: { color: Colors.secondary, fontSize: 17, fontWeight: '800' },
});
