import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  FlatList,
  Share,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ThemeContext';
import { PRODUCT_DATA } from '../../utilities/DummyData';
import ProductCardComponent from '../../components/ProductCardComponent';
import ProductActionBar from './components/ProductActionBar';
import { useToast } from '../../components/ToastContext';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { useWishlistStore } from '../../store/useWishlistStore';
import { getProductDetails } from '../../api/products/productsApi';
import { useCartStore } from '../../store/useCartStore';
import LoadingScreen from '../../components/LoadingScreen';
import * as NavigationService from '../../navigation/NavigationService';
import i18n from '../../utilities/i18n';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);
  const { showToast } = useToast();

  const [activeIndex, setActiveIndex] = useState(0);
  const [productDetails, setProductDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const addItem = useCartStore(state => state.addItem);
  const { loading } = useCartStore();

  const params = route?.params;
  const productId = params?.id;

  useEffect(() => {
    fetchProducts();
  }, [productId]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const results = await getProductDetails({ id: productId });
      setProductDetails(results);
    } catch (error) {
      setIsLoading(false);
      showToast(t('failed_to_load_details'), 'error');
      NavigationService.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const getApiTranslatedContent = () => {
    if (!productDetails) return { title: '', description: '' };
    const currentLang = i18n.language;
    const apiTrans = productDetails.translations?.[currentLang];
    return {
      title: apiTrans?.title || productDetails.title || 'N/A',
      description: apiTrans?.description || productDetails.description || '',
    };
  };

  const { title: displayTitle, description: displayDescription } =
    getApiTranslatedContent();

  const isFav = productDetails
    ? isInWishlist(productDetails.id) || productDetails.is_in_wishlist
    : false;

  const handleToggleWishlist = async () => {
    const wasFav = isFav;
    try {
      await toggleWishlist(productDetails);
    } catch (error) {
      showToast(
        wasFav ? t('failed_remove_wishlist') : t('failed_add_wishlist'),
        'error',
      );
    }
  };

  const handleShare = async () => {
    if (!productDetails) return;
    try {
      await Share.share({
        message: `${t('share_msg')} ${displayTitle}! AED ${
          productDetails.sale_price
        }`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToCart = async (quantity: number) => {
    try {
      await addItem(productDetails, quantity);
      showToast(`${displayTitle} ${t('added_to_cart_msg')}`, 'success');
    } catch (error) {
      showToast(t('failed_add_item'), 'error');
    }
  };

  const handleBuyNow = async (quantity: number) => {
    try {
      await addItem(productDetails, quantity);
      navigation.navigate('CartStack');
    } catch (error) {
      showToast(t('failed_add_item'), 'error');
    }
  };

  const renderSpecs = () => {
    const specs = [
      { label: t('sku'), value: productDetails?.variant_sku || 'N/A' },
      { label: t('category'), value: productDetails?.category || 'General' },
      {
        label: t('storage'),
        value: productDetails?.storage_condition || 'Room Temp',
      },
      { label: t('origin'), value: 'UAE Local Farms' },
      { label: t('delivery'), value: 'Express' },
    ];

    return (
      <View style={styles.specsContainer}>
        {specs.map((item, index) => (
          <View
            key={index}
            style={[
              styles.specRow,
              index === specs.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <Text style={styles.specLabel}>{item.label}</Text>
            <Text style={styles.specValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading || !productDetails) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageHeader}>
          <FlatList
            data={productDetails.image_urls}
            horizontal
            pagingEnabled
            onScroll={e =>
              setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))
            }
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.url || item }}
                style={styles.carouselImage}
              />
            )}
          />
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => NavigationService.goBack()}
            >
              <Icon xml={SVG_ICONS.backIcon} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.iconCircle} onPress={handleShare}>
                <Icon xml={SVG_ICONS.shareIcon} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.iconCircle,
                  {
                    marginLeft: 12,
                    backgroundColor: isFav ? colors.danger : colors.surface,
                  },
                ]}
                onPress={handleToggleWishlist}
              >
                <Icon
                  xml={SVG_ICONS.heart}
                  color={isFav ? 'white' : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentCard}>
          <View style={styles.dragHandle} />
          <View style={styles.headerRow}>
            <View style={styles.expressTag}>
              <Icon xml={SVG_ICONS.flashIcon} size={10} color="white" />
              <Text style={styles.expressText}>{t('express')}</Text>
            </View>
            <Text style={styles.categoryLabel}>
              {productDetails.category?.toUpperCase()}
            </Text>
            <Text style={styles.currentPrice}>
              AED {parseFloat(productDetails.sale_price).toFixed(2)}
            </Text>
          </View>

          <Text style={styles.productTitle}>{displayTitle}</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>
              {productDetails.rating} ({productDetails.reviews_count || 0}{' '}
              {t('reviews')})
            </Text>
            <View style={styles.verticalDivider} />
            <Text
              style={[
                styles.stockText,
                {
                  color:
                    productDetails.stock_status === 'In Stock'
                      ? colors.success
                      : colors.danger,
                },
              ]}
            >
              {productDetails.stock_status === 'In Stock'
                ? t('in_stock')
                : t('out_of_stock')}
            </Text>
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>{t('description')}</Text>
          <Text style={styles.descriptionText}>
            {displayDescription || t('no_description_available')}
          </Text>

          <Text style={styles.sectionTitle}>{t('product_specifications')}</Text>
          {renderSpecs()}

          <View style={styles.footerSpace} />
          {/* <Text style={styles.sectionTitle}>{t('you_might_also_like')}</Text>
          <FlatList
            data={PRODUCT_DATA}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <ProductCardComponent item={item} />}
          /> */}
        </View>
      </ScrollView>

      <ProductActionBar
        isOutOfStock={productDetails.stock_status !== 'In Stock'}
        handleAddCart={handleAddToCart}
        handleBuyNow={handleBuyNow}
        loading={loading}
      />
    </SafeAreaView>
  );
};

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    imageHeader: { height: width * 1.1, backgroundColor: 'white' },
    carouselImage: { width: width, height: '100%', resizeMode: 'cover' },
    rightIcons: { flexDirection: 'row' },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 5,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    contentCard: {
      marginTop: -40,
      backgroundColor: colors.background,
      borderTopLeftRadius: 35,
      borderTopRightRadius: 35,
      padding: 25,
      minHeight: 500,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 20,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    expressTag: {
      flexDirection: 'row',
      backgroundColor: '#2563EB',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignItems: 'center',
      gap: 3,
      marginRight: 10,
    },
    expressText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    categoryLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '800',
      flex: 1,
    },
    currentPrice: { color: colors.danger, fontSize: 28, fontWeight: '800' },
    productTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 10,
    },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
    ratingText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
    stockText: { fontSize: 14, fontWeight: 'bold' },
    divider: {
      height: 1,
      marginVertical: 15,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      marginTop: 25,
    },
    descriptionText: {
      color: colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
      marginTop: 5,
    },
    specsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 20,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    specRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    specLabel: { color: colors.textMuted, fontSize: 15 },
    specValue: { color: colors.text, fontSize: 15, fontWeight: '700' },
    verticalDivider: {
      width: 1,
      height: 15,
      backgroundColor: colors.border,
      marginHorizontal: 12,
    },
    footerSpace: { height: 40 },
    navButtons: {
      position: 'absolute',
      top: 50,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      zIndex: 10,
    },
  });

export default ProductDetailsScreen;
