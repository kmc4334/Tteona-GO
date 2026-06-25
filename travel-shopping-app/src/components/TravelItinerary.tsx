import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MapPin, Clock, CreditCard, ChevronRight, Map as MapIcon } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface ItineraryItem {
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  category: string;
  estimated_cost: number;
  day: number;
  order: number;
  route_group: string;
}

interface TravelItineraryProps {
  items: ItineraryItem[];
  onSpotPress?: (item: ItineraryItem) => void;
}

export const TravelItinerary: React.FC<TravelItineraryProps> = ({ items, onSpotPress }) => {
  // Group by day
  const groupedItems = items.reduce((acc, item) => {
    const day = item.day || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<number, ItineraryItem[]>);

  // Sort by order within each day
  Object.keys(groupedItems).forEach(day => {
    groupedItems[Number(day)].sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  const days = Object.keys(groupedItems).sort((a, b) => Number(a) - Number(b));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MapIcon size={20} color={Colors.primary} />
          <Text style={styles.headerTitle}>추천 여행 경로</Text>
        </View>
        <TouchableOpacity style={styles.mapButton}>
          <Text style={styles.mapButtonText}>지도 보기</Text>
        </TouchableOpacity>
      </View>

      {days.map((day) => (
        <View key={`day-${day}`} style={styles.daySection}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayText}>Day {day}</Text>
          </View>
          
          <View style={styles.timelineContainer}>
            {groupedItems[Number(day)].map((item, index) => (
              <TouchableOpacity 
                key={`${day}-${index}`} 
                style={styles.itemWrapper}
                onPress={() => onSpotPress?.(item)}
              >
                {/* Timeline Line & Dot */}
                <View style={styles.timelineLeft}>
                  <View style={styles.dot} />
                  {index !== groupedItems[Number(day)].length - 1 && <View style={styles.line} />}
                </View>

                {/* Content */}
                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.footer}>
                    {item.estimated_cost != null && item.estimated_cost > 0 && (
                      <View style={styles.metaInfo}>
                        <CreditCard size={12} color={Colors.textSecondary} />
                        <Text style={styles.metaText}>약 {item.estimated_cost.toLocaleString()}원</Text>
                      </View>
                    )}
                    <View style={styles.metaInfo}>
                      <MapPin size={12} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>위치 확인</Text>
                    </View>
                  </View>
                </View>
                
                <ChevronRight size={16} color={Colors.border} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginLeft: Spacing.xs,
  },
  mapButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.accent + '20',
    borderRadius: 12,
  },
  mapButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: Typography.weights.medium,
  },
  daySection: {
    marginBottom: Spacing.xl,
  },
  dayBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  dayText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  timelineContainer: {
    paddingLeft: Spacing.xs,
  },
  itemWrapper: {
    flexDirection: 'row',
    marginBottom: 0,
    minHeight: 80,
  },
  timelineLeft: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  itemContent: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginRight: Spacing.xs,
  },
  categoryBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  description: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 4,
  }
});
