import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTheme } from '../../ThemeContext';

interface ProductDetailCardProps {
  imageUri: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  discountTag?: string;
  isExpress?: boolean;
  offersCount?: number;
  onAdd?: () => void;
  onBuyNow?: () => void;
  onFavorite?: () => void;
}

const ProductDetailCard = ({
  imageUri,
  title,
  category,
  price,
  originalPrice,
  rating = 4.8,
  discountTag,
  isExpress = true,
  offersCount = 2,
  onAdd,
  onBuyNow,
  onFavorite,
}: ProductDetailCardProps) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  return (
    <View style={styles.card}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />

        {/* Floating Badges */}
        {discountTag && (
          <View style={styles.discountBadge}>
            <Text style={styles.badgeText}>{discountTag}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.favoriteBtn} onPress={onFavorite}>
          <MaterialIcons
            name="favorite-border"
            size={22}
            color={isDark ? colors.text : 'black'}
          />
        </TouchableOpacity>

        {isExpress && (
          <View style={styles.expressBadge}>
            <MaterialIcons name="bolt" size={14} color="white" />
            <Text style={styles.expressText}>Express</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#FBBF24" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>

        <Text style={styles.categoryText}>{category}</Text>

        {offersCount > 0 && (
          <View style={styles.offersBadge}>
            <MaterialIcons name="local-offer" size={14} color="#10B981" />
            <Text style={styles.offersText}>
              {offersCount} Offers Available
            </Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>AED {price}</Text>
          {originalPrice && (
            <Text style={styles.oldPrice}>AED {originalPrice}</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <MaterialIcons name="shopping-cart" size={20} color={colors.text} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buyBtn} onPress={onBuyNow}>
            <Text style={styles.buyBtnText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// --- Themed Styles ---

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 24,
      padding: 12,
      width: Dimensions.get('window').width - 32,
      alignSelf: 'center',
      backgroundColor: colors.surface,
      // Add shadow/border based on theme
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0 : 0.08,
          shadowRadius: 10,
        },
        android: {
          elevation: isDark ? 0 : 3,
        },
      }),
    },
    imageContainer: {
      height: 220,
      backgroundColor: isDark ? colors.background : '#F3F4F6',
      borderRadius: 20,
      position: 'relative',
      overflow: 'hidden',
    },
    image: { width: '100%', height: '100%', resizeMode: 'cover' },
    discountBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: '#F43F5E', // Standard brand color for discounts
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    favoriteBtn: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white',
      padding: 8,
      borderRadius: 20,
    },
    expressBadge: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      backgroundColor: '#3B82F6',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    expressText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
      marginLeft: 2,
    },
    content: { marginTop: 16 },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.background : '#1E293B',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    ratingText: { color: '#FBBF24', fontWeight: 'bold', marginLeft: 4 },
    categoryText: { color: colors.textMuted, fontSize: 16, marginTop: 4 },
    offersBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#10B981' : '#064E3B',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      marginTop: 12,
    },
    offersText: {
      color: '#10B981',
      fontSize: 13,
      fontWeight: '600',
      marginLeft: 6,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginTop: 16,
      gap: 10,
    },
    currentPrice: { color: '#F43F5E', fontSize: 28, fontWeight: 'bold' },
    oldPrice: {
      color: colors.textMuted,
      fontSize: 18,
      textDecorationLine: 'line-through',
    },
    buttonRow: { flexDirection: 'row', marginTop: 20, gap: 12 },
    addBtn: {
      flex: 1,
      flexDirection: 'row',
      height: 50,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'transparent' : colors.surface,
    },
    addBtnText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    buyBtn: {
      flex: 1,
      height: 50,
      backgroundColor: colors.primary,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buyBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  });

export default ProductDetailCard;
