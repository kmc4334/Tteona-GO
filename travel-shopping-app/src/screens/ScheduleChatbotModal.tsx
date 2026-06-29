import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Send, X, Bot, User as UserIcon, Check } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useSchedule, SlotItem } from '../store/ScheduleContext';
import { JEJU_NODES } from '../data/jeju_nodes';
import { API_BASE } from '../store/AuthContext';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  text: string;
}

interface ScheduleChatbotModalProps {
  visible: boolean;
  onClose: () => void;
  initialDayIdx: number;
}

const CATEGORY_MAP: Record<string, string> = {
  '자연': 'attraction',
  '도심': 'attraction',
  '쇼핑': 'attraction',
  '문화': 'attraction',
  '체험': 'activity',
  '숙소': 'accommodation',
  '교통': 'transport'
};

const CATEGORY_EMOJIS: Record<string, string> = {
  attraction: '🏛',
  restaurant: '🍽',
  cafe: '☕',
  accommodation: '🏨',
  activity: '🎡',
  transport: '🚗'
};

export const ScheduleChatbotModal: React.FC<ScheduleChatbotModalProps> = ({
  visible,
  onClose,
  initialDayIdx
}) => {
  const { scheduleState, addMultiplePlaces } = useSchedule();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendedPlaces, setRecommendedPlaces] = useState<SlotItem[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<SlotItem[]>([]);
  const [targetDayIdx, setTargetDayIdx] = useState(initialDayIdx);

  const flatListRef = useRef<FlatList>(null);

  // Set default messages and reset state when opened
  useEffect(() => {
    if (visible) {
      setMessages([
        {
          id: '1',
          type: 'bot',
          text: '안녕하세요! AI 일정 비서입니다. 제주도의 명소, 맛집, 숙소를 물어보시거나 키워드를 입력해보세요! (예: 협재, 한라산, 신라호텔, 체험)'
        }
      ]);
      setRecommendedPlaces([]);
      setSelectedPlaces([]);
      setTargetDayIdx(initialDayIdx);
    }
  }, [visible, initialDayIdx]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userQuery = inputText.trim();
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: userQuery
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setLoading(true);

    // AI recommendation simulation delay
    setTimeout(async () => {
      const queryLower = userQuery.toLowerCase();

      // 1. Search locally in JEJU_NODES
      let matches: SlotItem[] = JEJU_NODES.filter(node => 
        node.name.toLowerCase().includes(queryLower) ||
        node.category.toLowerCase().includes(queryLower)
      ).map(node => ({
        id: node.id,
        name: node.name,
        city: '제주도',
        category: CATEGORY_MAP[node.category] || 'attraction',
        rating: 4.5
      }));

      // 2. If nothing matches, fall back to backend API products
      if (matches.length === 0) {
        try {
          const response = await fetch(`${API_BASE}/products?search=${encodeURIComponent(userQuery)}`);
          const data = await response.json();
          if (data.success && data.products && data.products.length > 0) {
            matches = data.products.map((p: any) => ({
              id: p.id,
              productId: p.id,
              name: p.title,
              city: p.location || '제주도',
              category: p.category === '교통수단' ? 'transport' :
                        p.category === '숙소' ? 'accommodation' :
                        p.category === '체험' ? 'activity' : 'attraction',
              rating: p.rating || 4.5,
              price: p.price || 0
            }));
          }
        } catch (error) {
          console.error('Failed to search backend products:', error);
        }
      }

      setLoading(false);

      if (matches.length > 0) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: `'${userQuery}'에 대해 ${matches.length}개의 장소를 찾았습니다. 추가할 장소를 선택하고 아래 버튼을 눌러주세요!`
        };
        setMessages(prev => [...prev, botMsg]);
        setRecommendedPlaces(matches.slice(0, 6)); // limit to 6
      } else {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: `'${userQuery}'와 관련된 장소를 찾지 못했습니다. 다른 키워드로 검색해보세요!`
        };
        setMessages(prev => [...prev, botMsg]);
        setRecommendedPlaces([]);
      }
    }, 800);
  };

  const togglePlace = (place: SlotItem) => {
    const isSelected = selectedPlaces.some(p => p.id === place.id);
    if (isSelected) {
      setSelectedPlaces(prev => prev.filter(p => p.id !== place.id));
    } else {
      setSelectedPlaces(prev => [...prev, place]);
    }
  };

  const handleAddSelected = async () => {
    if (selectedPlaces.length === 0) {
      Alert.alert('알림', '추가할 장소를 선택해주세요.');
      return;
    }

    if (!scheduleState) return;

    const success = await addMultiplePlaces(targetDayIdx, selectedPlaces);
    if (success) {
      Alert.alert('성공', `${selectedPlaces.length}개의 장소가 Day ${targetDayIdx + 1} 일정에 추가되었습니다.`);
      setSelectedPlaces([]);
      setRecommendedPlaces([]);
      onClose();
    } else {
      Alert.alert('오류', '장소를 추가하는 중 오류가 발생했습니다.');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.type === 'user';
    return (
      <View style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperBot]}>
        {!isUser && (
          <View style={styles.botIcon}>
            <Bot color={Colors.secondary} size={16} />
          </View>
        )}
        <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleBot]}>
          <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextBot]}>
            {item.text}
          </Text>
        </View>
        {isUser && (
          <View style={styles.userIcon}>
            <UserIcon color={Colors.secondary} size={16} />
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContent}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>AI 일정 장소 추천</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X color={Colors.text} size={24} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {loading && (
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>장소를 검색 중입니다...</Text>
            </View>
          )}

          {/* Recommendations Area */}
          {recommendedPlaces.length > 0 && (
            <View style={styles.recContainer}>
              <Text style={styles.recHeaderTitle}>💡 추천 장소 목록</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recScroll}>
                {recommendedPlaces.map((place) => {
                  const isSelected = selectedPlaces.some(p => p.id === place.id);
                  return (
                    <TouchableOpacity
                      key={place.id}
                      style={[styles.recCard, isSelected && styles.recCardSelected]}
                      onPress={() => togglePlace(place)}
                    >
                      <View style={styles.recCardHeader}>
                        <Text style={styles.recEmoji}>
                          {CATEGORY_EMOJIS[place.category] || '📍'}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <Check color={Colors.secondary} size={10} strokeWidth={3} />
                          </View>
                        )}
                      </View>
                      <Text style={styles.recName} numberOfLines={1}>{place.name}</Text>
                      <Text style={styles.recCategory}>{place.city} · {place.category}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Bottom actions if recommendations are selected */}
          {selectedPlaces.length > 0 && (
            <View style={styles.actionSection}>
              <View style={styles.daySelectorRow}>
                <Text style={styles.daySelectLabel}>추가할 날짜:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
                  {scheduleState?.schedule.map((day, idx) => (
                    <TouchableOpacity
                      key={`select-day-${idx}`}
                      style={[styles.dayOption, targetDayIdx === idx && styles.dayOptionSelected]}
                      onPress={() => setTargetDayIdx(idx)}
                    >
                      <Text style={[styles.dayOptionText, targetDayIdx === idx && styles.dayOptionTextSelected]}>
                        Day {day.day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity style={styles.addButton} onPress={handleAddSelected}>
                <Text style={styles.addButtonText}>
                  선택한 {selectedPlaces.length}개 장소 추가하기
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Input Box */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="예: 해수욕장, 카페 추천해줘"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Send color={Colors.secondary} size={20} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  messagesList: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  msgWrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  msgWrapperUser: {
    justifyContent: 'flex-end',
  },
  msgWrapperBot: {
    justifyContent: 'flex-start',
  },
  botIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  userIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  msgBubble: {
    maxWidth: '75%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
  },
  msgBubbleBot: {
    backgroundColor: Colors.background,
    borderBottomLeftRadius: 4,
  },
  msgBubbleUser: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
  },
  msgText: {
    fontSize: Typography.sizes.md,
    lineHeight: 20,
  },
  msgTextBot: {
    color: Colors.text,
  },
  msgTextUser: {
    color: Colors.secondary,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginLeft: 42,
    marginBottom: Spacing.md,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  recContainer: {
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  recHeaderTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  recScroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  recCard: {
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: Spacing.sm,
    marginRight: Spacing.sm,
    width: 120,
    alignItems: 'center',
  },
  recCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  recCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  recEmoji: {
    fontSize: 20,
  },
  checkBadge: {
    backgroundColor: Colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    width: '100%',
  },
  recCategory: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionSection: {
    padding: Spacing.md,
    backgroundColor: Colors.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  daySelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  daySelectLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  daysScroll: {
    flexDirection: 'row',
  },
  dayOption: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayOptionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  dayOptionTextSelected: {
    color: Colors.secondary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Spacing.sm,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.md,
    marginRight: Spacing.sm,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
