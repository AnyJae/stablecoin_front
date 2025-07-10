import { NextRequest, NextResponse } from "next/server";
import { use } from "react";

//지갑 주소별 거래 내역 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = params;

  //Mocnking (개발용)
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  console.log("useMockData:", useMockData);
  if (useMockData) {
    const mockData = {
      success: true,
      data: {
        items: [
          {
            id: "1",
            txHash: "0x" + Math.random().toString(36).substring(2, 15),
            fromAddress: "0x" + Math.random().toString(36).substring(2, 15),
            toAddress: "0x" + Math.random().toString(36).substring(2, 15),
            txStatus: Math.random() > 0.2 ? "confirmed" : "pending",
            paymentType: Math.random() > 0.2 ? "instant" : "scheduled",
            fee: 0.0001,
            amount: (Math.random() * 1000).toFixed(2),
            tokenType: Math.random() > 0.2 ? "A_KSC" : "X_KSC",
            statusUpdatedAt: Date.now() - Math.random() * 86400000 * 7,
            memo:"Mock transaction for testing",
          },
          {
            id: "2",
            txHash: "0x" + Math.random().toString(36).substring(2, 15),
            fromAddress: "0x" + Math.random().toString(36).substring(2, 15),
            toAddress: "0x" + Math.random().toString(36).substring(2, 15),
            txStatus: Math.random() > 0.2 ? "confirmed" : "pending",
            paymentType: Math.random() > 0.2 ? "instant" : "scheduled",
            fee: 0.0001,
            amount: (Math.random() * 1000).toFixed(2),
            tokenType: Math.random() > 0.2 ? "A_KSC" : "X_KSC",
            statusUpdatedAt: Date.now() - Math.random() * 86400000 * 14,
            memo:"Mock transaction for testing",
          },
          {
            id: "3",
            txHash: "0x" + Math.random().toString(36).substring(2, 15),
            fromAddress: "0x" + Math.random().toString(36).substring(2, 15),
            toAddress: "0x" + Math.random().toString(36).substring(2, 15),
            txStatus: Math.random() > 0.2 ? "confirmed" : "pending",
            paymentType: Math.random() > 0.2 ? "instant" : "scheduled",
            fee: 0.0001,
            amount: (Math.random() * 1000).toFixed(2),
            tokenType: Math.random() > 0.2 ? "A_KSC" : "X_KSC",
            statusUpdatedAt: Date.now() - Math.random() * 86400000 * 14,
            memo:"Mock transaction for testing",
          },
        ],
        pagination: {
          limit: 10,
          currentPage: 1,
          totalPage: 15,
        },
      },
    };
    return NextResponse.json(mockData);
  }

  //   try {
  //     const backendUrl =
  //       process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  //     const response = await fetch(`${backendUrl}/api/transaction/history/${address}`);

  //     if (!response.ok) {
  //       throw new Error(`Backend API error: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     return NextResponse.json(data);
  //   } catch (error) {
  // return NextResponse.json(
  //       {
  //         success: false,
  //         message: "Failed to fetch balance from backend",
  //         error: (error as Error).message,
  //       },
  //       { status: 500 }
  //     );
  //   }
}
