import React from 'react';
import { createNavigationContainerRef, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { ToastProvider } from '../../srcCustomer/components/ToastContext';
import { useTheme } from '../../ThemeContext';
import MainNavigator from './mainCustomerNavigator';
import { navigationRef } from './NavigationService';

const CustomerAppNavigator = () => {
  const { colors } = useTheme();

  const MyNavigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background, // This fixes the root white background
      card: colors.surface, // This fixes header/tabbar backgrounds
      text: colors.text,
    },
  };

// const navigationRef = createNavigationContainerRef<any>();

  return (
    <>
      <ToastProvider>
        <NavigationContainer ref={navigationRef} theme={MyNavigationTheme}>
          <MainNavigator />
        </NavigationContainer>
      </ToastProvider>
    </>
  );
};

export default CustomerAppNavigator;
