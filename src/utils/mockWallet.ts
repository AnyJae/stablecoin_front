import { WalletTransaction } from "@/types/global.d";

// Mock Wallet 데이터
export const MOCK_WALLET_DATA = {
  xrpl: {
    address: "rMockXRPLWalletAddress123456789",
    balance: "0",
    kscBalance: "100000000000000000000000",
    krwBalance: "100000000000000000000000",
  },
  avalanche: {
    address: "0xMockAvalancheWalletAddress123456789",
    balance: "0",
    kscBalance: "100000000000000000000000",
    krwBalance: "100000000000000000000000",
  },
};

// Mock 트랜잭션 데이터 생성
export const generateMockTransactions = (
  address: string
): WalletTransaction[] => [];
