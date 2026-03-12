import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Icon from '../../../../Icon';
import { SVG_ICONS } from '../../../assets/icons/svg';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  addItem,
  updateQuantity,
} from '../../../store/features/cart/cartSlice';
import { useToast } from '../../../components/ToastContext';
import { useWishlistStore } from '../../../store/useWishlistStore';
import { getProductListingStyles } from '../style';

const ProductCard = ({ item }: { item: any }) => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { colors, isDark } = useTheme();

  // Initialize dynamic styles
  const styles = getProductListingStyles(colors, isDark);
  const navigation = useNavigation<any>();

  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isFavorite = isInWishlist(item.id);

  // Get cart state
  const cartItems = useAppSelector(state => state.cart.items);
  const cartItem = cartItems.find((c: any) => c.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const showProductDetails = () => {
    navigation.navigate('ProductDetails', { id: item.id });
  };

  const handleAddToCart = () => {
    try {
      dispatch(
        addItem({
          ...item,
          quantity: 1, // Initialize with 1 on first add
        }),
      );
      showToast(`${item.title} added to cart!`, 'success');
    } catch (error) {
      showToast('Failed to add item. Try again.', 'error');
    }
  };

  const handleBuyNow = () => {
    try {
      if (quantity === 0) {
        dispatch(addItem({ ...item, quantity: 1 }));
      }
      navigation.navigate('CartStack');
    } catch (error) {
      showToast('Failed to add item. Try again.', 'error');
    }
  };

  return (
    <Pressable onPress={showProductDetails} style={styles.card}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image_urls?.[0]?.url || item.imageUri }}
          style={styles.image}
        />

        {item.discountTag && (
          <View
            style={[
              styles.discountBadge,
              { backgroundColor: item.themeColor || colors.danger },
            ]}
          >
            <Text style={styles.badgeText}>{item.discountTag}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => toggleWishlist(item)}
          style={[
            styles.favBtn,
            { backgroundColor: isFavorite ? colors.danger : colors.surface },
          ]}
        >
          <Icon
            xml={SVG_ICONS.heart}
            color={isFavorite ? 'white' : colors.text}
            size={18}
          />
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {item.title}
        </Text>
        <Text style={styles.categoryText}>{item.category}</Text>

        {/* Stock Progress Bar */}
        <View style={styles.stockSection}>
          <View
            style={[styles.progressBarBg, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${(item.stockProgress || 0.5) * 100}%`,
                  backgroundColor: item.themeColor || colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.stockLabel, { color: colors.textMuted }]}>
            {item.stockLabel || 'In Stock'}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.text }]}>
            AED {parseFloat(item.sale_price || item.price).toFixed(2)}
          </Text>
          {item.originalPrice && (
            <Text style={styles.oldPrice}>AED {item.originalPrice}</Text>
          )}
        </View>

        <View style={styles.buttonRow}>
          {quantity > 0 ? (
            /* --- QUANTITY SELECTOR --- */
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                onPress={() =>
                  dispatch(updateQuantity({ id: item.id, delta: -1 }))
                }
                style={styles.qtyBtn}
              >
                <Icon xml={SVG_ICONS.minusIcon} size={14} color={colors.text} />
              </TouchableOpacity>

              <Text style={styles.qtyText}>{quantity}</Text>

              <TouchableOpacity
                onPress={() =>
                  dispatch(updateQuantity({ id: item.id, delta: 1 }))
                }
                style={styles.qtyBtn}
              >
                <Icon xml={SVG_ICONS.plusIcon} size={14} color={colors.text} />
              </TouchableOpacity>
            </View>
          ) : (
            /* --- ADD BUTTON --- */
            <TouchableOpacity onPress={handleAddToCart} style={styles.addBtn}>
              <Icon xml={SVG_ICONS.cart} size={16} color={colors.text} />
              <Text style={styles.btnText}>Add</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleBuyNow}
            style={[styles.buyBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.btnText, { color: 'white' }]}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};

export default ProductCard;
