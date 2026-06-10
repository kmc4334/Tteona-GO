import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import * as Location from 'expo-location';
import { Cloud, Sun, CloudRain, Snowflake, Wind, MapPin, AlertCircle, ChevronRight } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useWeather } from '../store/WeatherContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

const dfs_xy_conv = (v1: number, v2: number) => {
  const RE = 6371.00877; 
  const GRID = 5.0; 
  const SLAT1 = 30.0; 
  const SLAT2 = 60.0; 
  const OLON = 126.0; 
  const OLAT = 38.0; 
  const XO = 43; 
  const YO = 136; 

  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  
  let rs: any = {};
  let ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);
  let theta = v2 * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;
  rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  return rs;
};

interface WeatherData {
  temp: string;
  rainType: string;
  humidity: string;
  city: string;
}

export const WeatherWidget = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectedCity, isAutoLocation } = useWeather();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!API_KEY) {
        setError('API 키 미설정');
        setLoading(false);
        return;
      }

      let nx = selectedCity.nx;
      let ny = selectedCity.ny;
      let cityName = selectedCity.name;

      if (isAutoLocation) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const grid = dfs_xy_conv(location.coords.latitude, location.coords.longitude);
          nx = grid.x;
          ny = grid.y;
          cityName = '현재 위치';
        }
      }

      const now = new Date();
      let baseDate = now.toISOString().slice(0, 10).replace(/-/g, '');
      let hours = now.getHours();
      let minutes = now.getMinutes();

      if (minutes < 40) {
        if (hours === 0) {
          now.setDate(now.getDate() - 1);
          baseDate = now.toISOString().slice(0, 10).replace(/-/g, '');
          hours = 23;
        } else {
          hours -= 1;
        }
      }
      const baseTime = `${hours.toString().padStart(2, '0')}00`;

      const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${API_KEY}&numOfRows=10&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.response?.header?.resultCode === '00') {
        const items = data.response.body.items.item;
        const T1H = items.find((i: any) => i.category === 'T1H')?.obsrValue;
        const PTY = items.find((i: any) => i.category === 'PTY')?.obsrValue;
        const REH = items.find((i: any) => i.category === 'REH')?.obsrValue;

        setWeather({
          temp: T1H,
          rainType: PTY,
          humidity: REH,
          city: cityName
        });
      } else {
        setError(`오류`);
      }
    } catch (err) {
      setError('오류');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [selectedCity, isAutoLocation]);

  const getWeatherIcon = (rainType: string) => {
    const size = 28;
    if (rainType === '0') return <Sun color="#FFB800" size={size} />;
    if (['1', '2', '5', '6'].includes(rainType)) return <CloudRain color="#00A3FF" size={size} />;
    if (['3', '7'].includes(rainType)) return <Snowflake color="#00D1FF" size={size} />;
    return <Cloud color={Colors.primary} size={size} />;
  };

  const getWeatherDesc = (rainType: string) => {
    switch (rainType) {
      case '0': return '맑음';
      case '1': return '비';
      case '2': return '비/눈';
      case '3': return '눈';
      case '5': return '빗방울';
      case '6': return '빗방울/눈날림';
      case '7': return '눈날림';
      default: return '맑음';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => navigation.navigate('Weather')}
      activeOpacity={0.8}
    >
      <View style={styles.leftContent}>
        <View style={styles.cityRow}>
          <MapPin size={12} color={Colors.primary} style={{ marginRight: 4 }} />
          <Text style={styles.cityName}>{weather?.city}</Text>
        </View>
        <Text style={styles.tempText}>{Math.round(Number(weather?.temp))}°</Text>
      </View>
      
      <View style={styles.rightContent}>
        {weather && getWeatherIcon(weather.rainType)}
        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
           <Text style={styles.descText}>{getWeatherDesc(weather?.rainType || '0')}</Text>
           <ChevronRight size={10} color={Colors.textSecondary} style={{marginLeft: 2}} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  center: {
    justifyContent: 'center',
    height: 70,
  },
  leftContent: {
    flex: 1,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cityName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tempText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  rightContent: {
    alignItems: 'center',
  },
  descText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
});
