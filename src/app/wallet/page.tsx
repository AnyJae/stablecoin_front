"use client";

import WalletInterface from "@/components/wallet/wallet-interface";
import { useLanguage } from "@/contexts/localization/LanguageContext";

export default function WalletPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-ksc-white mb-4">
              <span className="text-ksc-white">{t("wallet.title")}</span>
            </h1>
            <p className="text-lg text-ksc-gray">{t("wallet.description")}</p>
          </div>
          <WalletInterface />
        </div>
      </main>
    </div>
  );
}

