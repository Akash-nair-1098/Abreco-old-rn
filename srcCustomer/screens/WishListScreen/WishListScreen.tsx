import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import ProductCardComponent from '../../components/ProductCardComponent';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import LoadingScreen from '../../components/LoadingScreen';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from '../../components/ToastContext';
import { useTheme } from '../../../ThemeContext';

const WishlistScreen = ({ navigation }: any) => {
  const { wishlist, loading, fetchWishlist, toggleWishlist, moveToCart } =
    useWishlistStore();
  const { showToast } = useToast();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);
  const fetchCart = useCartStore(state => state.fetchCart);

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, [fetchWishlist]),
  );

  const handleMoveToCart = async (wishlistItem: any) => {
    try {
      await moveToCart(wishlistItem.id);
      if (fetchCart) await fetchCart();
      showToast('Item moved to cart!', 'success');
    } catch (error: any) {
      showToast(error?.message ?? 'Failed to move to cart', 'error');
    }
  };

  const handleRemoveItem = async (wishlistItem: any) => {
    try {
      await toggleWishlist(wishlistItem.product);
    } catch (error: any) {
      showToast(error?.message ?? 'Failed to remove item', 'error');
    }
  };

  if (loading && wishlist.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon xml={SVG_ICONS.backIcon} color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist ({wishlist.length})</Text>
      </View>

      <FlatList
        data={wishlist}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchWishlist}
            tintColor={colors.primary}
            colors={[colors.primary]} // For Android
          />
        }
        renderItem={({ item }) => (
          <ProductCardComponent
            item={item}
            viewType="wishlist"
            onRemove={() => handleRemoveItem(item)}
            onMoveToCart={() => handleMoveToCart(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Icon xml={SVG_ICONS.heart} size={64} color={colors.border} />
            <Text style={styles.emptyText}>No items in your wishlist yet.</Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => navigation.navigate('Products')}
            >
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backBtn: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    listContent: {
      paddingHorizontal: 8,
      paddingBottom: 20,
      flexGrow: 1,
    },
    columnWrapper: {
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    emptyBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      marginTop: 100, // Better vertical alignment for empty state
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 16,
    },
    shopBtn: {
      marginTop: 24,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      // Add shadow to button in light mode
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.2,
      shadowRadius: 8,
      elevation: isDark ? 0 : 4,
    },
    shopBtnText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
  });

export default WishlistScreen;
