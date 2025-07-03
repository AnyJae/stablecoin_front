"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { AppKit } from "@reown/appkit";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useLanguage } from '@/contexts/LanguageContext';

interface WalletInfo {
  address: string;
  balance: string;
  isConnected: boolean;
  chain: "xrpl" | "avalanche" | null;
  networkName?: string;
  isMock?: boolean;
}

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
  walletInfo: WalletInfo;
  walletTransaction: WalletTransaction;
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (transaction: any) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

function WalletProviderContent({ children }: WalletProviderProps) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: "",
    balance: "",
    isConnected: false,
    chain: null,
  });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

 const { t } = useLanguage();

// 잔액 조회
 const fetchBalance = useCallback(async (address: string, chain: 'xrpl' | 'avalanche') => {
    try {
      if (chain === 'xrpl') {
        // XRPL 잔액 조회 API 호출
        const response = await fetch(`/api/xrpl/balance/${address}`);
        const data = await response.json();
        
        if (data.success) {
          setWalletInfo(prev => ({
            ...prev,
            balance: data.data?.formattedBalance || '0'
          }));
        } else {
          throw new Error(data.message || '잔액 조회에 실패했습니다.');
        }
      } else {
        // Avalanche 잔액 조회 API 호출
        const response = await fetch(`/api/avalanche/balance/${address}`);
        const data = await response.json();
        
        if (data.success) {
          setWalletInfo(prev => ({
            ...prev,
            balance: data.data?.formattedBalance || '0'
          }));
        } else {
          throw new Error(data.message || '잔액 조회에 실패했습니다.');
        }
      }
      toast.success(t('messages.walletConnected'));
    } catch (err) {
      console.error('Balance fetch error:', err);
      toast.error(t('errors.walletConnection'));
    }
  }, []);

  // 네트워크 정보 조회
  const fetchNetworkInfo = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask가 설치되지 않았습니다.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
    } catch (err) {
      console.error("네트워크 정보 조회 실패:", err);
      setError("네트워크 정보 조회에 실패했습니다.");
    }
  };

  // 지갑 연결
  // Avalanche 지갑 연결

  
  const connect = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!window.ethereum) {
        throw new Error("MetaMask가 설치되지 않았습니다.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        await fetchBalance(accounts[0]);
        await fetchNetworkInfo();
      }
    } catch (err) {
      console.error("지갑 연결 실패:", err);
      setError("지갑 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 지갑 연결 해제
  const disconnect = () => {
    try {
      setIsConnected(false);
      setAddress(null);
      setBalance(null);
      setChainId(null);
      setError(null);
    } catch (err) {
      console.error("지갑 연결 해제 실패:", err);
      setError("지갑 연결 해제에 실패했습니다.");
    }
  };

  // 메시지 서명
  const signMessage = async (message: string): Promise<string> => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask가 설치되지 않았습니다.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      return signature;
    } catch (err) {
      console.error("메시지 서명 실패:", err);
      throw new Error("메시지 서명에 실패했습니다.");
    }
  };

  // 트랜잭션 전송
  const sendTransaction = async (transaction: any) => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask가 설치되지 않았습니다.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction(transaction);
      return await tx.wait();
    } catch (err) {
      console.error("트랜잭션 전송 실패:", err);
      throw new Error("트랜잭션 전송에 실패했습니다.");
    }
  };

  const value: WalletContextType = {
    walletInfo:{
      address: walletInfo.address,
      balance: walletInfo.balance,
      isConnected: walletInfo.isConnected,
      chain: walletInfo.chain,
      networkName: walletInfo.networkName,
      isMock: walletInfo.isMock,
    },
    walletTransaction: transactions.length > 0 ? transactions[0] : {
      hash: "",
      from: "",
      to: "",
      amount: "",
      currency: "",
      timestamp: 0,
      status: "pending",
      explorerUrl: "",
    },
    connect,
    disconnect,
    signMessage,
    sendTransaction,
    isLoading,
    error,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function WalletProvider({ children }: WalletProviderProps) {
  return <WalletProviderContent>{children}</WalletProviderContent>;
}
