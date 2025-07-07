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
import { useLanguage } from "../localization/LanguageContext";
import toast from "react-hot-toast";

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
  chainId: number | null;
  chainName: "xrpl" | "avalanche" | null;
  isMock?: boolean;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;

  setAddress: (address: string | null) => void;
  setBalance: (balance: string | null) => void;
  setKscBalance: (balance: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setChainId: (chainId: number | null) => void;
  setChainName: (chainName: "xrpl" | "avalanche" | null) => void;
  setIsMock: (connected: boolean) => void;
  setTransactions: (transactions: WalletTransaction[]) => void;
  setError: (error: string) => void;
  setIsLoading: (connected: boolean) => void;
  setProvider: (provider: ethers.BrowserProvider | null) => void;
  setSigner: (signer: ethers.Signer | null) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [kscBalance, setKscBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [chainName, setChainName] = useState<"xrpl" | "avalanche" | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const { t } = useLanguage();

  const contextValue: WalletContextType = {
    address,
    balance,
    kscBalance,
    isConnected,
    chainId,
    chainName,
    isMock,
    transactions,
    isLoading,
    error,

    setAddress,
    setBalance,
    setKscBalance,
    setIsConnected,
    setChainId,
    setChainName,
    setIsMock,
    setTransactions,
    setError,
    setIsLoading,
    setProvider,
    setSigner,
  };

  //provider와 signer 설정 및 이벤트 리스너 등록
  useEffect(() => {
    const initWalletProvider = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          // ethers.js BrowserProvider 생성 (지갑 연결 없이도 가능)
          const _provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(_provider);

          // 이미 연결된 계정이 있는지 확인
          const accounts: string[] = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            const connectedAddress = accounts[0];
            const _signer = await _provider.getSigner(); // Signer 생성
            setSigner(_signer);

            // 연결된 체인 정보 가져오기
            const network = await _provider.getNetwork();
            const chainId = Number(network.chainId);
            const chainName = network.name;
            let currentChain: "xrpl" | "avalanche" | null = null;

            if (chainId === 43114 || chainId === 43113) {
              currentChain = "avalanche";
            } else if (chainId === 1440002) {
              currentChain = "xrpl";
            }

            // WalletInfo 상태 업데이트
            setAddress(connectedAddress);
            setChainId(chainId);
            setChainName(currentChain);
            setIsConnected(true);
            setIsMock(false);
          } else {
            // 계정이 연결되어 있지 않은 경우 초기화
            setAddress(null);
            setChainId(null);
            setChainName(null);
            setIsConnected(false);
            setIsMock(false);
            setSigner(null);
          }
        } catch (err) {
          console.error("Failed to initialize wallet provider/signer:", err);
          setError(
            "지갑 초기화에 실패했습니다. " +
              (err instanceof Error ? err.message : String(err))
          );
          // 에러 발생 시 모든 상태 초기화
          setAddress(null);
          setBalance(null);
          setKscBalance(null);
          setChainId(null);
          setChainName(null);
          setIsConnected(false);
          setIsMock(false);
          setTransactions([]);
          setIsLoading(false);
          setProvider(null);
          setSigner(null);
        }
      }
    };

    initWalletProvider();

    //이벤트 리스너 설정
    if (window.ethereum) {
      //계정 변경/해제 이벤트 리스너
      const handleAccountsChanged = async (newAccounts: string[]) => {
        setIsLoading(true);
        if (newAccounts.length === 0) {
          // 지갑 연결 해제
          setAddress(null);
          setBalance(null);
          setKscBalance(null);
          setChainId(null);
          setChainName(null);
          setIsConnected(false);
          setIsMock(false);
          setTransactions([]);
          setProvider(null);
          setSigner(null);
          setError(null);

          toast.success(t("messages.walletDisconnected"));
        } else {
          setAddress(newAccounts[0]);
          setIsConnected(true);

          if (provider) {
            // provider가 이미 있다면 Signer 갱신
            try {
              const _signer = await provider.getSigner();
              setSigner(_signer);
            } catch (signerError) {
              console.error(
                "Failed to get signer on account change:",
                signerError
              );
              setSigner(null);
            }
          }
          toast.success(t("messages.accountChanged"));
        }
        setIsLoading(false);
      };

      //네트워크 변경 이벤트 리스너
      const handleChainChanged = async (newChainId: string) => {
        setIsLoading(true); // 상태 변경 시작
        if (provider) {
          // provider가 있다면 네트워크 정보 갱신
          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);
          const chainName = network.name;
          let currentChain: "xrpl" | "avalanche" | null = null;
          if (chainId === 43114 || chainId === 43113) {
            // Avalanche
            currentChain = "avalanche";
          } else if (chainId === 1440002) {
            currentChain = "xrpl";
          }

          setChainId(chainId);
          setChainName(currentChain);
          setError(null);
          toast.success(t("messages.networkChanged", { chainName: chainName }));
        }
        setIsLoading(false);
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // 컴포넌트 언마운트 시 리스너 제거(클린업 함수)
      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [provider]);

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletInfo must be used within a WalletProvider");
  }
  return context;
};
