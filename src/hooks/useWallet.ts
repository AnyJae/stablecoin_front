"use client";
import { ethers, formatEther, parseEther } from "ethers";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { abi } from "abi.json";

export interface WalletInfo {
  address: string;
  balance: {
    xrp: string;
    ksc: string;
  };
  isConnected: boolean;
  chain: "xrpl" | "avalanche" | null;
  networkName?: string;
  isMock?: boolean;
}

export interface WalletTransaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  currency: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
  explorerUrl?: string;
}

// Mock Wallet 데이터
const MOCK_WALLET_DATA = {
  xrpl: {
    address: "rMockXRPLWalletAddress123456789",
    balance: {
      xrp: "1000.00",
      ksc: "5000.00",
    },
  },
  avalanche: {
    address: "0xMockAvalancheWalletAddress123456789",
    balance: {
      xrp: "0",
      ksc: "2500.00",
    },
  },
};

export const useWallet = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: "",
    balance: {
      xrp: "0",
      ksc: "0",
    },
    isConnected: false,
    chain: null,
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avaxProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL);
  const xrplProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_XRPL_RPC_URL);
  const tokenAddress = process.env.NEXT_PUBLIC_KSC_CONTRACT_ADDRESS!; // 예: USDT

  const avaxTokenContract = new ethers.Contract(tokenAddress, abi, avaxProvider);
  const xrplTokenContract = new ethers.Contract(tokenAddress, abi, xrplProvider);
  let signer;

  // Mock Wallet 연결 (개발용)
  const connectMockWallet = useCallback(async (chain: "xrpl" | "avalanche") => {
    setIsLoading(true);
    setError(null);

    try {
      const mockData = MOCK_WALLET_DATA[chain];

      setWalletInfo((prev) => ({
        ...prev,
        address: mockData.address,
        balance: mockData.balance,
        isConnected: true,
        chain,
        networkName: chain === "xrpl" ? "XRPL Devnet (Mock)" : "Avalanche Fuji Testnet (Mock)",
        isMock: true,
      }));

      // Mock 트랜잭션 데이터 생성
      const mockTransactions: WalletTransaction[] = [
        {
          hash: "0x" + Math.random().toString(36).substring(2, 15),
          from: mockData.address,
          to: "0x" + Math.random().toString(36).substring(2, 15),
          amount: "100.00",
          currency: "KSC",
          timestamp: Date.now() - 3600000, // 1시간 전
          status: "confirmed",
        },
        {
          hash: "0x" + Math.random().toString(36).substring(2, 15),
          from: "0x" + Math.random().toString(36).substring(2, 15),
          to: mockData.address,
          amount: "50.00",
          currency: "KSC",
          timestamp: Date.now() - 7200000, // 2시간 전
          status: "confirmed",
        },
      ];

      setTransactions(mockTransactions);
      toast.success(`${chain.toUpperCase()} Mock 지갑이 연결되었습니다.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Mock 지갑 연결에 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Mock wallet connection error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // XRPL 지갑 연결
  // const connectXRPLWallet = useCallback(async () => {
  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     // XUMM SDK 또는 xrpl.js를 사용한 실제 연결
  //     if (typeof window !== "undefined" && (window as any).xumm) {
  //       // XUMM 지갑 연결
  //       const xumm = (window as any).xumm;
  //       const account = await xumm.user.account;

  //       if (!account) {
  //         throw new Error("XUMM 지갑 연결이 필요합니다.");
  //       }

  //       setWalletInfo((prev) => ({
  //         ...prev,
  //         address: account,
  //         isConnected: true,
  //         chain: "xrpl",
  //         networkName: "XRPL Devnet",
  //         isMock: false,
  //       }));

  //       await fetchBalance(account, "xrpl");
  //       toast.success("XRPL 지갑이 연결되었습니다.");
  //     } else {
  //       // 개발용 모의 연결
  //       await connectMockWallet("xrpl");
  //     }
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : "XRPL 지갑 연결에 실패했습니다.";
  //     setError(errorMessage);
  //     toast.error(errorMessage);
  //     console.error("XRPL wallet connection error:", err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [connectMockWallet]);

  const connectXRPLWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window.ethereum !== "undefined") {
        // 계정 요청
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (!accounts || accounts.length === 0) {
          throw new Error("지갑 연결이 거부되었습니다.");
        }

        const address = accounts[0];

        // 네트워크 확인 및 전환
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        // Avalanche Fuji 테스트넷 (Chain ID: 43113)
        const targetChainId = "0x161c28"; // 43113 in hex

        if (chainId !== targetChainId) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: targetChainId }],
            });
          } catch (switchError: any) {
            // 네트워크가 없는 경우 추가
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: targetChainId,
                    chainName: "Avalanche Fuji Testnet",
                    nativeCurrency: {
                      name: "AVAX",
                      symbol: "AVAX",
                      decimals: 18,
                    },
                    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                    blockExplorerUrls: ["https://testnet.snowtrace.io"],
                  },
                ],
              });
            } else {
              throw switchError;
            }
          }
        }

        setWalletInfo((prev) => ({
          ...prev,
          address,
          isConnected: true,
          chain: "xrpl",
          networkName: "XRPL EVM Testnet",
          isMock: false,
        }));

        // await fetchBalance(address, "xrpl");
        toast.success("XRPL 지갑이 연결되었습니다.");

        // 계정 변경 이벤트 리스너
        window.ethereum.on("accountsChanged", (newAccounts: string[]) => {
          if (newAccounts.length === 0) {
            setWalletInfo({
              address: "",
              balance: { xrp: "0", ksc: "0" },
              isConnected: false,
              chain: null,
            });
            setTransactions([]);
            setError(null);
            toast.success("지갑 연결이 해제되었습니다.");
          } else {
            setWalletInfo((prev) => ({
              ...prev,
              address: newAccounts[0],
            }));
            setTimeout(() => {
              fetchBalance(newAccounts[0], "avalanche");
            }, 100);
            toast.success("계정이 변경되었습니다.");
          }
        });

        // 체인 변경 이벤트 리스너
        window.ethereum.on("chainChanged", (newChainId: string) => {
          if (newChainId !== targetChainId) {
            setError("Avalanche Fuji 테스트넷으로 전환해주세요.");
            toast.error("올바른 네트워크로 전환해주세요.");
          }
        });
      } else {
        // MetaMask가 없는 경우 Mock Wallet 사용
        await connectMockWallet("avalanche");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Avalanche 지갑 연결에 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Avalanche wallet connection error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [connectMockWallet]);

  // Avalanche 지갑 연결
  const connectAvalancheWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window.ethereum !== "undefined") {
        // 계정 요청
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (!accounts || accounts.length === 0) {
          throw new Error("지갑 연결이 거부되었습니다.");
        }

        const address = accounts[0];

        // 네트워크 확인 및 전환
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        // Avalanche Fuji 테스트넷 (Chain ID: 43113)
        const targetChainId = "0xa869"; // 43113 in hex

        if (chainId !== targetChainId) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: targetChainId }],
            });
          } catch (switchError: any) {
            // 네트워크가 없는 경우 추가
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: targetChainId,
                    chainName: "Avalanche Fuji Testnet",
                    nativeCurrency: {
                      name: "AVAX",
                      symbol: "AVAX",
                      decimals: 18,
                    },
                    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                    blockExplorerUrls: ["https://testnet.snowtrace.io"],
                  },
                ],
              });
            } else {
              throw switchError;
            }
          }
        }

        setWalletInfo((prev) => ({
          ...prev,
          address,
          isConnected: true,
          chain: "avalanche",
          networkName: "Avalanche Fuji Testnet",
          isMock: false,
        }));

        // await fetchBalance(address, "avalanche");
        toast.success("Avalanche 지갑이 연결되었습니다.");

        // 계정 변경 이벤트 리스너
        window.ethereum.on("accountsChanged", (newAccounts: string[]) => {
          if (newAccounts.length === 0) {
            setWalletInfo({
              address: "",
              balance: { xrp: "0", ksc: "0" },
              isConnected: false,
              chain: null,
            });
            setTransactions([]);
            setError(null);
            toast.success("지갑 연결이 해제되었습니다.");
          } else {
            setWalletInfo((prev) => ({
              ...prev,
              address: newAccounts[0],
            }));
            setTimeout(() => {
              fetchBalance(newAccounts[0], "avalanche");
            }, 100);
            toast.success("계정이 변경되었습니다.");
          }
        });

        // 체인 변경 이벤트 리스너
        window.ethereum.on("chainChanged", (newChainId: string) => {
          if (newChainId !== targetChainId) {
            setError("Avalanche Fuji 테스트넷으로 전환해주세요.");
            toast.error("올바른 네트워크로 전환해주세요.");
          }
        });
      } else {
        // MetaMask가 없는 경우 Mock Wallet 사용
        await connectMockWallet("avalanche");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Avalanche 지갑 연결에 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Avalanche wallet connection error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [connectMockWallet]);

  // 잔액 조회
  const fetchBalance = useCallback(
    async (address: string, chain: "xrpl" | "avalanche") => {
      try {
        // Mock Wallet인 경우 Mock 데이터 반환
        if (walletInfo.isMock) {
          const mockData = MOCK_WALLET_DATA[chain];
          setWalletInfo((prev) => ({
            ...prev,
            balance: mockData.balance,
          }));
          return;
        }
        // TODO: replace with API
        if (chain === "xrpl") {
          // XRPL 잔액 조회 API 호출
          // const response = await fetch(`/api/xrpl/balance/${address}`);
          // const data = await response.json();

          // if (data.success) {
          //   setWalletInfo((prev) => ({
          //     ...prev,
          //     balance: {
          //       xrp: data.data?.xrp || "0",
          //       ksc: data.data?.ksc || "0",
          //     },
          //   }));
          // } else {
          //   throw new Error(data.message || "잔액 조회에 실패했습니다.");
          // }

          const xrplBalance = formatEther(await xrplProvider.getBalance(address));
          const tokenBalance = formatEther(await xrplTokenContract.balanceOf(address));

          setWalletInfo((prev) => ({
            ...prev,
            balance: {
              xrp: xrplBalance,
              ksc: tokenBalance,
            },
          }));
        } else {
          // Avalanche 잔액 조회 API 호출
          // const response = await fetch(`/api/avalanche/balance/${address}`);
          // const data = await response.json();
          // if (data.success) {
          //   setWalletInfo((prev) => ({
          //     ...prev,
          //     balance: {
          //       xrp: data.data?.xrp || 0
          //       ksc: data.data?.ksc || 0,
          //     },
          //   }));
          // } else {
          //   throw new Error(data.message || "잔액 조회에 실패했습니다.");
          // }

          const avaxBalance = formatEther(await avaxProvider.getBalance(address));
          const tokenBalance = formatEther(await avaxTokenContract.balanceOf(address));
          console.log(avaxBalance, tokenBalance);

          setWalletInfo((prev) => ({
            ...prev,
            balance: {
              xrp: avaxBalance,
              ksc: tokenBalance,
            },
          }));
        }
      } catch (err) {
        console.error("Balance fetch error:", err);
        toast.error("잔액 조회에 실패했습니다.");
      }
    },
    [walletInfo.isMock]
  );

  // 트랜잭션 조회
  const fetchTransactions = useCallback(
    async (address: string) => {
      try {
        // Mock Wallet인 경우 Mock 데이터 반환
        if (walletInfo.isMock) {
          const mockTransactions: WalletTransaction[] = [
            {
              hash: "0x" + Math.random().toString(36).substring(2, 15),
              from: address,
              to: "0x" + Math.random().toString(36).substring(2, 15),
              amount: "100.00",
              currency: "KSC",
              timestamp: Date.now() - 3600000, // 1시간 전
              status: "confirmed",
            },
            {
              hash: "0x" + Math.random().toString(36).substring(2, 15),
              from: "0x" + Math.random().toString(36).substring(2, 15),
              to: address,
              amount: "50.00",
              currency: "KSC",
              timestamp: Date.now() - 7200000, // 2시간 전
              status: "confirmed",
            },
          ];
          setTransactions(mockTransactions);
          return;
        }

        const response = await fetch(`/api/transactions/${address}`);
        const data = await response.json();

        if (data.success) {
          setTransactions(data.transactions || []);
        } else {
          throw new Error(data.message || "거래내역 조회에 실패했습니다.");
        }
      } catch (err) {
        console.error("Transaction fetch error:", err);
        toast.error("거래내역 조회에 실패했습니다.");
      }
    },
    [walletInfo.isMock]
  );

  // KSC 전송
  const sendKSC = useCallback(
    async (to: string, amount: string, chain: "xrpl" | "avalanche") => {
      setIsLoading(true);
      setError(null);

      try {
        // Mock Wallet인 경우 Mock 전송 시뮬레이션
        if (walletInfo.isMock) {
          // Mock 전송 시뮬레이션 (2초 대기)
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Mock 트랜잭션 생성
          const mockTransaction: WalletTransaction = {
            hash: "0x" + Math.random().toString(36).substring(2, 15),
            from: walletInfo.address,
            to,
            amount,
            currency: "KSC",
            timestamp: Date.now(),
            status: "confirmed",
          };

          // 트랜잭션 목록에 추가
          setTransactions((prev) => [mockTransaction, ...prev]);

          // 잔액 업데이트 (Mock)
          const currentBalance = parseFloat(walletInfo.balance.ksc);
          const sendAmount = parseFloat(amount);
          const newBalance = Math.max(0, currentBalance - sendAmount);

          setWalletInfo((prev) => ({
            ...prev,
            balance: {
              ...prev.balance,
              ksc: newBalance.toFixed(2),
            },
          }));

          toast.success("Mock 전송이 완료되었습니다.");
          return {
            success: true,
            transactionHash: mockTransaction.hash,
            message: "Mock 전송이 성공적으로 완료되었습니다.",
          };
        }

        //   // MetaMask를 통한 직접 전송
        //   if (typeof window.ethereum === "undefined") {
        //     throw new Error("MetaMask가 설치되지 않았습니다.");
        //   }

        //   // 컨트랙트 ABI (필요한 함수만)
        //   const contractABI = [
        //     "function transfer(address to, uint256 amount) returns (bool)",
        //     "function decimals() view returns (uint8)",
        //   ];

        //   // 컨트랙트 주소 (실제 배포 후 변경 필요)
        //   const contractAddress =
        //     process.env.NEXT_PUBLIC_KSC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

        //   if (contractAddress === "0x0000000000000000000000000000000000000000") {
        //     throw new Error("컨트랙트 주소가 설정되지 않았습니다.");
        //   }

        //   // ethers.js를 사용한 전송
        //   const provider = new (window as any).ethers.providers.Web3Provider(window.ethereum);
        //   const signer = provider.getSigner();
        //   const contract = new (window as any).ethers.Contract(contractAddress, contractABI, signer);

        //   // 소수점 자릿수 조회
        //   const decimals = await contract.decimals();
        //   const amountWei = (window as any).ethers.utils.parseUnits(amount, decimals);

        //   // 트랜잭션 전송
        //   const tx = await contract.transfer(to, amountWei);
        //   toast.promise(tx.wait(), {
        //     loading: "트랜잭션을 처리 중입니다...",
        //     success: "전송이 완료되었습니다!",
        //     error: "전송에 실패했습니다.",
        //   });

        //   const receipt = await tx.wait();

        //   // 성공 시 상태 업데이트
        //   await fetchTransactions(walletInfo.address);
        //   await fetchBalance(walletInfo.address, chain);

        //   return {
        //     success: true,
        //     transactionHash: receipt.transactionHash,
        //     message: "전송이 성공적으로 완료되었습니다.",
        //   };
        // } else {
        //   // XRPL 전송 (백엔드 API 사용)
        //   const response = await fetch("/api/transaction/send", {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       from: walletInfo.address,
        //       to,
        //       amount,
        //       currency: "KSC",
        //       chain,
        //     }),
        //   });

        //   const data = await response.json();

        //   if (data.success) {
        //     toast.success("전송이 성공적으로 완료되었습니다.");
        //     // 트랜잭션 목록 새로고침
        //     await fetchTransactions(walletInfo.address);
        //     // 잔액 새로고침
        //     await fetchBalance(walletInfo.address, chain);
        //   } else {
        //     throw new Error(data.message || "전송에 실패했습니다.");
        //   }

        //   return data;

        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        const abi = [
          "function transfer(address to, uint256 amount) returns (bool)",
          "function decimals() view returns (uint8)",
        ];
        const token = new ethers.Contract(tokenAddress, abi, signer);

        const tx = await token.transfer(to, parseEther(amount));
        console.log("Tx sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("Tx confirmed:", receipt.transactionHash);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "전송에 실패했습니다.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Send KSC error:", err);
        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [walletInfo.address, walletInfo.balance.ksc, walletInfo.isMock, fetchTransactions, fetchBalance]
  );

  // 지갑 연결 해제
  const disconnectWallet = useCallback(() => {
    setWalletInfo({
      address: "",
      balance: {
        xrp: "0",
        ksc: "0",
      },
      isConnected: false,
      chain: null,
    });
    setTransactions([]);
    setError(null);
    toast.success("지갑 연결이 해제되었습니다.");
  }, []);

  // 컴포넌트 마운트 시 연결된 지갑 확인
  useEffect(() => {
    if (walletInfo.isConnected && walletInfo.address) {
      // fetchTransactions(walletInfo.address);
    }
  }, [walletInfo.isConnected, walletInfo.address, fetchTransactions]);

  return {
    walletInfo,
    transactions,
    isLoading,
    error,
    connectXRPLWallet,
    connectAvalancheWallet,
    connectMockWallet,
    sendKSC,
    disconnectWallet,
    fetchBalance,
    fetchTransactions,
  };
};

// TypeScript 전역 타입 선언
declare global {
  interface Window {
    ethereum?: any;
    ethers?: any;
    xumm?: any;
  }
}
