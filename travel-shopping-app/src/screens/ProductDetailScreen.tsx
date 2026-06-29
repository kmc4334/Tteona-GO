import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import {
  ArrowLeft, Share2, Heart, Star, MapPin, Calendar,
  Package, ShoppingCart, CreditCard, Users, ChevronDown, ChevronUp,
  TrendingDown, TrendingUp, Clock,
} from 'lucide-react-native';
import { useCart } from '../store/CartContext';
import { usePackage } from '../store/PackageContext';
import { useActivity } from '../store/ActivityContext';
import { useNotifications } from '../store/NotificationContext';
import { KakaoMap } from '../components/KakaoMap';



// ─────────────────────────────────────────────
// 날짜 포맷 유틸
// ─────────────────────────────────────────────
function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function formatDateKo(date: Date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
}
function calcNights(from: Date, to: Date) {
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
}

// ─────────────────────────────────────────────
// Simple inline calendar (no native dependency)
// ─────────────────────────────────────────────
interface InlineCalendarProps {
  selectedDate: Date;
  minDate?: Date;
  onSelect: (d: Date) => void;
}
const InlineCalendar: React.FC<InlineCalendarProps> = ({ selectedDate, minDate, onSelect }) => {
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(v => v - 1); setViewMonth(11); }
    else setViewMonth(v => v - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(v => v + 1); setViewMonth(0); }
    else setViewMonth(v => v + 1);
  };

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const dayNames = ['일','월','화','수','목','금','토'];

  return (
    <View style={calStyles.calWrap}>
      <View style={calStyles.calHeader}>
        <TouchableOpacity onPress={prevMonth} style={calStyles.navBtn}><Text style={calStyles.navTxt}>‹</Text></TouchableOpacity>
        <Text style={calStyles.monthTxt}>{viewYear}년 {monthNames[viewMonth]}</Text>
        <TouchableOpacity onPress={nextMonth} style={calStyles.navBtn}><Text style={calStyles.navTxt}>›</Text></TouchableOpacity>
      </View>
      <View style={calStyles.dayRow}>
        {dayNames.map((d, i) => (
          <Text key={d} style={[calStyles.dayLabel, i === 0 && { color: Colors.error }, i === 6 && { color: '#3D98FF' }]}>{d}</Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={calStyles.weekRow}>
          {week.map((day, di) => {
            if (!day) return <View key={di} style={calStyles.dayCell} />;
            const d = new Date(viewYear, viewMonth, day);
            d.setHours(0,0,0,0);
            const isSelected = d.getTime() === selectedDate.getTime();
            const isPast = minDate ? d < minDate : d < today;
            const isSun = di === 0, isSat = di === 6;
            return (
              <TouchableOpacity
                key={di}
                style={[calStyles.dayCell, isSelected && calStyles.selectedCell, isPast && calStyles.pastCell]}
                onPress={() => !isPast && onSelect(d)}
                disabled={isPast}
              >
                <Text style={[
                  calStyles.dayNum,
                  isSun && { color: Colors.error },
                  isSat && { color: '#3D98FF' },
                  isSelected && { color: Colors.secondary, fontWeight: 'bold' },
                  isPast && { color: Colors.border },
                ]}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const calStyles = StyleSheet.create({
  calWrap: { paddingHorizontal: 8, paddingBottom: 8 },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { padding: 8 },
  navTxt: { fontSize: 22, color: Colors.primary, fontWeight: 'bold' },
  monthTxt: { fontSize: 16, fontWeight: '700', color: Colors.text },
  dayRow: { flexDirection: 'row', marginBottom: 4 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  weekRow: { flexDirection: 'row' },
  dayCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 100, margin: 2 },
  selectedCell: { backgroundColor: Colors.primary },
  pastCell: { opacity: 0.4 },
  dayNum: { fontSize: 13, color: Colors.text },
});

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
export const ProductDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addToCart } = useCart();
  const { addToPackage } = usePackage();
  const { toggleLike, isLiked, addBooking } = useActivity();
  const { addNotification } = useNotifications();

  const { product } = (route.params as any) || {};

  // Basic product fields
  const title    = product?.title    || '알 수 없는 상품';
  const location = product?.location || '위치 미상';
  const rating   = product?.rating   || '0.0';
  const image    = product?.image    || 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=800';
  const category = product?.category || '기타';
  const basePrice: number = product?.price || 150000;
  const originalPrice: number | undefined = product?.originalPrice;
  const externalUrl: string = product?.externalUrl || '';
  const seatsAvailable: number = product?.seatsAvailable || 0;
  const isTransport     = category === '교통수단';
  const isAccommodation = category === '숙소';
  const isExperience    = category === '체험';

  // 상품 좌표
  const prodLat: number = product?.latitude  || 33.450701;
  const prodLng: number = product?.longitude || 126.570667;

  // 현재위치 상태
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);

  // 백그라운드로 현재위치 획득
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setMyLat(loc.coords.latitude);
        setMyLng(loc.coords.longitude);
      } catch (_) {}
    })();
  }, []);

  // Haversine 거리 (m)
  function calcDist(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const toR = (d: number) => (d * Math.PI) / 180;
    const dLat = toR(lat2 - lat1), dLng = toR(lng2 - lng1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLng/2)**2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  const distanceM = myLat && myLng ? calcDist(myLat, myLng, prodLat, prodLng) : null;
  const distanceLabel = distanceM
    ? distanceM < 1000 ? `${Math.round(distanceM)}m` : `${(distanceM/1000).toFixed(1)}km`
    : null;


  // ── 체험 시간 슬롯 ────────────────────────────
  const EXPERIENCE_SLOTS = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  ];

  // ── State ───────────────────────────────────
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const dayAfter  = new Date(today); dayAfter.setDate(today.getDate() + 2);

  // 숙박용 state
  const [checkIn,  setCheckIn]  = useState<Date>(tomorrow);
  const [checkOut, setCheckOut] = useState<Date>(dayAfter);
  const [guests,   setGuests]   = useState(1);
  const [showCheckInCal,  setShowCheckInCal]  = useState(false);
  const [showCheckOutCal, setShowCheckOutCal] = useState(false);

  // 체험용 state
  const [experienceDate, setExperienceDate]   = useState<Date>(tomorrow);
  const [experienceSlot, setExperienceSlot]   = useState<string>('10:00');
  const [showExpCal,     setShowExpCal]       = useState(false);
  const [expGuests,      setExpGuests]        = useState(1);

  const nights = calcNights(checkIn, checkOut);

  // 카테고리별 가격 계산
  const totalPrice = isAccommodation
    ? basePrice * nights * guests
    : isExperience
      ? basePrice * expGuests
      : basePrice;

  // ── Helpers ────────────────────────────────
  const showAlert = (title: string, message: string) => {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleCheckInSelect = (d: Date) => {
    setCheckIn(d);
    const nextDay = new Date(d); nextDay.setDate(d.getDate() + 1);
    if (checkOut <= d) setCheckOut(nextDay);
    setShowCheckInCal(false);
    setShowCheckOutCal(true);
  };

  const handleCheckOutSelect = (d: Date) => {
    setCheckOut(d);
    setShowCheckOutCal(false);
  };

  const handleAddToCart = () => {
    addToCart({ id: product?.id || String(Math.random()), category: category as any, title, image, rating: Number(rating), price: basePrice });
    addNotification({ title: '장바구니 담기', message: `'${title}' 상품이 장바구니에 담겼습니다.`, type: 'info' });
    showAlert('장바구니', '장바구니에 담겼습니다!');
  };

  const handleAddToPackage = () => {
    addToPackage({ day: 1, title, timeSlot: '10:00', image, price: basePrice, productId: product?.id || String(Math.random()) });
    addNotification({ title: '패키지 추가', message: `'${title}' 일정이 나의 패키지에 추가되었습니다.`, type: 'info' });
    showAlert('패키지 추가', '일정에 추가되었습니다! "패키지" 메뉴에서 확인하세요.');
  };

  const handleToggleLike = () => toggleLike(product);

  const handleBookNow = () => {
    if (isAccommodation) {
      addBooking({
        ...product,
        price: totalPrice,
        checkInDate: formatDate(checkIn),
        checkOutDate: formatDate(checkOut),
        guests,
      } as any);
    } else if (isExperience) {
      addBooking({
        ...product,
        price: totalPrice,
        checkInDate: formatDate(experienceDate),
        checkOutDate: formatDate(experienceDate),
        experienceSlot,
        guests: expGuests,
      } as any);
    } else {
      addBooking({ ...product, price: totalPrice } as any);
    }
    addNotification({ title: '예약 완료', message: `'${title}' 예약이 완료되었습니다. 내 활동에서 확인하세요!`, type: 'alert' });
    navigation.navigate('MyActivity');
  };

  const handleExternalBooking = () => {
    if (externalUrl) {
      Linking.openURL(externalUrl).catch(err => {
        console.error("Failed to open URL:", err);
        showAlert('오류', '외부 사이트를 열 수 없습니다.');
      });
    } else {
      showAlert('알림', '외부 예약 사이트 정보가 없습니다.');
    }
  };

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>상품 정보를 불러올 수 없습니다.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.primary }}>뒤로가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>

        {/* ── Hero Image ── */}
        <View style={styles.headerImageContainer}>
          <Image source={{ uri: image }} style={styles.headerImage} />
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <ArrowLeft color={Colors.text} size={20} />
            </TouchableOpacity>
            <View style={styles.rightIcons}>
              <TouchableOpacity style={[styles.iconButton, { marginRight: Spacing.md }]}>
                <Share2 color={Colors.text} size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleToggleLike}>
                <Heart
                  color={isLiked(product.id) ? Colors.error : Colors.text}
                  size={20}
                  fill={isLiked(product.id) ? Colors.error : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.contentContainer}>

          {/* Category & Title */}
          <View style={styles.tagBadge}><Text style={styles.tagText}>{category}</Text></View>
          <Text style={styles.title}>{title}</Text>

          {/* Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin color={Colors.textSecondary} size={16} />
              <Text style={styles.metaText}>{location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Star color="#FFD700" size={16} fill="#FFD700" />
              <Text style={styles.ratingText}>{rating} <Text style={styles.reviewCount}>(128)</Text></Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>상품 소개</Text>
          <Text style={styles.descriptionText}>
            여유롭고 편안한 휴식을 즐길 수 있는 최고의 선택입니다.{'\n'}
            현지 가이드와 함께 구석구석 숨겨진 명소를 탐험하고,{'\n'}
            잊지 못할 추억을 만들어보세요.
          </Text>

          <View style={styles.divider} />

          {/* Price Trend / Info */}
          <View style={styles.priceInfoBox}>
            <View>
              <Text style={styles.priceBoxLabel}>현재 최저가</Text>
              <View style={styles.priceRowMain}>
                <Text style={styles.priceBoxValue}>₩{basePrice.toLocaleString()}</Text>
                {originalPrice && originalPrice !== basePrice && (
                  <View style={[styles.trendBadge, { backgroundColor: basePrice < originalPrice ? Colors.error + '15' : Colors.textSecondary + '15' }]}>
                    {basePrice < originalPrice ? <TrendingDown color={Colors.error} size={14} /> : <TrendingUp color={Colors.textSecondary} size={14} />}
                    <Text style={[styles.trendText, { color: basePrice < originalPrice ? Colors.error : Colors.textSecondary }]}>
                      {basePrice < originalPrice ? '하락' : '상승'} (₩{Math.abs(originalPrice - basePrice).toLocaleString()})
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {isTransport && (
              <View style={styles.seatsBox}>
                <Text style={styles.seatsLabel}>잔여 좌석</Text>
                <Text style={[styles.seatsValue, seatsAvailable < 10 && { color: Colors.error }]}>{seatsAvailable}석</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Location Map */}
          <View style={styles.sectionHeader}>
            <MapPin color={Colors.primary} size={20} />
            <Text style={styles.sectionTitle}>위치 정보</Text>
            {distanceLabel && (
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceBadgeText}>📍 내 위치에서 {distanceLabel}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.mapPreviewContainer}
            onPress={() => navigation.navigate('Map', {
              lat: prodLat,
              lng: prodLng,
              title: title
            })}
            activeOpacity={0.9}
          >
            <View style={styles.mapWrap}>
              <KakaoMap lat={prodLat} lng={prodLng} title={title} />
            </View>
            <View style={styles.mapOverlay}>
              <Text style={styles.mapOverlayText}>지도를 터치하여 크게 보기</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* ══════════════════════════════════════
              날짜 / 일정 선택 섹션 (카테고리별 분기)
          ══════════════════════════════════════ */}

          {/* ── 숙박 전용: 체크인/체크아웃 ── */}
          {isAccommodation && (
            <>
              <View style={styles.sectionHeader}>
                <Calendar color={Colors.primary} size={20} />
                <Text style={styles.sectionTitle}>체크인 / 체크아웃</Text>
              </View>

              <View style={styles.dateRow}>
                {/* 체크인 */}
                <TouchableOpacity
                  style={[styles.dateCard, showCheckInCal && styles.dateCardActive]}
                  onPress={() => { setShowCheckInCal(v => !v); setShowCheckOutCal(false); }}
                >
                  <Text style={styles.dateCardLabel}>체크인</Text>
                  <Text style={styles.dateCardValue}>{formatDateKo(checkIn)}</Text>
                  {showCheckInCal ? <ChevronUp color={Colors.primary} size={16} /> : <ChevronDown color={Colors.textSecondary} size={16} />}
                </TouchableOpacity>

                <View style={styles.nightBadge}>
                  <Text style={styles.nightText}>{nights}박</Text>
                </View>

                {/* 체크아웃 */}
                <TouchableOpacity
                  style={[styles.dateCard, showCheckOutCal && styles.dateCardActive]}
                  onPress={() => { setShowCheckOutCal(v => !v); setShowCheckInCal(false); }}
                >
                  <Text style={styles.dateCardLabel}>체크아웃</Text>
                  <Text style={styles.dateCardValue}>{formatDateKo(checkOut)}</Text>
                  {showCheckOutCal ? <ChevronUp color={Colors.primary} size={16} /> : <ChevronDown color={Colors.textSecondary} size={16} />}
                </TouchableOpacity>
              </View>

              {showCheckInCal && (
                <View style={styles.calendarBox}>
                  <InlineCalendar selectedDate={checkIn} minDate={tomorrow} onSelect={handleCheckInSelect} />
                </View>
              )}
              {showCheckOutCal && (
                <View style={styles.calendarBox}>
                  <InlineCalendar selectedDate={checkOut} minDate={checkIn} onSelect={handleCheckOutSelect} />
                </View>
              )}

              {/* 인원수 */}
              <View style={styles.guestRow}>
                <View style={styles.guestLabel}>
                  <Users color={Colors.primary} size={18} />
                  <Text style={styles.guestLabelText}>인원</Text>
                </View>
                <View style={styles.guestControl}>
                  <TouchableOpacity
                    style={[styles.guestBtn, guests <= 1 && styles.guestBtnDisabled]}
                    onPress={() => setGuests(g => Math.max(1, g - 1))}
                    disabled={guests <= 1}
                  >
                    <Text style={styles.guestBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.guestCount}>{guests}명</Text>
                  <TouchableOpacity
                    style={[styles.guestBtn, guests >= 10 && styles.guestBtnDisabled]}
                    onPress={() => setGuests(g => Math.min(10, g + 1))}
                    disabled={guests >= 10}
                  >
                    <Text style={styles.guestBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* ── 체험 전용: 날짜 + 시간 선택 ── */}
          {isExperience && (
            <>
              <View style={styles.sectionHeader}>
                <Calendar color={Colors.primary} size={20} />
                <Text style={styles.sectionTitle}>체험 날짜 선택</Text>
              </View>

              {/* 날짜 선택 버튼 */}
              <TouchableOpacity
                style={[styles.expDateCard, showExpCal && styles.dateCardActive]}
                onPress={() => setShowExpCal(v => !v)}
              >
                <View style={styles.expDateLeft}>
                  <Calendar color={Colors.primary} size={18} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.dateCardLabel}>체험 날짜</Text>
                    <Text style={styles.dateCardValue}>{formatDateKo(experienceDate)}</Text>
                  </View>
                </View>
                {showExpCal ? <ChevronUp color={Colors.primary} size={18} /> : <ChevronDown color={Colors.textSecondary} size={18} />}
              </TouchableOpacity>

              {showExpCal && (
                <View style={styles.calendarBox}>
                  <InlineCalendar
                    selectedDate={experienceDate}
                    minDate={tomorrow}
                    onSelect={(d) => { setExperienceDate(d); setShowExpCal(false); }}
                  />
                </View>
              )}

              {/* 시간 슬롯 */}
              <View style={[styles.sectionHeader, { marginTop: Spacing.md }]}>
                <Clock color={Colors.primary} size={20} />
                <Text style={styles.sectionTitle}>체험 시간 선택</Text>
              </View>
              <View style={styles.slotGrid}>
                {EXPERIENCE_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotItem, experienceSlot === slot && styles.slotItemActive]}
                    onPress={() => setExperienceSlot(slot)}
                  >
                    <Text style={[styles.slotText, experienceSlot === slot && styles.slotTextActive]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 체험 인원 */}
              <View style={[styles.guestRow, { marginTop: Spacing.md }]}>
                <View style={styles.guestLabel}>
                  <Users color={Colors.primary} size={18} />
                  <Text style={styles.guestLabelText}>참가 인원</Text>
                </View>
                <View style={styles.guestControl}>
                  <TouchableOpacity
                    style={[styles.guestBtn, expGuests <= 1 && styles.guestBtnDisabled]}
                    onPress={() => setExpGuests(g => Math.max(1, g - 1))}
                    disabled={expGuests <= 1}
                  >
                    <Text style={styles.guestBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.guestCount}>{expGuests}명</Text>
                  <TouchableOpacity
                    style={[styles.guestBtn, expGuests >= 20 && styles.guestBtnDisabled]}
                    onPress={() => setExpGuests(g => Math.min(20, g + 1))}
                    disabled={expGuests >= 20}
                  >
                    <Text style={styles.guestBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          <View style={styles.divider} />

          {/* AI 추천 */}
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => navigation.navigate('Concierge', { initialQuery: `'${title}' 근처 맛집이나 여행 코스를 AI에게 추천받고 싶어요!` })}
          >
            <Text style={{ fontSize: 18, marginRight: 8 }}>🤖</Text>
            <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 13 }}>이 상품과 어울리는 주변 일정 AI에게 물어보기</Text>
          </TouchableOpacity>

          <View style={{ height: 180 }} />
        </View>
      </ScrollView>

      {/* ── Bottom Bar ── */}
      <View style={styles.bottomBar}>
        {/* 예약 요약 (카테고리별) */}
        <View style={styles.bookingSummary}>
          {isAccommodation ? (
            <Text style={styles.summaryLabel}>
              🏨 {formatDateKo(checkIn)} → {formatDateKo(checkOut)} · {nights}박 · {guests}명
            </Text>
          ) : isExperience ? (
            <Text style={styles.summaryLabel}>
              🎯 {formatDateKo(experienceDate)} · {experienceSlot} · {expGuests}명
            </Text>
          ) : (
            <Text style={styles.summaryLabel}>상품 1개</Text>
          )}
        </View>

        {/* 가격 */}
        <View style={styles.priceArea}>
          <Text style={styles.priceLabel}>총 결제 금액</Text>
          <Text style={styles.priceValue}>
            {totalPrice.toLocaleString()}
            <Text style={styles.priceUnit}>원</Text>
          </Text>
        </View>

        <View style={styles.actionArea}>
          {/* 패키지 & 장바구니 */}
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.iconActionButton} onPress={handleAddToPackage}>
              <Package color={Colors.primary} size={22} />
              <Text style={styles.iconActionText}>패키지</Text>
            </TouchableOpacity>
            <View style={styles.verticalDivider} />
            <TouchableOpacity style={styles.iconActionButton} onPress={handleAddToCart}>
              <ShoppingCart color={Colors.primary} size={22} />
              <Text style={styles.iconActionText}>장바구니</Text>
            </TouchableOpacity>
          </View>

          {/* 예약 */}
          {isTransport && externalUrl ? (
            <TouchableOpacity
              style={[styles.mainActionButton, { backgroundColor: Colors.accent }]}
              onPress={handleExternalBooking}
            >
              <Share2 color={Colors.secondary} size={18} style={{ marginRight: 8 }} />
              <Text style={[styles.mainActionText, { color: Colors.secondary }]}>고객사 이동 예약</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.mainActionButton}
              onPress={handleBookNow}
            >
              <CreditCard color={Colors.secondary} size={18} style={{ marginRight: 8 }} />
              <Text style={styles.mainActionText}>지금 예약</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea:             { flex: 1, backgroundColor: Colors.secondary },
  container:            { flex: 1 },

  // hero
  headerImageContainer: { position: 'relative', height: 320, width: '100%' },
  headerImage:          { width: '100%', height: '100%' },
  headerOverlay: {
    position: 'absolute', top: 50, left: Spacing.md, right: Spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  iconButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  rightIcons: { flexDirection: 'row' },

  // content
  contentContainer: {
    backgroundColor: Colors.secondary,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -28, padding: Spacing.xl,
  },
  tagBadge: {
    backgroundColor: Colors.accent + '25', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, marginBottom: Spacing.sm,
  },
  tagText:    { color: Colors.primary, fontSize: Typography.sizes.xs, fontWeight: 'bold' },
  title:      { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: Spacing.sm },
  metaRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  metaItem:   { flexDirection: 'row', alignItems: 'center', marginRight: Spacing.xl },
  metaText:   { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginLeft: 6 },
  ratingText: { fontSize: Typography.sizes.sm, fontWeight: 'bold', color: Colors.text, marginLeft: 6 },
  reviewCount:{ fontWeight: 'normal', color: Colors.textSecondary },
  divider:    { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.lg },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sectionTitle:  { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  mapPreviewContainer: {
    marginTop: Spacing.sm,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  mapWrap: {
    height: 180,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  mapOverlayText: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // 네비게이션 버튼
  distanceBadge: {
    marginLeft: 'auto',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  distanceBadgeText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  naviRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  naviBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 14,
    gap: 5,
    borderWidth: 1.5,
  },
  naviBtnKakao: { backgroundColor: '#FEE500' + '30', borderColor: '#FEE500' },
  naviBtnGoogle: { backgroundColor: '#4285F4' + '15', borderColor: '#4285F4' },
  naviBtnNaver: { backgroundColor: '#03C75A' + '15', borderColor: '#03C75A' },
  naviBtnIcon: { fontSize: 16 },
  naviBtnText: { fontSize: 11, fontWeight: '700', color: Colors.text },
  descriptionText: { fontSize: Typography.sizes.md, lineHeight: 24, color: Colors.textSecondary },
  subHint: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginBottom: Spacing.md },

  // 가격 정보 박스
  priceInfoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceBoxLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  priceRowMain: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceBoxValue: { fontSize: 20, fontWeight: '800', color: Colors.text },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendText: { fontSize: 12, fontWeight: 'bold' },
  seatsBox: { alignItems: 'flex-end' },
  seatsLabel: { fontSize: 11, color: Colors.textSecondary },
  seatsValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },

  // 날짜
  dateRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  dateCard: {
    flex: 1, backgroundColor: Colors.background, borderRadius: 14,
    padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border,
    gap: 4,
  },
  dateCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  dateCardLabel:  { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  dateCardValue:  { fontSize: 13, fontWeight: '700', color: Colors.text },
  nightBadge:    {
    backgroundColor: Colors.primary + '15', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, alignItems: 'center',
  },
  nightText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  calendarBox: {
    backgroundColor: Colors.background, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.md, overflow: 'hidden',
    paddingTop: 12,
  },

  // 체험 날짜 카드 (wide)
  expDateCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.background, borderRadius: 14,
    padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  expDateLeft: { flexDirection: 'row', alignItems: 'center' },

  // 시간 슬롯 그리드
  slotGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.sm,
  },
  slotItem: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border,
  },
  slotItemActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotText:       { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  slotTextActive: { color: Colors.secondary },

  // 인원
  guestRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.background, borderRadius: 14, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  guestLabel:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guestLabelText: { fontSize: 15, fontWeight: '600', color: Colors.text },
  guestControl:   { flexDirection: 'row', alignItems: 'center', gap: 16 },
  guestBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  guestBtnDisabled: { backgroundColor: Colors.border },
  guestBtnText: { fontSize: 20, color: Colors.secondary, fontWeight: 'bold', lineHeight: 22 },
  guestCount:   { fontSize: 16, fontWeight: '700', color: Colors.text, minWidth: 36, textAlign: 'center' },

  // AI button
  aiButton: {
    backgroundColor: Colors.background, borderRadius: 14,
    padding: Spacing.md, marginTop: Spacing.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },

  // bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 36,
    borderTopWidth: 1, borderTopColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 10,
    gap: 8,
  },
  bookingSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel:   { fontSize: 11, color: Colors.textSecondary, flexShrink: 1 },
  priceArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  priceLabel: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  priceValue: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  priceUnit:  { fontSize: Typography.sizes.sm, fontWeight: '600', color: Colors.textSecondary, marginLeft: 2 },
  actionArea: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  secondaryActions: {
    flexDirection: 'row', backgroundColor: Colors.background, borderRadius: 16,
    paddingHorizontal: 4, borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  iconActionButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, minWidth: 68 },
  iconActionText:   { fontSize: 10, fontWeight: '700', color: Colors.primary, marginTop: 2 },
  verticalDivider:  { width: 1, height: 24, backgroundColor: Colors.border },
  mainActionButton: {
    flex: 1, backgroundColor: Colors.primary, height: 54, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  mainActionButtonDisabled: { backgroundColor: Colors.textSecondary, shadowOpacity: 0 },
  mainActionText: { color: Colors.secondary, fontSize: 15, fontWeight: 'bold' },
});
