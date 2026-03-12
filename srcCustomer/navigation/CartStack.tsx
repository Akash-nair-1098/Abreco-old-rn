import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CartScreen from "../screens/CartScreen/CartScreen";
import CheckoutScreen from "../screens/checkoutScreen/CheckOutScreen";

export type CartStackParamList = {
  Cart: undefined;
  Checkout: { grandTotal?: any };
  //   CategoryProductListing: { params?: any };
};

const Stack = createNativeStackNavigator<CartStackParamList>();

const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
  </Stack.Navigator>
);

export default CartStack;
