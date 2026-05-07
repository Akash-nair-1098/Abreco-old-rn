import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../../ThemeContext';
import ProductCardComponent from '../../components/ProductCardComponent';
import { SVG_ICONS } from '../../assets/icons/svg';
import Icon from '../../../Icon';
import { getProductList } from '../../api/products/productsApi';
import { useFocusEffect } from '@react-navigation/native';
import LoadingScreen from '../../components/LoadingScreen';

const CategoryProductListing = ({ navigation, route }: any) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const { params } = route.params || {};
  const categoryTitle = params?.title || 'Products';
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any>([]);

  const fetchProducts = async () => {
    // Only show full loading if we have no products yet
    if (products.length === 0) setLoading(true);
    try {
      const results = await getProductList({
        main_categories: [params.mainCategoryId],
        categories: [params.categoryId],
        page: 1,
        page_size: 40,
      });
      setProducts(results);
    } catch (error) {
      // console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [params.categoryId]),
  );

  if (loading) {
    return <LoadingScreen message="Fetching products..." />;
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <Icon xml={SVG_ICONS.orderBox} size={40} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Products Found</Text>
      <Text style={styles.emptySubtitle}>
        We couldn't find any products in this category at the moment.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.backIconCircle}>
          <Icon xml={SVG_ICONS.backIcon} color={colors.text} size={20} />
        </View>
        <Text style={styles.backText}>Back to Sub Categories</Text>
      </TouchableOpacity>

      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.mainTitle}>{categoryTitle}</Text>
        <Text style={styles.subTitle}>Showing best results for you.</Text>
      </View>

      {/* Grid List */}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ProductCardComponent item={item} />}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 10,
    },
    backIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    backText: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 10,
      color: colors.text,
    },
    header: {
      paddingHorizontal: 16,
      marginVertical: 24,
    },
    mainTitle: {
      fontSize: 34,
      fontWeight: '900',
      color: colors.text,
    },
    subTitle: {
      fontSize: 18,
      marginTop: 4,
      color: colors.textMuted,
    },
    listContent: {
      paddingHorizontal: 12,
      paddingBottom: 20,
    },
    columnWrapper: {
      justifyContent: 'space-between',
    },

    // Empty State Styles
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 100,
      paddingHorizontal: 40,
    },
    emptyIconBox: {
      width: 80,
      height: 80,
      backgroundColor: colors.surface,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

export default CategoryProductListing;
