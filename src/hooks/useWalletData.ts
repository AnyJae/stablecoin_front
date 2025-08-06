import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { delay } from "@/utils/helpers";
import { WalletTransaction } from "@/types/global";
import { formatWeiToKsc } from "@/utils/formatters";
import { MOCK_WALLET_DATA } from "@/utils/mockWallet";

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
    transactions,

    setBalance,
    setKscBalance,
    setIsLoading,
    setError,
    setTransactions,
  } = useWalletContext();

  const { t, language } = useLanguage();

  //  페이지네이션 관련 상태 추가
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [paginatedTransactions, setPaginatedTransactions] = useState<
    WalletTransaction[]
  >([]);

  // 1. Avalanche or XRPL 네이티브 토큰 잔액 조회
  const fetchBalance = useCallback(async () => {
    setIsLoading(true);

    //유효성 검사
    if (!address) {
      setIsLoading(false);
      return;
    }

    try {
      if (isMock) {
        const mockData = MOCK_WALLET_DATA[chainName || "xrpl"];
        setBalance(mockData.balance);
        return;
      }

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
    if (!address) {
      setIsLoading(false);
      return;
    }

    try {
      if (isMock) {
        if(kscBalance !== "-") return;
        const mockData = MOCK_WALLET_DATA[chainName || "xrpl"];
        console.log("Mock KSC Balance:", mockData.kscBalance);
        setKscBalance(mockData.kscBalance);
        console.log("Mock KSC Balance set:", mockData.kscBalance);
        return;
      }
      const response = await fetch(`/api/wallet/get-wallet/${addressId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "accept-language": language,
        },
      });

      const data = await response.json();
      if (data.success) {
        setKscBalance(data.data.kscBalance);
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
      
      if (isMock) return;

      setIsLoading(true);
      setError(null);

      //유효성 검사
      if (!address || !addressId) {
        setIsLoading(false);
        setTransactions([]);
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
          setTransactions(data.data.items || []);
          setTotalTransactions(data.data.pagination.totalCount);
          setTotalPages(data.data.pagination.totalPage);
        } else {
          throw new Error(data.message || "거래 내역 조회에 실패했습니다");
        }
      } catch (err: any) {
        console.error("Transaction fetch error:", err);
        toast.error("거래 내역 조회에 실패했습니다.");
        setTransactions([]);
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
      setTransactions,
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
      setTransactions([]);
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
    setBalance,
    setKscBalance,
    setTransactions,
  ]);

  if (isMock) {
    useEffect(() => {
      const reversedTransactions = [...transactions].reverse(); // 복사 후 리버스

      const total = reversedTransactions.length;
      const pages = Math.ceil(total / itemsPerPage);
      setTotalTransactions(total);
      setTotalPages(pages);

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedTransactions(
        reversedTransactions.slice(startIndex, endIndex)
      );
    }, [currentPage, itemsPerPage, transactions]);
  } else {
    useEffect(() => {
      if (itemsPerPage > 0) {
        fetchTransactions();
      }
    }, [currentPage, itemsPerPage]);
  }

  return {
    fetchBalance,
    fetchKscBalance,
    fetchTransactions,

    transactions,
    paginatedTransactions,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalTransactions,
    totalPages,
  };
};
