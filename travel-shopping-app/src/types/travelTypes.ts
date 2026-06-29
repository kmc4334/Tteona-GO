import { NavigatorScreenParams } from '@react-navigation/native';
import { UserAnswers } from '../utils/personalityAnalyzer';

export type RootStackParamList = {
  Intro: undefined;
  Login: undefined;
  Signup: undefined;
  Welcome: undefined;
  ProfileSetup: undefined;
  InterestSelection: undefined;
  TravelPreferences: undefined;
  ResultPreview: undefined;
  AIReview: undefined;
  Weather: undefined;
  Map: { lat: number; lng: number; title: string };
  Main: NavigatorScreenParams<BottomTabParamList>;
  Concierge: { initialQuery?: string } | undefined;
  CreatePackage: undefined;
  ProductDetail: { product: any } | undefined;
  PathFinding: undefined;
  MyActivity: undefined;
  Notification: undefined;
  Settings: undefined;
  PersonalInfo: undefined;
  ChangeName: undefined;
  ChangeEmail: undefined;
  ChangePassword: undefined;
  PersonalityTest: undefined;
  PersonalityResult: { answers?: UserAnswers; savedResult?: any };
};

export type BottomTabParamList = {
  Home: undefined;
  AIRecommend: undefined;
  Package: undefined;
  Schedule: undefined;
  CartTab: undefined;
  Profile: undefined;
};

export type TravelCategory = '숙소' | '관광지' | '체험' | '교통수단' | '기타';

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
