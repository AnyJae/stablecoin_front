"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { ethers } from "ethers";

interface WalletTransaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  currency: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
  explorerUrl?: string;
}

interface WalletContextType {
  address: string | null;
  balance: string | null;
  kscBalance: string | null;
  isConnected: boolean;
  chain: "xrpl" | "avalanche" | null;
  isMock?: boolean;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;

  setAddress: (address: string | null) => void;
  setBalance: (balance: string | null) => void;
  setKscBalance: (balance: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setChain: (chain: "xrpl" | "avalanche" | null) => void;
  setIsMock: (connected: boolean) => void;
  setTransactions: (transactions: WalletTransaction[]) => void;
  setError:(error: string) => void;
  setIsLoading: (connected: boolean) => void;
//   setProvider: (provider: ethers.BrowserProvider | null) => void;
//   setSigner: (signer: ethers.Signer | null) => void;
 }

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [kscBalance, setKscBalance] = useState<string |null>(null);
  const [chain, setChain] = useState<"xrpl" | "avalanche" | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);


  const contextValue: WalletContextType = {
    address,
    balance,
    kscBalance,
    isConnected,
    chain,
    isMock,
    transactions,
    isLoading,
    error,

    setAddress,
    setBalance,
    setKscBalance,
    setIsConnected,
    setChain,
    setIsMock,
    setTransactions,
    setError,
    setIsLoading,
    // setProvider,
    // setSigner,
  };


  return (
    <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>
  );
}

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletInfo must be used within a WalletProvider');
  }
  return context;
};