import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Image, Platform, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { Search, Bell, Map, Sparkles, Navigation, Heart, Star, MapPin, Send, ChevronRight, AlertCircle } from 'lucide-react-native';
import { useNotifications } from '../store/NotificationContext';
import { API_BASE } from '../store/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Spacing.lg * 3) / 2;

const CATEGORIES = [
  { id: 'all', name: '전체', icon: '🌍' },
  { id: 'stay', name: '숙소', icon: '🏨' },
  { id: 'spot', name: '관광지', icon: '🎡' },
  { id: 'exp', name: '체험', icon: '🏄' },
  { id: 'trans', name: '교통수단', icon: '🚕' },
];

const SEARCH_TAGS = ['제주도', '서울', '부산', '양양', '경주'];

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        throw new Error(data.message || '상품 데이터를 가져오는데 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalityTestClick = async () => {
    console.log('Personality test button clicked');
    try {
      // AsyncStorage에서 저장된 결과 확인 (DB 없이 로컬에 저장)
      const savedResultString = await AsyncStorage.getItem('personalityResult');
      
      if (savedResultString) {
        // 저장된 결과가 있으면 결과 화면으로 이동
        const savedResult = JSON.parse(savedResultString);
        console.log('Found saved result:', savedResult.travelType);
        navigation.navigate('PersonalityResult', { savedResult });
      } else {
        // 저장된 결과가 없으면 테스트 시작
        console.log('No saved result, starting test');
        navigation.navigate('PersonalityTest');
      }
    } catch (error) {
      console.error('Check saved result error:', error);
      // 에러 발생 시 테스트 시작
      navigation.navigate('PersonalityTest');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchCategory = selectedCategory === '전체' || product.category === selectedCategory;
      const matchSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery, products]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingSmall}>안녕하세요 👋</Text>
          <Text style={styles.greetingLarge}>어디로 떠날까요?</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notification')}>
          <Bell color="#4A90E2" size={26} strokeWidth={1.5} />
          {unreadCount > 0 && <View style={styles.notiDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Weather Card ── */}
        <View style={styles.cardContainer}>
          <View style={styles.weatherCard}>
            <View>
              <View style={styles.locationRow}>
                <MapPin size={12} color="#4A90E2" strokeWidth={2.5} />
                <Text style={styles.locationText}>현재 위치</Text>
              </View>
              <Text style={styles.tempText}>21°</Text>
            </View>
            <View style={styles.weatherRight}>
              <View style={styles.weatherStatusRow}>
                <Text style={styles.weatherStatusText}>맑음</Text>
                <Text style={{ fontSize: 42 }}>☀️</Text>
              </View>
              <TouchableOpacity style={styles.detailBtn} onPress={() => navigation.navigate('Weather')}>
                <Text style={styles.detailBtnText}>자세히 보기 {'>'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Search Card ── */}
        <View style={styles.cardContainer}>
          <View style={styles.searchCard}>
            <View style={styles.searchInputRow}>
              <Search color="#4A5568" size={24} strokeWidth={2} />
              <TextInput
                style={[styles.searchInput, Platform.select({ web: { outlineStyle: 'none' } as any })]}
                placeholder="어디로 떠나볼까요?"
                placeholderTextColor="#A0AEC0"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
              {SEARCH_TAGS.map(tag => (
                <TouchableOpacity 
                  key={tag} 
                  style={styles.tagChip}
                  onPress={() => setSearchQuery(tag)}
                >
                  <Search size={12} color="#A0AEC0" strokeWidth={3} style={{ marginRight: 4 }} />
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.tagChipIconOnly}>
                <Search size={12} color="#A0AEC0" strokeWidth={3} />
              </TouchableOpacity>
              <View style={{ width: 15 }} />
            </ScrollView>
          </View>
        </View>

        {/* ── Promo Banner ── */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=1200' }}
              style={styles.bannerImg}
            />
            <View style={styles.bannerOverlay}>
              <View style={styles.priceTag}>
                <Text style={styles.priceTagText}>🔥 이번 주 특가</Text>
              </View>
              <Text style={styles.bannerTitle}>봄 맞이 여행</Text>
              <Text style={styles.bannerSubtitle}>최대 35% 할인 · 선착순 예약 중</Text>
            </View>
          </View>
        </View>

        {/* ── Personality Test Card ── */}
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.personalityCard} onPress={handlePersonalityTestClick}>
            <View style={[styles.aiIconWrapper, { backgroundColor: '#9F7AEA' }]}>
              <Text style={{ fontSize: 22 }}>✈️</Text>
            </View>
            <View style={styles.aiTextContent}>
              <Text style={styles.aiTitle}>나의 여행 스타일은?</Text>
              <Text style={styles.aiSubtitle}>12가지 질문으로 알아보는 여행 성향 테스트</Text>
            </View>
            <Send size={22} color="#9F7AEA" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* ── 길찾기 카드 ── */}
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.routeCard} onPress={() => navigation.navigate('PathFinding')}>
            <View style={[styles.aiIconWrapper, { backgroundColor: '#52C41A' }]}>
              <Navigation size={22} color="#fff" strokeWidth={2} />
            </View>
            <View style={styles.aiTextContent}>
              <Text style={styles.aiTitle}>🗺️ 최단 경로 탐색</Text>
              <Text style={styles.aiSubtitle}>다익스트라 알고리즘으로 최적 경로를 찾아드려요</Text>
            </View>
            <ChevronRight size={22} color="#52C41A" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* ── Category Filter ── */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.filterChip, selectedCategory === cat.name && styles.filterChipActive]}
                onPress={() => setSelectedCategory(cat.name)}
              >
                <Text style={{ marginRight: 6, fontSize: 16 }}>{cat.icon}</Text>
                <Text style={[styles.filterText, selectedCategory === cat.name && styles.filterTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Product Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>추천 상품</Text>
          <TouchableOpacity><Text style={styles.seeMore}>전체보기</Text></TouchableOpacity>
        </View>

        <View style={styles.productGrid}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>상품을 불러오는 중입니다...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={40} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts}>
                <Text style={styles.retryBtnText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>해당 카테고리의 상품이 없습니다.</Text>
            </View>
          ) : (
            filteredProducts.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
              >
                <Image source={{ uri: item.image }} style={styles.productImg} />
                <TouchableOpacity style={styles.likeBtn}>
                  <Heart size={16} color="#fff" strokeWidth={2} />
                </TouchableOpacity>
                <View style={styles.productInfo}>
                  <Text style={styles.productCatText}>{item.category}</Text>
                  <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.productLocRow}>
                    <MapPin size={11} color="#AAA" />
                    <Text style={styles.productLocText}>{item.location}</Text>
                  </View>
                  <View style={styles.productPriceRow}>
                    <View style={styles.starRow}>
                      <Star size={12} color="#FFD700" fill="#FFD700" />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <Text style={styles.priceText}>
                      <Text style={{ fontSize: 12, fontWeight: '600' }}>₩</Text>
                      {item.price.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  greetingSmall: { fontSize: 14, color: '#AAA', fontWeight: '500', marginBottom: 2 },
  greetingLarge: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5 },
  bellBtn: { padding: 5 },
  notiDot: {
    position: 'absolute', top: 6, right: 6,
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: '#FF5252',
  },

  container: { flex: 1, backgroundColor: '#FBFBFC' },
  cardContainer: { paddingHorizontal: 20, marginBottom: 15 },

  weatherCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 4,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  locationText: { fontSize: 13, color: '#999', marginLeft: 4, fontWeight: '700' },
  tempText: { fontSize: 34, fontWeight: '900', color: '#1A1A1A' },
  weatherRight: { alignItems: 'flex-end' },
  weatherStatusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  weatherStatusText: { fontSize: 16, fontWeight: 'bold', color: '#4A5568', marginRight: 8 },
  detailBtnText: { fontSize: 12, color: '#AAA', fontWeight: '600' },

  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingLeft: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  tagScroll: { marginLeft: -5 },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
  },
  tagChipIconOnly: {
    backgroundColor: '#F3F4F6',
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  tagText: { fontSize: 13, color: '#4A5568', fontWeight: '700' },

  bannerContainer: { paddingHorizontal: 20, marginBottom: 20 },
  bannerWrapper: { overflow: 'hidden', borderRadius: 32 },
  bannerImg: { width: '100%', height: 220 },
  bannerOverlay: { position: 'absolute', bottom: 25, left: 30, right: 30 },
  priceTag: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  priceTagText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  bannerTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 6, letterSpacing: -1 },
  bannerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.95)', fontWeight: '700' },

  aiCard: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  aiIconWrapper: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#4A90E2',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 15,
  },
  aiTextContent: { flex: 1 },
  aiTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 2 },
  aiSubtitle: { fontSize: 12, color: '#999', fontWeight: '600' },

  personalityCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 25,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9D8FD',
    shadowColor: '#9F7AEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },

  routeCard: {
    backgroundColor: '#F0FFF4',
    borderRadius: 25,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C6F6D5',
    shadowColor: '#52C41A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },

  filterContainer: { marginBottom: 15 },
  filterScroll: { paddingHorizontal: 20 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  filterChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterText: { fontSize: 13, color: '#777', fontWeight: 'bold' },
  filterTextActive: { color: '#fff' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: '#1A1A1A' },
  seeMore: { fontSize: 13, color: '#4A90E2', fontWeight: '800' },

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  productCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 28,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 3,
    overflow: 'hidden',
  },
  productImg: { width: '100%', height: COLUMN_WIDTH },
  likeBtn: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.15)',
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  productInfo: { padding: 15 },
  productCatText: { fontSize: 10, color: '#4A90E2', fontWeight: '800', marginBottom: 5, textTransform: 'uppercase' },
  productTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
  productLocRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  productLocText: { fontSize: 12, color: '#AAA', marginLeft: 4, fontWeight: '600' },
  productPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  starRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, fontWeight: '800', color: '#1A1A1A', marginLeft: 4 },
  priceText: { fontSize: 17, fontWeight: '900', color: '#4A90E2' },

  loadingContainer: {
    width: '100%',
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorContainer: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 10,
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    width: '100%',
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
