import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { ethers } from "ethers";

//localStorage 키 (지갑 연결 수동 해제 상태)
const DISCONNECT_FLAG_KEY = "wallet_disconnected_permanently";

// 각 체인별 설정 정보 (📍실제 Chain ID, RPC URL 등으로 업데이트 필요📍)
const CHAIN_CONFIGS = {
  avalanche: {
    chainId: "0xa869", // Avalanche Fuji Testnet (43113)
    chainName: "Avalanche Fuji Testnet",
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://testnet.snowtrace.io"],
  },
  "xrpl-evm": {
    chainId: "0x161c28", // XRPL EVM Sidechain Testnet (1449000)
    chainName: "XRPL EVM Sidechain Testnet",
    nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
    rpcUrls: ["https://rpc.testnet.xrplevm.org"],
    blockExplorerUrls: ["https://explorer.testnet.xrplevm.org/"],
  },
};

export const useWalletConnect = () => {
  const { t, language } = useLanguage();
  const {
    setAddress,
    setIsConnected,
    setChainId,
    setChainName,
    setIsMock,
    setIsLoading,
    setError,
    setSigner,
    setProvider,
  } = useWalletContext();

  //지갑 연결
  const connectEvmWallet = useCallback(
    async (targetChain: "avalanche" | "xrpl-evm") => {
      setIsLoading(true);
      setError(null);
      try {
        // 메타마스크가 없을 경우
        if (typeof window.ethereum === "undefined") {
          throw new Error(t("errors.metaMaskNotFound"));
        }

        localStorage.removeItem(DISCONNECT_FLAG_KEY);

        const config = CHAIN_CONFIGS[targetChain];

        // 계정 요청 (MetaMask 팝업 띄움)
        const accounts: string[] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (!accounts || accounts.length === 0) {
          throw new Error(t("errors.walletConnection"));
        }
        const address = accounts[0];

        // 현재 연결된 체인 ID 확인
        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        // 타겟 체인으로 전환 시도
        if (currentChainId !== config.chainId) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: config.chainId }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              // 네트워크가 MetaMask에 없는 경우 추가
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [config],
              });
            } else {
              throw switchError; //다른 에러
            }
          }
        }

        // ethers.js BrowserProvider,Signer생성
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const _signer = await _provider.getSigner();

        // 지갑 정보 백엔드에 저장
        try {
          const res = await fetch("/api/wallet/post-wallet", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "accept-language": language,
            },
            body: JSON.stringify({
              address,
              networkType: targetChain === "avalanche" ? "AVAX" : "XRPL",
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
          console.log("Wallet save response:", res);
        } catch (err: any) {
          console.error("Failed to save wallet:", err);
          throw new Error(err.message)
        }
                // WalletContext 상태 업데이트
        setAddress(address);
        setIsConnected(true);
        setChainId(Number(config.chainId)); // 십진수로 변환
        setChainName(targetChain === "avalanche" ? "avalanche" : "xrpl");
        setIsMock(false);
        setProvider(_provider);
        setSigner(_signer);
    
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : t("errors.walletConnection");
        setError(errorMessage);
        console.error(`${targetChain} wallet connection error:`, e);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [
      t,
      setAddress,
      setIsConnected,
      setChainId,
      setChainName,
      setIsMock,
      setIsLoading,
      setError,
    ]
  );

  // XRPL 지갑 연결 (EVM 사이드체인)
  const connectXrplEvmWallet = useCallback(async () => {
    await connectEvmWallet("xrpl-evm");
  }, [connectEvmWallet]);

  // Avalanche 지갑 연결
  const connectAvalancheWallet = useCallback(async () => {
    await connectEvmWallet("avalanche");
  }, [connectEvmWallet]);

  //지갑 연결 해제
  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setChainId(null);
    setChainName(null);
    setIsMock(false);
    setError(null);

    localStorage.setItem(DISCONNECT_FLAG_KEY, "true");
  }, []);

  return {
    connectAvalancheWallet,
    connectXrplEvmWallet,
    disconnectWallet,
  };
};
