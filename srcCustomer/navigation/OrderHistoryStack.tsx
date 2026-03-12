import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CartScreen from '../screens/CartScreen/CartScreen';
import CheckoutScreen from '../screens/checkoutScreen/CheckOutScreen';
import OrderHistoryScreen from '../screens/orderHistory/OrderHistory';
import OrderDetails from '../screens/orderHistory/OrderDetails';
import LiveOrderScreen from '../screens/orderTrackingScreen/OrderTrackingScreen';

export type OrderHistoryStackParamList = {
  History: undefined;
  OrderDetails: { params?: any };
  OrderTrackingScreen: { orderId?: any };
};

const Stack = createNativeStackNavigator<OrderHistoryStackParamList>();

const OrderHistoryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="History" component={OrderHistoryScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetails} />
     <Stack.Screen name="OrderTrackingScreen" component={LiveOrderScreen} />
  </Stack.Navigator>
);

export default OrderHistoryStack;
