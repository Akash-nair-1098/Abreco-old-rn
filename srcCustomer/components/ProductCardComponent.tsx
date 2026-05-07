import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';
import Icon from '../../Icon';
import { SVG_ICONS } from '../assets/icons/svg';
import { useTheme } from '../../ThemeContext';
import * as NavigationService from '../navigation/NavigationService';
import { useCartStore } from '../store/useCartStore';
import { useToast } from './ToastContext';
import i18n from '../utilities/i18n';

// To calculate half screen accurately
const { width } = Dimensions.get('window');
const HALF_SCREEN = (width - 40) / 2; // Adjusted for common grid padding

interface ProductCardProps {
  item: any;
  viewType?: 'default' | 'wishlist';
  onRemove?: (item: any) => void;
  onMoveToCart?: (item: any) => void;
  cardWidth?: number | string;
  isFlashDeal?: boolean; 
}

const PLACEHOLDER_IMAGES = [
  'https://t3.ftcdn.net/jpg/06/71/33/46/360_F_671334604_ZBV26w9fERX8FCLUyDrCrLrZG6bq7h0Q.jpg',
];

const ProductCardComponent = ({
  item,
  viewType = 'default',
  onRemove,
  onMoveToCart,
  cardWidth, // Removed default here to handle logic inside
  isFlashDeal = false,
}: ProductCardProps) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);
  const { t } = useTranslation();
  const { showToast } = useToast();

  const normalizedStockStatus = String(item?.stock_status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  const isOutOfStock = normalizedStockStatus === 'out_of_stock';
  const isLowStock =
    normalizedStockStatus === 'low_stock' ||
    normalizedStockStatus === 'lowstock' ||
    normalizedStockStatus === 'limited_stock';
  const isInStock =
    normalizedStockStatus === 'in_stock' ||
    normalizedStockStatus === 'instock';
  const addToCart = useCartStore(state => state.addItem);
  const loading = useCartStore(state => state.loading);
  const cartItems = useCartStore(state => state.items || []);

  const productId = item.id ?? item.inshop_product_id;
  const serverIsInCart = cartItems.some(
    (cartItem: any) => cartItem.in_shop_product_id === productId,
  );

  const translatedData = useMemo(() => {
    let parsedTranslations: any = {};
    try {
      parsedTranslations = typeof item.translations === 'string' 
        ? JSON.parse(item.translations) 
        : (item.translations || {});
    } catch (e) {}

    const currentLang = i18n.language || 'en';
    const langData = parsedTranslations[currentLang] || {};

    return {
      title: langData.title || item.product_title || item.title || item.name || t('product'),
      category: langData.category || item.category || t('express'),
    };
  }, [item, i18n.language]);

  const handleAddToCart = async (e: any) => {
    e.stopPropagation();
    if (isOutOfStock || serverIsInCart) return;
    try {
      await addToCart(item, 1);
      showToast(`${translatedData.title} ${t('added_to_cart_msg')}`, 'success');
    } catch (error) {
      showToast(t('failed_add_item'), 'error');
    }
  };

  const imageUri =
    item?.image_urls?.[0]?.url ??
    item?.primary_image_url ??
    item?.product_image ??
    item?.image ??
    PLACEHOLDER_IMAGES[0];
  const displayPrice = item?.offer_price ?? item?.sale_price ?? item?.price;
  const originalPrice = item?.purchase_price ?? item?.original_price;
  const discount = parseFloat(item?.discount_percentage || '0');

  // Logic: Use passed cardWidth, otherwise default to half screen for grids
  const finalWidth = cardWidth || HALF_SCREEN;

  return (
    <Pressable
      onPress={() =>
        (NavigationService.navigate as (n: string, p?: object) => void)(
          'ProductDetails',
          {id: productId},
        )
      }
      style={[styles.cardContainer, {width: finalWidth as any}]}
    >
      <View style={styles.imageWrapper}>
        <FastImage
          source={{uri: imageUri, priority: FastImage.priority.normal}}
          style={styles.productImage}
          resizeMode={FastImage.resizeMode.contain}
        />
        <View
          style={[
            styles.stockPill,
            isOutOfStock
              ? styles.stockPillOut
              : isLowStock
                ? styles.stockPillLow
                : styles.stockPillIn,
          ]}
          pointerEvents="none">
          <Text style={styles.stockPillText}>
            {isOutOfStock
              ? t('out_of_stock')
              : isLowStock
                ? t('low_stock')
                : t('in_stock')}
          </Text>
        </View>
        {isOutOfStock && (
          <View style={styles.outOfStockBanner} pointerEvents="none">
            <Text style={styles.outOfStockBannerText}>{t('out_of_stock')}</Text>
          </View>
        )}
        {discount > 0 && (
          <View style={styles.badge}>
             <Icon xml={SVG_ICONS.fireIcon} size={10} color="white" />
            <Text style={styles.badgeText}> {Math.round(discount)}% OFF</Text>
          </View>
        )}
        {!isOutOfStock && (
          <TouchableOpacity
            style={[styles.addButton, serverIsInCart && { backgroundColor: colors.primary }]}
            onPress={handleAddToCart}
          >
            {serverIsInCart ? (
              <Icon xml={SVG_ICONS.cart} size={16} color="white" />
            ) : (
              <Icon xml={SVG_ICONS.plusIcon} size={18} color={isDark ? 'black' : colors.text} />
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {translatedData.title}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {item.currency || 'AED'} {displayPrice}
          </Text>
          {originalPrice > displayPrice && (
             <Text style={styles.originalPrice}>
                {item.currency || 'AED'} {originalPrice}
             </Text>
          )}
        </View>

        {isFlashDeal && (
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '70%' }]} />
            </View>
            <Text style={styles.sellingFastText}>{t('selling_fast')}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    cardContainer: {
      borderRadius: 20,
      padding: 10,
      marginBottom: 12, // Added margin bottom for grid consistency
      marginRight: 8,   // Reduced margin right to fit half-screen better
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      // Ensures the card doesn't stretch even if data is missing
      alignSelf: 'flex-start', 
    },
    imageWrapper: { 
      backgroundColor: '#F9FAFB', 
      borderRadius: 15, 
      overflow: 'hidden',
      height: 130,
      justifyContent: 'center'
    },
    productImage: { width: '100%', height: 110, resizeMode: 'contain' },
    stockPill: {
      position: 'absolute',
      top: 8,
      right: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.18,
      shadowRadius: 3,
      elevation: 2,
    },
    stockPillIn: {backgroundColor: colors.success},
    stockPillLow: {backgroundColor: '#F59E0B'},
    stockPillOut: {backgroundColor: colors.danger},
    stockPillText: {color: '#FFFFFF', fontSize: 10, fontWeight: '800'},
    outOfStockBanner: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      marginTop: -18,
      backgroundColor: 'rgba(0,0,0,0.72)',
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outOfStockBannerText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    content: { marginTop: 8 },
    title: { color: colors.text, fontSize: 14, fontWeight: '600', height: 40 },
    priceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    price: { color: '#F43F5E', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
    originalPrice: { color: colors.textMuted, fontSize: 12, textDecorationLine: 'line-through', opacity: 0.5 },
    badge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#F43F5E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    addButton: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'white', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3 },
    progressSection: { marginTop: 10 },
    progressBarBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#F43F5E' },
    sellingFastText: { fontSize: 10, color: colors.textMuted, marginTop: 4, textAlign: 'right' }
  });

export default ProductCardComponent;