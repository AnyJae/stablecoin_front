import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { useWalletData } from "./useWalletData";

// 📍컨트랙트 주소 (실제 배포 후 변경 필요)📍
const KSC_CONTRACT_ADDRESS = {
  avalanche:
    process.env.NEXT_PUBLIC_KSC_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
  xrpl:
    process.env.NEXT_PUBLIC_KSC_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
};

// 컨트랙트 ABI (필요한 함수만)
const KSC_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

export const useSendTokens = () => {
  const { t } = useLanguage();

  const {
    provider,
    signer,
    isConnected,
    address,
    chainName,
    setIsLoading,
    setError,
  } = useWalletContext();
  const { fetchBalance, fetchKscBalance, fetchTransactions } = useWalletData();

  // KSC 전송
  const sendKsc = async (
    toAddress: string,
    amount: string,
    chainType: "xrpl" | "avalanche"
  ) => {
    //필수 정보 누락 체크
    if (
      !isConnected ||
      !address ||
      !signer ||
      !provider ||
      chainName !== chainType
    ) {
      throw new Error("지갑이 연결되지 않거나 유효하지 않은 네트워크입니다");
    }

    setIsLoading(true);

    try {
      const kscContractAddress = KSC_CONTRACT_ADDRESS[chainType];

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
      const amountWei = ethers.parseUnits(amount, decimals);

      // 잔액 부족 체크 (프론트에서 1차적으로 체크)
      const currentKSCBalanceRaw = await kscContract.balanceOf(address);
      if (currentKSCBalanceRaw < amountWei) {
        throw new Error("KSC 잔액이 부족합니다");
      }

      //토큰 전송 트랜잭션 생성 및 전송
      const tx = await kscContract.transfer(toAddress, amountWei);
      toast.promise(tx.wait(), {
        loading: "트랜잭션을 처리 중입니다...",
        success: "전송이 완료되었습니다!",
        error: "전송에 실패했습니다.",
      });

      //트랜잭션 성공 시 상태(잔액 및 트랜잭션 내역) 업데이트
      const receipt = await tx.wait(); //트랜잭션 영수증

      if (receipt && receipt.status === 1) {
        // 트랜잭션 성공
        fetchBalance();
        fetchKscBalance();
        fetchTransactions();

        return {
          success: true,
          transactionHash: receipt.hash,
          message: "전송이 성공적으로 완료되었습니다",
        };
      } else {
        // 트랜잭션 실패 (status 0)
        throw new Error("트랜잭션이 실패했습니다");
      }
    } catch (err) {
      console.error("KSC send error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "전송에 실패했습니다.";
      setError(errorMessage);

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };
  return { sendKsc };
};
