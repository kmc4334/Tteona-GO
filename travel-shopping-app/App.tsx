import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { CartProvider } from './src/store/CartContext';
import { PackageProvider } from './src/store/PackageContext';
import { ActivityProvider } from './src/store/ActivityContext';
import { NotificationProvider } from './src/store/NotificationContext';
import { BudgetProvider } from './src/store/BudgetContext';
import { AuthProvider } from './src/store/AuthContext';
import { WeatherProvider } from './src/store/WeatherContext';
import { ScheduleProvider } from './src/store/ScheduleContext';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>앱 실행 중 오류가 발생했습니다</Text>
          <Text style={styles.errorText}>{this.state.error?.message}</Text>
          <Text style={styles.errorHint}>앱을 다시 시작해주세요</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  console.log('🚀 App component mounting...');
  
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <PackageProvider>
              <ActivityProvider>
                <NotificationProvider>
                  <BudgetProvider>
                    <WeatherProvider>
                      <ScheduleProvider>
                        <AppNavigator />
                      </ScheduleProvider>
                    </WeatherProvider>
                  </BudgetProvider>
                </NotificationProvider>
              </ActivityProvider>
            </PackageProvider>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4D4F',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorHint: {
    fontSize: 12,
    color: '#999',
  },
});
