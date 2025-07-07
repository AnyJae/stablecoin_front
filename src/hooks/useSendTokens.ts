import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const useSendTokens = () => {
  const { t } = useLanguage();

  const {address, chain, isMock, setKscBalance, setIsLoading, setError} = useWalletContext();
  // KSC 전송
}