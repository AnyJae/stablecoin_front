"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { PaymentInterface } from "@/components/payment/payment-interface";
import { useLanguage } from "@/contexts/localization/LanguageContext";

export default function PaymentPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-ksc-background text-ksc-white">
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center mb-4">
              {t("payment.title")}
            </h1>
            <p className="text-center text-ksc-gray">
              {t("payment.description")}
            </p>
          </div>

          <PaymentInterface />
        </div>
      </main>
    </div>
  );
}
