import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Share, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useCart } from '../store/CartContext';

export const CartScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { cartItems, removeFromCart } = useCart();

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
  const estimatedSavings = cartItems.length > 0 ? 12000 : 0;
  const earningPoints = Math.floor((totalPrice - estimatedSavings) * 0.05);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>장바구니</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Share color={Colors.accent} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.packageHeaderBox}>
          <Text style={styles.badgeLabel}>작성 중</Text>
          <Text style={styles.packageTitle}>제주도 2박3일 커플 여행</Text>
        </View>

        <View style={styles.itemsList}>
          {cartItems.length === 0 ? (
            <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
              <Text style={{ color: Colors.textSecondary, fontSize: Typography.sizes.md }}>장바구니가 비어 있습니다.</Text>
            </View>
          ) : (
            cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.itemPrice}>{item.price.toLocaleString()}원</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeFromCart(item.id)}
                >
                  <Trash2 color={Colors.textSecondary} size={20} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>결제 상세</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>상품 총액</Text>
            <Text style={styles.summaryValue}>{totalPrice.toLocaleString()}원</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>패키지 할인</Text>
            <Text style={[styles.summaryValue, { color: Colors.error }]}>-{estimatedSavings.toLocaleString()}원</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>최종 결제 금액</Text>
            <Text style={styles.totalValue}>{(totalPrice - estimatedSavings).toLocaleString()}원</Text>
          </View>

          <View style={styles.pointsBox}>
            <Text style={styles.pointsText}>이 결제로 <Text style={styles.pointsHighlight}>{earningPoints.toLocaleString()}P</Text> 적립 예정입니다!</Text>
          </View>
        </View>

        {/* AI Recommendation Button based on Cart */}
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={{
              backgroundColor: Colors.accent + '20',
              borderRadius: 16,
              padding: Spacing.md,
              marginTop: Spacing.xl,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: Colors.accent + '40',
            }}
            onPress={() => {
              const itemNames = cartItems.map(item => item.title).join(', ');
              navigation.navigate('Concierge', {
                initialQuery: `장바구니에 [${itemNames}] 상품들을 담았어! 이 일정에 추가하기 좋은 다른 상품 추천해줘.`
              });
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 8 }}>✨</Text>
            <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 16 }}>담은 상품 기반 AI 추천 더보기</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>패키지 저장하기</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>이 패키지로 예약하기</Text>
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
  headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text },
  shareButton: { padding: Spacing.xs },
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  packageHeaderBox: {
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  badgeLabel: { color: Colors.accent, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, marginBottom: 4 },
  packageTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text },
  itemsList: { marginBottom: Spacing.xl },
  cartItem: {
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
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: Spacing.md },
  itemCategory: { color: Colors.accent, fontSize: Typography.sizes.xs, marginBottom: 4 },
  itemTitle: { color: Colors.text, fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium, marginBottom: 8 },
  itemPrice: { color: Colors.text, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
  deleteButton: { padding: Spacing.xs },
  summaryBox: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.text, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  summaryLabel: { color: Colors.textSecondary, fontSize: Typography.sizes.sm },
  summaryValue: { color: Colors.text, fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium },
  totalRow: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: 'center' },
  totalLabel: { color: Colors.text, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
  totalValue: { color: Colors.accent, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
  pointsBox: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  pointsText: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: '600'
  },
  pointsHighlight: {
    fontWeight: '800',
    fontSize: Typography.sizes.md,
    color: Colors.primary,
  },
  bottomBar: {
    padding: Spacing.md,
    backgroundColor: Colors.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButtonsRow: { marginBottom: Spacing.sm },
  secondaryButton: { borderWidth: 1, borderColor: Colors.primary, paddingVertical: Spacing.sm, borderRadius: 24, alignItems: 'center' },
  secondaryButtonText: { color: Colors.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
  primaryButton: { backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: 24, alignItems: 'center' },
  primaryButtonText: { color: Colors.secondary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
});
