"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Shield,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/contexts/localization/LanguageContext";

export function CollateralDashboard() {
  const { t } = useLanguage();
  const [collateralData, setCollateralData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "assets" | "alerts" | "analytics"
  >("overview");
  const [isClient, setIsClient] = useState(false);

  // Mock 차트 데이터 생성
  const generateChartData = () => {
    const now = Date.now();
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        }),
        collateralRatio: 150 + Math.random() * 10 - 5, // 145-155% 범위
        kscSupply: 100 + Math.random() * 5 - 2.5, // 97.5-102.5억원 범위
        totalValue: 150 + Math.random() * 10 - 5, // 145-155억원 범위
      });
    }
    return data;
  };

  // 파이 차트 데이터
  const pieChartData = [
    { name: "USDT", value: 50, color: "#26a69a" },
    { name: "USDC", value: 30, color: "#2196f3" },
    { name: "KRW", value: 20, color: "#4caf50" },
  ];

  // 클라이언트 사이드 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadCollateralData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData = {
        totalValue: 150000000000,
        kscSupply: 100000000000,
        collateralRatio: 15000,
        minCollateralRatio: 11000,
        isHealthy: true,
        chartData: generateChartData(),
        pieChartData: pieChartData,
        assets: [
          {
            symbol: "USDT",
            name: "Tether USD",
            amount: "50000000",
            valueInKRW: 75000000000,
            priceInKRW: 1500,
            ratio: 50,
            lastUpdateTime: Date.now(),
          },
          {
            symbol: "USDC",
            name: "USD Coin",
            amount: "30000000",
            valueInKRW: 45000000000,
            priceInKRW: 1500,
            ratio: 30,
            lastUpdateTime: Date.now(),
          },
          {
            symbol: "KRW",
            name: "Korean Won",
            amount: "30000000000",
            valueInKRW: 30000000000,
            priceInKRW: 1,
            ratio: 20,
            lastUpdateTime: Date.now(),
          },
        ],
        alerts: [
          {
            type: "info",
            message: t("collateral.alerts.stable"),
            timestamp: Date.now(),
          },
        ],
      };

      setCollateralData(mockData);
      setIsLoading(false);
    };

    loadCollateralData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatRatio = (ratio: number) => {
    return (ratio / 100).toFixed(2) + "%";
  };

  const formatTimestamp = (timestamp: number) => {
    if (!isClient) return t("common.loading");
    return new Date(timestamp).toLocaleString("ko-KR");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-ksc-gray-dark border border-ksc-gray p-3 rounded-lg">
          <p className="text-sm text-ksc-gray-light">{`날짜: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${
                entry.name === "collateralRatio" ? "%" : "억원"
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ksc-blue"></div>
      </div>
    );
  }

  if (!collateralData) {
    return (
      <div className="text-center text-ksc-gray-light">
        {t("collateral.errors.loadFailed")}
      </div>
    );
  }

  const tabList = [
    { id: "overview", label: t("collateral.tabs.overview"), icon: BarChart3 },
    { id: "assets", label: t("collateral.tabs.assets"), icon: DollarSign },
    { id: "alerts", label: t("collateral.tabs.alerts"), icon: AlertTriangle },
    {
      id: "analytics",
      label: t("collateral.tabs.analytics"),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 bg-ksc-gray-dark rounded-lg p-1">
        {tabList.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors group`}
            >
              <Icon
                size={20}
                className={`transition-colors ${
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

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-ksc-gray-dark rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ksc-gray-light text-sm">{t("collateral.overview.totalValue")}</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(collateralData.totalValue)}
                  </p>
                </div>
                <Shield className="text-ksc-blue" size={24} />
              </div>
            </div>

            <div className="bg-ksc-gray-dark rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ksc-gray-light text-sm">{t("collateral.overview.kscSupply")}</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(collateralData.kscSupply)}
                  </p>
                </div>
                <DollarSign className="text-green-500" size={24} />
              </div>
            </div>

            <div className="bg-ksc-gray-dark rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ksc-gray-light text-sm">{t("collateral.overview.collateralRatio")}</p>
                  <p className="text-2xl font-bold">
                    {formatRatio(collateralData.collateralRatio)}
                  </p>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </div>
            </div>

            <div className="bg-ksc-gray-dark rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ksc-gray-light text-sm">{t("collateral.overview.status")}</p>
                  <p
                    className={`text-2xl font-bold ${
                      collateralData.isHealthy
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {collateralData.isHealthy ? t("collateral.overview.stable") : t("collateral.overview.risk")}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-full ${
                    collateralData.isHealthy ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  <Shield size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-ksc-gray-dark rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">
              {t("collateral.overview.collateralRatioTrend")}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={collateralData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="collateralRatio"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name={t("collateral.overview.collateralRatio")}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "assets" && (
        <div className="bg-ksc-gray-dark rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6">{t("collateral.assets.title")}</h3>
          <div className="space-y-4">
            {collateralData.assets.map((asset: any, index: number) => (
              <div key={index} className="bg-ksc-gray rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-semibold">
                      {asset.name} ({asset.symbol})
                    </h4>
                    <p className="text-sm text-ksc-gray-light">
                      {new Intl.NumberFormat("ko-KR").format(
                        parseFloat(asset.amount)
                      )}{" "}
                      {asset.symbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(asset.valueInKRW)}
                    </p>
                    <p className="text-sm text-ksc-gray-light">
                      {asset.ratio}%
                    </p>
                  </div>
                </div>

                <div className="w-full bg-ksc-gray-light rounded-full h-2">
                  <div
                    className="bg-ksc-blue h-2 rounded-full"
                    style={{ width: `${asset.ratio}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="bg-ksc-gray-dark rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6">{t("collateral.alerts.title")}</h3>
          <div className="space-y-4">
            {[
              {
                id: 1,
                type: "warning",
                title: t("collateral.alerts.collateralRatioDrop"),
                message:
                  t("collateral.alerts.collateralRatioDropMessage"),
                severity: "medium",
                timestamp: Date.now() - 3600000,
                isRead: false,
              },
              {
                id: 2,
                type: "info",
                title: t("collateral.alerts.assetPriceUpdate"),
                message: t("collateral.alerts.assetPriceUpdateMessage"),
                severity: "low",
                timestamp: Date.now() - 7200000,
                isRead: true,
              },
            ].map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === "warning"
                    ? "border-yellow-500 bg-yellow-500/10"
                    : alert.type === "info"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-green-500 bg-green-500/10"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-sm text-ksc-gray-light mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-ksc-gray-light mt-2">
                      {formatTimestamp(alert.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.severity === "high"
                          ? "bg-red-600"
                          : alert.severity === "medium"
                          ? "bg-yellow-600"
                          : "bg-green-600"
                      }`}
                    >
                      {t(`collateral.alerts.severity.${alert.severity}`)}
                    </span>
                    {!alert.isRead && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-ksc-gray-dark rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">{t("collateral.analytics.collateralRatioTrend")}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={collateralData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="collateralRatio"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                      name={t("collateral.overview.collateralRatio")}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-ksc-gray-dark rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">{t("collateral.analytics.assetDistribution")}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={collateralData.pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name }) => name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {collateralData.pieChartData.map(
                        (entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value}%`, t("collateral.analytics.ratio")]}
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F9FAFB",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-ksc-gray-dark rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">
              {t("collateral.analytics.supplyAndValueTrend")}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={collateralData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `${value}억원`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="kscSupply"
                    stroke="#10B981"
                    strokeWidth={2}
                    name={t("collateral.overview.kscSupply")}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalValue"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name={t("collateral.overview.totalValue")}
                    dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  
    )
}
