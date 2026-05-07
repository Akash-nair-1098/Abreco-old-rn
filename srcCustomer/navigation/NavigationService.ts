// NavigationService.ts
import {
  createNavigationContainerRef,
  StackActions,
  CommonActions,
} from '@react-navigation/native';
import type { ProfileStackParamList } from '../navigation/ProfileStack'; // types only
import type { RootStackParamList } from './mainCustomerNavigator';
import type { CartStackParamList } from './CartStack';
import type { CategoryStackParamList } from './CategoryStack';
import type { ProductStackParamList } from './ProductStack';
import type { OrderHistoryStackParamList } from './OrderHistoryStack';
import type { SearchStackParamList } from './SearchStack';

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
