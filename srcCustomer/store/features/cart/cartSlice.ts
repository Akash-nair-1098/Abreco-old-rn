import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  itemTotal: number;
  freeDeliveryThreshold: number;
}

const initialState: CartState = {
  items: [],
  itemTotal: 0,
  freeDeliveryThreshold: 1000,
};

// Optional: Async Thunk if you need to sync with a server/API
export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (product: CartItem, { dispatch }) => {
    // Simulate API call
    // await api.post('/cart', product);
    dispatch(cartSlice.actions.addItem(product));
  },
);

const calculateTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      console.log('add to cart called');

      const existingItem = state.items.find(
        item => item.id === action.payload.id,
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.itemTotal = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; delta: number }>,
    ) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.quantity += action.payload.delta;
        // Automatically remove item if quantity hits 0
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.id !== action.payload.id);
        }
      }
      state.itemTotal = calculateTotal(state.items);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.itemTotal = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );
    },
    clearCart: state => {
      state.items = [];
      state.itemTotal = 0;
    },
    addMultipleItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.itemTotal = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );
    },
  },
});

export const { addItem, updateQuantity, removeItem, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
