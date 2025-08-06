"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { ethers, id } from "ethers";
import { MOCK_WALLET_DATA, generateMockTransactions } from "@/utils/mockWallet";
import { useLanguage } from "../localization/LanguageContext";
import toast from "react-hot-toast";

import { WalletTransaction } from "@/types/global.d";
import { usePathname } from "next/navigation";
import { XRPL_EVM_CHAIN_CONFIG } from "@/constants/xrplEvm";
import { AVALANCHE_CHAIN_CONFIG } from "@/constants/avalanche";

interface WalletContextType {
  address: string | null;
  addressId: string;
  balance: string | null;
  kscBalance: string;
  isConnected: boolean;
  chainId: string |null;
  chainName: "xrpl" | "avalanche" | null;
  isMock?: boolean;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;

  setAddress: (address: string | null) => void;
  setAddressId: (addressId: string) => void;
  setBalance: (balance: string | null) => void;
  setKscBalance: (balance: string) => void;
  setIsConnected: (connected: boolean) => void;
  setChainId: (chainId: string | null) => void;
  setChainName: (chainName: "xrpl" | "avalanche" | null) => void;
  setIsMock: (connected: boolean) => void;
  setTransactions: Dispatch<SetStateAction<WalletTransaction[]>>; 
  setError: (error: string | null) => void;
  setIsLoading: (connected: boolean) => void;
  setProvider: (provider: ethers.BrowserProvider | null) => void;
  setSigner: (signer: ethers.Signer | null) => void;
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
  const [addressId, setAddressId] = useState<string>("");
  const [balance, setBalance] = useState<string | null>(null);
  const [kscBalance, setKscBalance] = useState<string>("0");
  const [chainId, setChainId] = useState<string | null>(null);
  const [chainName, setChainName] = useState<"xrpl" | "avalanche" | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const pathname = usePathname(); //현재 경로

  const { t, language } = useLanguage();

  
  const contextValue: WalletContextType = {
    address,
    addressId,
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
    setAddressId,
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
    setSigner
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
          setAddressId("");
          setBalance(null);
          setKscBalance("0");
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
            const chainId = network.chainId.toString();
            let currentChain: "xrpl" | "avalanche" | null = null;

            if (Number(chainId) == Number(AVALANCHE_CHAIN_CONFIG.chainId)) {
              currentChain = "avalanche";
            } else if (Number(chainId) == Number(XRPL_EVM_CHAIN_CONFIG.chainId)) {
              currentChain = "xrpl";
            }

            // 지갑 정보 POST - 지갑 ID 받아오기
            try {
              const res = await fetch("/api/wallet/post-wallet", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "accept-language": language,
                },
                body: JSON.stringify({
                  address: connectedAddress,
                  networkType: currentChain === "avalanche" ? "AVAX" : "XRPL",
                }),
              });

              //에러 처리
              if (!res.ok) {
                let errData: any;
                try {
                  errData = await res.json();
                } catch (jsonParseError) {
                  // JSON 파싱 에러
                  console.error(
                    "Failed to parse API route error response JSON:",
                    jsonParseError
                  );
                  throw new Error(t("errors.networkError"));
                }
                const clientErrorMessage =
                  errData.message || t("errors.unexpectedError");

                throw new Error(clientErrorMessage);
              }

              //성공 시 아이디 상태 저장
              const data = await res.json();
              setAddressId(data.data.id);

