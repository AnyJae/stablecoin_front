"use client";

import { useEffect, useState } from "react";

import { useLanguage } from "@/contexts/localization/LanguageContext";
import {
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Zap,
  CircleX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useWalletData } from "@/hooks/useWalletData";
import { useSendTokens } from "@/hooks/useSendTokens";
import { formatAddress, formatWeiToKsc, formatDate } from "@/utils/formatters";
import { CustomDropdown } from "../common/CustomDropdown";
import { AddressDisplay } from "../common/AddressDisplay";
import { Network } from "ethers";

export default function WalletInterface() {
  const { t } = useLanguage();
  const {
    address,
    balance,
    kscBalance,
    chainName,
    isConnected,
    isLoading,
    error,
    isMock,
    connectMockWallet,
    sendMockKsc,
  } = useWalletContext();

  const { connectAvalancheWallet, connectXrplEvmWallet, disconnectWallet } =
    useWalletConnect();

  const {
    fetchBalance,
    fetchKscBalance,
    fetchTransactions,
    fetchTxCount,
    txCount,
    txHistory,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalTransactions,
    totalPages,
  } = useWalletData();

  const { sendInstant, sendInstantForTest, sendError, setSendError } =
    useSendTokens();

  const [sendForm, setSendForm] = useState({
    to: "",
    amount: "",
    memo: "",
    chain: "xrpl" as "xrpl" | "avalanche",
  });

  const [activeTab, setActiveTab] = useState<
    "overview" | "send" | "transactions"
  >("overview");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [paymentType, setPaymentType] = useState<
    "instant" | "batch" | "scheduled"
  >("instant");

  const [sendLoading, setSendLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendForm.to || !sendForm.amount) return;
    setSendLoading(true);

    let result;

    if (isMock) {
      result = await sendMockKsc(sendForm.to, sendForm.amount);
    } else {
      result = await sendInstant(
        sendForm.chain,
        sendForm.to,
        sendForm.amount,
        chainName
      );
    }

    if (result == "client-side-validation-fail") {
      setSendLoading(false);
      return;
    }
    setSendForm({ to: "", amount: "", memo: "", chain: "xrpl" });
    setSendLoading(false);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address || "");
      setCopiedAddress(true);
      toast.success(t("messages.addressCopied"));
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      toast.error(t("errors.walletConnection"));
    }
  };

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

  // 필터링된 거래 내역 - 취소한 거래 내역 제거
  const filteredTxHistory = txHistory.filter(
    (tx) => tx.txStatus !== "CANCELED"
  ); //"CANCELED" 상태 제외

  useEffect(() => {
    const initialItemsPerPage = 5;
    setItemsPerPage(initialItemsPerPage);
    fetchTransactions(initialItemsPerPage);
  }, []);

  useEffect(() => {
    if (itemsPerPage > 0) {
      fetchTransactions();
    }
  }, [itemsPerPage]);

  if (!isConnected && !isMock) {
    return (
      <div className="md:max-w-4xl md:mx-auto md:p-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="card">
          <h2 className="text-2xl font-bold text-ksc-white mb-6 text-center">
            {t("wallet.connect")}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* XRPL 지갑 연결 */}
            <div className="flex flex-col gap-8 md:gap-0 justify-between bg-ksc-box rounded-lg p-6 border border-ksc-mint/20 hover:shadow-md hover:shadow-ksc-mint/10 transition-shadow">
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
            <div className="flex flex-col gap-8 md:gap-0 justify-between bg-ksc-box rounded-lg p-6 border border-ksc-mint/20 hover:shadow-md hover:shadow-ksc-mint/10 transition-shadow">
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

            {/* Mock Wallet 연결 */}
            <div className="flex flex-col justify-between bg-ksc-box rounded-lg p-6 border border-ksc-mint/20 hover:shadow-md hover:shadow-ksc-mint/10 transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-ksc-mint rounded-lg flex items-center justify-center mr-4">
                  <Zap className="w-6 h-6 text-ksc-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ksc-white">
                    {t("wallet.connection.mock.title")}
                  </h3>
                  <p className="text-sm text-ksc-gray">
                    {t("wallet.connection.mock.subtitle")}
                  </p>
                </div>
              </div>

              <p className="text-ksc-gray mb-4">
                {t("wallet.connection.mock.description")}
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => connectMockWallet("xrpl")}
                  disabled={isLoading}
                  className="w-full btn-secondary text-sm text-sm hover:text-ksc-mint/80"
                >
                  {isLoading
                    ? t("common.loading")
                    : t("wallet.connection.mock.xrplMock")}
                </button>
                <button
                  onClick={() => connectMockWallet("avalanche")}
                  disabled={isLoading}
                  className="w-full btn-secondary text-sm hover:text-ksc-mint/80"
                >
                  {isLoading
                    ? t("common.loading")
                    : t("wallet.connection.mock.avalancheMock")}
                </button>
              </div>
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
    <div className="md:max-w-6xl md:mx-auto md:p-6">
      {/* Mock Wallet 연결 시 강조 배지 및 안내 */}
      {isMock && (
        <div className="mb-6 p-4 bg-ksc-mint/10 border border-ksc-mint rounded-lg flex items-center space-x-4">
          <span className="badge-mock">{t("wallet.status.mock")}</span>
          <span className="text-ksc-mint font-semibold">
            {t("wallet.status.mockDescription")}
          </span>
          <span className="text-ksc-gray text-sm">
            {t("wallet.status.mockNote")}
          </span>
        </div>
      )}
      {/* 지갑 정보 헤더 */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 `}
            >
              {isMock ? (
                <Zap className="w-6 h-6 text-ksc-black" />
              ) : (
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-ksc-white">
                  {t("wallet.title", {
                    chainName: chainName === "xrpl" ? "XRPL" : "Avalanche",
                  })}{" "}
                  ({chainName === "xrpl" ? "XRPL" : "Avalanche"})
                </h2>
                {isMock && (
                  <span className="badge-mock">{t("wallet.mock")}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-ksc-gray">{formatAddress(address || "")}</p>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-ksc-box/50 rounded transition-colors"
                  title={t("wallet.copyAddress")}
                >
                  {copiedAddress ? (
                    <Check className="w-4 h-4 text-ksc-mint" />
                  ) : (
                    <Copy className="w-4 h-4 text-ksc-gray" />
                  )}
                </button>
              </div>
              {/* {chainName && (
                <p className="text-sm text-ksc-gray">
                  {chainName}
                </p>
              )} */}
            </div>
          </div>

          <div className="flex items-center space-x-3 hidden md:block">
            <button
              onClick={disconnectWallet}
              className="flex items-center space-x-2 text-white hover:text-ksc-mint/80 text-sm"
            >
              <CircleX className="w-4 h-4" />
              <span>{t("wallet.disconnect")}</span>
            </button>
          </div>
        </div>

        {/* Mock Wallet 연결 시 mock data 예시 */}
        {/* {isMock && (
          <div className="mb-6 p-4 bg-ksc-box/80 border border-ksc-mint/30 rounded-lg">
            <div className="text-ksc-mint font-bold mb-2">Mock Data 예시</div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-ksc-gray text-sm mb-1">Mock 주소</div>
                <div className="font-mono text-ksc-white break-all">
                  {address}
                </div>
              </div>
              <div>
                <div className="text-ksc-gray text-sm mb-1">Mock KSC 잔액</div>
                <div className="font-mono text-ksc-mint">
                  {kscBalance} KSC
                </div>
              </div>
              <div>
                <div className="text-ksc-gray text-sm mb-1">Mock 최근 거래</div>
                <ul className="text-xs text-ksc-white space-y-1">
                  {transactions.slice(0, 2).map((tx) => (
                    <li key={tx.hash} className="flex items-center space-x-2">
                      <span className="font-mono">
                        {tx.hash.slice(0, 8)}...
                      </span>
                      <span className="text-ksc-mint">
                        {tx.amount} {tx.currency}
                      </span>
                      <span className="badge-mock">
                        {t(tx.status === "confirmed" ? "wallet.transactions.status.confirmed" : "wallet.transactions.status.pending")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )} */}

        {/* 잔액 정보 */}
        {/* <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
            <div className="flex items-center justify-between">
              <span className="text-ksc-gray">{t("wallet.overview.balance", { token: chainName === 'xrpl' ? 'XRP' : 'AVAX' })}</span>
              <span className="font-semibold text-ksc-mint">
                {formatBalance(balance || '')} {chainName === 'xrpl' ? 'XRP' : 'AVAX'}
              </span>
            </div>
          </div>
          <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
            <div className="flex items-center justify-between">
              <span className="text-ksc-gray">{t("wallet.overview.kscBalance")}</span>
              <span className="font-semibold text-ksc-mint">
                {formatBalance(kscBalance || '')} KSC
              </span>
            </div>
          </div>
        </div> */}
      </div>

      {/* 탭 네비게이션 */}
      <div className="card mb-6">
        <div className="border-b border-ksc-box/50">
          <nav className="flex space-x-8 md:px-6">
            {[
              { id: "overview", label: t("wallet.tabs.overview"), icon: "📊" },
              { id: "send", label: t("wallet.tabs.send"), icon: "💸" },
              {
                id: "transactions",
                label: t("wallet.tabs.transactions"),
                icon: "📋",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-ksc-mint text-ksc-mint"
                    : "border-transparent text-ksc-gray hover:text-ksc-white hover:border-ksc-gray"
                }`}
              >
                <span className="mr-2 hidden md:inline">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="md:p-6 py-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-ksc-white">
                  {t("wallet.overview.title")}
                </h3>

                <button
                  onClick={() => {
                    fetchBalance();
                    fetchKscBalance();
                    fetchTxCount();
                    fetchTransactions();
                  }}
                  disabled={isLoading}
                  className="flex items-center space-x-2 text-white hover:text-ksc-mint/80 text-sm"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span>{t("wallet.overview.refresh")}</span>
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex  gap-3 md:flex-col md:gap-0 bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
                  <div className="text-2xl font-bold text-ksc-mint">
                    {kscBalance || "-"}
                  </div>
                  <div className="text-sm text-ksc-gray flex items-center">
                    {t("wallet.overview.kscBalance")}
                  </div>
                </div>

                <div className="flex  gap-3 md:flex-col md:gap-0 bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
                  <div className="text-2xl font-bold text-ksc-mint">
                    {balance || "-"}
                  </div>
                  <div className="text-sm text-ksc-gray flex items-center">
                    {t("wallet.overview.balance", {
                      token: chainName === "xrpl" ? "XRP" : "AVAX",
                    })}
                  </div>
                </div>

                <div className="flex  gap-3 md:flex-col md:gap-0 bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
                  <div className="text-2xl font-bold text-ksc-mint">
                    {txCount || "-"}
                  </div>
                  <div className="text-sm text-ksc-gray flex items-center">
                    {t("wallet.overview.totalTransactions")}
                  </div>
                </div>
              </div>

              <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
                <h4 className="font-semibold text-ksc-mint mb-2">
                  {t("wallet.overview.recentTransactions")}
                </h4>
                {filteredTxHistory.slice(0, 3).length > 0 ? (
                  <div className="space-y-2">
                    {filteredTxHistory.slice(0, 3).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-ksc-gray">
                          {formatWeiToKsc(tx.amount)} KSC
                        </span>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              tx.txStatus === "CONFIRMED"
                                ? "bg-secondary-400 text-secondary-100"
                                : tx.txStatus === "PENDING"
                                ? "bg-green-200 text-green-800"
                                : tx.txStatus === "FAILED"
                                ? "bg-error-100 text-error-800"
                                : "bg-yellow-200 text-yellow-800"
                            }`}
                          >
                            {t(
                              `wallet.transactions.status.${
                                tx.txStatus.toLowerCase() || "FAILED"
                              }`
                            )}
                          </span>
                          {/* {tx.explorerUrl && (
                            <a
                              href={tx.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ksc-mint hover:text-ksc-mint/80"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )} */}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-ksc-gray">
                    {t("wallet.transactions.noTransactions")}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "send" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-ksc-white">
                {t("wallet.send.title")}
              </h3>

              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="label">
                    {t("wallet.send.recipientAddress")}
                  </label>
                  <input
                    type="text"
                    value={sendForm.to}
                    onChange={(e) => {
                      setSendError("");
                      setSendForm((prev) => ({ ...prev, to: e.target.value }));
                    }}
                    placeholder={t("wallet.send.recipientAddressPlaceholder")}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    {t("wallet.send.amount")} (KSC)
                  </label>
                  <input
                    type="number"
                    value={sendForm.amount}
                    onChange={(e) => {
                      setSendError("");
                      setSendForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }));
                    }}
                    placeholder="0"
                    min="0"
                    step="any"
                    className="input-field"
                    required
                  />
                </div>

                {/* <div>
                  <label className="label">{t("wallet.send.chain")}</label>
                  <select
                    value={sendForm.chain}
                    onChange={(e) =>
                      setSendForm((prev) => ({
                        ...prev,
                        chain: e.target.value as "xrpl" | "avalanche",
                      }))
                    }
                    className="input-field"
                  >
                    <option value="xrpl">XRPL</option>
                    <option value="avalanche">Avalanche</option>
                  </select>
                </div> */}

                <button
                  type="submit"
                  disabled={sendLoading || !sendForm.to || !sendForm.amount}
                  className="w-full btn-primary disabled:bg-ksc-gray disabled:cursor-not-allowed"
                >
                  {sendLoading
                    ? t("wallet.send.sending")
                    : t("wallet.send.send")}
                </button>
              </form>

              {sendError && (
                <div className="p-4 bg-error-100 border border-error-200 rounded-lg flex justify-center">
                  <p className="text-error-600">{sendError}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="flex flex-col gap-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-ksc-white">
                    {t("wallet.transactions.title")}
                  </h3>
                  <button
                    onClick={() => fetchTransactions()}
                    disabled={isLoading}
                    className="flex items-center space-x-2 text-white hover:text-ksc-mint/80 text-sm"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    <span>{t("wallet.transactions.refresh")}</span>
                  </button>
                </div>

                {txHistory.length > 0 ? (
                  <div>
                    <table className="min-w-full divide-y divide-ksc-box/50">
                      <thead className="bg-ksc-box/30">
                        <tr>
                          <th className="px-6 py-3 text-center text-xs font-medium text-ksc-gray uppercase tracking-wider">
                            {t("wallet.transactions.hash")}
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-ksc-gray uppercase tracking-wider">
                            {t("wallet.transactions.from")}
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-ksc-gray uppercase tracking-wider">
                            {t("wallet.transactions.to")}
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-ksc-gray uppercase tracking-wider">
                            {t("wallet.transactions.amount")}
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-ksc-gray uppercase tracking-wider">
                            {t("wallet.transactions.status.title")}
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-ksc-gray uppercase tracking-wider">
                            {t("wallet.transactions.timestamp")}
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-ksc-gray uppercase tracking-wider">
                            {t("wallet.transactions.explorer")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-ksc-box/20 divide-y divide-ksc-box/30">
                        {filteredTxHistory.map((tx) => (
                          <tr key={tx.id} className="hover:bg-ksc-box/30">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-ksc-white text-center">
                              {<AddressDisplay address={tx.txHash || ""} />}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-ksc-white text-center">
                              {
                                <AddressDisplay
                                  address={tx.fromAddress || ""}
                                />
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-ksc-white text-center">
                              {<AddressDisplay address={tx.toAddress || ""} />}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-ksc-white text-right text-center">
                              {formatWeiToKsc(tx.amount)}&nbsp; KSC
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  tx.txStatus === "CONFIRMED"
                                    ? "bg-secondary-400 text-secondary-100"
                                    : tx.txStatus === "PENDING"
                                    ? "bg-green-200 text-green-800"
                                    : tx.txStatus === "FAILED"
                                    ? "bg-error-100 text-error-800"
                                    : "bg-yellow-200 text-yellow-800"
                                }`}
                              >
                                {t(
                                  `wallet.transactions.status.${
                                    tx.txStatus.toLowerCase() || "FAILED"
                                  }`
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-ksc-gray text-center">
                              {tx.txStatus === "PENDING"
                                ? formatDate(tx.createdAt)
                                : tx.txStatus === "APPROVE"
                                ? formatDate(tx.scheduledAt)
                                : formatDate(tx.statusUpdatedAt || "")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <a
                                href={getExplorerUrl(
                                  tx.txHash || "",
                                  chainName!
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-ksc-white hover:text-ksc-mint/80 flex justify-center"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-ksc-gray">
                      {t("wallet.transactions.noTransactions")}
                    </p>
                  </div>
                )}
                {/* 페이지네이션 컨트롤 */}
                <div className="flex justify-between items-center mt-6">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
