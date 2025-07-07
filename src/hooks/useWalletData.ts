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
      if (address) {
        const balanceWei = await provider?.getBalance(address);
        if (balanceWei) {
          setBalance(ethers.formatEther(balanceWei));
        } else {
          setBalance("0");
        }
      } else {
        throw new Error("연결된 지갑이 없습니다");
      }
    } catch (err) {
      console.error("네이티브 토큰 잔액 조회에 실패했습니다", err);
    }
  }, []);

  //KSC 잔액 조회
  const fetchKscBalance = useCallback(async () => {
    try {
      const response = await fetch(`/api/${chainName}/balance/${address}`);
      const data = await response.json();
      if (data.success) {
        setKscBalance(data.data.formattedBalance);
      } else {
        throw new Error(data.error.message || "잔액 조회에 실패했습니다");
      }
    } catch (err: any) {
      console.log("KSC Balance fetch error", err);
      toast.error("잔액 조회에 실패했습니다");
    }
  }, []);

  //주소별 트랜잭션 내역 조회
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`/api/transactions/history/${address}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data.history || []);
      } else {
        throw new Error(data.error.message || "거래 내역 조회에 실패했습니다");
      }
    } catch (err: any) {
      console.error("Transaction fetch error:", err);
      toast.error("거래 내역 조회에 실패했습니다.");
    }
  }, []);

  useEffect(() => {
    if (isConnected && address && chainName) {
      fetchBalance();
      fetchKscBalance();
      fetchTransactions();
    } else {
      setBalance("0");
      setKscBalance("0");
      setTransactions([]);
    }
  },[
    isConnected,  //연결 상태 변경 시
    address,   //지갑 주소 변경 시
    chainName,   //네트워크 변경 시
    fetchBalance,
    fetchKscBalance,
    fetchTransactions
  ]);

  return {
    fetchBalance,
    fetchKscBalance,
    fetchTransactions,
  };
};
