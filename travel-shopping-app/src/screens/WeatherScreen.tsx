import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Keyboard, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';
import { ArrowLeft, MapPin, Sun, Cloud, CloudRain, Snowflake, Search, X, TrendingUp } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useWeather, CITIES } from '../store/WeatherContext';

export const WeatherScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectedCity, setSelectedCity, setIsAutoLocation } = useWeather();
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof CITIES>([]);
  const [isFocused, setIsFocused] = useState(false);

  const fetchWeeklyForecast = async () => {
    try {
      setLoading(true);
      // 시뮬레이션 데이터
      const mockData = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
          id: i.toString(),
          date: i === 0 ? '오늘' : date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' }),
          temp: Math.floor(Math.random() * 5) + 18,
          minTemp: Math.floor(Math.random() * 5) + 12,
          condition: ['맑음', '흐림', '비'][Math.floor(Math.random() * 3)],
        };
      });
      setForecast(mockData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyForecast();
  }, [selectedCity]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const filtered = CITIES.filter(city => 
        city.name.includes(text) || city.id.includes(text.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const selectCity = (city: typeof CITIES[0]) => {
    setSelectedCity(city);
    setIsAutoLocation(false);
    setSearchQuery('');
    setSearchResults([]);
    setIsFocused(false);
    Keyboard.dismiss();
  };

  const getWeatherIcon = (condition: string, size = 24) => {
    switch (condition) {
      case '맑음': return <Sun color="#FFB800" size={size} />;
      case '흐림': return <Cloud color={Colors.textSecondary} size={size} />;
      case '비': return <CloudRain color="#00A3FF" size={size} />;
      default: return <Cloud color={Colors.textSecondary} size={size} />;
    }
  };

  const RECOMMEND_CITIES = CITIES.slice(0, 6);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={Colors.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>날씨 검색</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <Search size={24} color={isFocused ? Colors.primary : Colors.textSecondary} style={{ marginRight: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="어느 지역의 날씨가 궁금하신가요?"
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setIsFocused(true)}
            placeholderTextColor={Colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearBtn}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <View style={styles.resultsDropdown}>
            <ScrollView bounces={false} style={{ maxHeight: 300 }}>
              {searchResults.map((city) => (
                <TouchableOpacity 
                  key={city.id} 
                  style={styles.resultItem}
                  onPress={() => selectCity(city)}
                >
                  <MapPin size={18} color={Colors.primary} style={{ marginRight: 12 }} />
                  <Text style={styles.resultText}>{city.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Recommend Section when no search query */}
        {searchQuery.length === 0 && (
          <View style={styles.recommendSection}>
            <View style={styles.recommendHeader}>
              <TrendingUp size={16} color={Colors.primary} />
              <Text style={styles.recommendTitle}>추천 지역</Text>
            </View>
            <View style={styles.recommendGrid}>
              {RECOMMEND_CITIES.map((city) => (
                <TouchableOpacity 
                  key={city.id} 
                  style={styles.recommendChip}
                  onPress={() => selectCity(city)}
                >
                  <Text style={styles.recommendChipText}>{city.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.currentCard}>
          <View style={styles.currentInfo}>
            <View style={styles.locationRow}>
              <MapPin size={20} color={Colors.secondary} />
              <Text style={styles.cityName}>{selectedCity.name}</Text>
            </View>
            <Text style={styles.currentTemp}>{forecast[0]?.temp || '--'}°</Text>
            <Text style={styles.currentDesc}>{forecast[0]?.condition || '맑음'}</Text>
          </View>
          <View style={styles.currentWeatherIcon}>
             {getWeatherIcon(forecast[0]?.condition || '맑음', 90)}
          </View>
        </View>

        <View style={styles.forecastList}>
          <Text style={styles.sectionTitle}>향후 7일간의 날씨</Text>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            forecast.map((day) => (
              <View key={day.id} style={styles.forecastItem}>
                <Text style={styles.dayText}>{day.date}</Text>
                <View style={styles.dayWeather}>
                  {getWeatherIcon(day.condition)}
                  <View style={styles.tempGroup}>
                    <Text style={styles.maxTemp}>{day.temp}°</Text>
                    <Text style={styles.minTemp}>{day.minTemp}°</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  backButton: { padding: Spacing.xs },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    zIndex: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 22,
    paddingHorizontal: 22,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  searchBarFocused: {
    backgroundColor: '#fff',
    shadowOpacity: 0.12,
    shadowRadius: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: Colors.text,
    fontWeight: '600',
    paddingVertical: 12,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  clearBtn: { padding: 4 },
  resultsDropdown: {
    position: 'absolute',
    top: 72,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: '#fff',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 20,
    zIndex: 1000,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultText: { fontSize: 17, fontWeight: '700', color: Colors.text },
  container: { flex: 1, paddingHorizontal: Spacing.md },
  
  recommendSection: { marginBottom: Spacing.xl, marginTop: Spacing.sm },
  recommendHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, marginLeft: 4 },
  recommendTitle: { fontSize: 14, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase' },
  recommendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  recommendChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: Colors.secondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recommendChipText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },

  currentCard: {
    backgroundColor: Colors.primary,
    borderRadius: 35,
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  currentInfo: { flex: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cityName: { fontSize: 24, fontWeight: 'bold', color: Colors.secondary, marginLeft: 8 },
  currentTemp: { fontSize: 64, fontWeight: '800', color: Colors.secondary, marginBottom: 5 },
  currentDesc: { fontSize: 16, color: Colors.secondary, opacity: 0.9, fontWeight: '600' },
  currentWeatherIcon: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  
  forecastList: {
    backgroundColor: Colors.secondary,
    borderRadius: 28,
    padding: 24,
    paddingBottom: 40,
    marginBottom: 40,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: Spacing.xl },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayText: { fontSize: 16, fontWeight: '600', color: Colors.text, width: 100 },
  dayWeather: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' },
  tempGroup: { flexDirection: 'row', alignItems: 'center' },
  maxTemp: { fontSize: 17, fontWeight: 'bold', color: Colors.text, marginRight: 12 },
  minTemp: { fontSize: 17, fontWeight: 'bold', color: Colors.textSecondary },
});
