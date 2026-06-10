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

export default function App() {
  return (
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
  );
}
