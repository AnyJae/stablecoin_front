import { useLanguage } from "@/contexts/localization/LanguageContext";

// ⚙️지갑 주소 줄임
export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// ⚙️금액 소수점 2~6 자리 표현
export const formatAmount = (balance: string) => {
  return parseFloat(balance).toLocaleString("ko-KR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};

// ⚙️날짜 및 시간 - 년.월.일 시간
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

  return new Date(timestamp || '').toLocaleString(locale, options);
};
