'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppKit } from '@reown/appkit';
import { ethers } from 'ethers';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (transaction: any) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

function WalletProviderContent({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 잔액 조회
  const fetchBalance = async (address: string) => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask가 설치되지 않았습니다.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (err) {
      console.error('잔액 조회 실패:', err);
      setError('잔액 조회에 실패했습니다.');
    }
  };

  // 네트워크 정보 조회
  const fetchNetworkInfo = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask가 설치되지 않았습니다.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
    } catch (err) {
      console.error('네트워크 정보 조회 실패:', err);
      setError('네트워크 정보 조회에 실패했습니다.');
    }
  };

  // 지갑 연결
  const connect = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      if (!window.ethereum) {
        throw new Error('MetaMask가 설치되지 않았습니다.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        await fetchBalance(accounts[0]);
        await fetchNetworkInfo();
      }
    } catch (err) {
      console.error('지갑 연결 실패:', err);
      setError('지갑 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 지갑 연결 해제
  const disconnect = () => {
    try {
      setIsConnected(false);
      setAddress(null);
      setBalance(null);
      setChainId(null);
      setError(null);
    } catch (err) {
      console.error('지갑 연결 해제 실패:', err);
      setError('지갑 연결 해제에 실패했습니다.');
    }
  };

  // 메시지 서명
  const signMessage = async (message: string): Promise<string> => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask가 설치되지 않았습니다.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      return signature;
    } catch (err) {
      console.error('메시지 서명 실패:', err);
      throw new Error('메시지 서명에 실패했습니다.');
    }
  };

  // 트랜잭션 전송
  const sendTransaction = async (transaction: any) => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask가 설치되지 않았습니다.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction(transaction);
      return await tx.wait();
    } catch (err) {
      console.error('트랜잭션 전송 실패:', err);
      throw new Error('트랜잭션 전송에 실패했습니다.');
    }
  };

  const value: WalletContextType = {
    isConnected,
    address,
    balance,
    chainId,
    connect,
    disconnect,
    signMessage,
    sendTransaction,
    isLoading,
    error
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WalletProviderContent>
      {children}
    </WalletProviderContent>
  );
} 