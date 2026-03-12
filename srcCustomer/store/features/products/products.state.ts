import { TabItem } from "../../../utilities/commonTypes";

// You can add ProductListItem interface here later
export interface ProductState {
  loading: boolean;
  error: string | null;
  statusCount: {};
  // products: any[]; // Add this when you create the list API
}

