import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { delay } from "@/utils/helpers";
import { WalletTransaction } from "@/types/global";
import { formatWeiToKsc } from "@/utils/formatters";

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
    isLoading,

    setBalance,
    setKscBalance,
    setIsLoading,
    setError,
  } = useWalletContext();

  const { t, language } = useLanguage();

  //거래 내역
  const [txHistory, setTxHistory] = useState<WalletTransaction[]>([]);

  //  페이지네이션 관련 상태 추가
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(0);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // 1. Avalanche or XRPL 네이티브 토큰 잔액 조회
  const fetchBalance = useCallback(async () => {
    setIsLoading(true);
    try {
      if (address && provider) {
        const balanceWei = await provider.getBalance(address);
        console.log("네이티브 토큰 잔액", balanceWei);
        setBalance(balanceWei.toString());
      } else {
        setBalance("-");
      }
    } catch (err) {
      toast.error(t(`wallet.errors.nativeTokenLoadError`));
      console.log("네이티브 잔액 조회 실패", err);
      setBalance("-");
    } finally {
      await delay(500);
      setIsLoading(false);
    }
  }, [address, provider, setBalance]);

  // 2. KSC 잔액 조회
  const fetchKscBalance = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    //유효성 검사
    if (!address || isMock) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/wallet/get-wallet/${addressId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "accept-language": language,
        },
      });

      const data = await response.json();
      if (data.success) {
        // setKscBalance("500.00");
        setKscBalance(data.data.kscBalance || "-");
        return formatWeiToKsc(data.data.kscBalance);
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


  // 3. 주소별 트랜잭션 내역 조회
  const fetchTransactions = useCallback(
    async (pageSize = itemsPerPage) => {
      setIsLoading(true);
      setError(null);

      //유효성 검사
      if (!address || !addressId || isMock) {
        setIsLoading(false);
        setTxHistory([]);
        setTotalTransactions(0);
        setTotalPages(0);
        return;
      }

      try {
        const response = await fetch(
          `/api/transaction/get-history/${addressId}?limit=${pageSize}&page=${currentPage}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "accept-language": language,
            },
          }
        );
        const data = await response.json();

        console.log("트랜잭션 내역:", data.data);

        if (data.success) {
          setTxHistory(data.data.items || []);
          setTotalTransactions(data.data.pagination.totalCount);
          setTotalPages(data.data.pagination.totalPage);
        } else {
          throw new Error(data.message || "거래 내역 조회에 실패했습니다");
        }
      } catch (err: any) {
        console.error("Transaction fetch error:", err);
        toast.error("거래 내역 조회에 실패했습니다.");
        setTxHistory([]);
        setTotalTransactions(0);
        setTotalPages(0);
      } finally {
        await delay(500);
        setIsLoading(false);
      }
    },
    [
      address,
      addressId,
      isMock,
      setTxHistory,
      setIsLoading,
      setError,
      currentPage,
      itemsPerPage,
      t,
    ]
  );

  useEffect(() => {
    if ((isConnected || isMock) && address && chainName) {
      fetchBalance();
      fetchKscBalance();
    } else {
      setBalance("-");
      setKscBalance("-");
      setTxHistory([]);
      setTotalTransactions(0);
      setTotalPages(0);
      setCurrentPage(1);
    }
  }, [
    isConnected,
    isMock,
    address,
    addressId,
    chainName,
    fetchBalance,
    fetchKscBalance,
    fetchTransactions,
    currentPage,
    itemsPerPage,
    setBalance,
    setKscBalance,
    setTxHistory,
    setTotalTransactions,
    setTotalPages,
    setCurrentPage,
  ]);

  useEffect(() => {
    if (itemsPerPage > 0) {
      fetchTransactions();
    }
  }, [currentPage]);

  return {
    fetchBalance,
    fetchKscBalance,
    fetchTransactions,

    txHistory,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalTransactions,
    totalPages,
  };
};
