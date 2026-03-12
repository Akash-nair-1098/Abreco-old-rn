import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import CategoryCard from '../../components/CategoryCard';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { mainCategory } from '../../api/products/productsApi';
import LoadingScreen from '../../components/LoadingScreen';
import { useToast } from '../../components/ToastContext';
import { getRandomGradient } from '../../utilities/theme'; // Ensure this is exported
import { useSearchStore } from '../../store/useSearchStore';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ThemeContext';

export default function CategoryScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [categoryData, setCategoryData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const searchText = useSearchStore(state => state.searchText);
  const { showToast } = useToast();

  const getCategoryData = async () => {
    // Only show full loading if we have no data yet
    if (categoryData.length === 0) setLoading(true);
    try {
      const payload = { search: searchText };
      const data = await mainCategory(payload);
      setCategoryData(data || []);
    } catch (error: any) {
      showToast(error?.message || 'Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Memoize gradients to prevent reshuffling on every re-render
  const memoizedGradients = useMemo(() => {
    return categoryData.map(() => {
      // Safety check: call function if it exists, else provide fallback
      return typeof getRandomGradient === 'function'
        ? getRandomGradient()
        : [colors.primary, colors.primary];
    });
  }, [categoryData, colors.primary]);

  useFocusEffect(
    useCallback(() => {
      const delayDebounceFn = setTimeout(() => {
        if (searchText.length > 2 || searchText.length === 0) {
          getCategoryData();
        }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }, [searchText]),
  );

  const handleCategoryPress = (item: any) => {
    navigation.navigate('SubCategories', {
      categoryId: item.id,
      title: item.name,
      subCategories: item.categories,
    });
  };

  if (loading) {
    return (
      <LoadingScreen
        message={t('fetching_categories') || 'Fetching categories...'}
      />
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.headerRow}>
        <Icon xml={SVG_ICONS.productsBag} color={colors.primary} size={28} />
        <Text style={styles.headerTitle}>{t('products') || 'Products'}</Text>
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
    </ScrollView>
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
  });
