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
  txStatus: "pending" | "confirmed" | "failed" | "approve" | "canceled" | "paused" |"PENDING" | "CONFIRMED" | "FAILED" | "APPROVE" | "CANCELED" | "PAUSED";
  paymentType: "instant" | "batch" | "scheduled" | "INSTANT" | "BATCH" | "SCHEDULED" | "MINT" | "BURN";
  fee: string | null;
  amount: string;
  tokenType: "A_KSC" | "X_KSC";
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  statusUpdatedAt?: string | null;
  memo?: string | null;
}
