import { create } from 'zustand';
import { createAddressApi, getAddressesApi } from '../api/products/productsApi';

interface Address {
  id: string;
  location_name: string;
  address: string;
  latitude: string;
  longitude: string;
}

interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null; // Track selection
  loading: boolean;
  fetchAddresses: () => Promise<void>;
  // Updated signature to include coordinates
  addAddress: (
    name: string, 
    fullAddress: string, 
    latitude: string, 
    longitude: string
  ) => Promise<Address>;
  setSelectedAddress: (address: Address) => void; // Action to set selection
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  selectedAddress: null, // Initial state
  loading: false,

  fetchAddresses: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const data = await getAddressesApi();
      const list = Array.isArray(data) ? data : [];
      const prev = get().selectedAddress;
const prevId = prev ? (prev as Address).id : null;
const stillValid =
  prev != null && list.some(a => String(a.id) === String(prevId));
      const selectedAddress =
        list.length === 0
          ? null
          : stillValid
            ? prev
            : list[0];
      set({ addresses: list, selectedAddress });
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      set({ loading: false });
    }
  },

  addAddress: async (name, fullAddress, latitude, longitude) => {
    set({ loading: true });
    try {
      // Sending latitude and longitude keys to the backend API
      const newAddr = await createAddressApi({
        location_name: name,
        address: fullAddress,
        latitude: latitude,
        longitude: longitude,
      });

      set(state => ({
        addresses: [newAddr, ...state.addresses],
        selectedAddress: newAddr, // Auto-select newly created address
      }));
      return newAddr;
    } finally {
      set({ loading: false });
    }
  },

  setSelectedAddress: address => set({ selectedAddress: address }),
}));