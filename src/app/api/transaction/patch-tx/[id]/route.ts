import { NextRequest, NextResponse } from "next/server";
import toast from "react-hot-toast";

//개별 트랜잭션 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: {
    status: "pending" | "confirmed" | "failed" | "PENDING"| "CONFIRMED" | "FAILED";
    fee: string | null;
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


    const data = await response.json();

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Transaction PATCH error:", err);
  if (err.name === "AbortError") {
      console.error("API 요청 타임아웃 또는 취소됨:", err);
      toast.error("요청 시간 초과");
    } else if (
      err instanceof TypeError &&
      err.message.includes("Failed to fetch")
    ) {
      console.error("네트워크 연결 오류:", err);
      toast.error("네트워크 연결 오류");
    } else {
      console.error("예상치 못한 오류 발생:", err);
      toast.error("예상치 못한 오류 발생");
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to backend",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
