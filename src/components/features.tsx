"use client";

import {
  Wallet,
  Send,
  Shield,
  BarChart3,
  Zap,
  Globe,
  Lock,
  Users,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/localization/LanguageContext";

export function Features() {
  const { t, tArray } = useLanguage();

  const features = [
    {
      icon: Wallet,
      title: t("home.features.items.secure.title"),
      description: t("home.features.items.secure.description"),
      color: "ksc-mint",
    },
    {
      icon: Send,
      title: t("home.features.items.realtime.title"),
      description: t("home.features.items.realtime.description"),
      color: "ksc-mint",
    },
    {
      icon: Shield,
      title: t("home.features.items.secure.title"),
      description: t("home.features.items.secure.description"),
      color: "ksc-mint",
    },
    {
      icon: BarChart3,
      title: t("home.features.items.monitoring.title"),
      description: t("home.features.items.monitoring.description"),
      color: "ksc-mint",
    },
    {
      icon: Zap,
      title: t("home.features.items.crosschain.title"),
      description: t("home.features.items.crosschain.description"),
      color: "ksc-mint",
    },
    {
      icon: Globe,
      title: t("home.features.items.crosschain.title"),
      description: t("home.features.items.crosschain.description"),
      color: "ksc-mint",
    },
  ];

  const benefits = tArray("home.about.benefits");

  const getColorClasses = (color: string) => {
    switch (color) {
      case "ksc-mint":
        return "bg-ksc-mint/20 text-ksc-mint";
      default:
        return "bg-ksc-mint/20 text-ksc-mint";
    }
  };

  return (
    <section className="py-20 bg-ksc-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-ksc-white mb-4">
            {t("home.features.title")}
          </h2>
          <p className="text-xl text-ksc-gray max-w-3xl mx-auto">
            {t("home.features.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="card-hover group">
              <div
                className={`w-12 h-12 ${getColorClasses(
                  feature.color
                )} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-ksc-white mb-3">
                {feature.title}
              </h3>
              <p className="text-ksc-gray leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-ksc-white mb-6">
              {t("home.about.title")}
            </h3>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-ksc-mint mt-0.5 flex-shrink-0" />
                  <span className="text-ksc-gray">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-ksc-mint mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-ksc-white mb-2">
                {t("home.about.title")}
              </h4>
              <p className="text-ksc-gray mb-6">
                {t("home.about.description")}
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-ksc-mint">2</div>
                  <div className="text-sm text-ksc-gray">
                    {t("home.stats.networks")}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-ksc-mint">100%</div>
                  <div className="text-sm text-ksc-gray">
                    {t("home.stats.krwPeg")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {/* <div className="text-center mt-16">
          <div className="card bg-gradient-to-r from-ksc-mint to-ksc-mint/80 text-ksc-white">
            <h3 className="text-2xl font-bold mb-4">{t("home.hero.cta")}</h3>
            <p className="text-ksc-white/90 mb-6">{t("home.hero.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-ksc-white text-ksc-background hover:bg-ksc-gray font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                {t("home.hero.cta")}
              </button>
              <button className="border border-ksc-white text-ksc-white hover:bg-ksc-white hover:text-ksc-background font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                {t("home.hero.learnMore")}
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}
