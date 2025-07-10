import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
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

    setBalance,
    setKscBalance,
    setTransactions,
    setIsLoading,
    setError,
  } = useWalletContext();

  const { t } = useLanguage();

  //Avalanche or XRPL 네이티브 토큰 잔액 조회
  const fetchBalance = useCallback(async () => {
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
    }
  }, [address, provider, setBalance]);

  //KSC 잔액 조회
  const fetchKscBalance = useCallback(async () => {
    if (!address || !chainName) return;
    try {
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
    }
  }, [address, chainName, setKscBalance]);

  //주소별 트랜잭션 내역 조회
  const fetchTransactions = useCallback(async () => {
    if (!address) return;
    try {
      const response = await fetch(`/api/transactions/${address}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data || []);
      } else {
        throw new Error(data.error.message || "거래 내역 조회에 실패했습니다");
      }
    } catch (err: any) {
      console.error("Transaction fetch error:", err);
      toast.error("거래 내역 조회에 실패했습니다.");
      setTransactions([]);
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
  }, [isConnected, isMock, address, chainName, fetchBalance, fetchKscBalance, fetchTransactions]);

  return {
    fetchBalance,
    fetchKscBalance,
    fetchTransactions,
  };
};
