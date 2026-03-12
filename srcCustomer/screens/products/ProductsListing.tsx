import React, { useCallback, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ThemeContext';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import ProductCardComponent from '../../components/ProductCardComponent';
import Dropdown from '../../components/DropDown';
import LoadingScreen from '../../components/LoadingScreen';
import FilterPopup from './components/FilterPopup';
import { useFocusEffect } from '@react-navigation/native';
import { useSearchStore } from '../../store/useSearchStore';
import { getProductList } from '../../api/products/productsApi';
import { useToast } from '../../components/ToastContext';

const ProductListingScreen = () => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  const [sortValue, setSortValue] = useState<string | undefined>('recommended');
  const [products, setProducts] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [filterParams, setFilterParams] = useState<any>({
    popular_filters: {},
    price_range: {},
  });

  const searchText = useSearchStore(state => state.searchText);
  const { showToast } = useToast();

  const SORT_OPTIONS = [
    { id: 'recommended', name: t('recommended') },
    { id: 'price_low', name: t('price_low') },
    { id: 'price_high', name: t('price_high') },
    { id: 'newest', name: t('newest') },
  ];

  const fetchProducts = async () => {
    try {
      const results = await getProductList({
        search: searchText,
        sort: sortValue,
        page: 1,
        page_size: 50,
        ...filterParams,
      });
      setProducts(results);
    } catch (error: any) {
      showToast(error?.message || 'Failed to load Products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const delayDebounceFn = setTimeout(() => {
        setLoading(true);
        fetchProducts();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }, [searchText, sortValue, filterParams]),
  );

  if (loading && products.length === 0) {
    return <LoadingScreen message={t('fetching_products')} />;
  }


  // console.log('products are', products);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={item => item?.id?.toString()}
        ListHeaderComponent={() => (
          <View style={styles.headerRow}>
            {/* Filter Button */}
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setFilterVisible(true)}
              activeOpacity={0.7}
            >
              <Icon xml={SVG_ICONS.filterIcon} size={15} color={colors.text} />
              <Text style={styles.btnText}>{t('filters')}</Text>
            </TouchableOpacity>

            {/* Sort Dropdown */}
            <Dropdown
              options={SORT_OPTIONS}
              value={sortValue}
              onChange={val => setSortValue(val.id)}
              leftIcon={SVG_ICONS.sortIcon}
              dropDownStyles={{ flex: 1 }}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => <ProductCardComponent item={item} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon xml={SVG_ICONS.orderBox} size={60} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>{t('no_products_found')}</Text>
            <Text style={styles.emptySubtitle}>{t('no_products_desc')}</Text>
          </View>
        )}
      />

      <FilterPopup
        visible={isFilterVisible}
        initialValues={filterParams}
        onClose={() => setFilterVisible(false)}
        onApply={data => {
          setFilterParams(data);
          setFilterVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

// --- Themed Styles ---

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      alignItems: 'center',
    },
    filterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 48,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      gap: 8,
      width: '45%',
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    btnText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    listContent: {
      paddingBottom: 24,
      flexGrow: 1,
    },
    columnWrapper: {
      justifyContent: 'flex-start',
      paddingHorizontal: 8, // Adjusted to work with ProductCard margins
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 80,
      paddingHorizontal: 40,
    },
    emptyIconCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    emptySubtitle: {
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 10,
      lineHeight: 22,
      fontSize: 14,
    },
  });

export default ProductListingScreen;
