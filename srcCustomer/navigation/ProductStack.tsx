import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CartScreen from '../screens/CartScreen/CartScreen';
import CheckoutScreen from '../screens/checkoutScreen/CheckOutScreen';
import ProductListingScreen from '../screens/products/ProductsListing';
import ProductDetailsScreen from '../screens/products/ProductDetails';
import { VoiceSearchScreen } from '../screens/VoiceSearchScreen';

export type ProductStackParamList = {
  ProductListing: undefined;
  ProductDetails: { id: any };
  // VoiceSearchScreen: { results: any; term: any };
  //   CategoryProductListing: { params?: any };
};

const Stack = createNativeStackNavigator<ProductStackParamList>();

const ProductStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProductListing" component={ProductListingScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    {/* <Stack.Screen name="VoiceSearchScreen" component={VoiceSearchScreen} /> */}
  </Stack.Navigator>
);

export default ProductStack;
