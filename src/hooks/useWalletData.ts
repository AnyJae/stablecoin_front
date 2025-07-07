import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useCallback } from "react";
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

export const useWalletData = () => {
  const {
    address,
    chain,
    isMock,
    setBalance,
    setKscBalance,
    setTransactions,
    setIsLoading,
    setError,
  } = useWalletContext();

  //Avalanche or XRPL 잔액 조회
  const fetchBalance = useCallback(async (chain: "xrpl" | "avalanche") => {},
  []);

  //KSC 잔액 조회
  const fetchKscBalance = useCallback(async () => {
    try {
      const response = await fetch(`/api/${chain}/balance/${address}`);
      const data = await response.json();
      if (data.success) {
        setKscBalance(data);
      } else {
        throw new Error(data.message || "잔액 조회에 실패했습니다.");
      }
    } catch (err) {
      console.error("Balance fetch error:", err);
      toast.error("잔액 조회에 실패했습니다.");
    }
  }, []);

  //트랜잭션 조회
  const fetchTransactions = useCallback(async (address: string) => {
    try {
      // Mock Wallet인 경우 Mock 데이터 반환
      if (isMock) {
        const mockTransactions: WalletTransaction[] = [
          {
            hash: "0x" + Math.random().toString(36).substring(2, 15),
            from: address,
            to: "0x" + Math.random().toString(36).substring(2, 15),
            amount: "100.00",
            currency: "KSC",
            timestamp: Date.now() - 3600000, // 1시간 전
            status: "confirmed",
          },
          {
            hash: "0x" + Math.random().toString(36).substring(2, 15),
            from: "0x" + Math.random().toString(36).substring(2, 15),
            to: address,
            amount: "50.00",
            currency: "KSC",
            timestamp: Date.now() - 7200000, // 2시간 전
            status: "confirmed",
          },
        ];
        setTransactions(mockTransactions);
        return;
      }

      const response = await fetch(`/api/transactions/${address}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);
      } else {
        throw new Error(data.message || "거래내역 조회에 실패했습니다.");
      }
    } catch (err) {
      console.error("Transaction fetch error:", err);
      toast.error("거래내역 조회에 실패했습니다.");
    }
  }, []);

  return {
    fetchBalance,
    fetchKscBalance,
    fetchTransactions,
  };
};
