import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';
import { ArrowLeft, Share2, Map as MapIcon, Navigation, ExternalLink } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { KakaoMap } from '../components/KakaoMap';

type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;

export const MapScreen = () => {
  const route = useRoute<MapScreenRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { lat, lng, title } = route.params;

  const openMapLink = () => {
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(title)},${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.fullContainer}>
      {/* Background Map */}
      <View style={styles.mapContainer}>
        <KakaoMap lat={lat} lng={lng} title={title} />
      </View>

      {/* Floating Header */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.roundButton}>
            <ArrowLeft color={Colors.text} size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          </View>
          <TouchableOpacity style={styles.roundButton}>
            <Share2 color={Colors.text} size={22} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Info Card */}
      <View style={styles.bottomCardContainer}>
        <View style={styles.bottomCard}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <MapIcon size={14} color={Colors.primary} />
              <Text style={styles.categoryText}>위치 정보</Text>
            </View>
          </View>

          <Text style={styles.placeName}>{title}</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            좌표: {lat.toFixed(4)}, {lng.toFixed(4)}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.primaryButton} onPress={openMapLink}>
              <Navigation size={20} color={Colors.secondary} />
              <Text style={styles.primaryButtonText}>길찾기 시작</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('PathFinding' as never)}
            >
              <ExternalLink size={20} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>경로탐색</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  mapContainer: { ...StyleSheet.absoluteFillObject },
  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  headerCenter: { flex: 1, alignItems: 'center', marginHorizontal: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomCardContainer: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
  },
  bottomCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: Spacing.lg,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  categoryText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  placeName: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  addressText: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  primaryButton: {
    flex: 2,
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  primaryButtonText: { color: Colors.secondary, fontSize: 16, fontWeight: 'bold' },
  secondaryButton: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.secondary,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButtonText: { color: Colors.primary, fontSize: 15, fontWeight: 'bold' },
});
