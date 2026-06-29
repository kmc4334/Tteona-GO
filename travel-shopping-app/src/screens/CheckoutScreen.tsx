/**
 * CheckoutScreen.tsx
 * 결제 화면 — 포인트 사용, 결제수단 선택, 최종 결제 처리
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, Platform, Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft, CreditCard, Wallet, ChevronRight,
  CheckCircle, Tag, Users,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useAuth, API_BASE } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import { RootStackParamList, CheckoutItem } from '../types/travelTypes';

// ── 결제 수단 목록 ────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'card',       label: '신용/체크카드',  emoji: '💳' },
  { id: 'kakao_pay',  label: '카카오페이',     emoji: '💛' },
  { id: 'naver_pay',  label: '네이버페이',     emoji: '💚' },
  { id: 'toss',       label: '토스페이',       emoji: '💙' },
  { id: 'points',     label: '포인트 전액',    emoji: '🪙' },
];

const DISCOUNT_RATE = 0; // 현재 할인 없음 (쿠폰 연동 시 변경)

export const CheckoutScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { token, user } = useAuth();
  const { clearCart } = useCart();

  const {
    items,
    subtotal,
    discountAmount: passedDiscount = 0,
  } = (route.params as any) || {};

  // ── 상태 ─────────────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [myPoints, setMyPoints]           = useState<number>(0);
  const [usePointInput, setUsePointInput] = useState<string>('');
  const [useAllPoints, setUseAllPoints]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [pointsLoading, setPointsLoading] = useState(true);

  const discountAmount = passedDiscount;
  // '포인트 전액' 결제 수단 선택 시엔 포인트 입력 섹션 불필요 → pointsToUse를 전액으로 고정
  const isFullPointsPay = paymentMethod === 'points';
  const pointsToUse    = isFullPointsPay
    ? Math.min(myPoints, subtotal - discountAmount)
    : useAllPoints
      ? Math.min(myPoints, subtotal - discountAmount)
      : Math.min(parseInt(usePointInput.replace(/[^0-9]/g, '')) || 0, myPoints, subtotal - discountAmount);
  const finalAmount    = Math.max(0, subtotal - discountAmount - pointsToUse);
  const willEarnPoints = Math.floor(finalAmount * 0.05);

  // ── 내 포인트 조회 ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      setPointsLoading(true);
      const res = await fetch(`${API_BASE}/points`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMyPoints(data.points);
    } catch (e) {
      console.error('[Checkout] 포인트 조회 실패:', e);
    } finally {
      setPointsLoading(false);
    }
  };

  // ── 결제 처리 ─────────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!paymentMethod) {
      Alert.alert('알림', '결제 수단을 선택해주세요.');
      return;
    }
    if (paymentMethod === 'points' && myPoints < subtotal - discountAmount) {
      Alert.alert('포인트 부족', `보유 포인트(${myPoints.toLocaleString()}P)가 부족합니다.`);
      return;
    }

    setLoading(true);
    try {
      const body = {
        items,
        subtotal,
        discountAmount,
        pointsUsed:    pointsToUse,
        paymentMethod,
        contactName:   user?.name || '',
        contactPhone:  user?.phoneNumber || '',
        contactEmail:  user?.email || '',
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        clearCart();
        navigation.replace('OrderComplete', { order: data.order });
      } else {
        throw new Error(data.message || '결제 실패');
      }
    } catch (e: any) {
      Alert.alert('결제 오류', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── 포인트 전액 사용 토글 ─────────────────────────────────────────────────
  const toggleAllPoints = () => {
    setUseAllPoints(v => !v);
    setUsePointInput('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={Colors.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>결제하기</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── 주문 상품 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 주문 상품</Text>
          {(items as CheckoutItem[])?.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImg} />
              ) : (
                <View style={[styles.itemImg, { backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 24 }}>🏨</Text>
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  {item.category}
                  {item.checkInDate ? ` · ${item.checkInDate}` : ''}
                  {item.nights ? ` · ${item.nights}박` : ''}
                  {item.guests ? ` · ${item.guests}명` : ''}
                </Text>
              </View>
              <Text style={styles.itemPrice}>₩{item.price.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* ── 포인트 사용 (포인트 전액 결제 수단 선택 시 숨김) ── */}
        {!isFullPointsPay && (
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>🪙 포인트 사용</Text>
            {pointsLoading
              ? <ActivityIndicator size="small" color={Colors.primary} />
              : <Text style={styles.myPointsText}>보유 {myPoints.toLocaleString()}P</Text>
            }
          </View>

          <View style={styles.pointInputRow}>
            <TextInput
              style={[styles.pointInput, useAllPoints && { opacity: 0.4 }]}
              placeholder="사용할 포인트 입력"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
              value={useAllPoints ? String(Math.min(myPoints, subtotal - discountAmount)) : usePointInput}
              onChangeText={setUsePointInput}
              editable={!useAllPoints}
            />
            <Text style={styles.pointUnit}>P</Text>
            <TouchableOpacity
              style={[styles.allPointBtn, useAllPoints && { backgroundColor: Colors.primary }]}
              onPress={toggleAllPoints}
            >
              <Text style={[styles.allPointBtnText, useAllPoints && { color: '#fff' }]}>
                {useAllPoints ? '취소' : '전액'}
              </Text>
            </TouchableOpacity>
          </View>
          {pointsToUse > 0 && (
            <Text style={styles.pointApplied}>
              ✅ {pointsToUse.toLocaleString()}P 적용 → ₩{pointsToUse.toLocaleString()} 할인
            </Text>
          )}
        </View>
        )}

        {/* ── 결제 수단 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 결제 수단</Text>
          {PAYMENT_METHODS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodRow, paymentMethod === m.id && styles.methodRowActive]}
              onPress={() => setPaymentMethod(m.id)}
            >
              <Text style={styles.methodEmoji}>{m.emoji}</Text>
              <Text style={[styles.methodLabel, paymentMethod === m.id && { color: Colors.primary, fontWeight: '700' }]}>
                {m.label}
              </Text>
              {m.id === 'points' && (
                <Text style={styles.methodSub}>잔액 {myPoints.toLocaleString()}P</Text>
              )}
              <View style={[styles.radio, paymentMethod === m.id && styles.radioActive]}>
                {paymentMethod === m.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── 금액 정보 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 결제 금액</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>상품 금액</Text>
            <Text style={styles.priceValue}>₩{subtotal?.toLocaleString()}</Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>할인</Text>
              <Text style={[styles.priceValue, { color: Colors.error }]}>-₩{discountAmount.toLocaleString()}</Text>
            </View>
          )}
          {pointsToUse > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>포인트 사용</Text>
              <Text style={[styles.priceValue, { color: Colors.error }]}>-₩{pointsToUse.toLocaleString()}</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>최종 결제 금액</Text>
            <Text style={styles.totalValue}>₩{finalAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.earnBox}>
            <Tag color={Colors.primary} size={14} />
            <Text style={styles.earnText}>
              이번 결제로 <Text style={styles.earnHighlight}>{willEarnPoints.toLocaleString()}P</Text> 적립 예정
            </Text>
          </View>
        </View>

        {/* ── 주문자 정보 ── */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <Text style={styles.sectionTitle}>👤 주문자 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이름</Text>
            <Text style={styles.infoValue}>{user?.name || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이메일</Text>
            <Text style={styles.infoValue}>{user?.email || '-'}</Text>
          </View>
          {user?.phoneNumber ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>연락처</Text>
              <Text style={styles.infoValue}>{user.phoneNumber}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* ── 하단 결제 버튼 ── */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomSummary}>
          <Text style={styles.bottomTotal}>₩{finalAmount.toLocaleString()}</Text>
          <Text style={styles.bottomEarn}>+{willEarnPoints.toLocaleString()}P 적립</Text>
        </View>
        <TouchableOpacity
          style={[styles.payBtn, loading && { opacity: 0.6 }]}
          onPress={handlePay}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <>
                <CreditCard color="#fff" size={18} style={{ marginRight: 8 }} />
                <Text style={styles.payBtnText}>결제하기</Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn:     { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },

  section: {
    backgroundColor: '#fff', marginTop: 10,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.lg,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border,
  },
  sectionTitle:    { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  myPointsText:    { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // 상품 아이템
  itemRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemImg:   { width: 56, height: 56, borderRadius: 10 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  itemMeta:  { fontSize: 11, color: Colors.textSecondary },
  itemPrice: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  // 포인트
  pointInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pointInput: {
    flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, fontSize: 15, color: Colors.text, backgroundColor: Colors.background,
  },
  pointUnit:       { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginLeft: -4 },
  allPointBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.primary, backgroundColor: '#fff',
  },
  allPointBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  pointApplied:    { marginTop: 8, fontSize: 12, color: Colors.success, fontWeight: '600' },

  // 결제 수단
  methodRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  methodRowActive: { backgroundColor: Colors.primary + '08' },
  methodEmoji:  { fontSize: 22, marginRight: 12 },
  methodLabel:  { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '500' },
  methodSub:    { fontSize: 12, color: Colors.textSecondary, marginRight: 8 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  // 금액
  priceRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { fontSize: 14, color: Colors.textSecondary },
  priceValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  totalRow: {
    marginTop: 10, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
    marginBottom: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: '800', color: Colors.text },
  totalValue: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  earnBox:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  earnText:  { fontSize: 12, color: Colors.textSecondary },
  earnHighlight: { color: Colors.primary, fontWeight: '800' },

  // 주문자 정보
  infoRow:   { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { width: 60, fontSize: 14, color: Colors.textSecondary },
  infoValue: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '600' },

  // 하단 바
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingTop: 12, paddingBottom: 32,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  bottomSummary: { flex: 1 },
  bottomTotal:   { fontSize: 20, fontWeight: '900', color: Colors.primary },
  bottomEarn:    { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  payBtn: {
    flex: 2, backgroundColor: Colors.primary, height: 52,
    borderRadius: 16, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
