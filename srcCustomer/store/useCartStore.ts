import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToCartApi, applyPromoCodeApi, deleteCartItemApi, getCartApi, placeOrderApi, updateCartItemApi } from '../api/products/productsApi';



interface CartItem {
  cart_item_id: string; // UUID for existing items
  product_id: string; // Original Product ID
  title: string;
  price: number;
  quantity: number;
  imageUri: string;
}

interface CartState {
  items: CartItem[];
  itemTotal: string;
  shipping: string;
  tax: string;
  promoCode: string;
  loading: boolean;
  billTotal: string;

  addItem: (product: any, qty: any) => Promise<void>;
  updateQty: (itemUuid: string, newQty: number) => Promise<void>;
  removeItem: (itemUuid: string) => Promise<void>;
  fetchCart: () => Promise<void>;
  clearEntireCart: () => void;
  applyPromoCode: (code: string) => Promise<void>;
  placeOrder: (addressId: string, paymentMethod: string) => Promise<any>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemTotal: '0',
      shipping: '0',
      tax: '0',
      promoCode: '',
      loading: false,
      billTotal:'0',

      // POST: Add new item or increment if exists
      // Inside useCartStore.ts

      addItem: async (product, requestedQuantity = 1) => {
        
        set({ loading: true });
        const { items } = get();
        let id = product.id ?? product.inshop_product_id
        const existingItem = items.find(i => i.product_id === id);

        if (existingItem) {
          // If it exists, we add the new requested quantity to the current quantity
          const newTotalQty = existingItem.quantity + requestedQuantity;
          return get().updateQty(existingItem.cart_item_id, newTotalQty);
        }

        try {
          const response = await addToCartApi({
            in_shop_product_id: id,
            quantity: requestedQuantity, // Pass the dynamic quantity here
          });
          // console.log('resp is', response);

          // Reset state with fresh data from server
          set({
            items: response.items,
            itemTotal: response.subtotal,
            shipping: response.shipping,
            promoCode: response.promo_code,
            tax: response.tax,
            billTotal: response.total
          });
        } catch (error) {
          console.error('Add to cart failed', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // PUT: Update quantity via item UUID
      updateQty: async (itemUuid, newQty) => {
        set({ loading: true });
        const oldItems = get().items;
        // Optimistic local update
        set({
          items: oldItems.map(i =>
            i.cart_item_id === itemUuid ? { ...i, quantity: newQty } : i,
          ),
        });

        try {
          const response = await updateCartItemApi(itemUuid, newQty);
          set({
            items: response.items,
            itemTotal: response.subtotal,
            shipping: response.shipping,
            promoCode: response.promo_code,
            tax: response.tax,
            billTotal: response.total
          });
          set({ loading: false });
        } catch (error) {
          set({ loading: false });
          set({ items: oldItems }); // Rollback

          // IMPORTANT: Re-throw the error so handleQtyChange can catch it
          throw error;
        }
      },

      // DELETE: Remove item via item UUID
      removeItem: async itemUuid => {
        set({ loading: true });
        try {
          const response = await deleteCartItemApi(itemUuid);
          set({
            items: response.items,
            itemTotal: response.subtotal,
            shipping: response.shipping,
            promoCode: response.promo_code,
            tax: response.tax,
            billTotal: response.total
          });
          set({ loading: false });
        } catch (error) {
          set({ loading: false });
          console.error('Delete failed', error);
          throw error;
        }
      },

      fetchCart: async () => {
        set({ loading: true });
        try {
          const response = await getCartApi();
          set({
            items: response.items,
            itemTotal: response.subtotal,
            shipping: response.shipping,
            promoCode: response.promo_code,
            tax: response.tax,
            billTotal: response.total
          });
        } catch (error) {
          set({ loading: false });
          console.error('fetch failed', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      clearEntireCart: () =>
        set({ items: [], itemTotal: '0', shipping: '0', tax: '0' }),

      applyPromoCode: async (code: string) => {
        set({ loading: true });
        try {
          const response = await applyPromoCodeApi(code);

          // Update the store with the new totals and items returned by the API
          set({
            items: response.items,
            itemTotal: response.subtotal,
            shipping: response.shipping,
            tax: response.tax,
            promoCode: response.promo_code,
            loading: false,
            billTotal: response.total
          });
        } catch (error) {
          set({ loading: false });
          // Re-throw so the UI can catch the "Invalid Promo Code" error
          throw error;
        }
      },
      placeOrder: async (addressId, paymentMethod) => {
        set({ loading: true });
        try {
          const response = await placeOrderApi({
            shipping_address_id: addressId,
            payment_method: paymentMethod,
          });

          // Clear cart locally after successful order
          get().clearEntireCart();
          set({ loading: false });
          return response; // Return order details (order ID, etc.)
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
