import { create } from 'zustand';
import { createAddressApi, getAddressesApi } from '../api/products/productsApi';

interface Address {
  id: string;
  location_name: string;
  address: string;
}

interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null; // Track selection
  loading: boolean;
  fetchAddresses: () => Promise<void>;
  addAddress: (name: string, fullAddress: string) => Promise<Address>;
  setSelectedAddress: (address: Address) => void; // Action to set selection
}

export const useAddressStore = create<AddressState>(set => ({
  addresses: [],
  selectedAddress: null, // Initial state
  loading: false,

  fetchAddresses: async () => {
    set({ loading: true });
    try {
      const data = await getAddressesApi();
      set({ addresses: data });
      // Optional: Auto-select the first address if none is selected
      if (data.length > 0 && !get().selectedAddress) {
        set({ selectedAddress: data[0] });
      }
    } finally {
      set({ loading: false });
    }
  },

  addAddress: async (name, fullAddress) => {
    set({ loading: true });
    try {
      const newAddr = await createAddressApi({
        location_name: name,
        address: fullAddress,
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
