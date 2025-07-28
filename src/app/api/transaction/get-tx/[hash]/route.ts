import { NextRequest, NextResponse } from "next/server";

// 개별 트랜잭션 상세 정보 조회  (📍수정 필요)

export async function GET(request: NextRequest, { params }: { params: { hash: string } }) {
  const { hash } = params;

  try {
    // 백엔드 API 호출
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const response = await fetch(`${backendUrl}/api/transaction/${hash}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error("Transaction GET error:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve transaction from backend",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
