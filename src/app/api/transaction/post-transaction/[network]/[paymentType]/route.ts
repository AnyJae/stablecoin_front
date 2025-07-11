import { AdminInterface } from '@/components/admin/admin-interface';
import { NextRequest, NextResponse } from "next/server";

// 개별 트랜잭션 생성
export async function POST(request: NextRequest, { params }: { params: { network: string, paymentType:string } }) {
  let body: {
    fromAddress: string;
    toAddress: string;
    txHash: string | null;
    amount: number;
    scheduledAt?: string | null;
    memo?: string | null;
  };

  //동적 경로 파라미터
  const { network, paymentType } = params;

  try {
    body = await request.json();

    //백엔드 API 호출
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const response = await fetch(`${backendUrl}/api/transaction/${network}/${paymentType.toUpperCase()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error("Transaction POST error:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save transaction to backend",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
