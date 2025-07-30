import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { useWalletData } from "./useWalletData";
import { delay } from "@/utils/helpers";
import { ReceiptIcon } from "lucide-react";
import { convertToUTC } from "@/utils/formatters";

// 📍컨트랙트 주소 (실제 배포 후 변경 필요)📍
const KSC_CONTRACT_ADDRESS = {
  avalanche:
    process.env.NEXT_PUBLIC_KSC_AVAX_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
  xrpl:
    process.env.NEXT_PUBLIC_KSC_XRPL_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
};

// 컨트랙트 ABI (필요한 함수만)
const KSC_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function batchTransfer(address[] recipients, uint256[] amounts) returns (bool)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export const useSendTokens = () => {
  const { t, language } = useLanguage();

  const {
    provider,
    signer,
    isConnected,
    address,
    kscBalance,
    setIsLoading,
    setError,
  } = useWalletContext();
  const { fetchBalance, fetchKscBalance, fetchTransactions, fetchTxCount } =
    useWalletData();

  const [sendError, setSendError] = useState("");

  const evmAddressRegex = /^0x[0-9a-fA-F]{40}$/; // EVM 주소 형식 정규 표현식

  // 1. 즉시 전송 함수
  const sendInstant = useCallback(
    async (
      toNetworkType: "xrpl" | "avalanche" | null,
      toAddress: string,
      amount: string,
      network: "xrpl" | "avalanche" | null,
      memo?: string
    ) => {

      // 유효 상태 체크
      if (!isConnected || !address || !signer || !provider || !network) {
        setSendError(t("payment.errors.disconnect"));
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
          setSendError(t("payment.errors.systemUnavailable"));
          return "client-side-validation-fail";
        }
      } catch (err: any) {
        setSendError(t("payment.errors.systemUnavailable"));
        return "client-side-validation-fail";
      }

      // 수신자 지갑 주소 형식 체크
      if (!evmAddressRegex.test(toAddress)) {
        setSendError(t("payment.errors.invalidAddress"));
        return "client-side-validation-fail";
      }

      // KSC 잔액 부족 체크 (프론트에서 1차적으로 체크)
      if (Number(kscBalance) < Number(amount)) {
        setSendError(t("payment.errors.insufficient"));
        return "client-side-validation-fail";
      }

      // KSC 전송
      try {
        const kscContractAddress = KSC_CONTRACT_ADDRESS[network];

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
        const amountWei = ethers.parseUnits(amount, decimals);

        //토큰 전송 트랜잭션 생성 및 전송
        const tx = await kscContract.transfer(toAddress, amountWei);
        let txId = "";

        // 트랜잭션 내역 백엔드에 저장
        try {
          const response = await fetch(`/api/transaction/post-tx`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "accept-language": language,
            },
            body: JSON.stringify({
              fromNetworkType: network === "xrpl" ? "XRPL" : "AVAX",
              toNetworkType: network === "xrpl" ? "XRPL" : "AVAX", //📍브릿지 기능 완료 후 수정 필요
              paymentType: "INSTANT",
              fromAddress: address,
              toAddress: toAddress.toLowerCase(),
              txHash: tx.hash,
              amount: amountWei.toString(),
              memo,
            }),
          });
          const data = await response.json();

          if (!data.success) {
            toast.error(t(`payment.errors.saveTxError`));
            return;
          } else {
            txId = data.data.id; // 트랜잭션 아이디 추출
            fetchTransactions();
            fetchBalance();
            fetchTxCount();
            fetchKscBalance();
          }
        } catch (err) {
          toast.error(t(`payment.errors.saveTxError`));
          return;
        }

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

        //데이터 상태 업데이트
        if (receipt && receipt.status === 1) {
          // 트랜잭션 성공
          // 백엔드에 트랜잭션 상태 업데이트
          try {
            const response = await fetch(`/api/transaction/patch-tx/${txId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "accept-language": language,
              },
              body: JSON.stringify({
                status: "CONFIRMED",
                fee: gasFeeInWei.toString(),
              }),
            });

            const data = await response.json();

            console.log("백엔드로부터 받은 응답: ", data);

            if (!data.success) {
              throw new Error(
                data.error.message || "트랜잭션 수정에 실패했습니다"
              );
            } else {
              fetchTransactions();
            }
          } catch (err) {
            console.error("트랜잭션 상태 업데이트 실패:", err);
          }

          // 상태(잔액 및 트랜잭션 내역) 업데이트
          fetchBalance();
          fetchKscBalance();
          fetchTxCount();
          fetchTransactions();
        } else {
          // 트랜잭션 실패
          //백엔드에 트랜잭션 상태 업데이트
          try {
            const response = await fetch(`/api/transaction/patch-tx/${txId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                status: "FAILED",
                fee: gasFeeInWei.toString(),
              }),
            });
            const data = await response.json();

            if (!data.success) {
              throw new Error(
                data.error.message || "트랜잭션 수정에 실패했습니다"
              );
            } else {
              fetchTransactions();
            }
          } catch (err) {
            console.error("트랜잭션 상태 업데이트 실패", err);
          }
        }
      } catch (err) {
        console.log("결제 처리 중 오류 발생: ", err);
      }
    },
    [fetchBalance, fetchKscBalance, fetchTransactions]
  );

  // 2. 배치 전송 함수
  const sendBatch = useCallback(
    async (
      toAddresses: string[],
      amounts: string[],
      network: "xrpl" | "avalanche" | null,
      memo?: string
    ) => {
      // 유효 상태 체크
      console.log(kscBalance, amounts);
      if (!isConnected || !address || !signer || !provider || !network) {
        setSendError(t("payment.errors.disconnect"));
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
          setSendError(t("payment.errors.systemUnavailable"));
          return "client-side-validation-fail";
        }
      } catch (err: any) {
        setSendError(t("payment.errors.systemUnavailable"));
        return "client-side-validation-fail";
      }

      // 수신자 지갑 주소 체크
      for (let i = 0; i < toAddresses.length; i++) {
        if (!evmAddressRegex.test(toAddresses[i])) {
          setSendError(t("payment.errors.invalidAddress"));
          return "client-side-validation-fail";
        }
      }

      // KSC 잔액 부족 체크 (프론트에서 1차적으로 체크)
      const totalAmountToSend = amounts.reduce(
        (acc, currentAmount) => acc + parseFloat(currentAmount),
        0
      );
      if (parseFloat(kscBalance) < totalAmountToSend) {
        setSendError(t("payment.errors.insufficient"));
        return "client-side-validation-fail";
      }

      // KSC 전송
      try {
        const kscContractAddress = KSC_CONTRACT_ADDRESS[network];

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
        const amountsWei = amounts.map((amountStr) =>
          ethers.parseUnits(amountStr, decimals)
        );

        //토큰 전송 트랜잭션 생성 및 전송
        const tx = await kscContract.batchTransfer(toAddresses, amountsWei);
        let txId = "";

        // 트랜잭션 내역 백엔드에 저장
        const postTxPromises = toAddresses.map(async (toAddr, index) => {
          console.log("트랜잭션 해시", tx.hash);
          try {
            const response = await fetch(`/api/transaction/post-tx`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "accept-language": language,
              },
              body: JSON.stringify({
                toNetworkType: network === "xrpl" ? "XRPL" : "AVAX",
                fromNetworkType: network === "xrpl" ? "XRPL" : "AVAX",
                paymentType: "BATCH",
                fromAddress: address,
                toAddress: toAddr.toLowerCase(),
                txHash: tx.hash,
                amount: amountsWei[index].toString(), // 각 개별 금액
                memo: memo,
              }),
            });
            const data = await response.json();
            if (!data.success) {
              // 개별 저장 실패 시 에러 처리 (로그만 남기거나, 특정 상태로 표시)
              console.error(
                `Failed to post individual transaction ${index} to backend:`,
                data.message || "Unknown error"
              );
              return null; // 실패한 요청은 null 반환
            }
            return data.data.id; // 성공 시 백엔드에서 반환된 ID
          } catch (err) {
            console.error(
              `Error posting individual transaction ${index} to backend:`,
              err
            );
            return null;
          }
        });

        // 모든 개별 트랜잭션 저장 요청이 완료될 때까지 기다림
        const results = await Promise.all(postTxPromises);
        const individualBackendTxIds = results.filter(
          (id) => id !== null
        ) as string[]; // 성공적으로 저장된 ID만 필터링
        console.log(
          "Individual transactions posted to backend:",
          individualBackendTxIds
        );

        // 모든 개별 트랜잭션 저장이 실패한 경우
        if (individualBackendTxIds.length === 0) {
          toast.error(t(`payment.errors.saveTxError`));
          return;
        }

        // 트랜잭션 확정 대기 및 토스트 메시지
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

        //트랜잭션 상태 업데이트
        const finalStatus =
          receipt && receipt.status === 1 ? "CONFIRMED" : "FAILED";

        // 백엔드에 각 개별 트랜잭션의 상태 업데이트 (개별 PATCH 호출)
        const patchTxPromises = individualBackendTxIds.map(async (txId) => {
          try {
            const response = await fetch(`/api/transaction/patch-tx/${txId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "accept-language": language,
              },
              body: JSON.stringify({
                status: finalStatus,
                fee: gasFeeInWei.toString(),
              }),
            });
            const data = await response.json();

            if (!data.success) {
              throw new Error(
                data.error.message || "트랜잭션 수정에 실패했습니다"
              );
            } else {
              fetchTransactions();
            }
          } catch (err) {
            console.error(
              `Failed to patch individual transaction ${txId} in backend:`,
              err
            );
          }
        });

        await Promise.all(patchTxPromises); // 모든 패치 요청 완료 대기
        console.log("All individual transactions status updated in backend.");

        // 상태(잔액 및 트랜잭션 내역) 업데이트
        fetchBalance();
        fetchKscBalance();
        fetchTxCount();
        fetchTransactions();
      } catch (err) {
        console.error("결제 처리 중 오류 발생", err);
      }
    },
    [fetchBalance, fetchKscBalance, fetchTransactions]
  );

  // 3. 예약 전송 함수
  const sendScheduled = useCallback(
    async (
      toAddress: string,
      amount: string,
      network: "xrpl" | "avalanche" | null,
      scheduledTimeStr: string,
      memo?: string
    ) => {

      // 유효 상태 체크
      if (!isConnected || !address || !signer || !provider || !network) {
        setSendError(t("payment.errors.disconnect"));
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
          setSendError(t("payment.errors.systemUnavailable"));
          return "client-side-validation-fail";
        }
      } catch (err: any) {
        setSendError(t("payment.errors.systemUnavailable"));
        return "client-side-validation-fail";
      }

      // 수신자 지갑 주소 형식 체크
      if (!evmAddressRegex.test(toAddress)) {
        setSendError(t("payment.errors.invalidAddress"));
        return "client-side-validation-fail";
      }

      // KSC 잔액 부족 체크 (프론트에서 1차적으로 체크)
      if (Number(kscBalance) < Number(amount)) {
        setSendError(t("payment.errors.insufficient"));
        return "client-side-validation-fail";
      }

      // 예약 시간 체크
      const scheduledTime = new Date(scheduledTimeStr);
      const currentTime = new Date();
      if (scheduledTime.getTime() < currentTime.getTime()) {
        setSendError(t("payment.errors.invalidTime"));
        return "client-side-validation-fail";
      }

      // KSC 전송
      try {
        const kscContractAddress = KSC_CONTRACT_ADDRESS[network];

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

        const scheduledTime = convertToUTC(scheduledTimeStr);
        // 트랜잭션 내역 백엔드에 저장
        try {
          //트랜잭션 성공
          if (receipt && receipt.status === 1) {
            const response = await fetch(`/api/transaction/post-tx`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "accept-language": language,
              },
              body: JSON.stringify({
                toNetworkType: network === "xrpl" ? "XRPL" : "AVAX",
                fromNetworkType: network === "xrpl" ? "XRPL" : "AVAX",
                paymentType: "SCHEDULED",
                fromAddress: address,
                toAddress: toAddress.toLowerCase(),
                txHash: tx.hash,
                amount: amountWei.toString(),
                scheduledAt: scheduledTime,
                memo,
                fee: gasFeeInWei.toString(),
              }),
            });
            const data = await response.json();

            if (!data.success) {
              toast.error(t(`payment.errors.saveTxError`));
              console.log("post-tx error:", data.data)
              return;
            } else {
              txId = data.data.id; // 트랜잭션 아이디 추출
              fetchTransactions();
              fetchBalance();
              fetchTxCount();
              fetchKscBalance();
            }
          } else {
            toast.error(t(`errors.transactionFailed`));
          }
        } catch (err) {
          toast.error(t(`payment.errors.saveTxError`));
          console.log(err);
          return;
        }
      } catch (err) {
        console.log("결제 처리 중 오류 발생: ", err);
      }
    },
    [fetchBalance, fetchKscBalance, fetchTransactions]
  );

  // ⚒️ ---------------------테스트용 Hook (컨트랙트 연동 X)--------------------- ⚒️

  //즉시 전송 테스트 함수
  const sendInstantForTest = async (
    toAddress: string,
    amount: string,
    network: "xrpl" | "avalanche" | null,
    memo?: string
  ) => {
    // 유효 상태 체크
    if (!isConnected || !address || !signer || !provider || !network) {
      console.log(
        "유효 상태 체크",
        isConnected,
        address,
        signer,
        provider,
        network
      );
      setSendError(t("payment.errors.disconnect"));
      return "client-side-validation-fail";
    }

    // 수신자 지갑 주소 형식 체크
    if (!evmAddressRegex.test(toAddress)) {
      setSendError(t("payment.errors.invalidAddress"));
      return "client-side-validation-fail";
    }

    // KSC 잔액 부족 체크 (프론트에서 1차적으로 체크)
    if (Number(kscBalance) < Number(amount)) {
      setSendError(t("payment.errors.insufficient"));
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
        setSendError(t("payment.errors.systemUnavailable"));
        return "client-side-validation-fail";
      }
    } catch (err: any) {
      setSendError(t("payment.errors.systemUnavailable"));
      return "client-side-validation-fail";
    }

    try {
      // 가짜 트랜잭션 해시 생성
      const mockTxHash = ethers.hexlify(ethers.randomBytes(32));
      let txId = "";

      const amountWei = ethers.parseUnits(amount.toString(), 18);
      console.log("amountWei", amountWei);

      // 트랜잭션 내역 백엔드에 저장
      try {
        const response = await fetch(`/api/transaction/post-tx`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept-language": language,
          },
          body: JSON.stringify({
            networkType: network === "xrpl" ? "XRPL" : "AVAX",
            paymentType: "INSTANT",
            fromAddress: address,
            toAddress,
            txHash: mockTxHash,
            amount: amountWei.toString(),
            memo,
          }),
        });
        const data = await response.json();
        if (!data.success) {
          toast.error(t(`payment.errors.saveTxError`));
          return;
        } else {
          txId = data.data.id; // 트랜잭션 아이디 추출
          fetchTransactions();
          fetchBalance();
          fetchTxCount();
          fetchKscBalance();
        }
      } catch (err) {
        toast.error(t(`payment.errors.saveTxError`));
        return;
      }

      await delay(10000);

      // 가짜 트랜잭션 영수증 생성 (성공 시나리오)
      const mockReceipt = {
        hash: mockTxHash,
        status: 1,
        gasUsed: BigInt(21000), // 일반적인 가스 사용량
        effectiveGasPrice: ethers.parseUnits("20", "gwei"), // 가상 가스 가격
      };

      // 가스비 계산
      const gasUsed = mockReceipt.gasUsed;
      const gasPrice = mockReceipt.effectiveGasPrice;
      const gasFeeInWei = gasUsed * gasPrice;

      //데이터 상태 업데이트
      if (mockReceipt && mockReceipt.status === 1) {
        // 트랜잭션 성공
        toast.success(t(`payment.messages.success`));
        // 백엔드에 트랜잭션 상태 업데이트
        try {
          const response = await fetch(`/api/transaction/patch-tx/${txId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "accept-language": language,
            },
            body: JSON.stringify({
              status: "CONFIRMED",
              fee: gasFeeInWei.toString(),
            }),
          });

          const data = await response.json();

          console.log("백엔드로부터 받은 응답: ", data);

          if (!data.success) {
            throw new Error(
              data.error.message || "트랜잭션 수정에 실패했습니다"
            );
          } else {
            fetchTransactions();
          }
        } catch (err) {
          console.error("트랜잭션 상태 업데이트 실패:", err);
        }

        // 상태(잔액 및 트랜잭션 내역) 업데이트
        fetchBalance();
        fetchKscBalance();
        fetchTxCount();
        fetchTransactions();
      } else {
        // 트랜잭션 실패
        toast.error(t(`payment.errors.processing`));
        //백엔드에 트랜잭션 상태 업데이트
        try {
          const response = await fetch(`/api/transaction/patch-tx/${txId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "FAILED",
              fee: gasFeeInWei.toString(),
            }),
          });
          const data = await response.json();

          if (!data.success) {
            throw new Error(
              data.error.message || "트랜잭션 수정에 실패했습니다"
            );
          } else {
            fetchTransactions();
          }
        } catch (err) {
          console.error("트랜잭션 상태 업데이트 실패", err);
        }
      }
    } catch (err) {
      console.log("결제 처리 중 오류 발생: ", err);
    }
  };

  // 배치 전송 테스트 함수
  const sendBatchForTest = useCallback(
    async (
      toAddresses: string[],
      amounts: string[],
      network: "xrpl" | "avalanche" | null,
      memo?: string
    ) => {
      // 유효 상태 체크
      console.log(
        "유효 상태 체크:",
        isConnected,
        address,
        signer,
        provider,
        network
      );
      if (!isConnected || !address || !signer || !provider || !network) {
        setSendError(t("payment.errors.disconnect"));
        return "client-side-validation-fail";
      }

      // 수신자 지갑 주소 체크
      for (let i = 0; i < toAddresses.length; i++) {
        if (!evmAddressRegex.test(toAddresses[i])) {
          setSendError(t("payment.errors.invalidAddress"));
          return "client-side-validation-fail";
        }
      }
      // KSC 잔액 부족 체크 (프론트에서 1차적으로 체크)
      const totalAmountToSend = amounts.reduce(
        (acc, currentAmount) => acc + parseFloat(currentAmount),
        0
      );
      if (parseFloat(kscBalance) < totalAmountToSend) {
        setSendError(t("payment.errors.insufficient"));
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
          setSendError(t("payment.errors.systemUnavailable"));
          return "client-side-validation-fail";
        }
      } catch (err: any) {
        setSendError(t("payment.errors.systemUnavailable"));
        return "client-side-validation-fail";
      }

      // KSC 전송
      try {
        const amountsWei = amounts.map((amountStr) =>
          ethers.parseUnits(amountStr, 18).toString()
        );

        const mockTxHash = ethers.hexlify(ethers.randomBytes(32));
        // 트랜잭션 내역 백엔드에 저장
        const postTxPromises = toAddresses.map(async (toAddr, index) => {
          try {
            const response = await fetch(`/api/transaction/post-tx`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "accept-language": language,
              },
              body: JSON.stringify({
                networkType: network === "xrpl" ? "XRPL" : "AVAX",
                paymentType: "BATCH",
                fromAddress: address,
                toAddress: toAddr,
                txHash: mockTxHash,
                amount: amountsWei[index], // 각 개별 금액
                memo: memo,
              }),
            });
            const data = await response.json();
            if (!data.success) {
              // 개별 저장 실패 시 에러 처리 (로그만 남기거나, 특정 상태로 표시)
              console.error(
                `Failed to post individual transaction ${index} to backend:`,
                data.error.message || "Unknown error"
              );
              return null; // 실패한 요청은 null 반환
            }
            return data.data.id; // 성공 시 백엔드에서 반환된 ID
          } catch (err) {
            console.error(
              `Error posting individual transaction ${index} to backend:`,
              err
            );
            return null;
          }
        });

        // 모든 개별 트랜잭션 저장 요청이 완료될 때까지 기다림
        const results = await Promise.all(postTxPromises);
        const individualBackendTxIds = results.filter(
          (id) => id !== null
        ) as string[]; // 성공적으로 저장된 ID만 필터링
        console.log(
          "Individual transactions posted to backend:",
          individualBackendTxIds
        );

        // 모든 개별 트랜잭션 저장이 실패한 경우
        if (individualBackendTxIds.length === 0) {
          throw new Error("모든 개별 트랜잭션 저장에 실패했습니다.");
        }

        const mockReceipt = {
          hash: mockTxHash,
          status: 1,
          gasUsed: BigInt(21000 * toAddresses.length),
          effectiveGasPrice: ethers.parseUnits("20", "gwei"),
        };

        const gasFeeInWei = mockReceipt.gasUsed * mockReceipt.effectiveGasPrice;
        const finalStatus = mockReceipt.status === 1 ? "CONFIRMED" : "FAILED";

        if (mockReceipt.status === 1) {
          toast.success(t(`payment.messages.success`));
        } else {
          toast.error(t(`payment.errors.processing`));
        }

        // 백엔드에 각 개별 트랜잭션의 상태 업데이트 (개별 PATCH 호출)
        const patchTxPromises = individualBackendTxIds.map(async (txId) => {
          try {
            const response = await fetch(`/api/transaction/patch-tx/${txId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "accept-language": language,
              },
              body: JSON.stringify({
                status: finalStatus,
                fee: gasFeeInWei.toString(),
              }),
            });
            const data = await response.json();

            if (!data.success) {
              throw new Error(
                data.error.message || "트랜잭션 수정에 실패했습니다"
              );
            } else {
              fetchTransactions();
            }
          } catch (err) {
            console.error(
              `Failed to patch individual transaction ${txId} in backend:`,
              err
            );
          }
        });

        await Promise.all(patchTxPromises); // 모든 패치 요청 완료 대기
        console.log("All individual transactions status updated in backend.");

        // 상태(잔액 및 트랜잭션 내역) 업데이트
        fetchBalance();
        fetchKscBalance();
        fetchTxCount();
        fetchTransactions();
      } catch (err) {
        console.error("결제 처리 중 오류 발생", err);
      }
    },
    [fetchBalance, fetchKscBalance, fetchTransactions]
  );

  //예약 전송 테스트 함수
  const sendScheduledForTest = useCallback(
    async (
      toAddress: string,
      amount: string,
      network: "xrpl" | "avalanche" | null,
      scheduledTimeStr: string,
      memo?: string
    ) => {
      // 유효 상태 체크
      if (!isConnected || !address || !signer || !provider || !network) {
        setSendError(t("payment.errors.disconnect"));
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
          setSendError(t("payment.errors.systemUnavailable"));
          return "client-side-validation-fail";
        }
      } catch (err: any) {
        setSendError(t("payment.errors.systemUnavailable"));
        return "client-side-validation-fail";
      }

      // 수신자 지갑 주소 형식 체크
      if (!evmAddressRegex.test(toAddress)) {
        setSendError(t("payment.errors.invalidAddress"));
        return "client-side-validation-fail";
      }

      // KSC 잔액 부족 체크 (프론트에서 1차적으로 체크)
      if (Number(kscBalance) < Number(amount)) {
        setSendError(t("payment.errors.insufficient"));
        return "client-side-validation-fail";
      }

      // 예약 시간 체크
      const scheduledTime = new Date(scheduledTimeStr);
      const currentTime = new Date();
      if (scheduledTime.getTime() < currentTime.getTime()) {
        setSendError(t("payment.errors.invalidTime"));
        return "client-side-validation-fail";
      }

      // KSC 전송
      try {
        const kscContractAddress = KSC_CONTRACT_ADDRESS[network];

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

        //토큰 전송 트랜잭션 생성 및 전송
        const tx = await kscContract.transfer(toAddress, amountWei);
        let txId = "";

        // 트랜잭션 내역 백엔드에 저장
        try {
          const response = await fetch(`/api/transaction/post-tx`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "accept-language": language,
            },
            body: JSON.stringify({
              networkType: network === "xrpl" ? "XRPL" : "AVAX",
              paymentType: "INSTANT",
              fromAddress: address,
              toAddress,
              txHash: tx.hash,
              amount: amountWei.toString(),
              memo,
            }),
          });
          const data = await response.json();

          if (!data.success) {
            toast.error(t(`payment.errors.saveTxError`));
            return;
          } else {
            txId = data.data.id; // 트랜잭션 아이디 추출
            fetchTransactions();
            fetchBalance();
            fetchTxCount();
            fetchKscBalance();
          }
        } catch (err) {
          toast.error(t(`payment.errors.saveTxError`));
          return;
        }

        toast.promise(tx.wait(), {
          loading: "트랜잭션을 처리 중입니다...",
          success: "전송이 완료되었습니다!",
          error: "전송에 실패했습니다.",
        });

        const receipt = await tx.wait(); //트랜잭션 영수증

        // 가스비 계산
        const gasUsed = receipt.gasUsed;
        const gasPrice = receipt.effectiveGasPrice;
        const gasFeeInWei = gasUsed * gasPrice;

        //데이터 상태 업데이트
        if (receipt && receipt.status === 1) {
          // 트랜잭션 성공
          toast.success(t(`payment.messages.success`));
          // 백엔드에 트랜잭션 상태 업데이트
          try {
            const response = await fetch(`/api/transaction/patch-tx/${txId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "accept-language": language,
              },
              body: JSON.stringify({
                status: "CONFIRMED",
                fee: gasFeeInWei.toString(),
              }),
            });

            const data = await response.json();

            console.log("백엔드로부터 받은 응답: ", data);

            if (!data.success) {
              throw new Error(
                data.error.message || "트랜잭션 수정에 실패했습니다"
              );
            } else {
              fetchTransactions();
            }
          } catch (err) {
            console.error("트랜잭션 상태 업데이트 실패:", err);
          }

          // 상태(잔액 및 트랜잭션 내역) 업데이트
          fetchBalance();
          fetchKscBalance();
          fetchTxCount();
          fetchTransactions();
        } else {
          // 트랜잭션 실패
          toast.error(t(`payment.errors.processing`));
          //백엔드에 트랜잭션 상태 업데이트
          try {
            const response = await fetch(`/api/transaction/patch-tx/${txId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                status: "FAILED",
                fee: gasFeeInWei.toString(),
              }),
            });
            const data = await response.json();

            if (!data.success) {
              throw new Error(
                data.error.message || "트랜잭션 수정에 실패했습니다"
              );
            } else {
              fetchTransactions();
            }
          } catch (err) {
            console.error("트랜잭션 상태 업데이트 실패", err);
          }
        }
      } catch (err) {
        console.log("결제 처리 중 오류 발생: ", err);
      }
    },
    [fetchBalance, fetchKscBalance, fetchTransactions]
  );

  return {
    sendInstant,
    sendBatch,
    sendScheduled,
    sendInstantForTest,
    sendBatchForTest,
    sendScheduledForTest,
    sendError,
    setSendError,
  };
};
