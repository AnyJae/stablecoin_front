import { getFetchErrorMessage } from "@/utils/translator";
import { NextRequest, NextResponse } from "next/server";
import { use } from "react";
import toast from "react-hot-toast";

//지갑 주소별 거래 내역 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { walletId: string } }
) {
  //동적 파라미터
  const { walletId } = params;
  //쿼리 파라미터
  const limit = Number(request.nextUrl.searchParams.get("limit"));
  const page = Number(request.nextUrl.searchParams.get("page")) || 1;

  const lang = request.headers.get("accept-language") || "en";

  //Mocnking (개발용)
  // const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  // console.log("useMockData:", useMockData);
  // if (useMockData) {
  //   const mockData = {
  //     success: true,
  //     data: {
  //       items: [
  //         {
  //           id: "1",
  //           txHash: "0x" + Math.random().toString(36).substring(2, 15),
  //           fromAddress: "0x" + Math.random().toString(36).substring(2, 15),
  //           toAddress: "0x" + Math.random().toString(36).substring(2, 15),
  //           txStatus: Math.random() > 0.2 ? "confirmed" : "pending",
  //           paymentType: Math.random() > 0.2 ? "instant" : "scheduled",
  //           fee: 0.0001,
  //           amount: (Math.random() * 1000).toFixed(2),
  //           tokenType: Math.random() > 0.2 ? "A_KSC" : "X_KSC",
  //           statusUpdatedAt: Date.now() - Math.random() * 86400000 * 7,
  //           memo:"Mock transaction for testing",
  //         },
  //         {
  //           id: "2",
  //           txHash: "0x" + Math.random().toString(36).substring(2, 15),
  //           fromAddress: "0x" + Math.random().toString(36).substring(2, 15),
  //           toAddress: "0x" + Math.random().toString(36).substring(2, 15),
  //           txStatus: Math.random() > 0.2 ? "confirmed" : "pending",
  //           paymentType: Math.random() > 0.2 ? "instant" : "scheduled",
  //           fee: 0.0001,
  //           amount: (Math.random() * 1000).toFixed(2),
  //           tokenType: Math.random() > 0.2 ? "A_KSC" : "X_KSC",
  //           statusUpdatedAt: Date.now() - Math.random() * 86400000 * 14,
  //           memo:"Mock transaction for testing",
  //         },
  //         {
  //           id: "3",
  //           txHash: "0x" + Math.random().toString(36).substring(2, 15),
  //           fromAddress: "0x" + Math.random().toString(36).substring(2, 15),
  //           toAddress: "0x" + Math.random().toString(36).substring(2, 15),
  //           txStatus: Math.random() > 0.2 ? "confirmed" : "pending",
  //           paymentType: Math.random() > 0.2 ? "instant" : "scheduled",
  //           fee: 0.0001,
  //           amount: (Math.random() * 1000).toFixed(2),
  //           tokenType: Math.random() > 0.2 ? "A_KSC" : "X_KSC",
  //           statusUpdatedAt: Date.now() - Math.random() * 86400000 * 14,
  //           memo:"Mock transaction for testing",
  //         },
  //       ],
  //       pagination: {
  //         limit: 10,
  //         currentPage: 1,
  //         totalPage: 15,
  //       },
  //     },
  //   };
  //   return NextResponse.json(mockData);
  // }



  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const response = await fetch(
      `${backendUrl}/api/transaction/history/${walletId}?limit=${limit}&currentPage=${page}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    //HTTP 응답 상태 코드 확인
    if (!response.ok) {
      let errData: any;
      try {
        errData = await response.json();
      } catch (jsonParseError) {
        //1. JSON 파싱 실패 에러 처리
        console.error(
          "Failed to parse error response JSON (HTTP status not OK):",
          jsonParseError
        );
        return NextResponse.json(
          {
            success: false,
            message: getFetchErrorMessage(lang, "networkIssue"),
          },
          { status: response.status }
        );
      }

      //2. HTTP 통신 에러 처리
      const errMessage =
        errData.error?.message ||
        getFetchErrorMessage(lang, "serverReturnedError");
      return NextResponse.json(
        { success: false, message: errMessage, data: errData },
        { status: response.status }
      );
    }

    // 3. 백엔드 비즈니스 로직 에러 처리
    const data = await response.json();
    if (!data.success) {
      let errMessage = getFetchErrorMessage(lang, "backendLogicFailed");
      if (data.statusCode === 400) {
        errMessage = getFetchErrorMessage(lang, "badRequest");
      } else if (data.statusCode === 404) {
        errMessage = getFetchErrorMessage(lang, "walletNotFound");
      } else if (data.statusCode === 422) {
        errMessage = getFetchErrorMessage(lang, "invalidData");
      } else if (data.statusCode === 500) {
        errMessage = getFetchErrorMessage(lang, "serverReturnedError");
      }

      return NextResponse.json(
        { success: false, message: errMessage, data: data },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Wallet POST error:", err);

    // 4. 그 외 에러 처리
    let statusCode = 500;
    let message = getFetchErrorMessage(lang, "unexpectedError");

    if (err.name === "AbortError") {
      statusCode = 408; // Request Timeout
      message = getFetchErrorMessage(lang, "apiRequestTimedOut");
    } else if (
      err instanceof TypeError &&
      err.message.includes("Failed to fetch")
    ) {
      statusCode = 503; // Service Unavailable
      message = getFetchErrorMessage(lang, "networkConnectionProblem");
    }
    // 기타 예상치 못한 에러는 기본 500으로 처리

    return NextResponse.json(
      {
        success: false,
        message: message,
        errorDetails: (err as Error).message,
      },
      { status: statusCode }
    );
  }
}
