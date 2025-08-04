import { formatWeiToKsc } from "@/utils/formatters";
import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { useWalletData } from "./useWalletData";
import toast from "react-hot-toast";
import { delay } from "@/utils/helpers";

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
  const { address, kscBalance, chainName, isConnected, signer, provider } =
    useWalletContext();
  const { fetchKscBalance } = useWalletData();

  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  //KSC 잔액
  const [kscBalanceTemp, setKscBalanceTemp] = useState<string>("");
  // KRW 잔액
  const [krwBalance, setKrwBalance] = useState<bigint>(() => {
    const saved = sessionStorage.getItem("krwBalance");
    return saved ? BigInt(saved) : 100000000000000000000000n;
  });
    // 보유 자산
  const [totalAssets, setTotalAssets] = useState<bigint>(0n);
  // 최대 발행 가능량
  const [maxRequestAmount, setMaxRequestAmount] = useState<bigint>(() => {
    const saved = sessionStorage.getItem("maxRequestAmount");
    return saved ? BigInt(saved) : 80000000000000000000000n;
  });

  // KSC 요청(발행)
  const requestKSC = useCallback(
    async (amount: string) => {
      setIsLoading("mint");
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
      if (Number(amount) <= 0) {
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

          const newKscBalance = Number(kscBalance) + Number(amount);
          setKscBalanceTemp(newKscBalance.toString());

          const calculatedValue = (amountWei * 125n) / 100n;
          setKrwBalance((prev: bigint) => prev - calculatedValue);

          const newKrwBalance = krwBalance - calculatedValue;
          const maxRequest = (newKrwBalance * 80n) / 100n;
          setMaxRequestAmount(maxRequest);
        } else {
          throw new Error(t("admin.errors.mint"));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("admin.errors.mint");
        toast.error(errorMessage);
        console.error("Mint KSC error", err);
      } finally {
        setIsLoading(null);
      }
    },
    [address, language]
  );

  // KSC 소각
  const redeemKSC = useCallback(
    async (amount: string) => {
      setIsLoading("redeem");
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

      console.log("KSC 잔액 왜 이래", kscBalance, " / ", kscBalanceTemp);

      // 요청 발행량 유효 체크
      if (Number(amount) <= 0) {
        setAdminError(t("admin.errors.moreThanZero"));
        return "client-side-validation-fail";
      }
      if (Number(amount) > Number(kscBalanceTemp)) {
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

        console.log("허용량", amountWei);

        //토큰 전송 트랜잭션 생성 및 전송
        const spenderAddress = process.env.NEXT_PUBLIC_BACKEND_WALLET_ADDRESS;
        const tx = await kscContract.approve(spenderAddress, amountWei);
        let txId = "";

        toast.promise(tx.wait(), {
          loading: t(`messages.txProcessing`),
          success: t(`messages.txSuccess`),
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
              const newKscBalance = Number(kscBalance) - Number(amount);
              setKscBalanceTemp(newKscBalance.toString());

              const calculatedValue = (amountWei * 125n) / 100n;
              setKrwBalance((prev: bigint) => prev + calculatedValue);

              const newKrwBalance = krwBalance + calculatedValue;
              const maxRequest = (newKrwBalance * 80n) / 100n;
              setMaxRequestAmount(maxRequest);
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
        toast.error(err.message);
        console.error("소각 실패:", err);
      } finally {
        setIsLoading(null);
      }
    },
    [address, language]
  );

  useEffect(() => {
    sessionStorage.setItem("krwBalance", krwBalance.toString());
  }, [krwBalance]);

  useEffect(() => {
    sessionStorage.setItem("maxRequestAmount", maxRequestAmount.toString());
  }, [maxRequestAmount]);

  useEffect(() => {
    if (kscBalance && !isNaN(Number(kscBalance))) {
      setKscBalanceTemp(kscBalance);
      setTotalAssets(BigInt(krwBalance) + BigInt(kscBalance));
    }
  }, [kscBalance]);
  return {
    isLoading,
    totalAssets,
    kscBalanceTemp,
    krwBalance,
    maxRequestAmount,
    adminError,
    requestKSC,
    redeemKSC,
    setIsLoading,
    setAdminError,
  };
}
