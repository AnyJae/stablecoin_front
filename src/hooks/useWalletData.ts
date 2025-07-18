import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { delay } from "@/utils/helpers";

export const useWalletData = () => {
  const {
    address,
    addressId,
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

  const { t, language } = useLanguage();

  const [txCount, setTxCount] = useState('');

  //Avalanche or XRPL 네이티브 토큰 잔액 조회
  const fetchBalance = useCallback(async () => {
    setIsLoading(true);
    try {
      if (address && provider) {
        const balanceWei = await provider.getBalance(address);
        setBalance(ethers.formatEther(balanceWei));
      } else {
        setBalance("-");
      }
    } catch (err) {
      toast.error(t(`wallet.errors.nativeTokenLoadError`));
      setBalance("-");
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
      const response = await fetch(
        `/api/wallet/get-wallet/${addressId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "accept-language": language,
            },}
      );

      const data = await response.json();
      if (data.success) {
        setKscBalance('500');
        //setKscBalance(data.data.kscBalance || '-');
      } else {
        throw new Error("잔액 조회에 실패했습니다");
      }
    } catch (err: any) {
      console.log("KSC Balance fetch error: ", err);
      toast.error("KSC 잔액 조회에 실패했습니다");
      setError(err.message);
      setKscBalance("-");
    } finally {
      await delay(500);
      setIsLoading(false);
    }
  }, [address, isMock, chainName, setKscBalance]);

  //거래 내역 수 조회
  const fetchTxCount = useCallback(async () => {
    //유효성 검사
    if (!address || !chainName || isMock) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `/api/wallet/get-wallet/${addressId}`,{
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "accept-language": language,
            },}
      );

      const data = await response.json();
      if (data.success) {
        setTxCount(data.data.successfulTransactions);
      } else {
        throw new Error("거래 수 조회에 실패했습니다");
      }
    } catch (err: any) {
      console.log("KSC Balance fetch error: ", err);
      toast.error("거래 내역 수 조회에 실패했습니다");
      setError(err.message);
      setTxCount("-");
    } finally {
      await delay(500);
      setIsLoading(false);
    }
  }, [address, chainName, isMock, setTxCount]);

  //주소별 트랜잭션 내역 조회
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    if (!address || isMock) return;
    try {
      console.log("트랜잭션 조회 시도");
      const response = await fetch(`/api/transaction/get-history/${addressId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "accept-language": language,
            },});
      const data = await response.json();

      console.log("백엔드 응답: ", data);
      if (data.success) {
        setTransactions(data.data.items || []);
        console.log('트랜잭션 히스토리', data.data.items);
      } else {
        throw new Error(data.message || "거래 내역 조회에 실패했습니다");
      }
    } catch (err: any) {
      console.error("Transaction fetch error:", err);
      toast.error("거래 내역 조회에 실패했습니다.");
      setTransactions([]);
    } finally {
      await delay(500);
      setIsLoading(false);
    }
  }, [address, isMock,setTransactions]);

  useEffect(() => {
    if ((isConnected || isMock) && address && chainName) {
      fetchBalance();
      fetchKscBalance();
      fetchTxCount();
      fetchTransactions();
    } else {
      setBalance("-");
      setKscBalance("-");
      setTxCount("-")
      setTransactions([]);
    }
  }, [
    isConnected,
    isMock,
    address,
    addressId,
    chainName
  ]);

  return {
    txCount,
    fetchBalance,
    fetchKscBalance,
    fetchTxCount,
    fetchTransactions,
  };
};
