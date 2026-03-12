// NavigationService.ts
import {
  createNavigationContainerRef,
  StackActions,
  CommonActions,
} from '@react-navigation/native';
import { ProfileStackParamList } from '../navigation/ProfileStack'; // Path to your types
import { RootStackParamList } from './mainCustomerNavigator';
import { CartStackParamList } from './CartStack';
import { CategoryStackParamList } from './CategoryStack';
import { ProductStackParamList } from './ProductStack';
import { OrderHistoryStackParamList } from './OrderHistoryStack';
import { SearchStackParamList } from './SearchStack';

// Combine all possible screens for the global ref
type AllScreensParamList = RootStackParamList &
  ProfileStackParamList &
  CartStackParamList &
  CategoryStackParamList &
  ProductStackParamList &
  OrderHistoryStackParamList &
  SearchStackParamList;

export const navigationRef =
  createNavigationContainerRef<AllScreensParamList>();

export const navigate = <RouteName extends keyof AllScreensParamList>(
  name: RouteName,
  params?: AllScreensParamList[RouteName],
) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
};

export const push = (name: string, params?: object) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  }
};

export const goBack = () => {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
};
