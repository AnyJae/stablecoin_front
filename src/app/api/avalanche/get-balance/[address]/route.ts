import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
      console.log("❗❗❗❗❗❗ API ROUTE EXECUTION STARTED ❗❗❗❗❗❗");
      const { address } = params;

  //Mocking (개발용)
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  console.log("useMockData:", useMockData);

  if (useMockData) {
    console.log("Using mock data for balance API.");
    const mockData = {
      success: true,
      data: {
        address,
        balance: "100",
        formattedBalance: "100",
        symbol: "KSC",
        decimals: "18",
      },
    };
    return NextResponse.json(mockData);
  }

  // try {
  //   // 백엔드 API 호출
  //   const backendUrl =
  //     process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  //   const response = await fetch(
  //     `${backendUrl}/api/avalanche/balance/${address}`
  //   );

  //   if (!response.ok) {
  //     throw new Error(`Backend API error: ${response.status}`);
  //   }

  //   const data = await response.json();
  //   return NextResponse.json(data);
  // } catch (error) {
  //   console.error("Avalanche balance fetch error:", error);

  //   return NextResponse.json(
  //     {
  //       success: false,
  //       message: "Failed to fetch balance from backend",
  //       error: (error as Error).message,
  //     },
  //     { status: 500 }
  //   );
  // }
}
