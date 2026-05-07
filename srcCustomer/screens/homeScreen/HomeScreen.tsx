import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Added for persistence
import PromoCarousel from '../../components/carousel/PromoCarousel';
import ProductCardComponent from '../../components/ProductCardComponent';
import CategoryCard from '../../components/CategoryCard';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ThemeContext';
import { SVG_ICONS } from '../../assets/icons/svg';
import Icon from '../../../Icon';
import i18n from '../../utilities/i18n'; // Added to change language globally

import {
  getFeaturedProducts,
  getTodaysDeals,
  getHeroBanners,
  getExclusiveOffers,
  mainCategory,
} from '../../api/products/productsApi';

const MAX_HOME_CATEGORIES = 4; // Only 4 for the home screen grid
const CATEGORY_GRADIENTS = [
  ['#10B981', '#059669'], // Fresh Market (Green)
  ['#3B82F6', '#2563EB'], // Frozen Goods (Blue)
  ['#F59E0B', '#D97706'], // Chilled & Dairy (Orange)
  ['#EC4899', '#DB2777'], // Pantry (Pink)
];

const CustomerHomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const renderDealItem = useCallback(
    ({ item }: { item: any }) => (
      <ProductCardComponent item={item} cardWidth={180} isFlashDeal={true} />
    ),
    [],
  );
  const renderFeaturedItem = useCallback(
    ({ item }: { item: any }) => <ProductCardComponent item={item} cardWidth={180} />,
    [],
  );

  const [todaysDeals, setTodaysDeals] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  // Timer Calculation Logic
  useEffect(() => {
    if (todaysDeals.length === 0) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(todaysDeals[0].end_time).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('00:00:00');
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let formattedTime = '';
        if (days > 0) formattedTime += `${days}d `;
        formattedTime += `${hours.toString().padStart(2, '0')}h `;
        formattedTime += `${minutes.toString().padStart(2, '0')}m `;
        formattedTime += `${seconds.toString().padStart(2, '0')}s`;

        setTimeLeft(formattedTime);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [todaysDeals]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Check and Set Saved Language BEFORE fetching data
        const savedLanguage = await AsyncStorage.getItem('user-language');
        if (savedLanguage && i18n.language !== savedLanguage) {
          await i18n.changeLanguage(savedLanguage);
        }

        // 2. Fetch API Data
        const [bannersRes, featuredRes, dealsRes, categoriesRes] = await Promise.all([
          getHeroBanners().catch(() => []),
          getFeaturedProducts().catch(() => []),
          getTodaysDeals().catch(() => []),
          mainCategory({ search: '' }).catch(() => []),
        ]);

        setHeroBanners(bannersRes || []);
        setFeaturedProducts(featuredRes || []);
        setTodaysDeals(dealsRes || []);
        setCategories((categoriesRes || []).slice(0, MAX_HOME_CATEGORIES));
      } catch (error) {
        // console.error('Fetch error:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isInitialLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <PromoCarousel data={heroBanners} />

        {/* ── FLASH SALES SECTION ── */}
        {todaysDeals.length > 0 && (
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.titleWithTimer}>
                <Text style={styles.sectionTitle}>{t('flash_sales')}</Text>
                <View style={styles.timerBadge}>
                  <Icon xml={SVG_ICONS.dealsTimer} size={12} color="red" />
                  <Text style={styles.timerText}>{timeLeft}</Text>
                </View>
              </View>
            </View>

            <FlatList
              data={todaysDeals}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listPadding}
              renderItem={renderDealItem}
            />
          </View>
        )}

        {/* ── CATEGORIES GRID ── */}
        {categories.length > 0 && (
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('product_categories')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>{t('view_all')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.categoryGrid}>
              {categories.slice(0, 4).map((item, index) => {
                const gradient = CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length];
                return (
                  <View key={item.id} style={styles.categoryGridItem}>
                    <CategoryCard
                      title={item.name}
                      count={item?.categories?.length || 0}
                      iconName={SVG_ICONS.menuIcon}
                      useFullBackground={true}
                      gradientColors={gradient}
                      showBadge={false}
                      onChange={() => 
                        navigation.navigate('SubCategories', { 
                          categoryId: item.id, 
                          title: item.name 
                        })
                      }
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── FEATURED PRODUCTS ── */}
        {featuredProducts.length > 0 && (
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('featured_products')}</Text>
            </View>
            <FlatList
              data={featuredProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listPadding}
              renderItem={renderFeaturedItem}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sectionWrapper: { marginBottom: 25, marginTop: 10 },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 15,
    },
    titleWithTimer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionTitle: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
    timerBadge: { 
      backgroundColor: '#F43F5E33', 
      paddingHorizontal: 8, 
      paddingVertical: 4, 
      borderRadius: 6, 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 5,
      borderWidth: 1,
      borderColor: '#F43F5E'
    },
    timerText: { color: '#F43F5E', fontSize: 12, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    viewAllText: { fontSize: 14, fontWeight: '700' },
    listPadding: { paddingHorizontal: 16 },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 10,
      justifyContent: 'space-between',
    },
    categoryGridItem: {
      width: '48%',
      marginBottom: 12,
    },
  });

export default CustomerHomeScreen;