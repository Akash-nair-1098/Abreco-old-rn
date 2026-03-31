import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  StatusBar, 
  RefreshControl 
} from 'react-native';
import CategoryCard from '../../components/CategoryCard';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { mainCategory } from '../../api/products/productsApi';
import LoadingScreen from '../../components/LoadingScreen';
import { useToast } from '../../components/ToastContext';
import { getRandomGradient } from '../../utilities/theme';
import { useSearchStore } from '../../store/useSearchStore';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ThemeContext';

export default function CategoryScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [categoryData, setCategoryData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const searchText = useSearchStore(state => state.searchText);
  const { showToast } = useToast();

  // Unified fetch function
  const getCategoryData = async (isPullToRefresh = false) => {
    // Show full screen loader ONLY if no data exists and it's not a pull-to-refresh
    if (categoryData.length === 0 && !isPullToRefresh) {
      setLoading(true);
    }

    try {
      const payload = { search: searchText };
      const data = await mainCategory(payload);
      setCategoryData(data || []);
      console.log('categories response is', data)
    } catch (error: any) {
      showToast(error?.message || t('failed_fetch_categories'), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 1. Initial Load: Fetch data once when component mounts
  useEffect(() => {
    getCategoryData();
  }, []);

  // 2. Handle Search: Only fetch when searchText changes (with debounce)
  // Removed focus-based fetching to prevent redundant calls on tab switch
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchText.length > 2 || searchText.length === 0) {
        getCategoryData();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  // 3. Manual Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getCategoryData(true);
  }, [searchText]);

  const memoizedGradients = useMemo(() => {
    return categoryData.map(() => {
      return typeof getRandomGradient === 'function'
        ? getRandomGradient()
        : [colors.primary, colors.primary];
    });
  }, [categoryData, colors.primary]);

  const handleCategoryPress = (item: any) => {
    navigation.navigate('SubCategories', {
      categoryId: item.id,
      title: item.name,
      subCategories: item.categories,
    });
  };

  // Full screen loading only for the very first fetch with no data
  if (loading && categoryData.length === 0) {
    return (
      <LoadingScreen
        message={t('fetching_categories')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]} // Android
          />
        }
      >
        <View style={styles.headerRow}>
          <Icon xml={SVG_ICONS.productsBag} color={colors.primary} size={28} />
          <Text style={styles.headerTitle}>{t('products')}</Text>
        </View>

        <View style={styles.grid}>
          {categoryData?.map((item: any, index: number) => {
            const randomPalette = memoizedGradients[index] || [
              colors.surface,
              colors.border,
            ];
            const titleColor = isDark ? randomPalette[0] : colors.text;

            return (
              <CategoryCard
                key={item.id}
                title={item.name}
                count={item?.categories?.length || 0}
                iconName={SVG_ICONS.menuIcon}
                gradientColors={randomPalette}
                showBadge={false}
                titleColor={titleColor}
                onChange={() => handleCategoryPress(item)}
              />
            );
          })}
        </View>

        {categoryData.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('no_categories')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      marginTop: 10,
      paddingHorizontal: 16,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 26,
      fontWeight: 'bold',
      marginLeft: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: 50,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 16,
    },
  });