import { getFetchErrorMessage } from "@/utils/translator";
import { NextRequest, NextResponse } from "next/server";

// KSC 공급량 정보 조회 - 최대 발행량, 현재 유통량, 총 소각량 
export async function GET(
  request: NextRequest,
  { params }: { params: { networkType: string } }
) {
  const { networkType } = params;
  const lang = request.headers.get("accept-language") || "en";

  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const response = await fetch(
      `${backendUrl}/api/external/ksc/token-info/${networkType}`,
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
      }  else if (data.statusCode === 422) {
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
