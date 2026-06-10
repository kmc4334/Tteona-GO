import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface RecommendationCardProps {
  image: string;
  title: string;
  description: string;
  price: number;
  onAddToCart: () => void;
}

export const AiRecommendationCard: React.FC<RecommendationCardProps> = ({ 
  image, title, description, price, onAddToCart 
}) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{price != null ? price.toLocaleString() : '가격 미정'}원</Text>
          <TouchableOpacity style={styles.addButton} onPress={onAddToCart}>
            <Text style={styles.addButtonText}>장바구니 담기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  addButtonText: {
    color: Colors.accent,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.xs,
  }
});
