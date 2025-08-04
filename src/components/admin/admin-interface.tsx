"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useLanguage } from "@/contexts/localization/LanguageContext";
import { formatDate, formatWeiToKsc } from "@/utils/formatters";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { CustomDropdown } from "../common/CustomDropdown";
import toast from "react-hot-toast";
import { useAssets } from "@/hooks/useAssets";
import { useWalletData } from "@/hooks/useWalletData";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { AddressDisplay } from "../common/AddressDisplay";

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
    adminLoading,
    setAdminLoading,
    adminError,
    setAdminError,
    adminHistory,
    fetchAdminHistory,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
  } = useAssets();

  const { address, kscBalance, chainName, isConnected, isLoading } =
    useWalletContext();

  const { connectAvalancheWallet, connectXrplEvmWallet } = useWalletConnect();

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
      if (result == "client-side-validation-fail") return;
      setMintForm({ to: "", amount: "" });
    } catch (err) {
      toast.error(t("admin.errors.mint"));
    } finally {
      setAdminLoading(null);
    }
  };

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!burnForm.amount) return;

    const result = await redeemKSC(burnForm.amount);
    setAdminLoading(null);
    if (result == "client-side-validation-fail") return;
    setBurnForm({ from: "", amount: "" });
  };

  const formatNumber = (value: string) => {
    return parseFloat(value).toLocaleString("ko-KR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  //탐색기 이동
  const getExplorerUrl = (hash: string, chain: "xrpl" | "avalanche") => {
    if (chain === "xrpl") {
      return `https://explorer.testnet.xrplevm.org/tx/${hash}`;
    } else {
      return `https://testnet.snowtrace.io/tx/${hash}`;
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 페이지당 항목 수 변경 핸들러
  const handleItemsPerPageChange = (selectedOption: any) => {
    setItemsPerPage(Number(selectedOption.value));
    setCurrentPage(1); // 항목 수 변경 시 첫 페이지로 리셋
  };

  useEffect(() => {
    const initialItemsPerPage = 5;
    setItemsPerPage(initialItemsPerPage);
  }, []);

  useEffect(() => {
    if (itemsPerPage > 0) {
      fetchAdminHistory();
    }
  }, [currentPage, itemsPerPage]);

  if (!isConnected) {
    return (
      <div className="md:max-w-2xl md:mx-auto md:p-6 max-w-7xl">
        <div className="card">
          <h2 className="text-2xl font-bold text-ksc-white mb-6 text-center">
            {t("wallet.connect")}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* XRPL 지갑 연결 */}
            <div className="flex flex-col justify-between gap-8 bg-ksc-box rounded-lg p-6 border border-ksc-mint/20 hover:shadow-md hover:shadow-ksc-mint/10 transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-ksc-mint rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-ksc-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ksc-white">
                    {t("wallet.connection.xrpl.title")}
                  </h3>
                  <p className="text-sm text-ksc-gray">
                    {t("wallet.connection.xrpl.subtitle")}
                  </p>
                </div>
              </div>

              <p className="text-ksc-gray">
                {t("wallet.connection.xrpl.description")}
              </p>

              <button
                onClick={connectXrplEvmWallet}
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading
                  ? t("common.loading")
                  : t("wallet.connection.xrpl.connect")}
              </button>
            </div>

            {/* Avalanche 지갑 연결 */}
            <div className="flex flex-col justify-between gap-8 bg-ksc-box rounded-lg p-6 border border-ksc-mint/20 hover:shadow-md hover:shadow-ksc-mint/10 transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-ksc-mint rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-ksc-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ksc-white">
                    {t("wallet.connection.avalanche.title")}
                  </h3>
                  <p className="text-sm text-ksc-gray">
                    {t("wallet.connection.avalanche.subtitle")}
                  </p>
                </div>
              </div>

              <p className="text-ksc-gray">
                {t("wallet.connection.avalanche.description")}
              </p>

              <button
                onClick={connectAvalancheWallet}
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading
                  ? t("common.loading")
                  : t("wallet.connection.avalanche.connect")}
              </button>
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-6 p-4 bg-error-100 border border-error-200 rounded-lg">
            <p className="text-error-600 text-center">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl md:max-w-5xl mx-auto sm:p-6">
      {/* 컨트랙트 정보 */}
      <div className="card p-6 mb-6">
        <div className="flex items-center mb-2">
          <h2 className="text-xl font-bold text-ksc-white">
            {t("admin.supplyInfo.title")} (
            {chainName === "xrpl" ? "XRPL" : "Avalanche"})
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
                {formatWeiToKsc(totalAssets || "-")} ₩
              </div>
              <div className="text-sm text-ksc-gray">
                {t("admin.supplyInfo.assets")}
              </div>
            </div>

            <div className="bg-ksc-mint/20 rounded-lg p-4 border border-ksc-mint/30">
              <div className="text-2xl font-bold text-ksc-mint">
                {formatWeiToKsc(kscBalanceTemp || "-")}
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
                  <span className="text-ksc-gray">
                    {formatWeiToKsc(maxRequestAmount)} (KSC)
                  </span>
                  <span className="text-ksc-mint">MAX</span>
                </div>
              </div>
              <input
                type="number"
                value={mintForm.amount}
                onChange={(e) => {
                  setMintForm((prev) => ({ ...prev, amount: e.target.value }));
                  setAdminError(null);
                }}
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
                  adminLoading === "mint" || !mintForm.amount || !!adminError
                }
                className="w-full btn-primary disabled:bg-ksc-gray disabled:cursor-not-allowed"
              >
                {adminLoading === "mint"
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
                  <span className="text-ksc-gray">
                    {formatWeiToKsc(kscBalanceTemp)} (KSC)
                  </span>
                  <span className="text-ksc-mint">MAX</span>
                </div>
              </div>
              <input
                type="number"
                value={burnForm.amount}
                onChange={(e) => {
                  setBurnForm((prev) => ({ ...prev, amount: e.target.value }));
                  setAdminError(null);
                }}
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
                  adminLoading === "redeem" || !burnForm.amount || !!adminError
                }
                className="w-full btn-primary disabled:bg-ksc-gray disabled:cursor-not-allowed"
              >
                {adminLoading === "burn"
                  ? t("admin.burn.processing")
                  : t("admin.burn.button")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {adminError && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-center">{adminError}</p>
        </div>
      )}

      <div className="space-y-4 mt-10">
        <div className="flex">
          <h2 className="text-xl font-semibold text-ksc-white px-2">
            {t("admin.history.title")}
          </h2>

          {/* 페이지네이션 컨트롤 */}
          <div className="flex justify-between items-center flex-grow">
            <div className="flex items-center">
              <CustomDropdown
                _onChange={handleItemsPerPageChange}
                _options={["5", "10", "20"]}
                _defaultOption={0}
                _width={60}
              />
              <span className="ml-2 text-ksc-gray-light text-sm ml-0">
                {t("pagination.itemsPerPage")}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 hover:text-ksc-mint disabled:invisible rounded-md"
              >
                <ChevronLeft />
              </button>
              <span className="text-ksc-white">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 hover:text-ksc-mint disabled:invisible rounded-md"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>

        {adminHistory.map((tx) => (
          <div
            key={tx.id}
            className={`rounded-lg p-4 ${
              tx.txStatus === "CANCELED" ? "bg-ksc-box/40" : "bg-ksc-box"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <div className={`flex items-center space-x-2 mb-1`}>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      tx.paymentType === "MINT" ? "bg-blue-600" : "bg-[#6B3B30]"
                    }`}
                  >
                    {tx.paymentType === "MINT"
                      ? t("admin.history.type.mint")
                      : t("admin.history.type.burn")}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      tx.txStatus === "CONFIRMED"
                        ? "bg-gray-400"
                        : tx.txStatus === "PENDING"
                        ? "bg-green-600"
                        : tx.txStatus === "FAILED"
                        ? "bg-red-500"
                        : tx.txStatus === "CANCELED"
                        ? "bg-gray-600"
                        : "bg-green-500"
                    }`}
                  >
                    {tx.txStatus === "CONFIRMED"
                      ? t("wallet.transactions.status.confirmed")
                      : tx.txStatus === "PENDING"
                      ? t("wallet.transactions.status.pending")
                      : tx.txStatus === "FAILED"
                      ? t("wallet.transactions.status.failed")
                      : tx.txStatus === "CANCELED"
                      ? t("wallet.transactions.status.canceled")
                      : t("wallet.transactions.status.approve")}
                  </span>
                  {/* <p
                    className={`px-1 text-sm text-ksc-gray-light ${
                      tx.txStatus === "CANCELED" ? "text-gray-500" : ""
                    }`}
                  >
                    {tx.memo}
                  </p> */}

                  <span className="flex-grow px-4 py-4 whitespace-nowrap text-sm flex justify-end gap-2">
                    <a
                      href={getExplorerUrl(tx.txHash || "", chainName!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-ksc-white hover:text-ksc-mint/80 flex justify-end ${
                        tx.txStatus === "CANCELED" ? "hidden" : ""
                      }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </span>
                </div>

                <div className="space-y-1">
                  {/* 트랜잭션 ID */}
                  <p
                    className={`flex items-start text-sm text-ksc-gray-light ${
                      tx.txStatus === "CANCELED" ? "text-gray-500" : ""
                    }`}
                  >
                    <span className="min-w-[100px] sm:min-w-[110px] mr-2">
                      {" "}
                      {t("admin.history.txHash")}
                    </span>
                    <span className="break-all">
                      {" "}
                      <AddressDisplay address={tx.txHash || ""} full={true} />
                    </span>
                  </p>
                  {/* 모바일용 */}
                  <p className="flex items-start sm:hidden text-sm text-ksc-gray-light">
                    <span className="min-w-[100px] mr-2">
                      {t("admin.history.txHash")}:
                    </span>
                    <span className="break-all">
                      <AddressDisplay address={tx.txHash || ""} />
                    </span>
                  </p>

                  {/* 발행량 (소각량) */}
                  <p className="flex items-start text-sm text-ksc-gray-light">
                    <span className="min-w-[100px] sm:min-w-[110px] mr-2">
                      {" "}
        
                      {tx.paymentType === "MINT"
                        ? t("admin.history.mintedAmount")
                        : t("admin.history.burnedAmount")}
                      
                    </span>
                    <span>{formatWeiToKsc(tx.amount)} KSC</span> 
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ksc-gray-light">
                    {tx.txStatus === "PENDING"
                      ? formatDate(tx.createdAt)
                      : tx.txStatus === "APPROVE"
                      ? formatDate(tx.scheduledAt)
                      : formatDate(tx.statusUpdatedAt || "")}
                  </p>
                </div>
              </div>
              {/* <div className="hidden lg:block text-right">
                    <p className="text-sm text-ksc-gray-light">
                      {tx.txStatus === "PENDING"
                        ? formatDate(tx.createdAt)
                        : formatDate(tx.statusUpdatedAt || "")}
                    </p>
                  </div> */}
            </div>
          </div>
        ))}
      </div>

      {/* 긴급 제어 */}
      <div className="card p-6 mt-10">
        <h3 className="text-lg font-semibold text-ksc-white mb-4">
          {t("admin.emergency.title")}
        </h3>

        <div className="flex space-x-4">
          <button
            onClick={emergencyPause}
            disabled={adminLoading === "pause"}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-ksc-box/50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {adminLoading === "pause"
              ? t("common.processing")
              : t("admin.emergency.pause")}
          </button>

          <button
            onClick={emergencyUnpause}
            disabled={adminLoading === "unpause"}
            className="bg-green-500 hover:bg-green-600 disabled:bg-ksc-box/50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {adminLoading === "unpause"
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
