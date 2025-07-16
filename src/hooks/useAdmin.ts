import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
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

export const useAdmin = () => {
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [supplyInfo, setSupplyInfo] = useState({
    maxSupply: "",
    totalSupply: "",
    totalBurned: "",
    networkType: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { chainName } = useWalletContext();
  const { t, language } = useLanguage();

  // KSC 공급량 정보 조회
  const fetchSupplyInfo = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/external/get-tokenSupply/${chainName == "xrpl" ? "XRPL" : "AVAX"}`,{
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "accept-language": language,
            },}
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
  }, []);

  // KSC 발행
  const mintKSC = useCallback(
    async (to: string, amount: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/mint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to,
            amount,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("KSC 발행이 완료되었습니다.");
          // 컨트랙트 정보 새로고침
          await fetchSupplyInfo();
        } else {
          throw new Error(data.message || "발행에 실패했습니다.");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "발행에 실패했습니다.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Mint KSC error:", err);
      } finally {
        setIsLoading(false);
      }
    },
     [fetchSupplyInfo]
  );

  // KSC 소각
  const burnKSC = useCallback(
    async (from: string, amount: string) => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    },
     [fetchSupplyInfo]
  );

  // 긴급 일시정지
  const emergencyPause = useCallback(async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  },  [fetchSupplyInfo]);

  // 일시정지 해제
  const emergencyUnpause = useCallback(async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  },  [fetchSupplyInfo]);

  // 컴포넌트 마운트 시 공급량 정보 조회
  useEffect(() => {
   fetchSupplyInfo();
  },  [fetchSupplyInfo]);

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
