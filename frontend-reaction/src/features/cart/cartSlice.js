import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const response = await api.get('/cart/');
  return response.data;
});

export const addToCart = createAsyncThunk('cart/addToCart', async ({ productId, quantity }) => {
  const response = await api.post('/cart-items/', { product_id: productId, quantity });
  return response.data;
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (itemId) => {
  await api.delete(`/cart-items/${itemId}/`);
  return itemId;
});

export const updateCartItem = createAsyncThunk('cart/updateCartItem', async ({ itemId, quantity }) => {
  const response = await api.patch(`/cart-items/${itemId}/`, { quantity });
  return response.data;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const existingItem = state.items.find(i => i.product.id === action.payload.product.id);
        if (existingItem) {
            existingItem.quantity = action.payload.quantity;
        } else {
            state.items.push(action.payload);
        }
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default cartSlice.reducer;

