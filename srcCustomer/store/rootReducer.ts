import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/auth/auth.slice';
import productReducer from './features/products/products.slice'
import cartReducer from './features/cart/cartSlice'

export const rootReducer = combineReducers({
  // auth: authReducer,
  // product: productReducer,
  cart: cartReducer
});

export type RootState = ReturnType<typeof rootReducer>;
