import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { wishlistApi } from '../api/products/wishListApi';

interface Product {
  id: string;
  title: string;
  imageUri: string;
  price: number;
  originalPrice?: number;
  discountTag?: string;
  stockProgress?: number;
  rating?: number;
  reviewsCount?: number;
  stockLabel?: string;
  themeColor?: string;
  category?: string;
  description?: string;
  thumbnails?: string[];
  specs?: { label: string; value: string }[];
}

interface WishlistState {
  wishlist: any[];
  loading: boolean;
  isInitialized: boolean; // New flag to track if API was ever called
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (product: any) => Promise<void>;
  moveToCart: (wishlistItemId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      loading: false,
      isInitialized: false,

      fetchWishlist: async () => {


        set({ loading: true });
        try {
          const response = await wishlistApi.getWishlist();
          // Added defensive check for nested results structure
          const data =
            response || [];
          set({
            wishlist: Array.isArray(data) ? data : [],
            isInitialized: true,
          });
        } catch (error) {
          // console.error('Wishlist Fetch Error:', error);
          set({ wishlist: [] }); // Fallback to empty array on error to prevent crash
           throw error; 
        } finally {
          set({ loading: false });
        }
      },

      toggleWishlist: async product => {
        const previousWishlist = [...get().wishlist];
        const existingItem = previousWishlist.find(
          item =>
            item?.product?.id === product?.id ||
            item?.in_shop_product_id === product?.id,
        );

        // OPTIMISTIC UPDATE: Update UI immediately
        if (existingItem) {
          set({
            wishlist: previousWishlist.filter(i => i.id !== existingItem.id),
          });
        } else {
          // Temporary ID for the heart to stay filled while API works
          const tempItem = {
            id: 'temp-' + Date.now(),
            product: product,
            in_shop_product_id: product.id,
          };
          set({ wishlist: [tempItem, ...previousWishlist] });
        }

        try {
          if (existingItem) {
            await wishlistApi.removeFromWishlist(existingItem.id);
          } else {
            const response = await wishlistApi.addToWishlist(product.id);
            const newItem = response.data?.results?.data || response.data;

            // Update the temp item with the real one from server
            set(state => ({
              wishlist: state.wishlist.map(item =>
                item.in_shop_product_id === product.id ? newItem : item,
              ),
            }));
          }
        } catch (error) {
          // ROLLBACK: Revert to previous state if API fails
          set({ wishlist: previousWishlist });
          throw error; // Re-throw to handle in the component
        }
      },

      moveToCart: async (wishlistItemId: string) => {
        set({ loading: true });
        try {
          await wishlistApi.moveToCart(wishlistItemId);
          set(state => ({
            wishlist: Array.isArray(state.wishlist)
              ? state.wishlist.filter(i => i.id !== wishlistItemId)
              : [],
          }));
        } finally {
          set({ loading: false });
        }
      },

      isInWishlist: (productId: string) => {
        const wishlist = get().wishlist;
        if (!productId || !Array.isArray(wishlist)) return false;

        return wishlist.some(
          item =>
            item?.in_shop_product_id === productId ||
            item?.product?.id === productId,
        );
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Optional: Don't persist the loading or initialization state
      partialize: state => ({ wishlist: state.wishlist }),
    },
  ),
);