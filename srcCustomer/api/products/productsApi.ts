import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../axiosConf";
import { AddToCartPayload, mainCategoryPayload, ProductListPayload } from "./product.type";

 export const mainCategory = async (payload: mainCategoryPayload) => {
  console.log('category api called with', payload);
  const response = await api.get(`products/product-main-category-list?is_landing=${false}&search=${payload.search}`);
  // console.log('response is', response);
  
  return response.data.results.data;
};

export const getProductList = async (payload: ProductListPayload = {}) => {
  // console.log('Product list api called with', payload);

  // Using POST as this API requires a body for filtering
  const response = await api.post('products/products-list', {
    // Set defaults for pagination if not provided
    page: payload.page || 1,
    page_size: payload.page_size || 20,
    ...payload,
  });

  // console.log('response is', response.data.results.data);
  
  return response.data.results.data;
};

 export const getProductDetails = async ({
   id,
   in_shop_id,
 }: {
   id: string;
   in_shop_id?: string;
 }) => {
   let url = `products/product-detail?id=${encodeURIComponent(id)}`;
   if (in_shop_id) {
     url += `&in_shop_id=${encodeURIComponent(in_shop_id)}`;
   }
   console.log('product details called with', url);
   const response = await api.get(url);
   console.log('response is', response);

   return response.data.results.data;
 };


 export const addToCartApi = async (payload: AddToCartPayload) => {
   console.log('Add to cart API called with:', payload);

   // Sending the POST request to the specified endpoint
   const response = await api.post('customers/cart/items', payload);

   console.log('Add to cart response:', response);

   // Returning the results data from the response structure
   return response.data.results.data;
 };

 export const getCartApi = async () => {
   const response = await api.get('customers/cart');
   return response.data.results.data;
 };

 export const updateCartItemApi = async (
   itemUuid: string,
   quantity: number,
 ) => {
   const response = await api.put(`customers/cart/items/${itemUuid}`, {
     quantity,
   });
   
   return response.data.results.data;
 };


 export const deleteCartItemApi = async (itemUuid: string) => {
   const response = await api.delete(`customers/cart/items/${itemUuid}`);
   return response.data.results.data;
 };


 export const applyPromoCodeApi = async (promo_code: string) => {

   const response = await api.post('customers/cart/promo-code', {
     promo_code: promo_code,
   });

   return response.data.results.data;
 };


 export const placeOrderApi = async (payload: {
   shipping_address_id: string;
   payment_method: string;
 }) => {

   const response = await api.post('order/place-order', payload);

   return response.data;
 };

 /**
 * GET: Fetch all saved addresses
 */
export const getAddressesApi = async () => {
  const response = await api.get('customers/customer-address/');

  return response.data;
};

/**
 * POST: Create a new address
 */

interface CreateAddressPayload {
  location_name: string;
  address: string;
  latitude: string;  // Add this
  longitude: string; // Add this
}
export const createAddressApi = async (payload: CreateAddressPayload) => {
  const response = await api.post('customers/customer-address/', payload);
  return response.data
};

export const fetchOrdersList = async (status: string) => {
  const response = await api.get(`order/list-orders?status=${status}`);
  // Adjust based on your API's specific response nesting
  return response.data.results.data;
};

export const fetchOrderDetail = async (orderId: string) => {
  const response = await api.get(`order/${orderId}`);
  // Based on your sample, data is nested in results.data
  return response.data.results.data;
};


export const fetchProductSubCategoryList = async (categoryName: string) => {
  const response = await api.get(
    `products/product-sub-category-list?category=${categoryName}`);

  // Following your model: data is nested in results.data
  return response.data.results.data;
};


const TOKEN_KEY = '@voice_search_token';
const EXPIRY_KEY = '@voice_search_expiry';

