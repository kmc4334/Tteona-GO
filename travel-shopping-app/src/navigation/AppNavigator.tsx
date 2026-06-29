import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ConciergeScreen } from '../screens/ConciergeScreen';
import { CreatePackageScreen } from '../screens/CreatePackageScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { MyActivityScreen } from '../screens/MyActivityScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { RootStackParamList } from '../types/travelTypes';
import { useAuth } from '../store/AuthContext';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { IntroScreen } from '../screens/IntroScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { InterestSelectionScreen } from '../screens/InterestSelectionScreen';
import { TravelPreferencesScreen } from '../screens/TravelPreferencesScreen';
import { ResultPreviewScreen } from '../screens/ResultPreviewScreen';
// AI 기반 여행 일정 검토 스크린
import { AIReviewScreen } from '../screens/AIReviewScreen';
import { WeatherScreen } from '../screens/WeatherScreen';
import { MapScreen } from '../screens/MapScreen';
import { PersonalInfoScreen } from '../screens/PersonalInfoScreen';
import { ChangeNameScreen } from '../screens/ChangeNameScreen';
import { ChangeEmailScreen } from '../screens/ChangeEmailScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { PathFindingScreen } from '../screens/PathFindingScreen';
import { PersonalityTestScreen } from '../screens/PersonalityTestScreen';
import { PersonalityResultScreen } from '../screens/PersonalityResultScreen';
import { BannerDetailScreen } from '../screens/BannerDetailScreen';
import { Colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  console.log('🗺️ AppNavigator rendering...');
  
  // 로그인 기능 임시 비활성화
  // const { isAuthenticated, loading, isOnboarded } = useAuth();

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
  //       <ActivityIndicator size="large" color={Colors.primary} />
  //     </View>
  //   );
  // }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 로그인/회원가입 기능 임시 비활성화 - 바로 메인 화면으로 */}
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name={"BannerDetail" as any} component={BannerDetailScreen} />
        <Stack.Screen name="AIReview" component={AIReviewScreen} />
        <Stack.Screen name="Weather" component={WeatherScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="TravelPreferences" component={TravelPreferencesScreen} />
        <Stack.Screen name="InterestSelection" component={InterestSelectionScreen} />
        <Stack.Screen name={"ResultPreview" as keyof RootStackParamList} component={ResultPreviewScreen} />
        <Stack.Screen name="Concierge" component={ConciergeScreen} />
        <Stack.Screen name="CreatePackage" component={CreatePackageScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="MyActivity" component={MyActivityScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="ChangeName" component={ChangeNameScreen} />
        <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="PathFinding" component={PathFindingScreen} />
        <Stack.Screen name="PersonalityTest" component={PersonalityTestScreen} />
        <Stack.Screen name="PersonalityResult" component={PersonalityResultScreen} />
        
        {/* 로그인/온보딩 화면들 (필요시 나중에 사용) */}
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
