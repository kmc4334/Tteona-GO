import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState<boolean>(false);
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

  const handleSendQuery = async (query: string) => {
    if (!query.trim() || isSending) return;

    const newUserMsg: Message = { id: Date.now().toString(), type: 'user', text: query };
    setMessages(prev => [...prev, newUserMsg]);
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: query })
      });
      const data = await response.json();

      if (data.success) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: data.botMessage.content,
          recommendation: data.botMessage.recommendation ?? undefined,
          itinerary: data.botMessage.itinerary ?? undefined,
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: '응답을 받지 못했습니다. 다시 시도해주세요.',
      };
      setMessages(prev => [...prev, errMsg]);
      setTimeout(() => setIsSending(false), 3000);
      return;
    } finally {
      setIsSending(false);
    }
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
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 여행 컨시어지</Text>
        <View style={{width: 24}} />
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        <FlatList 
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        />
        
        {isSending && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.accent} />
          </View>
        )}

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.sm }]}>
          <TextInput 
            style={[styles.textInput, isSending && styles.textInputDisabled]}
            placeholder="여행에 대해 물어보세요..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            editable={!isSending}
            returnKeyType="send"
          />
          <TouchableOpacity style={[styles.sendButton, isSending && styles.sendButtonDisabled]} onPress={handleSend} disabled={isSending}>
            <Send color={Colors.secondary} size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
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
      } as any,
    }),
  },
  sendButton: {
    backgroundColor: Colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
  loadingContainer: {
    paddingVertical: 8,
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
  },
  textInputDisabled: {
    opacity: 0.5,
  },
});
