import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CartScreen from '../screens/CartScreen/CartScreen';
import CheckoutScreen from '../screens/checkoutScreen/CheckOutScreen';
import ProductListingScreen from '../screens/products/ProductsListing';
import ProductDetailsScreen from '../screens/products/ProductDetails';
import { VoiceSearchScreen } from '../screens/VoiceSearchScreen';

export type SearchStackParamList = {
  VoiceSearchScreen: { results: any; term: any; isGlobalSearch?: boolean };
  ProductDetails: { id: any };
};

const Stack = createNativeStackNavigator<SearchStackParamList>();

const SearchStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="VoiceSearchScreen" component={VoiceSearchScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
  </Stack.Navigator>
);

export default SearchStack;
