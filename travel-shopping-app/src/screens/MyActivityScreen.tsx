import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  FlatList, Image, Alert, ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Calendar, Heart, ShoppingBag, Receipt } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, OrderResult } from '../types/travelTypes';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useActivity } from '../store/ActivityContext';
import { useAuth, API_BASE } from '../store/AuthContext';

type TabType = 'orders' | 'bookings' | 'likes';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  confirmed:   { label: '결제 완료', color: Colors.success },
  in_progress: { label: '진행 중',   color: Colors.primary },
  completed:   { label: '완료',      color: Colors.textSecondary },
  cancelled:   { label: '취소됨',    color: Colors.error },
};

const PAYMENT_LABEL: Record<string, string> = {
  card:       '신용/체크카드',
  kakao_pay:  '카카오페이',
  naver_pay:  '네이버페이',
  toss:       '토스페이',
  points:     '포인트 전액',
};

export const MyActivityScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const { bookings, likedItems, cancelBooking, refreshActivity } = useActivity();

  const [orders, setOrders]         = useState<OrderResult[]>([]);
  const [ordersLoading, setOL]      = useState(false);
  const [activityLoading, setAL]    = useState(false);

  // ── 주문 조회 ─────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setOL(true);
    try {
      const res  = await fetch(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (e) {
      console.error('[MyActivity] fetchOrders 실패:', e);
    } finally {
      setOL(false);
    }
  }, [token]);

  // ── 주문 취소 ─────────────────────────────────────────────────────────────
  const handleCancelOrder = (id: string, orderNo: string) => {
    Alert.alert(
      '주문 취소',
      `주문 ${orderNo}을 취소하시겠습니까?\n결제 금액과 포인트가 환불됩니다.`,
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '취소하기', style: 'destructive',
          onPress: async () => {
            try {
              const res  = await fetch(`${API_BASE}/orders/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              if (data.success) {
                setOrders(prev => prev.map(o =>
                  o._id === id ? { ...o, status: 'cancelled' } : o
                ));
                Alert.alert('완료', '주문이 취소되었습니다.');
              } else {
                Alert.alert('오류', data.message);
              }
            } catch (e) {
              Alert.alert('오류', '취소 처리 중 문제가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchOrders();
    const loadActivity = async () => {
      setAL(true);
      await refreshActivity();
      setAL(false);
    };
    loadActivity();
  }, []);

  // ── 주문 아이템 렌더 ──────────────────────────────────────────────────────
  const renderOrderItem = ({ item }: { item: OrderResult }) => {
    const st = STATUS_LABEL[item.status] || { label: item.status, color: Colors.textSecondary };
    const isCancelled = item.status === 'cancelled';
    const firstItem   = item.items?.[0];

    return (
      <View style={[styles.activityCard, isCancelled && { opacity: 0.6 }]}>
        <View style={{ flex: 1 }}>
          {/* 주문번호 + 상태 */}
          <View style={styles.orderTopRow}>
            <Text style={styles.orderNo}>{item.orderNo}</Text>
            <View style={[styles.statusBadge, { backgroundColor: st.color + '20' }]}>
              <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
            </View>
          </View>

          {/* 대표 상품 */}
          {firstItem && (
            <View style={styles.orderItemRow}>
              {firstItem.image ? (
                <Image source={{ uri: firstItem.image }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, { backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 20 }}>🏨</Text>
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {firstItem.title}
                  {item.items.length > 1 ? ` 외 ${item.items.length - 1}건` : ''}
                </Text>
                <Text style={styles.cardMetaText}>
                  {PAYMENT_LABEL[item.paymentMethod] || item.paymentMethod}
                  {item.pointsUsed > 0 ? ` · ${item.pointsUsed.toLocaleString()}P 사용` : ''}
                </Text>
                <Text style={styles.orderDate}>
                  {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.priceText}>₩{item.finalAmount?.toLocaleString()}</Text>
                {item.pointsEarned > 0 && (
                  <Text style={styles.earnText}>+{item.pointsEarned.toLocaleString()}P</Text>
                )}
              </View>
            </View>
          )}

          {/* 하단 버튼 */}
          {!isCancelled && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelOrder(item._id, item.orderNo)}
            >
              <Text style={styles.cancelButtonText}>주문 취소</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ── 예약 아이템 렌더 ──────────────────────────────────────────────────────
  const renderBookingItem = ({ item }: { item: any }) => (
    <View style={styles.activityCard}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={[styles.statusBadge, { backgroundColor: Colors.accent + '20' }]}>
            <Text style={[styles.statusText, { color: Colors.primary }]}>
              {item.status === 'confirmed' ? '예약 완료' : '진행 중'}
            </Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.cardMeta}>
            <Calendar size={12} color={Colors.textSecondary} />
            <Text style={styles.cardMetaText}>
              {item.bookingDate ? new Date(item.bookingDate).toLocaleDateString('ko-KR') : '날짜 없음'}
            </Text>
            <Text style={styles.priceText}>{item.price?.toLocaleString()}원</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => Alert.alert('예약 취소', `'${item.title}' 예약을 취소하시겠습니까?`, [
          { text: '아니오', style: 'cancel' },
          { text: '예', style: 'destructive', onPress: () => cancelBooking(item._id || item.id) },
        ])}
      >
        <Text style={styles.cancelButtonText}>취소</Text>
      </TouchableOpacity>
    </View>
  );

  // ── 찜 아이템 렌더 ─────────────────────────────────────────────────────────
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

  const listData = activeTab === 'orders'   ? orders
    : activeTab === 'bookings' ? bookings
    : likedItems;

  const isLoading = activeTab === 'orders' ? ordersLoading : activityLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 활동</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 탭 */}
      <View style={styles.tabContainer}>
        {([
          { key: 'orders',   icon: Receipt,     label: '구매 내역' },
          { key: 'bookings', icon: ShoppingBag, label: '예약 내역' },
          { key: 'likes',    icon: Heart,       label: '찜한 목록' },
        ] as const).map(({ key, icon: Icon, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.activeTab]}
            onPress={() => setActiveTab(key)}
          >
            <Icon size={16} color={activeTab === key ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === key && styles.activeTabText]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={listData}
          renderItem={
            activeTab === 'orders'   ? renderOrderItem   :
            activeTab === 'bookings' ? renderBookingItem :
            renderLikeItem
          }
          keyExtractor={(item: any) => item._id || item.id || String(Math.random())}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>
                {activeTab === 'orders' ? '🛒' : activeTab === 'bookings' ? '📅' : '❤️'}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'orders'   ? '구매 내역이 없습니다.'  :
                 activeTab === 'bookings' ? '예약된 활동이 없습니다.' :
                 '찜한 상품이 없습니다.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, backgroundColor: Colors.secondary,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backButton:  { padding: Spacing.xs },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },

  tabContainer: {
    flexDirection: 'row', backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent', gap: 4,
  },
  activeTab:     { borderBottomColor: Colors.primary },
  tabText:       { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  activeTabText: { color: Colors.primary, fontWeight: '800' },

  listContent: { padding: Spacing.md },

  activityCard: {
    backgroundColor: Colors.secondary, borderRadius: 16, padding: Spacing.md,
    marginBottom: Spacing.md, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },

  // 주문 스타일
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderNo:     { fontSize: 13, fontWeight: '800', color: Colors.text, letterSpacing: 0.5 },
  orderItemRow:{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  orderDate:   { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  earnText:    { fontSize: 11, color: Colors.primary, fontWeight: '700', marginTop: 2 },

  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6, alignSelf: 'flex-start', marginBottom: 4,
  },
  statusText: { fontSize: 10, fontWeight: '800' },

  // 공통
  cardImage:    { width: 64, height: 64, borderRadius: 10 },
  cardContent:  { flex: 1, marginLeft: Spacing.md },
  cardCategory: { fontSize: 10, color: Colors.primary, fontWeight: 'bold', marginBottom: 2 },
  cardTitle:    { fontSize: Typography.sizes.md, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  cardMeta:     { flexDirection: 'row', alignItems: 'center' },
  cardMetaText: { fontSize: 11, color: Colors.textSecondary, marginLeft: 4, flex: 1 },
  priceText:    { fontSize: 14, fontWeight: '800', color: Colors.primary },

  cancelButton: {
    alignSelf: 'flex-end', borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, marginTop: 8,
  },
  cancelButtonText: { fontSize: 12, color: Colors.error, fontWeight: '600' },

  emptyContainer: { paddingTop: 80, alignItems: 'center' },
  emptyText:      { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});
