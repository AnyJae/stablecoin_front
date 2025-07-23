"use client";

import Link from "next/link";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/localization/LanguageContext";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-ksc-background py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl md:text-6xl font-bold text-ksc-white mb-6">
              {t("home.hero.title.ksc")}{" "}
              <span className="text-gradient">
                {t("home.hero.title.stablecoin")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-m md:text-lg text-ksc-gray mb-8 max-w-3xl mx-auto">
              {t("home.hero.subtitle")}
              <br />
              {t("home.hero.description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/wallet"
                className="btn-primary text-lg px-8 py-3 flex items-center space-x-2"
              >
                <span>{t("home.hero.cta")}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/docs" className="btn-secondary text-lg px-8 py-3">
                {t("home.hero.learnMore")}
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-ksc-mint/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-ksc-mint" />
              </div>
              <h3 className="text-lg font-semibold text-ksc-white mb-2">
                {t("home.features.items.secure.title")}
              </h3>
              <p className="text-ksc-gray">
                {t("home.features.items.secure.description")}
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-ksc-mint/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-ksc-mint" />
              </div>
              <h3 className="text-lg font-semibold text-ksc-white mb-2">
                {t("home.features.items.realtime.title")}
              </h3>
              <p className="text-ksc-gray">
                {t("home.features.items.realtime.description")}
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-ksc-mint/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-ksc-mint" />
              </div>
              <h3 className="text-lg font-semibold text-ksc-white mb-2">
                {t("home.features.items.crosschain.title")}
              </h3>
              <p className="text-ksc-gray">
                {t("home.features.items.crosschain.description")}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-ksc-mint mb-2">₩1</div>
              <div className="text-sm text-ksc-gray">
                {t("home.stats.kscValue")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ksc-mint mb-2">100%</div>
              <div className="text-sm text-ksc-gray">
                {t("home.stats.krwPeg")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ksc-mint mb-2">2</div>
              <div className="text-sm text-ksc-gray">
                {t("home.stats.networks")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ksc-mint mb-2">24/7</div>
              <div className="text-sm text-ksc-gray">
                {t("home.stats.trading")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-ksc-mint/20 rounded-full opacity-20 animate-float"></div>
      <div
        className="absolute top-40 right-20 w-16 h-16 bg-ksc-mint/20 rounded-full opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-20 left-20 w-12 h-12 bg-ksc-mint/20 rounded-full opacity-20 animate-float"
        style={{ animationDelay: "4s" }}
      ></div>
    </section>
  );
}
