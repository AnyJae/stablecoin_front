import { NextRequest, NextResponse } from "next/server";

//개별 트랜잭션 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: {
    status: "pending" | "confirmed" | "failed";
    fee: number | null;
  };

  //동적 경로 파라미터
  const { id } = params;

  try {
    body = await request.json();

    //백엔드 API 호출
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const response = await fetch(`${backendUrl}/api/transaction/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error("Transaction PATCH error:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update transaction in backend",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
