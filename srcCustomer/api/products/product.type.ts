export interface mainCategoryPayload {
  //   role: number | undefined;
  isLanding?: string;
  search?: string;
}


export interface ProductListPayload {
  main_categories?: string[];
  categories?: string[];
  sub_categories?: string[];
  popular_filters?: {
    on_sale?: boolean;
    best_seller?: boolean;
    new_arrivals?: boolean;
    express_delivery?: boolean;
  };
  price_range?: {
    min?: number;
    max?: number;
  };
  search?: string;
  sort?: 'price_low' | 'price_high' | 'newest' | 'recommended';
  page?: number;
  page_size?: number;
}


export interface AddToCartPayload {
  in_shop_product_id: string;
  quantity: number;
}