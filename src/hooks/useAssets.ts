import { formatWeiToKsc } from "@/utils/formatters";
import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWalletData } from "./useWalletData";
import toast from "react-hot-toast";
import { delay } from "@/utils/helpers";
import { WalletTransaction } from "@/types/global";
import { useSocket } from "@/contexts/SocketContext";

const KSC_CONTRACT_ADDRESS = {
  avalanche:
    process.env.NEXT_PUBLIC_KSC_AVAX_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
  xrpl:
    process.env.NEXT_PUBLIC_KSC_XRPL_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
};

const KSC_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function batchTransfer(address[] recipients, uint256[] amounts) returns (bool)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export function useAssets() {
  const { t, language } = useLanguage();
  const {socket} = useSocket();
  const {
    address,
    addressId,
    kscBalance,
    chainName,
    isConnected,
    signer,
    provider,
    isMock,
    transactions,
    setTransactions,
  } = useWalletContext();
  const { fetchKscBalance } = useWalletData();

  const [adminLoading, setAdminLoading] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  //KSC 잔액
  const [kscBalanceTemp, setKscBalanceTemp] = useState<string>("");
  // KRW 잔액
  const [krwBalance, setKrwBalance] = useState<bigint>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("krwBalance");
      return saved ? BigInt(saved) : 100000000000000000000000n;
    }
    return 100000000000000000000000n;
  });

  // 보유 자산
  const [totalAssets, setTotalAssets] = useState<bigint>(0n);

  // 최대 발행 가능량
  const [maxRequestAmount, setMaxRequestAmount] = useState<bigint>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("maxRequestAmount");
      return saved ? BigInt(saved) : 80000000000000000000000n;
    }
    return 80000000000000000000000n;
  });

  // KSC 발행 및 소각 내역
  const [adminHistory, setAdminHistory] = useState<WalletTransaction[]>([]);

  //  페이지네이션 관련 상태 추가
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(0);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // 1. KSC 요청(발행)
  const requestKSC = useCallback(
    async (amount: string) => {
      setAdminLoading("mint");
      setAdminError(null);

      const amountWei = ethers.parseUnits(amount, 18);

      // 유효 상태 체크
      if (!isConnected || !address || !signer || !provider || !chainName) {
        setAdminError(t("payment.errors.disconnect"));
        return "client-side-validation-fail";
      }

      //시스템 헬스 체크
      try {
        const response = await fetch(`/api/health/get-system`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "accept-language": language,
          },
        });

        const data = await response.json();
        if (!data.success) {
          setAdminError(t("payment.errors.systemUnavailable"));
          return "client-side-validation-fail";
        }
      } catch (err: any) {
        setAdminError(t("payment.errors.systemUnavailable"));
        return "client-side-validation-fail";
      }

      // 요청 발행량 유효 체크
      if (amountWei <= 0) {
        setAdminError(t("admin.errors.moreThanZero"));
        return "client-side-validation-fail";
      } else if (amountWei > maxRequestAmount) {
        setAdminError(t("admin.errors.insufficient"));
        return "client-side-validation-fail";
      }

      // KSC 발행
      try {
        const response = await fetch(`/api/transaction/post-mint`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept-language": language,
          },
          body: JSON.stringify({
            toAddress: address?.toLowerCase(),
            amount: amountWei.toString(),
            networkType: chainName === "xrpl" ? "XRPL" : "AVAX",
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success(t("admin.mint.success"));

          const newKscBalance = BigInt(kscBalance) + amountWei;
          setKscBalanceTemp(newKscBalance.toString());

          const calculatedValue = (amountWei * 125n) / 100n;
          setKrwBalance((prev: bigint) => prev - calculatedValue);

          const newKrwBalance = krwBalance - calculatedValue;
          const maxRequest = (newKrwBalance * 80n) / 100n;
          setMaxRequestAmount(maxRequest);

          const newTxs = [data.data,...adminHistory];
          setAdminHistory(newTxs);
        } else {
          throw new Error(t("admin.errors.mint"));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("admin.errors.mint");
        toast.error(errorMessage);
        console.error("Mint KSC error", err);
      } finally {
        setAdminLoading(null);
      }
    },
    [address, language, adminHistory, kscBalance, krwBalance, chainName, isConnected, signer, provider, maxRequestAmount, t]
  );

  //2. KSC 소각
  const redeemKSC = useCallback(
    async (amount: string) => {
      setAdminLoading("redeem");
      setAdminError(null);

      const amountWei = ethers.parseUnits(amount, 18);

      // 유효 상태 체크
      if (!isConnected || !address || !signer || !provider || !chainName) {
        setAdminError(t("payment.errors.disconnect"));
        return "client-side-validation-fail";
      }

      //시스템 헬스 체크
      try {
        const response = await fetch(`/api/health/get-system`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "accept-language": language,
          },
        });

        const data = await response.json();
        if (!data.success) {
          setAdminError(t("payment.errors.systemUnavailable"));
          return "client-side-validation-fail";
        }
      } catch (err: any) {
        setAdminError(t("payment.errors.systemUnavailable"));
        return "client-side-validation-fail";
      }

      // 요청 소각량 유효 체크
      if (amountWei <= 0) {
        setAdminError(t("admin.errors.moreThanZero"));
        return "client-side-validation-fail";
      }
      if (amountWei > BigInt(kscBalance)) {
        setAdminError(t("admin.errors.insufficient"));
        return "client-side-validation-fail";
      }

      //KSC 소각
      try {
        const kscContractAddress = KSC_CONTRACT_ADDRESS[chainName];

        // 컨트랙트 주소 유효성 검사
        if (
          !kscContractAddress ||
          kscContractAddress === "0x0000000000000000000000000000000000000000"
        ) {
          throw new Error("컨트랙트 주소가 설정되지 않았습니다.");
        }

        //컨트랙트 인스턴스 생성
        const kscContract = new ethers.Contract(
          kscContractAddress,
          KSC_ABI,
          signer
        );

        //토큰 소수점 자리 조회 및 사용자 입력 금액 단위 변환
        const decimals = await kscContract.decimals();
        const amountWei = ethers.parseUnits(amount.toString(), decimals);

        const spenderAddress = process.env.NEXT_PUBLIC_BACKEND_WALLET_ADDRESS;
        const tx = await kscContract.approve(spenderAddress, amountWei);
        let txId = "";

        toast.promise(tx.wait(), {
          loading: t(`messages.txProcessing`),
          error: t(`messages.txFail`),
        });

        const receipt = await tx.wait(); //트랜잭션 영수증

        // 가스비 계산
        const gasUsed = BigInt(receipt.gasUsed);
        const gasPrice = BigInt(receipt.gasPrice);
        const gasFeeInWei = gasUsed * gasPrice;

        // 백엔드에 요청
        try {
          //트랜잭션 성공
          if (receipt && receipt.status === 1) {
            const response = await fetch("/api/transaction/post-burn", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fromAddress: address?.toLowerCase(),
                amount: amountWei.toString(),
                networkType: chainName === "xrpl" ? "XRPL" : "AVAX",
                approveHash: tx.hash,
              }),
            });

            const data = await response.json();

            if (data.success) {
              toast.success(t("admin.burn.requestAccept"));

              await delay(5000); // temp
              const newKscBalance = BigInt(kscBalance) - amountWei;
              setKscBalanceTemp(newKscBalance.toString());

              const calculatedValue = (amountWei * 125n) / 100n;
              setKrwBalance((prev: bigint) => prev + calculatedValue);

              const newKrwBalance = krwBalance + calculatedValue;
              const maxRequest = (newKrwBalance * 80n) / 100n;
              setMaxRequestAmount(maxRequest);

              const newTxs = [data.data,...adminHistory];
              setAdminHistory(newTxs);
              toast.success(t("admin.burn.success")); // temp
            } else {
              throw new Error(data.message || "admin.errors.burn");
            }
          } else {
            throw new Error(t(`errors.transactionFailed`));
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : t("admin.errors.burn");
          throw new Error(errorMessage);
        }
      } catch (err: any) {
        if (err.info.error.code === 4001) {
          //사용자가 요청 취소
          toast.error(t("errors.userRejected"));
        } else if (err instanceof Error) {
          toast.error(err.message);
        }
        console.error("소각 실패:", err);
      } finally {
        setAdminLoading(null);
      }
    },
    [address, language, adminHistory, kscBalance, krwBalance, chainName, isConnected, signer, provider]
  );

  // 3. KSC 발행 및 소각 내역 조회
  const fetchAdminHistory = useCallback(
    async (pageSize = itemsPerPage) => {
      console.log("유효성 검사", address, addressId, isMock);
      //유효성 검사
      if (!address || !addressId || isMock) {
        setAdminHistory([]);
        setTotalTransactions(0);
        setTotalPages(0);
        return;
      }

      try {
        const response = await fetch(
          `/api/transaction/get-history/${addressId}?limit=${pageSize}&page=${currentPage}&operationType=${"mint-burn"}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "accept-language": language,
            },
          }
        );
        const data = await response.json();

        console.log("발행 및 소각 트랜잭션 내역:", data.data);

        if (data.success) {
          setAdminHistory(data.data.items || []);
          setTotalTransactions(data.data.pagination.totalCount);
          setTotalPages(data.data.pagination.totalPage);
        } else {
          throw new Error(
            data.message || "발행 및 소각 내역 조회에 실패했습니다"
          );
        }
      } catch (err: any) {
        console.error("Transaction fetch error:", err);
        toast.error("트랜잭션 내역 조회에 실패했습니다.");
        setAdminHistory([]);
        setTotalTransactions(0);
        setTotalPages(0);
      } finally {
        await delay(500);
      }
    },
    [address, addressId, isMock, currentPage, itemsPerPage, t]
  );

  useEffect(() => {
    sessionStorage.setItem("krwBalance", krwBalance.toString());
  }, [krwBalance]);

  useEffect(() => {
    sessionStorage.setItem("maxRequestAmount", maxRequestAmount.toString());
  }, [maxRequestAmount]);

  useEffect(() => {
    fetchKscBalance();
    const initialItemsPerPage = 5;
    setItemsPerPage(initialItemsPerPage);
  }, []);

  useEffect(() => {
    // 유효성 검사 (BigInt 에러 방지)
    const isValidIntegerString = (value: string | null): boolean => {
      if (typeof value !== "string" || value.trim() === "") return false;
      return /^-?\d+$/.test(value);
    };

    if (isValidIntegerString(kscBalance)) {
      setKscBalanceTemp(kscBalance);
      setTotalAssets(BigInt(krwBalance) + BigInt(kscBalance));
      console.log("✅ KSC 잔액으로 계산 완료:", kscBalance);
    }
  }, [kscBalance, krwBalance]);

  useEffect(() => {
    if (itemsPerPage > 0) {
      fetchAdminHistory();
    }
  }, [currentPage, itemsPerPage, fetchAdminHistory]);
  

  // 웹소켓 이벤트 리스너
  useEffect(() => {
    if (!socket) return;
    socket.on("transaction.status.changed", (updatedTx) => {
      setAdminHistory((prevTxs) => {
        const existingTxIndex = prevTxs.findIndex(
          (tx) => tx.id === updatedTx.data.id
        );
        if (existingTxIndex !== -1) {
          const newTxs = [...prevTxs];
          const originalTx = newTxs[existingTxIndex];
          const changedTx = {
            ...originalTx,
            txStatus: updatedTx.data.currentStatus,
            fee: updatedTx.data.fee,
            statusUpdatedAt: updatedTx.data.statusUpdatedAt,
          };
          newTxs[existingTxIndex] = changedTx;
          return newTxs;
        } else {
          return [...prevTxs];
        }
      });
    });
  }, [socket, adminHistory]);
  

  const value = useMemo(() => ({
    adminLoading,
    totalAssets,
    kscBalanceTemp,
    krwBalance,
    maxRequestAmount,
    adminError,
    adminHistory,
    fetchAdminHistory,
    requestKSC,
    redeemKSC,
    setAdminLoading,
    setAdminError,
    setAdminHistory,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalTransactions,
    totalPages,
  }), [
      adminLoading,
      totalAssets,
      kscBalanceTemp,
      krwBalance,
      maxRequestAmount,
      adminError,
      adminHistory,
      fetchAdminHistory, 
      requestKSC,       
      redeemKSC,         
      currentPage,
      itemsPerPage,
      totalTransactions,
      totalPages
  ]);

  return value;
}
