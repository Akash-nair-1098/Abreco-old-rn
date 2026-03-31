import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomHeader from '../components/CustomHeader';
import CustomerHomeScreen from '../screens/homeScreen/HomeScreen';
import CategoryStack from './CategoryStack';
import OrderHistoryStack from './OrderHistoryStack';
import ProductStack from './ProductStack';
import ProfileStack from './ProfileStack';
import CartStack from './CartStack';
import OrderDetails from '../screens/orderHistory/OrderDetails';
import ProductDetailsScreen from '../screens/products/ProductDetails';
import TransactionScreen from '../screens/transactionScreen/TransactionScreen';
import BranchLocationScreen from '../screens/profile/BranchLocationScreen';
import LiveOrderScreen from '../screens/orderTrackingScreen/OrderTrackingScreen';
import InvoicesScreen from '../screens/profile/InvoiceScreen';
import WishlistScreen from '../screens/WishListScreen/WishListScreen';
import Icon from '../../Icon';
import { SVG_ICONS } from '../assets/icons/svg';
import { VoiceSearchFloatingUI } from '../components/VoiceSearchFloatingButton';
import { useTheme } from '../../ThemeContext';
import SearchStack from './SearchStack';

const Tab = createBottomTabNavigator();

export function CustomerTabNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          header: () => {
            // Hide header for specific stacks if they handle their own headers
            if (route.name === 'Profile') {
              return null;
            }
            return <CustomHeader title={route.name} />;
          },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: isDark ? 0 : 1,
            borderTopColor: colors.border,
            height: 70,
            paddingBottom: 10,
            elevation: 8, // Shadow for Android
            shadowColor: '#000', // Shadow for iOS
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: isDark ? 0 : 0.1,
            shadowRadius: 4,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = SVG_ICONS.house;
            else if (route.name === 'Categories')
              iconName = SVG_ICONS.collection;
            else if (route.name === 'Products') iconName = SVG_ICONS.products;
            else if (route.name === 'History') iconName = SVG_ICONS.orders;
            else if (route.name === 'Profile') iconName = SVG_ICONS.profile;

            return <Icon xml={iconName} size={size} color={color} />;
          },
        })}
      >
        {/* Main Visible Tabs */}
        <Tab.Screen name="Home" component={CustomerHomeScreen} />
        <Tab.Screen name="Categories" component={CategoryStack} />
        <Tab.Screen name="Products" component={ProductStack} />
        <Tab.Screen name="History" component={OrderHistoryStack} />
        <Tab.Screen name="Profile" component={ProfileStack} />

        {/* Hidden Screens (Navigable but not in the Bottom Bar) */}
        {[
          { name: 'OrderDetails', component: OrderDetails },
          { name: 'ProductDetails', component: ProductDetailsScreen },
          { name: 'CartStack', component: CartStack },
          { name: 'TransactionScreen', component: TransactionScreen },
          { name: 'BranchLocationScreen', component: BranchLocationScreen },
          { name: 'OrderTrackingScreen', component: LiveOrderScreen },
          { name: 'InvoiceScreen', component: InvoicesScreen },
          { name: 'WishlistScreen', component: WishlistScreen },
          { name: 'SearchStack', component: SearchStack },
        ].map(screen => (
          <Tab.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={{
              tabBarButton: () => null,
              tabBarItemStyle: { display: 'none' },
            }}
          />
        ))}
      </Tab.Navigator>

      {/* Voice Search Floating UI remains over the tabs */}
      <VoiceSearchFloatingUI />
    </>
  );
}
