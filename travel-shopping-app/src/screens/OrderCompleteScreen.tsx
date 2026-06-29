/**
 * OrderCompleteScreen.tsx
 * 결제 완료 화면
 */
import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { RootStackParamList, OrderResult } from '../types/travelTypes';

const PAYMENT_LABEL: Record<string, string> = {
  card:       '신용/체크카드',
  kakao_pay:  '카카오페이',
  naver_pay:  '네이버페이',
  toss:       '토스페이',
  points:     '포인트 전액',
};

export const OrderCompleteScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route      = useRoute();
  const { order }  = (route.params as any) as { order: OrderResult };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── 완료 아이콘 ── */}
        <View style={styles.iconWrap}>
          <CheckCircle color={Colors.success} size={72} strokeWidth={1.5} />
        </View>
        <Text style={styles.mainTitle}>결제가 완료됐습니다! 🎉</Text>
        <Text style={styles.subTitle}>여행을 즐길 준비가 됐어요</Text>

        {/* ── 주문 번호 카드 ── */}
        <View style={styles.orderCard}>
          <Text style={styles.orderNoLabel}>주문 번호</Text>
          <Text style={styles.orderNo}>{order?.orderNo}</Text>
        </View>

        {/* ── 결제 상세 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 상세</Text>

          <Row label="상품 금액"     value={`₩${order?.subtotal?.toLocaleString()}`} />
          {order?.discountAmount > 0 && (
            <Row label="할인"         value={`-₩${order.discountAmount.toLocaleString()}`} color={Colors.error} />
          )}
          {order?.pointsUsed > 0 && (
            <Row label="포인트 사용" value={`-₩${order.pointsUsed.toLocaleString()}`} color={Colors.error} />
          )}
          <Row
            label="최종 결제 금액"
            value={`₩${order?.finalAmount?.toLocaleString()}`}
            bold
          />
          <Row label="결제 수단"    value={PAYMENT_LABEL[order?.paymentMethod] || order?.paymentMethod} />
          <Row label="포인트 적립"  value={`+${order?.pointsEarned?.toLocaleString()}P`} color={Colors.primary} />
        </View>

        {/* ── 주문 상품 목록 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주문 상품</Text>
          {order?.items?.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  {item.category}
                  {item.checkInDate ? ` · ${item.checkInDate}` : ''}
                  {item.nights      ? ` · ${item.nights}박`     : ''}
                  {item.guests      ? ` · ${item.guests}명`     : ''}
                </Text>
              </View>
              <Text style={styles.itemPrice}>₩{item.price.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* ── 안내 문구 ── */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            📧 예약 확인서가 이메일로 발송됩니다.{'\n'}
            내 활동 → 예약 내역에서 확인하실 수 있습니다.
          </Text>
        </View>

        {/* ── 버튼 ── */}
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.activityBtn}
            onPress={() => navigation.navigate('MyActivity')}
          >
            <ShoppingBag color={Colors.primary} size={18} style={{ marginRight: 8 }} />
            <Text style={styles.activityBtnText}>내 활동 보기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Main')}
          >
            <Home color="#fff" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.homeBtnText}>홈으로</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ── 작은 Row 컴포넌트 ──────────────────────────────────────────────────────────
const Row = ({
  label, value, bold = false, color,
}: { label: string; value: string; bold?: boolean; color?: string }) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    <Text style={[rowStyles.value, bold && rowStyles.bold, color ? { color } : {}]}>
      {value}
    </Text>
  </View>
);

const rowStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { fontSize: 14, color: Colors.textSecondary },
  value: { fontSize: 14, color: Colors.text, fontWeight: '600' },
  bold:  { fontSize: 16, fontWeight: '900', color: Colors.primary },
});

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 60 },

  iconWrap:  { alignItems: 'center', marginTop: 32, marginBottom: 20 },
  mainTitle: { fontSize: 24, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  subTitle:  { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 28 },

  orderCard: {
    backgroundColor: Colors.primary, borderRadius: 20,
    padding: Spacing.lg, alignItems: 'center', marginBottom: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  orderNoLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', marginBottom: 6, letterSpacing: 1 },
  orderNo:      { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 2 },

  section: {
    backgroundColor: '#fff', borderRadius: 16, padding: Spacing.lg,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 12 },

  itemRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent, marginRight: 12 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 3 },
  itemMeta:  { fontSize: 11, color: Colors.textSecondary },
  itemPrice: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  notice: {
    backgroundColor: Colors.accent + '18', borderRadius: 14,
    padding: Spacing.md, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.accent + '40',
  },
  noticeText: { fontSize: 13, color: Colors.primary, lineHeight: 20, fontWeight: '500' },

  btnGroup:     { flexDirection: 'row', gap: 12 },
  activityBtn:  {
    flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.primary,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  activityBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
  homeBtn: {
    flex: 1, height: 52, borderRadius: 14, backgroundColor: Colors.primary,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  homeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
