import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';

import Icon from '../../../../Icon';
import { SVG_ICONS } from '../../../assets/icons/svg';
import { useToast } from '../../../components/ToastContext';
import { useTheme } from '../../../../ThemeContext';

interface PropTypes {
  handleAddCart: (quantity: number) => void;
  handleBuyNow: (quantity: number) => void;
  loading: boolean;
  isOutOfStock?: boolean;
}

const ProductActionBar = ({
  handleAddCart,
  handleBuyNow,
  loading,
  isOutOfStock = false,
}: PropTypes) => {
  const [quantity, setQuantity] = useState(1);
  const { showToast } = useToast();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark, isOutOfStock);

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const onAddPress = () => {
    if (isOutOfStock) {
      showToast('Item is OUT OF STOCK', 'error');
    } else {
      handleAddCart(quantity);
    }
  };

  const onBuyPress = () => {
    if (isOutOfStock) {
      showToast('Item is OUT OF STOCK!', 'error');
    } else {
      handleBuyNow(quantity);
    }
  };

  return (
    <View style={styles.footerContainer}>
      {/* 1. Increment/Decrement Section */}
      <View style={styles.quantitySelector}>
        <TouchableOpacity
          onPress={handleDecrement}
          style={styles.qtyBtn}
          activeOpacity={0.7}
          disabled={isOutOfStock}
        >
          <Icon
            xml={SVG_ICONS.minusIcon}
            color={isOutOfStock ? colors.textMuted : colors.text}
          />
        </TouchableOpacity>

        <View style={styles.qtyDisplay}>
          <Text style={styles.qtyText}>{quantity}</Text>
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          style={styles.qtyBtn}
          activeOpacity={0.7}
          disabled={isOutOfStock}
        >
          <Icon
            xml={SVG_ICONS.plusIcon}
            color={isOutOfStock ? colors.textMuted : colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* 2. Add to Cart Button */}
      <TouchableOpacity
        disabled={loading}
        onPress={onAddPress}
        style={styles.addCartBtn}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Icon
              xml={SVG_ICONS.cart}
              color={isOutOfStock ? colors.textMuted : colors.text}
            />
            <Text style={styles.addLabel}>Add</Text>
          </>
        )}
      </TouchableOpacity>

      {/* 3. Buy Now Button */}
      <TouchableOpacity
        disabled={loading}
        onPress={onBuyPress}
        style={styles.buyNowBtn}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buyLabel}>
            {isOutOfStock ? 'Sold Out' : 'Buy Now'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (colors: any, isDark: boolean, isOutOfStock: boolean) =>
  StyleSheet.create({
    footerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 30 : 20, // Adjust for iOS home indicator
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    quantitySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      height: 56,
      paddingHorizontal: 8,
      opacity: isOutOfStock ? 0.5 : 1,
    },
    qtyBtn: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    qtyDisplay: {
      minWidth: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qtyText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
    },
    addCartBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isOutOfStock ? colors.border : colors.primary,
      height: 56,
      gap: 6,
      paddingHorizontal: 10,
      opacity: isOutOfStock ? 0.6 : 1,
    },
    buyNowBtn: {
      flex: 1.8,
      backgroundColor: isOutOfStock ? colors.border : colors.primary,
      borderRadius: 16,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: isOutOfStock ? 0 : 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.5 : 0.2,
      shadowRadius: 8,
    },
    addLabel: {
      color: isOutOfStock ? colors.textMuted : colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    buyLabel: {
      color: isOutOfStock ? colors.textMuted : 'white',
      fontSize: 16,
      fontWeight: '800',
    },
  });

export default ProductActionBar;
