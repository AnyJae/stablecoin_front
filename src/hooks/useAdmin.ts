import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { ethers } from "ethers";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export interface ContractInfo {
  name: string;
  symbol: string;
  decimals: string;
  totalSupply: string;
  totalMinted: string;
  totalBurned: string;
  paused: boolean;
  contractAddress: string;
  explorerUrl: string;
}

export const useAdmin = (network: string) => {
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [supplyInfo, setSupplyInfo] = useState({
    maxSupply: "",
    totalSupply: "",
    totalBurned: "",
    networkType: "",
  });
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { chainName } = useWalletContext();
  const { t, language } = useLanguage();

  const evmAddressRegex = /^0x[0-9a-fA-F]{40}$/; // EVM 주소 형식 정규 표현식

  // KSC 공급량 정보 조회
  const fetchSupplyInfo = useCallback(async () => {
    if (network === "Mock XRPL" || network == "Mock AVAX") {
      setSupplyInfo({
        maxSupply: "100000000000000000000",
        totalSupply: "1000000000000000000000000",
        totalBurned: "5000000000000000000000",
        networkType: "Mock",
      });

      console.log("Mock 데이터")
      return;
    }

    try {
      const response = await fetch(
        `/api/external/get-tokenSupply/${network == "XRPL" ? "XRPL" : "AVAX"}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "accept-language": language,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setSupplyInfo(data.data);
      } else {
        throw new Error(t(`errors.loadDataError`));
      }
    } catch (err: any) {
      console.error("Contract info fetch error:", err);
      setError(err.message);
      setSupplyInfo({
        maxSupply: "-",
        totalSupply: "-",
        totalBurned: "-",
        networkType: "-",
      });
    }
  }, [network]);

  // KSC 발행
  const mintKSC = useCallback(
    async (to: string, amount: string, network: string) => {
      setIsLoading("mint");
      setError(null);

      // 수신자 지갑 주소 형식 체크
      if (!evmAddressRegex.test(to)) {
        setFormError(t("payment.errors.invalidAddress"));
        return "client-side-validation-fail";
      }

      const amountWei = ethers.parseUnits(amount, 18);
      try {
        const response = await fetch(`/api/transaction/post-mint`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept-language": language,
          },
          body: JSON.stringify({
            toAddress: to.toLowerCase(),
            amount: amountWei.toString(),
            networkType: network === "XRPL" ? "XRPL" : "AVAX",
          }),
        });

        const data = await response.json();

        if (data.success) {
          // toast.success(t("admin.mint.success"));
          await fetchSupplyInfo();
        } else {
          throw new Error(t("admin.errors.mint"));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("admin.errors.mint");
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Mint KSC error", err);
      } finally {
        setIsLoading(null);
      }
    },
    [fetchSupplyInfo]
  );

  // KSC 소각
  const burnKSC = useCallback(
    async (from: string, amount: string) => {
      setIsLoading("burn");
      setError(null);

      try {
        const response = await fetch("/api/admin/burn", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            amount,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("KSC 소각이 완료되었습니다.");
          // 컨트랙트 정보 새로고침
          await fetchSupplyInfo();
        } else {
          throw new Error(data.message || "소각에 실패했습니다.");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "소각에 실패했습니다.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Burn KSC error:", err);
      } finally {
        setIsLoading(null);
      }
    },
    [fetchSupplyInfo]
  );

  // 긴급 일시정지
  const emergencyPause = useCallback(async () => {
    setIsLoading("pause");
    setError(null);

    try {
      const response = await fetch("/api/admin/pause", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("긴급 일시정지가 적용되었습니다.");
        // 컨트랙트 정보 새로고침
        await fetchSupplyInfo();
      } else {
        throw new Error(data.message || "일시정지에 실패했습니다.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "일시정지에 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Emergency pause error:", err);
    } finally {
      setIsLoading(null);
    }
  }, [fetchSupplyInfo]);

  // 일시정지 해제
  const emergencyUnpause = useCallback(async () => {
    setIsLoading("unpause");
    setError(null);

    try {
      const response = await fetch("/api/admin/unpause", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("일시정지가 해제되었습니다.");
        // 컨트랙트 정보 새로고침
        await fetchSupplyInfo();
      } else {
        throw new Error(data.message || "일시정지 해제에 실패했습니다.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "일시정지 해제에 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Emergency unpause error:", err);
    } finally {
      setIsLoading(null);
    }
  }, [fetchSupplyInfo]);

  // 컴포넌트 마운트 시 공급량 정보 조회
  useEffect(() => {
    fetchSupplyInfo();
  }, [fetchSupplyInfo]);

  return {
    supplyInfo,
    mintKSC,
    burnKSC,
    emergencyPause,
    emergencyUnpause,
    isLoading,
    error,
  };
};
