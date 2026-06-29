import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { ArrowLeft, Calendar, Heart, ShoppingBag } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useActivity } from '../store/ActivityContext';

type TabType = 'bookings' | 'likes';

export const MyActivityScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const { bookings, likedItems, cancelBooking, refreshActivity } = useActivity();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await refreshActivity();
      setLoading(false);
    };
    load();
  }, []);

  const handleCancel = (id: string, title: string) => {
    Alert.alert(
      '예약 취소',
      `'${title}' 예약을 취소하시겠습니까?`,
      [
        { text: '아니오', style: 'cancel' },
        { text: '예', style: 'destructive', onPress: () => cancelBooking(id) }
      ]
    );
  };

  const renderBookingItem = ({ item }: { item: any }) => (
    <View style={styles.activityCard}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status === 'confirmed' ? '예약 완료' : '진행 중'}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.cardMeta}>
            <Calendar size={12} color={Colors.textSecondary} />
            <Text style={styles.cardMetaText}>{item.bookingDate ? new Date(item.bookingDate).toLocaleDateString() : '날짜 없음'}</Text>
            <Text style={styles.priceText}>{item.price?.toLocaleString()}원</Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => handleCancel(item._id || item.id, item.title)}
      >
        <Text style={styles.cancelButtonText}>취소</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLikeItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardMeta}>
          <Heart size={12} color={Colors.error} fill={Colors.error} />
          <Text style={[styles.cardMetaText, { color: Colors.error, fontWeight: 'bold' }]}>찜한 상품</Text>
          <Text style={styles.priceText}>{item.price?.toLocaleString()}원</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 활동</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
          onPress={() => setActiveTab('bookings')}
        >
          <ShoppingBag size={18} color={activeTab === 'bookings' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>예약 내역</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
          onPress={() => setActiveTab('likes')}
        >
          <Heart size={18} color={activeTab === 'likes' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>찜한 목록</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'bookings' ? bookings : likedItems}
        renderItem={activeTab === 'bookings' ? renderBookingItem : renderLikeItem}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'bookings' ? '예약된 활동이 없습니다.' : '찜한 상품이 없습니다.'}
            </Text>
          </View>
        }
      />
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
  backButton: { padding: Spacing.xs },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  listContent: {
    padding: Spacing.md,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardImage: { width: 70, height: 70, borderRadius: 12 },
  cardContent: { flex: 1, marginLeft: Spacing.md },
  statusBadge: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  statusText: { fontSize: 10, color: Colors.primary, fontWeight: '800' },
  cardCategory: { fontSize: 10, color: Colors.primary, fontWeight: 'bold', marginBottom: 2 },
  cardTitle: { fontSize: Typography.sizes.md, fontWeight: 'bold', color: Colors.text, marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  cardMetaText: { fontSize: 11, color: Colors.textSecondary, marginLeft: 4, flex: 1 },
  priceText: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600',
  }
});