              console.log("Wallet save response:", res);
            } catch (err: any) {
              console.error("Failed to save wallet:", err);
              throw new Error(err.message);
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
            setAddressId("");
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
          toast.error(t(`errors.initWalletError`));
          // 에러 발생 시 모든 상태 초기화
          setAddress(null);
          setAddressId("");
          setBalance(null);
          setKscBalance("0");
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
      const handleAccountsChanged = async () => {
        setIsLoading(true);

        const accounts: string[] = await window.ethereum.request({
          method: "eth_accounts",
        });
        const currentProvider = new ethers.BrowserProvider(window.ethereum);

        if (accounts.length === 0) {
          // 지갑 연결 해제
          setAddress(null);
          setAddressId("");
          setBalance(null);
          setKscBalance("0");
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
          // 지갑 정보 POST - 지갑 ID 받아오기
          try {
            const currentProvider = new ethers.BrowserProvider(window.ethereum);
            let currentChain: "xrpl" | "avalanche" | null = null;
            if (currentProvider) {
              // provider가 있다면 네트워크 정보 갱신
              const network = await currentProvider.getNetwork();
              const chainId = Number(network.chainId);

              if (chainId === 43114 || chainId === 43113) {
                // Avalanche
                currentChain = "avalanche";
              } else if (chainId === 1449000) {
                currentChain = "xrpl";
              }
            }
            const res = await fetch("/api/wallet/post-wallet", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "accept-language": language,
              },
              body: JSON.stringify({
                address: accounts[0],
                networkType: currentChain === "avalanche" ? "AVAX" : "XRPL",
              }),
            });

            //에러 처리
            if (!res.ok) {
              let errData: any;
              try {
                errData = await res.json();
              } catch (jsonParseError) {
                // JSON 파싱 에러
                console.error(
                  "Failed to parse API route error response JSON:",
                  jsonParseError
                );
                throw new Error(t("errors.networkError"));
              }
              const clientErrorMessage =
                errData.message || t("errors.unexpectedError");

              throw new Error(clientErrorMessage);
            }

            //성공 시 상태 변경

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

            const data = await res.json();
            setAddressId(data.data.id);

            setAddress(accounts[0]);
            setIsConnected(true);
            localStorage.removeItem(DISCONNECT_FLAG_KEY);
            toast.success(t("messages.accountChanged"));

            console.log("Wallet save response:", res);
          } catch (err: any) {
            console.error("Failed to change wallet:", err);
            toast.error(t(`errors.accountChangeError`));
            throw new Error(err.message);
          }
        }
        setIsLoading(false);
      };

      //네트워크 변경 이벤트 리스너
      const handleChainChanged = async () => {
        setIsLoading(true); // 상태 변경 시작

        const accounts: string[] = await window.ethereum.request({
          method: "eth_accounts",
        });

        const currentProvider = new ethers.BrowserProvider(window.ethereum);
        let currentChain: "xrpl" | "avalanche" | null = null;
        if (currentProvider) {
          // provider가 있다면 네트워크 정보 갱신
          const network = await currentProvider.getNetwork();
          const chainId = Number(network.chainId);

          if (chainId === 43114 || chainId === 43113) {
            // Avalanche
            currentChain = "avalanche";
          } else if (chainId === 1449000) {
            currentChain = "xrpl";
          }
        }
        // 지갑 정보 POST - 지갑 ID 받아오기
        try {
          const res = await fetch("/api/wallet/post-wallet", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "accept-language": language,
            },
            body: JSON.stringify({
              address: accounts[0],
              networkType: currentChain === "avalanche" ? "AVAX" : "XRPL",
            }),
          });

          //에러 처리
          if (!res.ok) {
            let errData: any;
            try {
              errData = await res.json();
            } catch (jsonParseError) {
              // JSON 파싱 에러
              console.error(
                "Failed to parse API route error response JSON:",
                jsonParseError
              );
              throw new Error(t("errors.networkError"));
            }
            const clientErrorMessage =
              errData.message || t("errors.unexpectedError");

            throw new Error(clientErrorMessage);
          }

          //성공 시 상태 저장
          const data = await res.json();
          setAddressId(data.data.id);

          setChainId(chainId);
          setChainName(currentChain);
          setError(null);
          toast.success(
            t("messages.networkChanged", { chainName: currentChain || "" })
          );

          console.log("Wallet save response:", res);
        } catch (err: any) {
          console.error("Failed to save wallet:", err);
          toast.error(t(`errors.networkChangeError`));
          throw new Error(err.message);
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

  //경로 변경 시 에러 상태 초기화
  useEffect(() => {
    if (error !== null) {
      setError(null);
    }
  }, [pathname]);

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
