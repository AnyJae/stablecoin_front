import { NextRequest, NextResponse } from "next/server";
import { use } from "react";

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
      data: [
      {
        hash: "0x" + Math.random().toString(36).substring(2, 15),
        from: address,
        to: "0x" + Math.random().toString(36).substring(2, 15),
        amount: (Math.random() * 1000).toFixed(2),
        currency: "KSC",
        timestamp: Date.now() - Math.random() * 86400000 * 7, // 최근 7일 내
        status: Math.random() > 0.2 ? "confirmed" : "pending",
      },
      {
        hash: "0x" + Math.random().toString(36).substring(2, 15),
        from: "0x" + Math.random().toString(36).substring(2, 15),
        to: address,
        amount: (Math.random() * 500).toFixed(2),
        currency: "KSC",
        timestamp: Date.now() - Math.random() * 86400000 * 14, // 최근 14일 내
        status: Math.random() > 0.2 ? "confirmed" : "pending",
      },
    ],
    };
    return NextResponse.json(mockData);
  }

  //   try {
  //     const backendUrl =
  //       process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  //     const response = await fetch(`${backendUrl}/api/transactions/${address}`);

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
