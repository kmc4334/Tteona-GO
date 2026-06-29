import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { User, Settings, CreditCard, Heart, Map } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { WeatherWidget } from '../components/WeatherWidget';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';
import { useAuth, API_BASE } from '../store/AuthContext';

export const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, token } = useAuth();
  const isFocused = useIsFocused();
  
  const [points, setPoints] = useState<number>(0);
  const [loadingPoints, setLoadingPoints] = useState(false);

  useEffect(() => {
    if (isFocused && token) {
      fetchPoints();
    }
  }, [isFocused, token]);

  const fetchPoints = async () => {
    try {
      const response = await fetch(`${API_BASE}/points`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPoints(data.points);
      }
    } catch (error) {
      console.error('Failed to fetch points:', error);
    } finally {
      setLoadingPoints(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 프로필</Text>
        <TouchableOpacity 
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Settings color={Colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* User Info */}
        <View style={styles.userInfoBox}>
          <View style={styles.avatar}>
            <User color={Colors.secondary} size={32} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.nickname || user?.name || '떠나 GO 여행자'} 님</Text>
            <Text style={styles.userEmail}>{user?.email || 'traveler@example.com'}</Text>
          </View>
        </View>

        {/* Rewards */}
        <View style={styles.rewardsBox}>
          <Text style={styles.rewardsSlogan}>티끌 모아 태산 포인트</Text>
          {loadingPoints ? (
            <ActivityIndicator color={Colors.secondary} style={{ marginVertical: 10 }} />
          ) : (
            <Text style={styles.rewardsBalance}>{points.toLocaleString()} <Text style={styles.rewardsSymbol}>P</Text></Text>
          )}
          <Text style={styles.rewardsGoal}>패키지 공유하고 포인트 더 모으기!</Text>
        </View>



        {/* Saved Packages & Links */}
        <Text style={styles.sectionTitle}>내 활동</Text>
        
        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('MyActivity')}>
          <View style={styles.actionIconBot}><Map color={Colors.accent} size={20} /></View>
          <Text style={styles.actionText}>저장한 여행 패키지</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('MyActivity')}>
          <View style={styles.actionIconBot}><Heart color={Colors.accent} size={20} /></View>
          <Text style={styles.actionText}>찜한 상품</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('MyActivity')}>
          <View style={styles.actionIconBot}><CreditCard color={Colors.accent} size={20} /></View>
          <Text style={styles.actionText}>결제 및 예약 내역</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text },
  settingsBtn: { position: 'absolute', right: Spacing.md },
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl * 2 },
  userInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: { marginLeft: Spacing.md },
  userName: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.text, marginBottom: 4 },
  userEmail: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  rewardsBox: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  rewardsSlogan: { color: Colors.primary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, marginBottom: Spacing.sm },
  rewardsBalance: { color: Colors.secondary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold, marginBottom: Spacing.sm },
  rewardsSymbol: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.medium },
  rewardsGoal: { color: Colors.primary, fontSize: Typography.sizes.xs },
  sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text, marginBottom: Spacing.md },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIconBot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium, color: Colors.text },
});
