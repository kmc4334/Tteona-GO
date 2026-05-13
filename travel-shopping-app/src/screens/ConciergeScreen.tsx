import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Send, ArrowLeft, Bot, User as UserIcon } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { AiRecommendationCard } from '../components/AiRecommendationCard';
import { useCart } from '../store/CartContext';
import { useAuth, API_BASE } from '../store/AuthContext';
import { TravelItinerary } from '../components/TravelItinerary';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  recommendation?: {
    id?: string;
    image: string;
    title: string;
    description: string;
    price: number;
  };
  itinerary?: any[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'bot',
    text: '안녕하세요! 저는 AI 여행 컨시어지입니다. 어디로 여행을 떠나고 싶으신가요? (예: 제주도 2박3일 여행 추천, 부산 커플 여행 코스)',
  }
];

export const ConciergeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { addToCart } = useCart();
  const { token, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Fetch chat history from backend
  const fetchChatHistory = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.messages.length > 0) {
        const formatted = data.messages.map((m: any, index: number) => ({
          id: index.toString(),
          type: m.role === 'user' ? 'user' : 'bot',
          text: m.content,
          recommendation: m.recommendation,
          itinerary: m.itinerary
        }));
        setMessages(formatted);
      } else {
        setMessages(INITIAL_MESSAGES);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      setMessages(INITIAL_MESSAGES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchChatHistory();
    } else {
      setMessages(INITIAL_MESSAGES);
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Handle initial query from other screens
  useEffect(() => {
    const params = route.params as { initialQuery?: string } | undefined;
    if (params?.initialQuery && !loading) {
      handleSendQuery(params.initialQuery);
    }
  }, [route.params, loading]);

  const saveMessageToBackend = async (role: 'user' | 'bot', content: string, recommendation?: any) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role, content, recommendation })
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const handleSendQuery = async (query: string) => {
    if (!query.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), type: 'user', text: query };
    setMessages(prev => [...prev, newUserMsg]);
    
    // Save user message
    saveMessageToBackend('user', query);

    // Mock AI Response after delay
    setTimeout(async () => {
      const rec = {
        id: `ai-rec-${Date.now()}`,
        image: 'https://images.unsplash.com/photo-1542171295-c2d1b72a0f67?auto=format&fit=crop&q=80&w=600',
        title: '제주 감귤밭 프라이빗 독채 펜션',
        description: '커플 여행에 딱 맞는 로맨틱한 분위기와 야외 바베큐장을 갖춘 숙소입니다.',
        price: 180000,
      };

      const botText = `'${query}'에 대한 추천 여행 상품입니다! 마음에 드시면 장바구니에 담아주세요.`;
      
      // Mock itinerary generation based on keywords (matching backend logic)
      let mockItinerary = undefined;
      if (query.includes('제주')) {
        mockItinerary = [
          { name: "제주국제공항", latitude: 33.5113, longitude: 126.4930, description: "여행의 시작점", category: "교통", estimated_cost: 0, day: 1, order: 1, route_group: "day1" },
          { name: "자매국수", latitude: 33.5122, longitude: 126.5277, description: "고기국수 맛집", category: "맛집", estimated_cost: 10000, day: 1, order: 2, route_group: "day1" },
          { name: "함덕 해수욕장", latitude: 33.5430, longitude: 126.6692, description: "에메랄드빛 바다", category: "자연", estimated_cost: 0, day: 1, order: 3, route_group: "day1" }
        ];
      }

      let botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: botText,
        recommendation: rec,
        itinerary: mockItinerary
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Save bot response (the backend will also generate itinerary if not provided)
      saveMessageToBackend('bot', botText, rec);
    }, 1000);
  };


  const handleSend = () => {
    handleSendQuery(inputText);
    setInputText('');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.type === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperBot]}>
        {!isUser && (
          <View style={styles.avatarBot}>
            <Bot color={Colors.secondary} size={16} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleBot]}>
          <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextBot]}>
            {item.text}
          </Text>
          {item.recommendation && (
            <AiRecommendationCard 
              image={item.recommendation.image}
              title={item.recommendation.title}
              description={item.recommendation.description}
              price={item.recommendation.price}
              onAddToCart={() => addToCart({
                id: item.recommendation!.id || Math.random().toString(),
                category: '숙소',
                title: item.recommendation!.title,
                image: item.recommendation!.image,
                rating: 4.5,
                price: item.recommendation!.price,
              })}
            />
          )}
          {item.itinerary && item.itinerary.length > 0 && (
            <TravelItinerary 
              items={item.itinerary} 
              onSpotPress={(spot) => Alert.alert(spot.name, spot.description)}
            />
          )}
        </View>
        {isUser && (
          <View style={styles.avatarUser}>
            <UserIcon color={Colors.secondary} size={16} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 여행 컨시어지</Text>
        <View style={{width: 24}} />
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList 
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
        />
        
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.textInput}
            placeholder="여행에 대해 물어보세요..."
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
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  container: {
    flex: 1,
  },
  chatContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperBot: {
    justifyContent: 'flex-start',
  },
  avatarBot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarUser: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: Spacing.md,
    borderRadius: 16,
  },
  messageBubbleBot: {
    backgroundColor: Colors.secondary,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  messageBubbleUser: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  messageTextBot: {
    color: Colors.text,
  },
  messageTextUser: {
    color: Colors.secondary,
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
    backgroundColor: Colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
