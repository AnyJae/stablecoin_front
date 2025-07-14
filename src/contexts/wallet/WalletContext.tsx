"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { ethers, id } from "ethers";
import { MOCK_WALLET_DATA, generateMockTransactions } from "@/utils/mockWallet";
import { useLanguage } from "../localization/LanguageContext";
import toast from "react-hot-toast";

import { WalletTransaction } from "@/types/global.d";

interface WalletContextType {
  address: string | null;
  balance: string | null;
  kscBalance: string;
  isConnected: boolean;
  chainId: number | null;
  chainName: "xrpl" | "avalanche" | null;
  isMock?: boolean;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;

  setAddress: (address: string | null) => void;
  setBalance: (balance: string | null) => void;
  setKscBalance: (balance: string) => void;
  setIsConnected: (connected: boolean) => void;
  setChainId: (chainId: number | null) => void;
  setChainName: (chainName: "xrpl" | "avalanche" | null) => void;
  setIsMock: (connected: boolean) => void;
  setTransactions: (transactions: WalletTransaction[]) => void;
  setError: (error: string | null) => void;
  setIsLoading: (connected: boolean) => void;
  setProvider: (provider: ethers.BrowserProvider | null) => void;
  setSigner: (signer: ethers.Signer | null) => void;
  connectMockWallet: (chain: "xrpl" | "avalanche") => void;
  sendMockKsc: (to: string, amount: string) => Promise<void>;
}

//localStorage 키 (지갑 연결 수동 해제 상태)
const DISCONNECT_FLAG_KEY = "wallet_disconnected_permanently";

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [kscBalance, setKscBalance] = useState<string>('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [chainName, setChainName] = useState<"xrpl" | "avalanche" | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  // Mock 지갑 연결
  const connectMockWallet = useCallback(async (chain: "xrpl" | "avalanche") => {
    setIsLoading(true);
    setError(null);
    setIsMock(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5초 지연
      const mockData = MOCK_WALLET_DATA[chain];
      // const mockTransactions = generateMockTransactions(mockData.address);

      setAddress(mockData.address);
      setBalance(mockData.balance);
      setKscBalance(mockData.kscBalance);
      setChainName(chain);
      setTransactions([]);

      toast.success(`${chain.toUpperCase()} Mock 지갑이 연결되었습니다.`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Mock 지갑 연결에 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Mock wallet connection error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  //Mock KSC 전송
  const sendMockKsc = useCallback(
    async (to: string, amount: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 지연

        if (!address || !kscBalance) {
          throw new Error(
            "지갑이 연결되지 않았거나 KSC 잔액을 알 수 없습니다."
          );
        }


        if (kscBalance < amount) {
          throw new Error("잔액이 부족합니다.");
        }

        const newKscBalance = (parseFloat(kscBalance) - parseFloat(amount)).toFixed(2);
        setKscBalance(newKscBalance);

        const mockTransaction: WalletTransaction = {
          id: "txid_" + Math.random().toString(36).substring(2, 9),
          txHash: "0x" + Math.random().toString(36).substring(2, 15),
          fromAddress: address,
          toAddress: to,
          txStatus: "pending",
          paymentType: "instant",
          fee: 0.0003,
          amount: amount,
          tokenType: chainName === "avalanche" ? "A_KSC" : "X_KSC",
          createdAt: new Date().toISOString(),
          statusUpdatedAt: new Date().toISOString(),
          memo: "Mock KSC 전송",
        };
        setTransactions((prev) => [mockTransaction, ...prev]);

        toast.success("Mock KSC 전송이 성공적으로 완료되었습니다!");
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Mock KSC 전송 중 오류가 발생했습니다.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Mock KSC send error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      address,
      kscBalance,
      setKscBalance,
      setTransactions,
      setIsLoading,
      setError,
    ]
  );

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
    provider,
    signer,

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
    connectMockWallet,
    sendMockKsc,
  };

  //provider와 signer 설정 및 이벤트 리스너 등록
  useEffect(() => {
    const initWalletProvider = async () => {
      if (typeof window.ethereum === "undefined") {
        console.warn("MetaMask wallet not detected.");
        return;
      } else {
        // 지갑 연결 해제 플래그 확인하여 상태 업데이트
        if (localStorage.getItem(DISCONNECT_FLAG_KEY) === "true") {
          setAddress(null);
          setBalance(null);
          setKscBalance('0');
          setChainId(null);
          setChainName(null);
          setIsConnected(false);
          setIsMock(false);
          setTransactions([]);
          setIsLoading(false);
          setProvider(null);
          setSigner(null);

          return; //지갑 연결 해제 상태 시 자동 연결하지 않음
        }

        try {
          // ethers.js BrowserProvider 생성
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
          setKscBalance('0');
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

        const currentProvider = new ethers.BrowserProvider(window.ethereum);

        if (newAccounts.length === 0) {
          // 지갑 연결 해제
          setAddress(null);
          setBalance(null);
          setKscBalance('0');
          setChainId(null);
          setChainName(null);
          setIsConnected(false);
          setIsMock(false);
          setTransactions([]);
          setProvider(null);
          setSigner(null);
          setError(null);

          localStorage.setItem(DISCONNECT_FLAG_KEY, "true");
          toast.success(t("messages.walletDisconnected"));
        } else {
          setAddress(newAccounts[0]);
          setIsConnected(true);
          localStorage.removeItem(DISCONNECT_FLAG_KEY);

          if (currentProvider) {
            // provider가 이미 있다면 Signer 갱신
            try {
              const _signer = await currentProvider.getSigner();
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
      const handleChainChanged = async () => {
        setIsLoading(true); // 상태 변경 시작
        const currentProvider = new ethers.BrowserProvider(window.ethereum);
        if (currentProvider) {
          // provider가 있다면 네트워크 정보 갱신
          const network = await currentProvider.getNetwork();
          const chainId = Number(network.chainId);
          let currentChain: "xrpl" | "avalanche" | null = null;
          if (chainId === 43114 || chainId === 43113) {
            // Avalanche
            currentChain = "avalanche";
          } else if (chainId === 1449000) {
            currentChain = "xrpl";
          }

          setChainId(chainId);
          setChainName(currentChain);
          setError(null);
          toast.success(
            t("messages.networkChanged", { chainName: currentChain || "" })
          );
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
  }, []);

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
