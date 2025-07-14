import { ethers } from "ethers";
import { BrowserProvider, Eip1193Provider } from "ethers/types/providers";

declare global {
  interface Window {
    ethereum: Eip1193Provider & BrowserProvider;
  }
}

export interface WalletTransaction {
  id: string;
  txHash: string | null;
  fromAddress: string;
  toAddress: string;
  txStatus: "pending" | "confirmed" | "failed";
  paymentType: "instant" | "batch" | "scheduled";
  fee: string | null;
  amount: string;
  tokenType: "A_KSC" | "X_KSC";
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  statusUpdatedAt?: string | null;
  memo?: string | null;
}
