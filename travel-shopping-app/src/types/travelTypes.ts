import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Intro: undefined;
  Login: undefined;
  Signup: undefined;
  Welcome: undefined;
  ProfileSetup: undefined;
  InterestSelection: undefined;
  TravelPreferences: undefined;
  AIReview: undefined;
  Weather: undefined;
  Map: undefined;
  Main: NavigatorScreenParams<BottomTabParamList>;
  Concierge: { initialQuery?: string } | undefined;
  CreatePackage: undefined;
  MyActivity: undefined;
  Notification: undefined;
  Settings: undefined;
  PersonalInfo: undefined;
  ChangeName: undefined;
  ChangeEmail: undefined;
  ChangePassword: undefined;
  PersonalityQuiz: undefined;
  PersonalityResult: { result: any };
  ResultPreview: undefined;
  ProductDetail: { product: any };
  Checkout: { items: CheckoutItem[]; subtotal: number; discountAmount?: number };
  OrderComplete: { order: OrderResult };
};

export type BottomTabParamList = {
  Home: undefined;
  AIRecommend: undefined;
  Package: undefined;
  CartTab: undefined;
  Profile: undefined;
};

export type TravelCategory = '숙소' | '관광지' | '체험' | '교통수단' | '기타';

export interface CheckoutItem {
  productId: string;
  title: string;
  image: string;
  category: string;
  price: number;
  quantity: number;
  checkInDate?: string;
  checkOutDate?: string;
  nights?: number;
  experienceDate?: string;
  experienceSlot?: string;
  guests?: number;
}

export interface OrderResult {
  _id: string;
  orderNo: string;
  items: CheckoutItem[];
  subtotal: number;
  discountAmount: number;
  pointsUsed: number;
  finalAmount: number;
  pointsEarned: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

export interface TravelProduct {
  id: string;
  category: TravelCategory;
  title: string;
  image: string;
  rating: number;
  price: number;
  location?: string;
  // 예약 추가 필드 (optional)
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
  platform?: string;
  platformPrice?: number;
}
