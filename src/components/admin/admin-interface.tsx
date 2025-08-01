"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useLanguage } from "@/contexts/localization/LanguageContext";
import { formatWeiToKsc } from "@/utils/formatters";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { CustomDropdown } from "../common/CustomDropdown";
import toast from "react-hot-toast";
import { useAssets } from "@/hooks/useAssets";
import { useWalletData } from "@/hooks/useWalletData";

export function AdminInterface() {
  const { t, language } = useLanguage();

  const [network, setNetwork] = useState("XRPL");

  const {
    supplyInfo,
    mintKSC,
    burnKSC,
    emergencyPause,
    emergencyUnpause,
    error,
  } = useAdmin(network);

  const {
    totalAssets,
    kscBalanceTemp,
    krwBalance,
    maxRequestAmount,
    requestKSC,
    redeemKSC,
    isLoading,
  } = useAssets();

  const { address, kscBalance, chainName } = useWalletContext();

  const {fetchKscBalance} = useWalletData();

  const [mintForm, setMintForm] = useState({
    to: address,
    amount: "",
  });

  const [burnForm, setBurnForm] = useState({
    from: address,
    amount: "",
  });

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintForm.amount) return;

    try {
      const result = await requestKSC(mintForm.amount);
      setMintForm({ to: "", amount: "" });
    } catch (err) {
      toast.error(t("admin.errors.mint"));
    }
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
    <div className="max-w-7xl md:max-w-5xl mx-auto sm:p-6">
      {/* 컨트랙트 정보 */}
      <div className="card p-6 mb-6">
        <div className="flex items-center mb-2">
          <h2 className="text-xl font-bold text-ksc-white">
            {t("admin.supplyInfo.title")}  ({chainName === "xrpl" ? "XRPL" : "Avalanche"})
          </h2>

          {/* <CustomDropdown
            _onChange={(selectedOption) => {
              setNetwork(selectedOption.value);
            }}
            _options={["XRPL", "AVAX", "Mock XRPL", "Mock AVAX"]}
            _defaultOption={0}
            _width={120}
            _border="none"
          /> */}
        </div>

        {supplyInfo ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-ksc-mint/20 rounded-lg p-4 border border-ksc-mint/30">
              <div className="text-2xl font-bold text-ksc-mint">
                {formatWeiToKsc(totalAssets || "-")}
              </div>
              <div className="text-sm text-ksc-gray">
                {t("admin.supplyInfo.assets")}
              </div>
            </div>

            <div className="bg-ksc-mint/20 rounded-lg p-4 border border-ksc-mint/30">
              <div className="text-2xl font-bold text-ksc-mint">
                {kscBalanceTemp || "-"}
              </div>
              <div className="text-sm text-ksc-gray">
                {t("admin.supplyInfo.kscBalance")}
              </div>
            </div>

            <div className="bg-ksc-mint/20 rounded-lg p-4 border border-ksc-mint/30">
              <div className="text-2xl font-bold text-ksc-mint">
                {formatWeiToKsc(krwBalance || "-")}
              </div>
              <div className="text-sm text-ksc-gray">
                {t("admin.supplyInfo.krwBalance")}
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
              <div className="flex justify-between">
                <label className="block text-sm font-medium text-ksc-gray mb-2">
                  {t("admin.mint.amount")}
                </label>
                <div className="text-sm flex gap-2">
                  <span className="text-ksc-gray">{formatWeiToKsc(maxRequestAmount)} (KSC)</span>
                  <span className="text-ksc-mint">MAX</span>
                </div>
              </div>
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
                disabled={isLoading === "mint" || !mintForm.amount}
                className="w-full btn-primary disabled:bg-ksc-gray disabled:cursor-not-allowed"
              >
                {isLoading === "mint"
                  ? t("admin.mint.processing")
                  : t("admin.mint.button")}
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
              <div className="flex justify-between">
                <label className="block text-sm font-medium text-ksc-gray mb-2">
                  {t("admin.burn.amount")}
                </label>
                <div className="text-sm flex gap-2">
                  <span className="text-ksc-gray">{kscBalanceTemp} (KSC)</span>
                  <span className="text-ksc-mint">MAX</span>
                </div>
              </div>
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
                disabled={
                  isLoading === "burn" || !burnForm.from || !burnForm.amount
                }
                className="w-full btn-primary disabled:bg-ksc-gray disabled:cursor-not-allowed"
              >
                {isLoading === "burn"
                  ? t("admin.burn.processing")
                  : t("admin.burn.button")}
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
            disabled={isLoading === "pause"}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-ksc-box/50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading === "pause"
              ? t("common.processing")
              : t("admin.emergency.pause")}
          </button>

          <button
            onClick={emergencyUnpause}
            disabled={isLoading === "unpause"}
            className="bg-green-500 hover:bg-green-600 disabled:bg-ksc-box/50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading === "unpause"
              ? t("common.processing")
              : t("admin.emergency.unpause")}
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
