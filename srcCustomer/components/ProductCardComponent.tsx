import { useNavigation } from '@react-navigation/native';
import React from 'react';
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
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
  'https://images.unsplash.com/photo-1506484334402-40f299bc7bd0?w=500&q=80',
  'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&q=80',
  'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=500&q=80',
  'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=500&q=80',
];

const ProductCardComponent = ({
  item,
  viewType = 'default',
  onRemove,
  onMoveToCart,
}: ProductCardProps) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);
  const { t } = useTranslation();
  const isWishlist = viewType === 'wishlist';
  const { showToast } = useToast();

  const isOutOfStock = item.stock_status === 'out_of_stock';
  const addToCart = useCartStore(state => state.addItem);
  const loading = useCartStore(state => state.loading);
  const cartItems = useCartStore(state => state.items || []);

  const serverIsInCart = cartItems.some(
    (cartItem: any) => cartItem.in_shop_product_id === item.id,
  );

  const getTranslatedTitle = () => {
    try {
      if (item.translations) {
        const parsedTranslations =
          typeof item.translations === 'string'
            ? JSON.parse(item.translations)
            : item.translations;

        const currentLang = i18n.language;
        return (
          parsedTranslations[currentLang]?.title ||
          item.title ||
          item.product_name ||
          item.name
        );
      }
    } catch (e) {
      console.error('Translation parsing failed', e);
    }
    return item.title || item.product_name || item.name;
  };

  const displayTitle = getTranslatedTitle();

  const handleAddToCart = async (e: any) => {
    e.stopPropagation();
    if (isOutOfStock || serverIsInCart) return;
    try {
      await addToCart(item, 1);
      showToast(
        `${displayTitle} ${t('added_to_cart_msg', {
          defaultValue: 'added to cart!',
        })}`,
        'success',
      );
    } catch (error) {
      showToast(
        t('failed_add_item', { defaultValue: 'Failed to add item' }),
        'error',
      );
    }
  };

  const getRandomPlaceholder = () => {
    const randomIndex = Math.floor(Math.random() * PLACEHOLDER_IMAGES.length);
    return PLACEHOLDER_IMAGES[randomIndex];
  };

  return (
    <Pressable
      onPress={() =>
        NavigationService.navigate('ProductDetails', { id: item.id })
      }
      style={[styles.cardContainer, isWishlist && styles.wishlistCard]}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri:
              item?.primary_image_url ??
              item?.product_image ??
              item?.image ??
              getRandomPlaceholder(),
          }}
          style={styles.productImage}
        />

        {isOutOfStock && (
          <View style={styles.oosOverlay}>
            <Text style={styles.oosText}>{t('out_of_stock')}</Text>
          </View>
        )}

        {item?.discount_percentage > 0 && (
          <View style={[styles.badge]}>
            <Text style={styles.badgeText}>
              {!isWishlist && (
                <Icon xml={SVG_ICONS.fireIcon} size={12} color="white" />
              )}{' '}
              {item.discount_percentage}% OFF
            </Text>
          </View>
        )}

        {isWishlist ? (
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => onRemove?.(item)}
          >
            <Icon xml={SVG_ICONS.close} size={14} color="white" />
          </TouchableOpacity>
        ) : (
          !isOutOfStock && (
            <TouchableOpacity
              style={[
                styles.addButton,
                serverIsInCart && { backgroundColor: colors.primary },
              ]}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              {serverIsInCart ? (
                <Icon xml={SVG_ICONS.cart} size={18} color="white" />
              ) : loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Icon
                  xml={SVG_ICONS.plusIcon}
                  size={22}
                  color={isDark ? 'black' : colors.text}
                />
              )}
            </TouchableOpacity>
          )
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {displayTitle}
        </Text>
        <Text numberOfLines={1} style={styles.categoryText}>
          {item?.category || item?.main_category || t('express')}
        </Text>

        <View style={styles.priceContainer}>
          <View style={styles.priceWrapper}>
            <Text style={styles.price} numberOfLines={1}>
              {item.currency || 'AED'} {item?.price ?? item?.offer_price}
            </Text>
            {item.original_price && item.original_price !== item.price && (
              <Text style={styles.originalPrice} numberOfLines={1}>
                {item.currency || 'AED'} {item.original_price}
              </Text>
            )}
          </View>

          {isWishlist && (
            <View style={styles.ratingRow}>
              <Icon
                xml={SVG_ICONS.ratingStarFilled}
                size={12}
                color="#FBBF24"
              />
              <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
            </View>
          )}
        </View>

        {isWishlist && (
          <TouchableOpacity
            style={styles.moveToCartBtn}
            onPress={() => onMoveToCart?.(item)}
          >
            <Icon
              xml={SVG_ICONS.cart}
              size={14}
              color={isDark ? 'white' : colors.primary}
            />
            <Text style={styles.moveToCartText}>{t('move_to_cart')}</Text>
          </TouchableOpacity>
        )}

        {!isWishlist && item.stock_status === 'low_stock' && (
          <View style={styles.stockSection}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '30%' }]} />
            </View>
            <Text style={styles.stockLabel}>{t('low_stock')}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

// --- Themed Styles ---

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    cardContainer: {
      borderRadius: 24,
      padding: 12,
      width: 180,
      margin: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: isDark ? 0 : 2,
        },
      }),
    },
    wishlistCard: {
      flex: 1,
      width: 'auto',
      maxWidth: '47%',
    },
    imageWrapper: {
      position: 'relative',
      backgroundColor: isDark ? colors.background : '#F3F4F6',
      borderRadius: 20,
      overflow: 'hidden',
    },
    productImage: {
      width: '100%',
      height: 140,
      resizeMode: 'cover',
    },
    content: {
      marginTop: 10,
    },
    title: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    categoryText: {
      color: colors.textMuted,
      fontSize: 12,
      marginBottom: 6,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    priceWrapper: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      gap: 4,
    },
    price: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    originalPrice: {
      color: colors.textMuted,
      fontSize: 12,
      textDecorationLine: 'line-through',
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    ratingText: {
      color: '#FBBF24',
      fontSize: 12,
      fontWeight: '600',
    },
    badge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: '#F43F5E',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    badgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
    },
    addButton: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: isDark ? 'white' : colors.background,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    oosOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    oosText: {
      backgroundColor: '#EF4444',
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    moveToCartBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.primary,
      borderRadius: 10,
      height: 36,
      marginTop: 10,
      backgroundColor: isDark ? colors.background : 'transparent',
    },
    moveToCartText: {
      color: isDark ? 'white' : colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    stockSection: {
      marginTop: 8,
    },
    progressBarBg: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#F43F5E',
    },
    stockLabel: {
      color: colors.textMuted,
      fontSize: 10,
      textAlign: 'right',
      marginTop: 2,
    },
    removeBtn: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: 4,
      borderRadius: 12,
    },
  });

export default ProductCardComponent;
