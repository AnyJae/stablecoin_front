import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { delay } from "@/utils/helpers";

export const useWalletData = () => {
  const {
    address,
    chainName,
    provider,
    isConnected,
    isMock,
    balance,
    kscBalance,
    transactions,
    isLoading,

    setBalance,
    setKscBalance,
    setTransactions,
    setIsLoading,
    setError,
  } = useWalletContext();

  const { t } = useLanguage();

  //Avalanche or XRPL 네이티브 토큰 잔액 조회
  const fetchBalance = useCallback(async () => {
    setIsLoading(true);
    try {
      if (address && provider) {
        const balanceWei = await provider.getBalance(address);
        setBalance(ethers.formatEther(balanceWei));
      } else {
        setBalance("0");
      }
    } catch (err) {
      console.error("네이티브 토큰 잔액 조회에 실패했습니다", err);
      setBalance("0");
    } finally {
      await delay(500);
      setIsLoading(false);
    }
  }, [address, provider, setBalance]);

  //KSC 잔액 조회
  const fetchKscBalance = useCallback(async () => {
    setIsLoading(true);

    //유효성 검사
    if (!address || !chainName || isMock) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("잔액 조회 시도");
      const response = await fetch(`/api/${chainName}/get-balance/${address}`);
      const data = await response.json();
      if (data.success) {
        setKscBalance(data.data.formattedBalance);
      } else {
        throw new Error(data.error.message || "잔액 조회에 실패했습니다");
      }
    } catch (err: any) {
      console.log("KSC Balance fetch error: ", err);
      toast.error("잔액 조회에 실패했습니다");
      setKscBalance("0");
    } finally {
      await delay(500);
      setIsLoading(false);
    }
  }, [address, chainName, setKscBalance]);

  //주소별 트랜잭션 내역 조회
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    if (!address || isMock) return;
    try {
      setTimeout(() => {}, 5000);

      console.log("트랜잭션 조회 시도");
      const response = await fetch(`/api/transaction/get-history/${address}`);
      const data = await response.json();

      console.log("백엔드 응답: ", data);
      if (data.success) {
        setTransactions(data.data.items || []);
      } else {
        throw new Error(data.error.message || "거래 내역 조회에 실패했습니다");
      }
    } catch (err: any) {
      console.error("Transaction fetch error:", err);
      toast.error("거래 내역 조회에 실패했습니다.");
      setTransactions([]);
    } finally {
      await delay(500);
      setIsLoading(false);
    }
  }, [address, setTransactions]);

  useEffect(() => {
    if ((isConnected || isMock) && address && chainName) {
      fetchBalance();
      fetchKscBalance();
      fetchTransactions();
    } else {
      setBalance("0");
      setKscBalance("0");
      setTransactions([]);
    }
  }, [
    isConnected,
    isMock,
    address,
    chainName,
    fetchBalance,
    fetchKscBalance,
    fetchTransactions,
  ]);

  return {
    fetchBalance,
    fetchKscBalance,
    fetchTransactions,
  };
};
