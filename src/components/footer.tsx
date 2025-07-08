"use client";

import Link from "next/link";
import { Coins, Github, Twitter, Mail, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/localization/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const [currentYear, setCurrentYear] = useState<number>(2024);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const footerLinks = {
    product: [
      { name: t("footer.product.wallet"), href: "/wallet" },
      { name: t("footer.product.admin"), href: "/admin" },
      { name: t("footer.product.docs"), href: "/docs" },
      { name: t("footer.product.api"), href: "/api" },
    ],
    resources: [
      { name: t("footer.resources.developerDocs"), href: "/docs/developer" },
      { name: t("footer.resources.apiRef"), href: "/docs/api" },
      {
        name: t("footer.resources.github"),
        href: "https://github.com",
        external: true,
      },
      { name: t("footer.resources.community"), href: "/community" },
    ],
    company: [
      { name: t("footer.company.about"), href: "/about" },
      { name: t("footer.company.blog"), href: "/blog" },
      { name: t("footer.company.careers"), href: "/careers" },
      { name: t("footer.company.contact"), href: "/contact" },
    ],
    legal: [
      { name: t("footer.legal.privacy"), href: "/privacy" },
      { name: t("footer.legal.terms"), href: "/terms" },
      { name: t("footer.legal.cookies"), href: "/cookies" },
      { name: t("footer.legal.license"), href: "/license" },
    ],
  };

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
    { name: "Email", icon: Mail, href: "mailto:contact@ksc.com" },
  ];

  return (
    <footer className="bg-ksc-box text-ksc-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-ksc-mint rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-ksc-black" />
              </div>
              <span className="text-xl font-bold">KSC</span>
            </Link>
            <p className="text-ksc-gray mb-6 max-w-md">
              {t("footer.description")}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ksc-gray hover:text-ksc-mint transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-ksc-gray uppercase tracking-wider mb-4">
              {t("footer.sections.product")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-ksc-gray hover:text-ksc-mint transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-ksc-gray uppercase tracking-wider mb-4">
              {t("footer.sections.resources")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-ksc-gray hover:text-ksc-mint transition-colors flex items-center space-x-1"
                  >
                    <span>{link.name}</span>
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-ksc-gray uppercase tracking-wider mb-4">
              {t("footer.sections.company")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-ksc-gray hover:text-ksc-mint transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-ksc-box/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-ksc-gray text-sm">
              © {currentYear} KSC Stablecoin. {t("footer.copyright")}
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-ksc-gray hover:text-ksc-mint text-sm transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t border-ksc-box/50">
          <div className="text-center text-ksc-gray text-xs">
            <p className="mb-2">{t("footer.disclaimer.demo")}</p>
            <p>{t("footer.disclaimer.warning")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
