
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler'; // MUST BE THE FIRST LINE
import { StatusBar, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
// import { store } from './src/store';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { ThemeProvider } from './ThemeContext';
import { store } from './srcCustomer/store';
import CustomerAppNavigator from './srcCustomer/navigation/AppNavigator';
import { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  useEffect(() => {
    const init = async () => {
      // 1. Perform your initializations (API calls, state loading) here
    };

    init().finally(async () => {
      // 2. Hide the splash screen with a smooth fade
      await BootSplash.hide({ fade: true });
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Provider store={store}>
          <ActionSheetProvider>
            <CustomerAppNavigator />
          </ActionSheetProvider>
        </Provider>
      </ThemeProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;