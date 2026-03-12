import api from "../axiosConf";

export const wishlistApi = {
  // GET customers/wishlist
  getWishlist: async () => {
    const response = await api.get('customers/wishlist');
    // Based on your sample, data is nested in results.data
    return response.data.results.data.items
  },
  // POST customers/wishlist/items
  addToWishlist: (productId: string) =>
    api.post('customers/wishlist/items', { in_shop_product_id: productId }),

  // DELETE/POST customers/wishlist/items/{id}
  // Note: Usually removing is a DELETE request, but based on your prompt:
  removeFromWishlist: (wishlistItemId: string) =>
    api.post(`customers/wishlist/items/${wishlistItemId}`),

  // POST customers/wishlist/items/{id}/move-to-cart
  moveToCart: (wishlistItemId: string) =>
    api.post(`customers/wishlist/items/${wishlistItemId}/move-to-cart`),
};
