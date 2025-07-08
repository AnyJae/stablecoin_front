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
export const generateMockTransactions = (address: string) => [
  {
    hash: "0x" + Math.random().toString(36).substring(2, 15),
    from: address,
    to: "0x" + Math.random().toString(36).substring(2, 15),
    amount: "100.00",
    currency: "KSC",
    timestamp: Date.now() - 3600000, // 1시간 전
    status: "confirmed" as const,
    explorerUrl: `https://mock-explorer.com/tx/${"0x" + Math.random().toString(36).substring(2, 15)}`
  },
  {
    hash: "0x" + Math.random().toString(36).substring(2, 15),
    from: "0x" + Math.random().toString(36).substring(2, 15),
    to: address,
    amount: "50.00",
    currency: "KSC",
    timestamp: Date.now() - 7200000, // 2시간 전
    status: "confirmed" as const,
    explorerUrl: `https://mock-explorer.com/tx/${"0x" + Math.random().toString(36).substring(2, 15)}`
  },
];