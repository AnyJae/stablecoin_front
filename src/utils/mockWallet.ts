import { WalletTransaction } from "@/types/global.d";

// Mock Wallet 데이터
export const MOCK_WALLET_DATA = {
  xrpl: {
    address: "rMockXRPLWalletAddress123456789",
    balance: "1000.00",
    kscBalance: "5000.00",
  },
  avalanche: {
    address: "0xMockAvalancheWalletAddress123456789",
    balance: "10.00",
    kscBalance: "2500.00",
  },
};

// Mock 트랜잭션 데이터 생성
export const generateMockTransactions = (address: string): WalletTransaction[] => [];

