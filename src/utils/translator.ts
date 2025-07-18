const errorTranslations = {
  'ko': {
    networkIssue: "네트워크 오류 또는 서버 응답 형식이 잘못되었습니다",
    serverReturnedError: "서버에서 오류가 발생했습니다",
    backendLogicFailed: "서버에서 처리 중 오류가 발생했습니다",
    apiRequestTimedOut: "API 요청 시간이 초과되었습니다",
    networkConnectionProblem: "백엔드 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요",
    unexpectedError: "예상치 못한 서버 오류가 발생했습니다",
    badRequest: '잘못된 요청입니다',
    invalidData: "데이터 검증에 실패했습니다",
    walletNotFound: "지갑을 찾을 수 없습니다"

  },
  'en': {
    networkIssue: "Network error or invalid server response format",
    serverReturnedError: "Server returned an error",
    backendLogicFailed: "Backend logic failed",
    apiRequestTimedOut: "API request timed out",
    networkConnectionProblem: "Could not connect to the backend server. Please try again later",
    unexpectedError: "An unexpected server error occurred",
    badRequest: "Bad request",
    invalidData: "Failed to validate data",
    walletNotFound: "Wallet not found"
  }
};

export function getFetchErrorMessage(lang:string, key: keyof typeof errorTranslations['en'] ) {
  const selectedLang = lang.startsWith('ko') ? 'ko' : 'en';
  return errorTranslations[selectedLang][key] || errorTranslations['en'][key];
}