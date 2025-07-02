'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface MarketData {
  timestamp: string;
  kscPrice: number;
  kscSupply: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
}

interface CollateralData {
  timestamp: string;
  totalValue: number;
  kscSupply: number;
  collateralRatio: number;
  minCollateralRatio: number;
  isHealthy: boolean;
  assets: Array<{
    symbol: string;
    name: string;
    amount: string;
    valueInKRW: number;
    priceInKRW: number;
    ratio: number;
    lastUpdateTime: number;
  }>;
}

interface TransactionData {
  timestamp: string;
  recentTransactions: Array<{
    id: string;
    type: string;
    from: string;
    to: string;
    amount: number;
    timestamp: string;
    status: string;
  }>;
  totalTransactions24h: number;
  totalVolume24h: number;
}

interface RealtimeData {
  market: MarketData | null;
  collateral: CollateralData | null;
  transaction: TransactionData | null;
}

interface UseRealtimeOptions {
  autoConnect?: boolean;
  reconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const {
    autoConnect = true,
    reconnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 1000
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RealtimeData>({
    market: null,
    collateral: null,
    transaction: null
  });

  const socketRef = useRef<Socket | null>(null);

  // Socket.IO 연결
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002', {
        transports: ['websocket', 'polling'],
        autoConnect: false,
        reconnection: reconnect,
        reconnectionAttempts: reconnectAttempts,
        reconnectionDelay: reconnectDelay,
        timeout: 10000
      });

      socket.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        console.log('실시간 서비스에 연결되었습니다.');
      });

      socket.on('disconnect', (reason) => {
        setIsConnected(false);
        setIsConnecting(false);
        console.log('실시간 서비스 연결이 해제되었습니다:', reason);
      });

      socket.on('connect_error', (err) => {
        setIsConnecting(false);
        setError(`연결 실패: ${err.message}`);
        console.error('실시간 서비스 연결 에러:', err);
      });

      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`재연결 시도 ${attemptNumber}/${reconnectAttempts}`);
      });

      socket.on('reconnect_failed', () => {
        setError('재연결에 실패했습니다.');
        console.error('실시간 서비스 재연결 실패');
      });

      // 데이터 이벤트 리스너
      socket.on('market-update', (marketData: MarketData) => {
        setData(prev => ({ ...prev, market: marketData }));
      });

      socket.on('collateral-update', (collateralData: CollateralData) => {
        setData(prev => ({ ...prev, collateral: collateralData }));
      });

      socket.on('transaction-update', (transactionData: TransactionData) => {
        setData(prev => ({ ...prev, transaction: transactionData }));
      });

      socketRef.current = socket;
      socket.connect();
    } catch (err) {
      setIsConnecting(false);
      setError('Socket.IO 연결 초기화 실패');
      console.error('Socket.IO 초기화 에러:', err);
    }
  }, [reconnect, reconnectAttempts, reconnectDelay]);

  // Socket.IO 연결 해제
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
    }
  }, []);

  // 채널 구독
  const subscribe = useCallback((channels: string | string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe', channels);
    }
  }, []);

  // 채널 구독 해제
  const unsubscribe = useCallback((channels: string | string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe', channels);
    }
  }, []);

  // 사용자 인증
  const authenticate = useCallback((userId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('authenticate', { userId });
    }
  }, []);

  // 자동 연결
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // 상태
    isConnected,
    isConnecting,
    error,
    data,
    
    // 메서드
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    authenticate,
    
    // 개별 데이터
    marketData: data.market,
    collateralData: data.collateral,
    transactionData: data.transaction
  };
} 