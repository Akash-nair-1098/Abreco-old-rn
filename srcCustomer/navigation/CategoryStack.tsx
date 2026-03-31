import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoryScreen from '../screens/categories/CategoryScreen';
import SubCategoryScreen from '../screens/categories/SubCategoryScreen';
import ProductListingScreen from '../screens/categoryProductListingScreen/CategoryProductListing';
import CategoryProductListing from '../screens/categoryProductListingScreen/CategoryProductListing';

export type CategoryStackParamList = {
  Categories: undefined;
  SubCategories: { categoryId: string,
    title: string,
    subCategories: string};
  CategoryProductListing: { params?: any };
};

const Stack = createNativeStackNavigator<CategoryStackParamList>();

const CategoryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Categories" component={CategoryScreen} />
    <Stack.Screen name="SubCategories" component={SubCategoryScreen} />
    <Stack.Screen
      name="CategoryProductListing"
      component={CategoryProductListing}
    />
  </Stack.Navigator>
);

export default CategoryStack;
