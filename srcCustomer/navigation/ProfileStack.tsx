import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CartScreen from '../screens/CartScreen/CartScreen';
import CheckoutScreen from '../screens/checkoutScreen/CheckOutScreen';
import ProductListingScreen from '../screens/products/ProductsListing';
import ProductDetailsScreen from '../screens/products/ProductDetails';
import BranchLocationScreen from '../screens/profile/BranchLocationScreen';
import TransactionScreen from '../screens/transactionScreen/TransactionScreen';
import InvoicesScreen from '../screens/profile/InvoiceScreen';
import LiveOrderScreen from '../screens/orderTrackingScreen/OrderTrackingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LegalDocScreen from '../screens/profile/LegalDocsScreen';
import SOAScreen from '../screens/profile/SOAScreen';

export type ProfileStackParamList = {
  BranchLocationScreen: undefined;
  TransactionScreen: undefined;
  InvoiceScreen: undefined;
  SOAScreen: undefined;
  OrderTrackingScreen: undefined;
  ProfileScreen: undefined;
  LegalDocScreen: { docType : any};
  //   CategoryProductListing: { params?: any };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen
      name="BranchLocationScreen"
      component={BranchLocationScreen}
    />
    <Stack.Screen name="TransactionScreen" component={TransactionScreen} />
    <Stack.Screen name="SOAScreen" component={SOAScreen} />
    <Stack.Screen name="InvoiceScreen" component={InvoicesScreen} />
    <Stack.Screen name="OrderTrackingScreen" component={LiveOrderScreen} />
    <Stack.Screen name="LegalDocScreen" component={LegalDocScreen} />
  </Stack.Navigator>
);

export default ProfileStack;
