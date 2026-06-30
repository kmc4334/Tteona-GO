import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle } from 'lucide-react-native';
import { RootStackParamList } from '../types/travelTypes';
import { Colors } from '../theme/colors';
import { useActivity } from '../store/ActivityContext';
import { useNotifications } from '../store/NotificationContext';

type PaymentSuccessRouteProp = RouteProp<RootStackParamList, 'PaymentSuccess'>;

export const PaymentSuccessScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PaymentSuccessRouteProp>();
  const { addBooking } = useActivity();
  const { addNotification } = useNotifications();
  const { amount, orderName, product, pointsEarned, totalPoints } = route.params;

  // 결제 완료 시 예약 내역에 추가 (한 번만)
  React.useEffect(() => {
    if (product) {
      addBooking({ ...product, price: amount } as any);
      addNotification({
        title: '예약 완료 🎉',
        message: `'${orderName}' 예약이 완료되었습니다!`,
        type: 'alert',
      });
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CheckCircle color="#52C41A" size={80} />
        <Text style={styles.title}>결제 완료!</Text>
        <Text style={styles.subtitle}>{orderName}</Text>

        {/* 상품 이미지 */}
        {product?.image && (
          <Image source={{ uri: product.image }} style={styles.productImg} />
        )}

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>결제 금액</Text>
            <Text style={styles.value}>{amount.toLocaleString()}원</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>적립 포인트</Text>
            <Text style={[styles.value, styles.pointValue]}>+{pointsEarned.toLocaleString()} P</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>보유 포인트</Text>
            <Text style={[styles.value, styles.totalValue]}>{totalPoints.toLocaleString()} P</Text>
          </View>
        </View>

        <Text style={styles.notice}>예약 내역은 '내 활동'에서 확인할 수 있습니다.</Text>

        <TouchableOpacity
          style={styles.activityBtn}
          onPress={() => navigation.navigate('MyActivity')}
        >
          <Text style={styles.activityBtnText}>예약 내역 보기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
        >
          <Text style={styles.homeBtnText}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginTop: 16, marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' },
  productImg: { width: '100%', height: 160, borderRadius: 16, marginBottom: 20, backgroundColor: '#E0E0E0' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },
  label: { fontSize: 15, color: '#555' },
  value: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  pointValue: { color: '#52C41A', fontSize: 16 },
  totalValue: { color: Colors.primary, fontSize: 16 },
  notice: { fontSize: 13, color: '#999', marginBottom: 24, textAlign: 'center' },
  activityBtn: { width: '100%', backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  activityBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  homeBtn: { width: '100%', backgroundColor: '#fff', paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#E0E0E0' },
  homeBtnText: { color: '#555', fontSize: 16, fontWeight: '600' },
});
