"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useLanguage } from "@/contexts/localization/LanguageContext";
import { formatWeiToKsc } from "@/utils/formatters";

export function AdminInterface() {
  const { t } = useLanguage();
  const {
    supplyInfo,
    mintKSC,
    burnKSC,
    emergencyPause,
    emergencyUnpause,
    isLoading,
    error,
  } = useAdmin();

  const [mintForm, setMintForm] = useState({
    to: "",
    amount: "",
  });

  const [burnForm, setBurnForm] = useState({
    from: "",
    amount: "",
  });

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintForm.to || !mintForm.amount) return;

    await mintKSC(mintForm.to, mintForm.amount);
    setMintForm({ to: "", amount: "" });
  };

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!burnForm.from || !burnForm.amount) return;

    await burnKSC(burnForm.from, burnForm.amount);
    setBurnForm({ from: "", amount: "" });
  };

  const formatNumber = (value: string) => {
    return parseFloat(value).toLocaleString("ko-KR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 컨트랙트 정보 */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold text-ksc-white mb-4">
          {t("admin.supplyInfo.title")}
        </h2>

        {supplyInfo ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-ksc-mint/20 rounded-lg p-4 border border-ksc-mint/30">
              <div className="text-2xl font-bold text-ksc-mint">
                {formatWeiToKsc(supplyInfo.maxSupply)}
              </div>
              <div className="text-sm text-ksc-gray">
                {t("admin.supplyInfo.maxSupply")}
              </div>
            </div>

            <div className="bg-ksc-mint/20 rounded-lg p-4 border border-ksc-mint/30">
              <div className="text-2xl font-bold text-ksc-mint">
                {formatWeiToKsc(supplyInfo.totalSupply)}
              </div>
              <div className="text-sm text-ksc-gray">
                {t("admin.supplyInfo.currentSupply")}
              </div>
            </div>

            <div className="bg-ksc-mint/20 rounded-lg p-4 border border-ksc-mint/30">
              <div className="text-2xl font-bold text-ksc-mint">
                {formatWeiToKsc(supplyInfo.totalBurned)}
              </div>
              <div className="text-sm text-ksc-gray">
                {t("admin.supplyInfo.totalBurned")}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-ksc-gray">{t("admin.supplyInfo.loading")}</p>
        )}
      </div>

      {/* 관리자 기능 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 발행 기능 */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-ksc-white mb-4">
            {t("admin.mint.title")}
          </h3>

          <form onSubmit={handleMint} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ksc-gray mb-2">
                {t("admin.mint.recipient")}
              </label>
              <input
                type="text"
                value={mintForm.to}
                onChange={(e) =>
                  setMintForm((prev) => ({ ...prev, to: e.target.value }))
                }
                placeholder="0x..."
                className="w-full px-3 py-2 bg-ksc-box border border-ksc-border rounded-lg text-ksc-white placeholder-ksc-gray focus:ring-2 focus:ring-ksc-mint focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ksc-gray mb-2">
                {t("admin.mint.amount")}
              </label>
              <input
                type="number"
                value={mintForm.amount}
                onChange={(e) =>
                  setMintForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 bg-ksc-box border border-ksc-border rounded-lg text-ksc-white placeholder-ksc-gray focus:ring-2 focus:ring-ksc-mint focus:border-transparent"
                required
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading || !mintForm.to || !mintForm.amount}
                className="bg-ksc-mint hover:text-ksc-mint disabled:bg-ksc-box/50 text-ksc-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {isLoading ? t("admin.mint.processing") : t("admin.mint.button")}
              </button>
            </div>
          </form>
        </div>

        {/* 소각 기능 */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-ksc-white mb-4">
            {t("admin.burn.title")}
          </h3>

          <form onSubmit={handleBurn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ksc-gray mb-2">
                {t("admin.burn.address")}
              </label>
              <input
                type="text"
                value={burnForm.from}
                onChange={(e) =>
                  setBurnForm((prev) => ({ ...prev, from: e.target.value }))
                }
                placeholder="0x..."
                className="w-full px-3 py-2 bg-ksc-box border border-ksc-border rounded-lg text-ksc-white placeholder-ksc-gray focus:ring-2 focus:ring-ksc-mint focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ksc-gray mb-2">
                {t("admin.burn.amount")}
              </label>
              <input
                type="number"
                value={burnForm.amount}
                onChange={(e) =>
                  setBurnForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 bg-ksc-box border border-ksc-border rounded-lg text-ksc-white placeholder-ksc-gray focus:ring-2 focus:ring-ksc-mint focus:border-transparent"
                required
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading || !burnForm.from || !burnForm.amount}
                className="bg-red-500 hover:text-ksc-mint disabled:bg-ksc-box/50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {isLoading ? t("admin.burn.processing") : t("admin.burn.button")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 긴급 제어 */}
      <div className="card p-6 mt-6">
        <h3 className="text-lg font-semibold text-ksc-white mb-4">
          {t("admin.emergency.title")}
        </h3>

        <div className="flex space-x-4">
          <button
            onClick={emergencyPause}
            disabled={isLoading}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-ksc-box/50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? t("common.processing") : t("admin.emergency.pause")}
          </button>

          <button
            onClick={emergencyUnpause}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-ksc-box/50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? t("common.processing") : t("admin.emergency.unpause")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
