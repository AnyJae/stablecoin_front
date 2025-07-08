"use client";

import { Header } from "@/components/header";
import { CollateralDashboard } from "@/components/collateral/collateral-dashboard";
import { useLanguage } from "@/contexts/localization/LanguageContext";

export default function CollateralPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-ksc-background text-ksc-white">
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center mb-4">
              {t("collateral.title")}
            </h1>
            <p className="text-center text-ksc-gray">
              {t("collateral.description")}
            </p>
          </div>

          <CollateralDashboard />
        </div>
      </main>
    </div>
  );
}