export const getVoiceSearchToken = async () => {
  try {
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
    const storedExpiry = await AsyncStorage.getItem(EXPIRY_KEY);

    // If token exists and hasn't expired (using a 1-minute safety buffer)
    if (
      storedToken &&
      storedExpiry &&
      Date.now() < parseInt(storedExpiry) - 60000
    ) {
      return storedToken;
    }

    // Otherwise, fetch a new one using your standard API pattern
    const response = await api.get('customers/voice-search/token');

    console.log(' oice key response is', response);
    
    // Adjust based on your actual backend response structure
    const { token, expires_at } = response.data.results.data;

    // Save to storage
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(EXPIRY_KEY, expires_at.toString());

    return token;
  } catch (error) {
    console.error('Failed to fetch voice search token:', error);
    return null;
  }
};

const normalizeSearchTerm = (value: string) =>
  value
    .normalize('NFC')
    .replace(/[!?.,/\\|()[\]{}"'`~@#$%^&*_+=:;<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildSearchVariants = (term: string): string[] => {
  const normalized = normalizeSearchTerm(term);
  const lower = normalized.toLowerCase();
  const variants = [term, normalized, lower].filter(Boolean);
  return Array.from(new Set(variants));
};

export const globalSearchProducts = async (term: string) => {
  try {
    const variants = buildSearchVariants(term);

    for (const query of variants) {
      const response = await api.get('customers/global-search', {
        params: { search: query },
      });
      const results = response.data?.results?.data?.results || [];
      if (results.length > 0) {
        return results;
      }
    }

    return [];
  } catch (error) {
    console.error('Global search failed:', error);
    throw error;
  }
};


// productsApi.ts (example)

export const getFeaturedProducts = async () => {
  const response = await api.get('products/features-products-list');
  return response.data.results.data.results;
};

export const getTodaysDeals = async () => {
  const response = await api.get('products/todays-deals-list');
  return response.data.results.data;  // { message: "Success", results: { data: [] } }
};

export const getHeroBanners = async () => {
  const response = await api.get('products/hero-banner-offer-list');
  return response.data.results.data; // { data: [...] }
};


export const getExclusiveOffers = async () => {
  const response = await api.get('products/exclusive-offer-list');
  return response.data.results.data; 
};

export const getOrderTrackingDetails = async (orderId: string) => {
  const response = await api.get(`order/${orderId}`);
  console.log('order tracking respons ei', response);
  
  return response.data.results.data;

};

export const acknowledgeOrder = async (orderId: string) => {
  const response = await api.post(`order/${orderId}/acknowledge`);
  return response.data;
};

/**
 * Fetches transaction history with pagination
 * @param page - The page number to fetch
 */
export const getTransactionHistory = async (page: number) => {
  try {
    const response = await api.get(`order/financials/transactions`, {
      params: { page },
    });
    console.log('Transactions response:', response.data);
    return response.data; // Returning full object to access total_pages
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};


/**
 * Fetches invoices using URL path segments
 * Example: order/financials/invoices/PAID/this_month?page=1
 */
export const getInvoices = async (page: number, status?: string, time?: string) => {
  try {
    // Fallback to "all" or "any" if no value is provided to keep URL structure consistent
    const statusPath = !status || status === 'All' ? 'all' : status.toLowerCase();
    const timePath = !time ? 'all' : time;

    // Constructing the URL with path segments
    // Note: page is usually still kept as a query param for standard pagination
    const url = `order/financials/invoices?status=${statusPath}&time=${timePath}`;

    const response = await api.get(url, {
      params: { page },
    });

    return response.data;
  } catch (error) {
    console.error('API Error [getInvoices]:', error);
    throw error;
  }
};


export const getProfileDetails = async () => {
  try {
    const response = await api.get('customers/profile-details');
    return response.data.results.data;
  } catch (error) {
    console.error('API Error [getProfileDetails]:', error);
    throw error;
  }
};

export const getStatementOfAccounts = async (
  period: 'this_month' | 'last_3_month' | 'this_year',
) => {
  try {
    const response = await api.get(
      `customers/statement-of-accounts?period=${period}`,
    );
    return response.data.results;
  } catch (error) {
    console.error('API Error [getStatementOfAccounts]:', error);
    throw error;
  }
};


export const initiatePayment = async (orderId: string) => {
   try {
     const response = await api.post(`order/${orderId}/initiate-payment`);
     return response.data;
   } catch (error) {
     console.error('API Error', error);
     throw error;
   }
};