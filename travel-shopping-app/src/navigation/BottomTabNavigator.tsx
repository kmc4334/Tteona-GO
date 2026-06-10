import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Sparkles, Calendar, Plus, ShoppingCart, User } from 'lucide-react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CartScreen } from '../screens/CartScreen';
import { ConciergeScreen } from '../screens/ConciergeScreen';
import { CreatePackageScreen } from '../screens/CreatePackageScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { BottomTabParamList } from '../types/travelTypes';
import { Colors } from '../theme/colors';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// Dummy screens for UI layout
const DummyScreen = () => <View style={{ flex: 1, backgroundColor: Colors.background }} />;

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: Colors.primary, // Sky blue primary color
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.secondary,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 0,
          shadowOpacity: 0,
          height: 110, // Increased to 100
          paddingBottom: 32, // More padding to balance height change
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        }
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => <Home color={color} size={20} />
        }}
      />
      <Tab.Screen
        name="AIRecommend"
        component={ConciergeScreen}
        options={{
          tabBarLabel: 'AI 추천',
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={20} />
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarLabel: '일정',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={20} />
        }}
      />
      <Tab.Screen
        name="Package"
        component={CreatePackageScreen}
        options={{
          tabBarLabel: '패키지',
          tabBarIcon: ({ color, size }) => <Plus color={color} size={20} />,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 4, // use normal margin as icon is absolute
          }
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: '장바구니',
          tabBarIcon: ({ color, size }) => {
            const { cartItems } = require('../store/CartContext').useCart();
            return (
              <View>
                <ShoppingCart color={color} size={20} />
                {cartItems.length > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: -5,
                    right: -10,
                    backgroundColor: Colors.error,
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                  }}>
                    <Text style={{ color: Colors.secondary, fontSize: 10, fontWeight: 'bold' }}>
                      {cartItems.length}
                    </Text>
                  </View>
                )}
              </View>
            );
          }
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '마이',
          tabBarIcon: ({ color, size }) => <User color={color} size={20} />
        }}
      />
    </Tab.Navigator>
  );
};
