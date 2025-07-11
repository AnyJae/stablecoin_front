"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Activity,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Circle,
  Wifi,
  WifiOff,
  Shield,
} from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";

export function DashboardInterface() {
  const { t } = useLanguage();
  const { isConnected } = useWalletContext();
  const {
    isConnected: isRealtimeConnected,
    marketData,
    collateralData,
    transactionData,
    error: realtimeError,
  } = useRealtime();

  const [activeTab, setActiveTab] = useState("overview");
  const [currentTime, setCurrentTime] = useState<string>("");

  // 실시간 연결 상태 표시
  useEffect(() => {
    if (realtimeError) {
      toast.error(t("dashboard.errors.realtime"));
    }
  }, [realtimeError, t]);

  // 시간 업데이트 (클라이언트 사이드에서만)
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString("ko-KR"));
    };

    // 초기 시간 설정
    updateTime();

    // 1초마다 시간 업데이트
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1e12)
      return `${(num / 1e12).toFixed(1)}${t("dashboard.trillion")}`;
    if (num >= 1e8)
      return `${(num / 1e8).toFixed(1)}${t("dashboard.hundredMillion")}`;
    if (num >= 1e4)
      return `${(num / 1e4).toFixed(1)}${t("dashboard.tenThousand")}`;
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getStatusColor = (ratio: number, minRatio: number) => {
    if (ratio >= minRatio * 1.2) return "text-green-500";
    if (ratio >= minRatio) return "text-yellow-500";
    return "text-red-500";
  };

  const getStatusIcon = (ratio: number, minRatio: number) => {
    if (ratio >= minRatio * 1.2) return <TrendingUp className="w-4 h-4" />;
    if (ratio >= minRatio) return <Circle className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-ksc-white">
            {t("dashboard.title")}
          </h1>
          <p className="text-ksc-gray mt-1">{t("dashboard.overview")}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isRealtimeConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm text-ksc-gray-light">
              {isRealtimeConnected
                ? t("dashboard.status.connected")
                : t("dashboard.status.disconnected")}
            </span>
          </div>
          {isConnected && (
            <span className="px-2 py-1 text-xs font-medium text-ksc-mint border border-ksc-mint rounded">
              {t("dashboard.status.walletConnected")}
            </span>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 bg-ksc-box rounded-lg p-1">
        {[
          { id: "overview", label: t("dashboard.overview"), icon: Activity },
          { id: "market", label: t("dashboard.market"), icon: TrendingUp },
          { id: "collateral", label: t("dashboard.collateral"), icon: Shield },
          {
            id: "transactions",
            label: t("dashboard.transactions"),
            icon: Coins,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors group`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  activeTab === tab.id
                    ? "text-ksc-mint"
                    : "text-ksc-gray-light group-hover:text-ksc-mint"
                }`}
              />
              <span
                className={`transition-colors ${
                  activeTab === tab.id
                    ? "text-ksc-mint"
                    : "text-ksc-gray-light group-hover:text-ksc-mint"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 개요 탭 */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KSC 가격 */}
            <div className="bg-ksc-box border border-ksc-box rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-ksc-gray-light">
                  {t("dashboard.stats.kscPrice")}
                </h3>
                <DollarSign className="h-4 w-4 text-ksc-mint" />
              </div>
              <div className="text-2xl font-bold text-ksc-white">
                ₩{marketData?.kscPrice?.toFixed(2) || "1.00"}
              </div>
              <p className="text-xs text-ksc-gray-light mt-1">
                {marketData?.change24h ? (
                  <span
                    className={
                      marketData.change24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {marketData.change24h >= 0 ? "+" : ""}
                    {marketData.change24h.toFixed(2)}%
                  </span>
                ) : (
                  t("dashboard.stats.noChange")
                )}
              </p>
            </div>

            {/* 총 공급량 */}
            <div className="bg-ksc-box border border-ksc-box rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-ksc-gray-light">
                  {t("dashboard.stats.totalSupply")}
                </h3>
                <Coins className="h-4 w-4 text-ksc-mint" />
              </div>
              <div className="text-2xl font-bold text-ksc-white">
                {formatNumber(marketData?.kscSupply || 0)}
              </div>
              <p className="text-xs text-ksc-gray-light mt-1">KSC</p>
            </div>

            {/* 시가총액 */}
            <div className="bg-ksc-box border border-ksc-box rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-ksc-gray-light">
                  {t("dashboard.stats.marketCap")}
                </h3>
                <TrendingUp className="h-4 w-4 text-ksc-mint" />
              </div>
              <div className="text-2xl font-bold text-ksc-white">
                {formatCurrency(marketData?.marketCap || 0)}
              </div>
              <p className="text-xs text-ksc-gray-light mt-1">KRW</p>
            </div>

            {/* 24시간 거래량 */}
            <div className="bg-ksc-box border border-ksc-box rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-ksc-gray-light">
                  {t("dashboard.stats.volume24h")}
                </h3>
                <Activity className="h-4 w-4 text-ksc-mint" />
              </div>
              <div className="text-2xl font-bold text-ksc-white">
                {formatCurrency(marketData?.volume24h || 0)}
              </div>
              <p className="text-xs text-ksc-gray-light mt-1">KRW</p>
            </div>
          </div>

          {/* 추가 정보 섹션 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-ksc-box border border-ksc-box rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">{t("dashboard.systemStatus.title")}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-ksc-gray-light">{t("dashboard.systemStatus.blockchain")}</span>
                  <span className="text-green-500 font-medium">{t("dashboard.systemStatus.normal")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ksc-gray-light">{t("dashboard.systemStatus.apiServer")}</span>
                  <span className="text-green-500 font-medium">{t("dashboard.systemStatus.normal")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ksc-gray-light">{t("dashboard.systemStatus.database")}</span>
                  <span className="text-yellow-500 font-medium">{t("dashboard.systemStatus.mockMode")}</span>
                </div>
              </div>
            </div>

            <div className="bg-ksc-box border border-ksc-box rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">{t("dashboard.recentActivity.title")}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-ksc-gray-light">{t("dashboard.recentActivity.lastUpdate")}</span>
                  <span className="text-ksc-white font-medium">
                    {currentTime || t("common.loading")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ksc-gray-light">{t("dashboard.recentActivity.realtimeConnection")}</span>
                  <span
                    className={
                      isRealtimeConnected ? "text-green-500" : "text-red-500"
                    }
                    font-medium
                  >
                    {isRealtimeConnected ? t("dashboard.recentActivity.active") : t("dashboard.recentActivity.inactive")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ksc-gray-light">{t("dashboard.recentActivity.walletStatus")}</span>
                  <span
                    className={isConnected ? "text-green-500" : "text-gray-500"}
                    font-medium
                  >
                    {isConnected ? t("dashboard.recentActivity.connected") : t("dashboard.recentActivity.disconnected")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 다른 탭들도 기본 구조로 표시 */}
      {activeTab !== "overview" && (
        <div className="bg-ksc-box border border-ksc-box rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">
            {t(`dashboard.tabs.${activeTab}`)}
          </h3>
          <p className="text-ksc-gray-light">{t("dashboard.underDevelopment")}</p>
        </div>
      )}
    </div>
  );
}
