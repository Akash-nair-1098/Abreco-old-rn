import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from '../../Icon';
import { SVG_ICONS } from '../assets/icons/svg';
import { useTheme } from '../../ThemeContext';
import * as NavigationService from '../navigation/NavigationService';
import { useCartStore } from '../store/useCartStore';
import { useToast } from './ToastContext';
import i18n from '../utilities/i18n';

interface ProductCardProps {
  item: any;
  viewType?: 'default' | 'wishlist';
  onRemove?: (item: any) => void;
  onMoveToCart?: (item: any) => void;
  cardWidth?: number | string;
  isFlashDeal?: boolean; // New prop to toggle Flash Deal UI
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
];

const ProductCardComponent = ({
  item,
  viewType = 'default',
  onRemove,
  onMoveToCart,
  cardWidth = '100%',
  isFlashDeal = false,
}: ProductCardProps) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);
  const { t } = useTranslation();
  const { showToast } = useToast();

  const isOutOfStock = item.stock_status === 'out_of_stock';
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

  // Logic to pick the first URL from the API response
  const imageUri = item?.image_urls?.[0]?.url ?? item?.primary_image_url ?? item?.product_image ?? PLACEHOLDER_IMAGES[0];
  const displayPrice = item?.offer_price ?? item?.sale_price ?? item?.price;
  const originalPrice = item?.purchase_price ?? item?.original_price;
  const discount = parseFloat(item?.discount_percentage || '0');

  return (
    <Pressable
      onPress={() => NavigationService.navigate('ProductDetails', { id: productId })}
      style={[styles.cardContainer, { width: cardWidth }]}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUri }} style={styles.productImage} />
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
      marginRight: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    imageWrapper: { 
      backgroundColor: '#F9FAFB', 
      borderRadius: 15, 
      overflow: 'hidden',
      height: 130,
      justifyContent: 'center'
    },
    productImage: { width: '100%', height: 110, resizeMode: 'contain' },
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