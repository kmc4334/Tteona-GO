import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { XCircle } from 'lucide-react-native';
import { RootStackParamList } from '../types/travelTypes';
import { Colors } from '../theme/colors';

type PaymentFailRouteProp = RouteProp<RootStackParamList, 'PaymentFail'>;

export const PaymentFailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PaymentFailRouteProp>();
  const { message } = route.params;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <XCircle color="#FF4D4F" size={72} />
        <Text style={styles.title}>결제 실패</Text>
        <Text style={styles.message}>{message || '결제 중 문제가 발생했습니다.'}</Text>

        <View style={styles.card}>
          <Text style={styles.cardText}>
            결제가 취소되었거나 오류가 발생했습니다.{'\n'}
            다시 시도해주세요.
          </Text>
        </View>

        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.replace('PointCharge')}>
          <Text style={styles.retryBtnText}>다시 충전하기</Text>
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
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginTop: 16, marginBottom: 8 },
  message: { fontSize: 14, color: '#FF4D4F', marginBottom: 32, textAlign: 'center' },
  card: { width: '100%', backgroundColor: '#FFF2F2', borderRadius: 16, padding: 20, marginBottom: 32 },
  cardText: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 22 },
  retryBtn: { width: '100%', backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  retryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  homeBtn: { width: '100%', backgroundColor: '#fff', paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#E0E0E0' },
  homeBtnText: { color: '#555', fontSize: 16, fontWeight: '600' },
});
