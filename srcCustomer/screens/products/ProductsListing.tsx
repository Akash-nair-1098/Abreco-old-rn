import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  FlatList,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
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

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 32 - 12) / 2;

const ProductListingScreen = ({ navigation, route }: any) => {
  const { offerId } = route.params || {};
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  const [sortValue, setSortValue] = useState<string | undefined>('recommended');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [filterParams, setFilterParams] = useState<any>({
    popular_filters: {},
    price_range: {},
  });

  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isError, setIsError] = useState(false); // NEW: Track network errors

  const searchText = useSearchStore(state => state.searchText);
  const { showToast } = useToast();

  const SORT_OPTIONS = [
    { id: 'recommended', name: t('recommended') },
    { id: 'price_low', name: t('price_low') },
    { id: 'price_high', name: t('price_high') },
    { id: 'newest', name: t('newest') },
  ];

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      const state = navigation.getState();
      const currentRouteName = state.routes[state.index]?.name;
      if (currentRouteName !== 'ProductDetails' && currentRouteName !== 'ProductListing') {
        navigation.setParams({ offerId: undefined });
      }
    });
    return unsubscribe;
  }, [navigation]);

  const fetchProducts = async (pageNum: number, isInitial: boolean = false) => {
    // 1. Guard Clause: Don't call if already loading or if there's an unresolved error
    if (!isInitial && (isFetchingMore || isError || !hasMore)) return;

    try {
      if (isInitial) {
        setLoading(true);
        setIsError(false);
        setPage(1);
      } else {
        setIsFetchingMore(true);
      }

      const results = await getProductList({
        search: searchText,
        sort: sortValue,
        page: pageNum,
        page_size: 20,
        offer_id: offerId,
        ...filterParams,
      });

      if (isInitial) {
        setProducts(results || []);
        // console.log('products is', results);
      } else {
        setProducts(prev => [...prev, ...results]);
      }

      setHasMore(results?.length >= 20);
      setIsError(false); // Reset error state on success
    } catch (error: any) {
      setIsError(true);
      showToast(error?.message || t('failed_load_products'), 'error');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const delayDebounceFn = setTimeout(() => {
        fetchProducts(1, true);
      }, 400);

      return () => clearTimeout(delayDebounceFn);
    }, [searchText, sortValue, filterParams, offerId])
  );

  const handleLoadMore = () => {
    // Only increment and fetch if everything is clear
    if (!isFetchingMore && hasMore && !loading && !isError) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, false);
    }
  };

  const handleRetry = () => {
    setIsError(false);
    fetchProducts(page, false);
  };

  const handleClearOffer = () => {
    setProducts([]);
    navigation.setParams({ offerId: undefined });
  };

  if (loading && products.length === 0) {
    return <LoadingScreen message={t('fetching_products')} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item, index) => `${item?.id || index}-${index}`}
        ListHeaderComponent={() => (
          <View>
            {offerId && (
              <View style={styles.tagWrapper}>
                <View style={styles.filterTag}>
                  <Text style={styles.filterTagText}>{t('offer_results')}</Text>
                  <TouchableOpacity onPress={handleClearOffer} style={styles.tagCloseBtn}>
                    <Icon xml={SVG_ICONS.closeIcon} size={10} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.filterBtn}
                onPress={() => setFilterVisible(true)}
                activeOpacity={0.7}
              >
                <Icon xml={SVG_ICONS.filterIcon} size={15} color={colors.text} />
                <Text style={styles.btnText}>{t('filters')}</Text>
              </TouchableOpacity>

              <Dropdown
                options={SORT_OPTIONS}
                value={sortValue}
                onChange={val => setSortValue(val.id)}
                leftIcon={SVG_ICONS.sortIcon}
                dropDownStyles={{ flex: 1 }}
              />
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <ProductCardComponent item={item} />
          </View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2} // Threshold reduced to avoid aggressive firing
        ListFooterComponent={() => {
          if (isFetchingMore) {
            return (
              <View style={styles.loaderFooter}>
                <ActivityIndicator color={colors.primary} />
              </View>
            );
          }
          if (isError && products.length > 0) {
            return (
              <TouchableOpacity style={styles.retryFooter} onPress={handleRetry}>
                <Text style={styles.retryText}>{t('retry')}</Text>
              </TouchableOpacity>
            );
          }
          return null;
        }}
        ListEmptyComponent={() => (
          !loading ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon xml={isError ? SVG_ICONS.infoIcon : SVG_ICONS.orderBox} size={60} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {isError ? t('network_error') : t('no_products_found')}
              </Text>
              <Text style={styles.emptySubtitle}>
                {isError ? t('check_connection') : t('no_products_desc')}
              </Text>
              {isError && (
                <TouchableOpacity style={styles.errorRetryBtn} onPress={() => fetchProducts(1, true)}>
                  <Text style={styles.errorRetryText}>{t('retry')}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
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

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    headerRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 8,
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
    btnText: { fontSize: 14, fontWeight: '600', color: colors.text },
    listContent: { paddingBottom: 24, paddingHorizontal: 10 },
    columnWrapper: { justifyContent: 'space-between', marginBottom: 12 },
    cardContainer: { width: ITEM_WIDTH },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyIconCircle: {
      width: 100, height: 100, borderRadius: 50,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
    emptySubtitle: { color: colors.textMuted, textAlign: 'center', marginTop: 10, lineHeight: 22, fontSize: 14 },
    loaderFooter: { marginVertical: 20, alignItems: 'center' },
    retryFooter: { padding: 15, alignItems: 'center' },
    retryText: { color: colors.primary, fontWeight: 'bold', fontSize: 14 },
    errorRetryBtn: { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 25, paddingVertical: 10, borderRadius: 20 },
    errorRetryText: { color: '#fff', fontWeight: 'bold' },
    tagWrapper: { paddingHorizontal: 16, paddingTop: 7, flexDirection: 'row' },
    filterTag: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '15',
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.primary + '30',
    },
    filterTagText: { color: colors.primary, fontSize: 12, fontWeight: 'bold', marginRight: 6 },
    tagCloseBtn: { backgroundColor: colors.primary + '25', borderRadius: 10, padding: 3 },
  });

export default ProductListingScreen;