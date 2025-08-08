"use client";

import { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useWalletContext } from "./wallet/WalletContext";
import { WalletTransaction } from "@/types/global";
import toast from "react-hot-toast";
import { useAssets } from "@/hooks/useAssets";

interface SocketContextType {
  socket: Socket | null;
  socketConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  socketConnected: false,
});

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { addressId, setBalance } = useWalletContext();
  const { setAdminHistory, adminHistory } = useAssets();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    if (!addressId) return;

    const socket = io(`${SOCKET_URL}/events`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        walletId: addressId,
      },
    });

    setSocket(socket);

    // 웹소켓 연결, 해제, 오류
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
    });

    socket.on("connect_error", (err) => {
      toast.error(`연결 에러: ${err.message}`);
    });

    // 클라이언트 인증 및 이벤트 구독 요청
    socket.emit("auth", { walletId: addressId });
    socket.on("auth_success", (response) => {
      console.log("클라이언트 인증 성공", response);
      socket.emit("subscribe", { eventTypes: ["transaction.status.changed"] });
    });

    socket.on("subscribe_success", (response) => {
      console.log("이벤트 구독 성공", response);
    });
    socket.on("subscribe_error", (response) => {
      console.log("이벤트 구독 실패", response);
    });

    return () => {
      socket.disconnect();
    };
  }, [addressId, setBalance, setAdminHistory]);

  return (
    <SocketContext.Provider value={{ socket, socketConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
