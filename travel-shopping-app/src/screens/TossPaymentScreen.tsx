import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ActivityIndicator,
  TouchableOpacity, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import { RootStackParamList } from '../types/travelTypes';
import { useAuth, API_BASE } from '../store/AuthContext';
import { Colors } from '../theme/colors';

let WebView: any = null;
try { WebView = require('react-native-webview').WebView; } catch (_) {}

type TossPaymentRouteProp = RouteProp<RootStackParamList, 'TossPayment'>;

const TOSS_CLIENT_KEY = 'test_ck_6bJXmgo28emEQdpzE2oy8LAnGKWx';

export const TossPaymentScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<TossPaymentRouteProp>();
  const { token, updateUser, user } = useAuth();
  const { amount, orderName, customerName, customerEmail, product, bookingInfo } = route.params;

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  // orderId는 컴포넌트 수명 동안 고정
  const [orderId] = useState(
    `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  );

  const backendBase = API_BASE.replace('/api', '');
  const successUrl = `${backendBase}/api/payments/toss-success`;
  const failUrl = `${backendBase}/api/payments/toss-fail`;
  const encodedToken = encodeURIComponent(token || '');

  // 결제 승인 (모바일 WebView postMessage 수신 시 직접 처리)
  const confirmPayment = async (paymentKey: string, paidAmount: number) => {
    if (confirming) return;
    setConfirming(true);
    try {
      const res = await fetch(`${API_BASE}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentKey, orderId, amount: paidAmount, product, bookingInfo }),
      });
      const data = await res.json();
      if (data.success) {
        updateUser({ ...user, points: data.totalPoints });
        navigation.replace('PaymentSuccess', {
          amount: paidAmount,
          orderName,
          product,
          pointsEarned: data.pointsEarned,
          totalPoints: data.totalPoints,
        });
      } else {
        navigation.replace('PaymentFail', { message: data.message || '결제 승인 실패' });
      }
    } catch {
      navigation.replace('PaymentFail', { message: '네트워크 오류가 발생했습니다.' });
    }
  };

  const paymentHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>결제</title>
  <script src="https://js.tosspayments.com/v1/payment"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif;
           background: #F8F9FA; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #fff; border-radius: 20px; padding: 32px 28px;
            width: 100%; max-width: 440px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { display: flex; align-items: center; gap: 12; margin-bottom: 24px; }
    .logo { font-size: 28px; }
    .header-text h2 { font-size: 18px; font-weight: 700; color: #1A1A1A; }
    .header-text p { font-size: 13px; color: #888; margin-top: 2px; }
    .amount-box { background: #EEF4FF; border-radius: 14px; padding: 20px;
                  text-align: center; margin-bottom: 20px; }
    .amount-label { font-size: 13px; color: #666; margin-bottom: 6px; }
    .amount-value { font-size: 32px; font-weight: 800; color: #4A90E2; }
    .amount-unit { font-size: 18px; font-weight: 600; }
    .order-info { background: #F8F9FA; border-radius: 12px; padding: 16px;
                  margin-bottom: 24px; font-size: 13px; color: #555; line-height: 1.8; }
    .order-info strong { color: #1A1A1A; }
    .pay-btn { width: 100%; background: #4A90E2; color: #fff; border: none;
               padding: 16px; font-size: 16px; font-weight: 700;
               border-radius: 12px; cursor: pointer; display: flex;
               align-items: center; justify-content: center; gap: 8px; }
    .pay-btn:hover { background: #357ABD; }
    .cancel-btn { width: 100%; background: #fff; color: #666;
                  border: 1.5px solid #E0E0E0; padding: 14px; font-size: 15px;
                  font-weight: 600; border-radius: 12px; cursor: pointer;
                  margin-top: 10px; }
    .notice { font-size: 12px; color: #aaa; text-align: center;
              margin-top: 14px; line-height: 1.6; }
    .spinner-wrap { text-align: center; padding: 20px 0; display: none; }
    .spinner { width: 36px; height: 36px; border: 4px solid #E0E0E0;
               border-top-color: #4A90E2; border-radius: 50%;
               animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error { color: #E53E3E; margin-top: 12px; font-size: 13px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">💳</div>
      <div class="header-text">
        <h2>토스페이먼츠 결제</h2>
        <p>테스트 결제 · 실제 청구 없음</p>
      </div>
    </div>

    <div class="amount-box">
      <div class="amount-label">결제 금액</div>
      <div class="amount-value">
        ${amount.toLocaleString()}<span class="amount-unit">원</span>
      </div>
    </div>

    <div class="order-info">
      <strong>상품명</strong>: ${orderName.replace(/</g, '&lt;')}<br>
    </div>

    <div class="spinner-wrap" id="spinner">
      <div class="spinner"></div>
      <p style="color:#666;font-size:14px">결제창 로딩 중...</p>
    </div>

    <button class="pay-btn" id="pay-btn">
      <span>💳</span> 카드로 결제하기
    </button>
    <button class="cancel-btn" id="cancel-btn">취소</button>
    <p class="error" id="error-msg"></p>
    <p class="notice">
      토스페이먼츠 테스트 결제입니다.<br>
      실제 카드 금액이 청구되지 않습니다.
    </p>
  </div>

  <script>
    function postMsg(data) {
      var json = JSON.stringify(data);
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(json);
      else window.parent.postMessage(json, '*');
    }

    document.getElementById('cancel-btn').addEventListener('click', function() {
      postMsg({ type: 'CANCEL' });
    });

    document.getElementById('pay-btn').addEventListener('click', function() {
      document.getElementById('pay-btn').style.display = 'none';
      document.getElementById('cancel-btn').style.display = 'none';
      document.getElementById('spinner').style.display = 'block';
      document.getElementById('error-msg').textContent = '';

      var tossPayments = TossPayments('${TOSS_CLIENT_KEY}');
      tossPayments.requestPayment('카드', {
        amount: ${amount},
        orderId: '${orderId}',
        orderName: '${orderName.replace(/'/g, "\\'").replace(/\n/g, ' ')}',
        customerName: '${(customerName || user?.name || user?.nickname || '고객').replace(/'/g, "\\'")}',
        customerEmail: '${(customerEmail || user?.email || '').replace(/'/g, "\\'")}',
        successUrl: '${successUrl}?orderId=${orderId}&amount=${amount}&token=${encodedToken}',
        failUrl: '${failUrl}',
      }).catch(function(error) {
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('pay-btn').style.display = 'block';
        document.getElementById('cancel-btn').style.display = 'block';
        if (error.code === 'USER_CANCEL') {
          postMsg({ type: 'CANCEL' });
        } else {
          document.getElementById('error-msg').textContent = error.message || '결제 오류 발생';
          postMsg({ type: 'FAIL', message: error.message });
        }
      });
    });
  </script>
</body>
</html>`;

  const handleMessage = (msg: any) => {
    if (msg.type === 'SUCCESS') confirmPayment(msg.paymentKey, msg.amount);
    else if (msg.type === 'CANCEL') navigation.goBack();
    else if (msg.type === 'FAIL') navigation.replace('PaymentFail', { message: msg.message || '결제 오류' });
  };

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color={Colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>결제</Text>
        </View>
        {confirming && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.overlayText}>결제 처리 중...</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>결제창 로딩 중...</Text>
            </View>
          )}
          {/* @ts-ignore */}
          <iframe
            srcDoc={paymentHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
            onLoad={() => setLoading(false)}
          />
        </View>
        <IframeListener onMessage={handleMessage} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>결제</Text>
      </View>
      {confirming && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.overlayText}>결제 처리 중...</Text>
        </View>
      )}
      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>결제창 로딩 중...</Text>
        </View>
      )}
      {WebView && (
        <WebView
          source={{ html: paymentHtml }}
          onLoadEnd={() => setLoading(false)}
          onMessage={(e: any) => {
            try { handleMessage(JSON.parse(e.nativeEvent.data)); } catch (_) {}
          }}
          javaScriptEnabled
          domStorageEnabled
          style={{ flex: 1, display: loading ? 'none' : 'flex' } as any}
        />
      )}
    </SafeAreaView>
  );
};

const IframeListener = ({ onMessage }: { onMessage: (msg: any) => void }) => {
  React.useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (msg?.type) onMessage(msg);
      } catch (_) {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
  return null;
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  loadingBox: { position: 'absolute', top: 60, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10, backgroundColor: '#fff' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  overlayText: { color: '#fff', marginTop: 12, fontSize: 16, fontWeight: '600' },
});
