"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DocsInterface } from "@/components/docs/docs-interface";
import { useLanguage } from "@/contexts/localization/LanguageContext";

export default function DocsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-ksc-white mb-4">
              KSC {t("docs.title")}
            </h1>
            <p className="text-lg text-ksc-gray">{t("docs.description")}</p>
          </div>
          <DocsInterface />
        </div>
      </main>
    </div>
  );
}
