import { create } from "zustand";
import { WalletService, WalletProviderType } from "../wallet/WalletService";
import { checkFreighterInstalled, connectFreighterWallet, getFreighterPublicKey } from "../utils/freighter";

interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  walletType: WalletProviderType | null;
  isLoading: boolean;
  error: string | null;
  connectWallet: (walletType: WalletProviderType) => Promise<void>;
  disconnectWallet: () => void;
  checkConnection: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  isConnected: false,
  publicKey: null,
  walletType: null,
  isLoading: false,
  error: null,

  connectWallet: async (walletType: WalletProviderType) => {
    set({ isLoading: true, error: null });
    try {
      const publicKey = await WalletService.connect(walletType);
      console.log(`Connected wallet: ${publicKey}`);
      console.log(`Wallet type: ${walletType}`);
      // Save to localStorage so we can try reconnecting
      if (typeof window !== "undefined") {
        localStorage.setItem("connectedWalletType", walletType);
      }
      set({ isConnected: true, publicKey, walletType, isLoading: false, error: null });
    } catch (error: any) {
      console.log(`Wallet connection failed: ${error.message}`);
      set({ error: error.message, isLoading: false });
    }
  },

  disconnectWallet: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("connectedWalletType");
    }
    set({ isConnected: false, publicKey: null, walletType: null, error: null });
  },

  checkConnection: async () => {
    if (typeof window === "undefined") return;
    const storedWalletType = localStorage.getItem("connectedWalletType") as WalletProviderType | null;
    if (storedWalletType) {
      try {
        const publicKey = await WalletService.checkConnection(storedWalletType);
        if (publicKey) {
          console.log(`Connected wallet: ${publicKey}`);
          console.log(`Wallet type: ${storedWalletType}`);
          set({ isConnected: true, publicKey, walletType: storedWalletType });
        } else {
          // If check fails or not supported (like Albedo), we clear the state
          localStorage.removeItem("connectedWalletType");
        }
      } catch (error) {
        // Silently fail
        localStorage.removeItem("connectedWalletType");
      }
    }
  },
}));
