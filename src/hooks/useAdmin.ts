"use client";
import { ethers, formatEther, parseEther } from "ethers";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { abi } from "abi.json";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avaxProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL);
  const xrplProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_XRPL_RPC_URL);
  const tokenAddress = process.env.NEXT_PUBLIC_KSC_CONTRACT_ADDRESS!;
  const avaxTokenContract = new ethers.Contract(tokenAddress, abi, avaxProvider);
  const xrplTokenContract = new ethers.Contract(tokenAddress, abi, xrplProvider);
  let signer;

  // 컨트랙트 정보 조회
  const fetchContractInfo = useCallback(async () => {
    try {
      // const response = await fetch('/api/avalanche/contract-info');
      // const data = await response.json();
      // if (data.success) {
      //   setContractInfo(data.data);
      // } else {
      //   throw new Error(data.error || '컨트랙트 정보 조회에 실패했습니다.');
      // }

      const totalMinted = formatEther(await xrplTokenContract.getTotalMinted());
      const totalBurned = formatEther(await xrplTokenContract.getTotalBurned());
      setContractInfo({
        name: "Korea Stable Coin",
        symbol: "KSC",
        decimals: "18",
        totalSupply: "1000000.00",
        totalMinted: totalMinted,
        totalBurned: totalBurned,
        paused: false,
        contractAddress: process.env.NEXT_PUBLIC_KSC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
        explorerUrl: "https://testnet.snowtrace.io",
      });
    } catch (err) {
      console.error("Contract info fetch error:", err);
      // 모의 데이터 (개발용)
      setContractInfo({
        name: "Korea Stable Coin",
        symbol: "KSC",
        decimals: "18",
        totalSupply: "1000000.00",
        totalMinted: "500000.00",
        totalBurned: "50000.00",
        paused: false,
        contractAddress: "0x0000000000000000000000000000000000000000",
        explorerUrl: "https://testnet.snowtrace.io",
      });
      toast.error("컨트랙트 정보 조회에 실패했습니다. (개발 모드)");
    }
  }, []);

  // KSC 발행
  const mintKSC = useCallback(
    async (to: string, amount: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        const token = new ethers.Contract(tokenAddress, abi, signer);

        const tx = await token.mint(to, parseEther(amount));
        console.log("Tx sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("Tx confirmed:", receipt.transactionHash);
        // const response = await fetch("/api/admin/mint", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     to,
        //     amount,
        //   }),
        // });
        // const data = await response.json();
        // if (data.success) {
        //   toast.success("KSC 발행이 완료되었습니다.");
        //   // 컨트랙트 정보 새로고침
        //   await fetchContractInfo();
        // } else {
        //   throw new Error(data.message || "발행에 실패했습니다.");
        // }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "발행에 실패했습니다.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Mint KSC error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchContractInfo]
  );

  // KSC 소각
  const burnKSC = useCallback(
    async (from: string, amount: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        const token = new ethers.Contract(tokenAddress, abi, signer);

        const tx = await token.burn(from, parseEther(amount));
        console.log("Tx sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("Tx confirmed:", receipt.transactionHash);

        // const response = await fetch("/api/admin/burn", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     from,
        //     amount,
        //   }),
        // });

        // const data = await response.json();

        // if (data.success) {
        //   toast.success("KSC 소각이 완료되었습니다.");
        //   // 컨트랙트 정보 새로고침
        //   await fetchContractInfo();
        // } else {
        //   throw new Error(data.message || "소각에 실패했습니다.");
        // }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "소각에 실패했습니다.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Burn KSC error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchContractInfo]
  );

  // 긴급 일시정지
  const emergencyPause = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // const response = await fetch("/api/admin/pause", {
      //   method: "POST",
      // });

      // const data = await response.json();

      // if (data.success) {
      //   toast.success("긴급 일시정지가 적용되었습니다.");
      //   // 컨트랙트 정보 새로고침
      //   await fetchContractInfo();
      // } else {
      //   throw new Error(data.message || "일시정지에 실패했습니다.");
      // }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = await provider.getSigner();
      const abi = ["function emergencyPause(string reason) external"];
      const token = new ethers.Contract(tokenAddress, abi, signer);

      const tx = await token.emergencyPause("skrr");
      console.log("Tx sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Tx confirmed:", receipt);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "일시정지에 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Emergency pause error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchContractInfo]);

  // 일시정지 해제
  const emergencyUnpause = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // const response = await fetch("/api/admin/unpause", {
      //   method: "POST",
      // });

      // const data = await response.json();

      // if (data.success) {
      //   toast.success("일시정지가 해제되었습니다.");
      //   // 컨트랙트 정보 새로고침
      //   await fetchContractInfo();
      // } else {
      //   throw new Error(data.message || "일시정지 해제에 실패했습니다.");
      // }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = await provider.getSigner();
      const abi = ["function emergencyUnpause() external"];
      const token = new ethers.Contract(tokenAddress, abi, signer);

      const tx = await token.emergencyUnpause();
      console.log("Tx sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Tx confirmed:", receipt);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "일시정지 해제에 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Emergency unpause error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchContractInfo]);

  // 컴포넌트 마운트 시 컨트랙트 정보 조회
  useEffect(() => {
    fetchContractInfo();
  }, [fetchContractInfo]);

  return {
    contractInfo,
    mintKSC,
    burnKSC,
    emergencyPause,
    emergencyUnpause,
    isLoading,
    error,
  };
};
