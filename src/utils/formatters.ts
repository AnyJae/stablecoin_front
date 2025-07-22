import { useLanguage } from "@/contexts/localization/LanguageContext";
import { ethers, BigNumberish } from "ethers";

// ⚙️지갑 주소 줄임
export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// ⚙️금액 소수점 2~6 자리 표현
export const formatAmount = (balance: string) => {
  if(balance == "-"){
    return balance;
  }

  return parseFloat(balance).toLocaleString("ko-KR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};

// ⚙️ Wei to ERC-20 토큰 단위로 변환
export const formatWeiToKsc = (
  weiAmountStr: string,
  tokenDecimals: number = 18,
  displayDecimals: number = 2 
): string => {
  try {
    const kscFullPrecision = ethers.formatUnits(weiAmountStr, tokenDecimals);
    const numValue = parseFloat(kscFullPrecision);

    //  0이 아닌 아주 작은 값이 0.0000으로 표시될 경우 처리
    if (numValue === 0 && BigInt(weiAmountStr) !== 0n) {
      return numValue.toFixed(displayDecimals);
    }

    const finalFormattedValue = parseFloat(numValue.toFixed(displayDecimals)).toLocaleString("en-US", {
        minimumFractionDigits: displayDecimals, 
        maximumFractionDigits: displayDecimals, 
    });

    return finalFormattedValue;

  } catch (error) {
    console.error("formatWeiToKsc conversion error:", error);
    return "Error";
  }
};

// ⚙️날짜 및 시간 - 년.월.일 시간 (YYYY-MM-DDTHH:mm)
export const formatDate = (timestamp: string | null | undefined) => {
  const { language } = useLanguage();
  const locale = language === "en" ? "en-US" : "ko-KR";

  // toLocaleString 옵션
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long", // 'long': January, February / 'short': Jan, Feb / '2-digit': 01, 02
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24시간 형식 (true로 하면 AM/PM)
  };

  return new Date(timestamp || "").toLocaleString(locale, options);
};
