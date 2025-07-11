"use client";

import { useState } from "react";

import { useLanguage } from "@/contexts/localization/LanguageContext";
import {
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Zap,
  CircleX,
} from "lucide-react";
import toast from "react-hot-toast";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useWalletData } from "@/hooks/useWalletData";
import { useSendTokens } from "@/hooks/useSendTokens";

export default function WalletInterface() {
  const { t } = useLanguage();
  const {
    address,
    balance,
    kscBalance,
    chainName,
    transactions,
    isConnected,
    isLoading,
    error,
    isMock,
    connectMockWallet,
    sendMockKsc,
  } = useWalletContext();

  const { connectAvalancheWallet, connectXrplEvmWallet, disconnectWallet } =
    useWalletConnect();

  const { fetchBalance, fetchKscBalance, fetchTransactions } = useWalletData();

  const { sendKsc } = useSendTokens();

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
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendForm.to || !sendForm.amount) return;

    if (isMock) {
      await sendMockKsc(sendForm.to, sendForm.amount);
    } else {
      await sendKsc(
        sendForm.to,
        sendForm.amount,
        sendForm.memo,
        sendForm.chain,
        paymentType,
        scheduledAt
      );
    }
    setSendForm({ to: "", amount: "", memo: "", chain: "xrpl" });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toLocaleString("ko-KR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("ko-KR");
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
      return `https://devnet.xrpl.org/transactions/${hash}`;
    } else {
      return `https://testnet.snowtrace.io/tx/${hash}`;
    }
  };

  if (!isConnected && !isMock) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card">
          <h2 className="text-2xl font-bold text-ksc-white mb-6 text-center">
            {t("wallet.connect")}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* XRPL 지갑 연결 */}
            <div className="bg-ksc-box rounded-lg p-6 border border-ksc-mint/20 hover:shadow-md hover:shadow-ksc-mint/10 transition-shadow">
              <div className="flex items-center mb-4">
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

              <p className="text-ksc-gray mb-4">
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
            <div className="bg-ksc-box rounded-lg p-6 border border-ksc-mint/20 hover:shadow-md hover:shadow-ksc-mint/10 transition-shadow">
              <div className="flex items-center mb-4">
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

              <p className="text-ksc-gray mb-4">
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
            <div className="bg-ksc-box rounded-lg p-6 border border-ksc-mint/20 hover:shadow-md hover:shadow-ksc-mint/10 transition-shadow">
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
                  className="w-full btn-secondary text-sm"
                >
                  {isLoading
                    ? t("common.loading")
                    : t("wallet.connection.mock.xrplMock")}
                </button>
                <button
                  onClick={() => connectMockWallet("avalanche")}
                  disabled={isLoading}
                  className="w-full btn-secondary text-sm"
                >
                  {isLoading
                    ? t("common.loading")
                    : t("wallet.connection.mock.avalancheMock")}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-error-100 border border-error-200 rounded-lg">
              <p className="text-error-600">{t("errors.walletConnection")}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
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
                  })}
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

          <div className="flex items-center space-x-3">
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
          <nav className="flex space-x-8 px-6">
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
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="p-6">
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
                <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
                  <div className="text-2xl font-bold text-ksc-mint">
                    {formatBalance(kscBalance || "")}
                  </div>
                  <div className="text-sm text-ksc-gray">
                    {t("wallet.overview.kscBalance")}
                  </div>
                </div>

                <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
                  <div className="text-2xl font-bold text-ksc-mint">
                    {formatBalance(balance || "")}
                  </div>
                  <div className="text-sm text-ksc-gray">
                    {t("wallet.overview.balance", {
                      token: chainName === "xrpl" ? "XRP" : "AVAX",
                    })}
                  </div>
                </div>

                <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
                  <div className="text-2xl font-bold text-ksc-mint">
                    {transactions.length}
                  </div>
                  <div className="text-sm text-ksc-gray">
                    {t("wallet.overview.totalTransactions")}
                  </div>
                </div>
              </div>

              <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
                <h4 className="font-semibold text-ksc-mint mb-2">
                  {t("wallet.overview.recentTransactions")}
                </h4>
                {transactions.slice(0, 3).length > 0 ? (
                  <div className="space-y-2">
                    {transactions.slice(0, 3).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-ksc-gray">
                          {tx.amount} {tx.tokenType}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              tx.txStatus === "confirmed"
                                ? "bg-success-100 text-success-800"
                                : tx.txStatus === "pending"
                                ? "bg-warning-100 text-warning-800"
                                : "bg-error-100 text-error-800"
                            }`}
                          >
                            {t(
                              `wallet.transactions.status.${
                                tx.txStatus || "failed"
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
                    onChange={(e) =>
                      setSendForm((prev) => ({ ...prev, to: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setSendForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    {t("wallet.send.chain")}
                  </label>
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
                    <option value="xrpl">{t("wallet.send.xrpl")}</option>
                    <option value="avalanche">
                      {t("wallet.send.avalanche")}
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !sendForm.to || !sendForm.amount}
                  className="w-full btn-primary disabled:bg-ksc-gray disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? t("wallet.send.sending")
                    : t("wallet.send.send")}
                </button>
              </form>

              {error && (
                <div className="p-4 bg-error-100 border border-error-200 rounded-lg">
                  <p className="text-error-600">{error}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "transactions" && (
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

              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-ksc-box/50">
                    <thead className="bg-ksc-box/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          {t("wallet.transactions.hash")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          {t("wallet.transactions.from")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          {t("wallet.transactions.to")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          {t("wallet.transactions.amount")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          {t("wallet.transactions.status.title")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          {t("wallet.transactions.timestamp")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          {t("wallet.transactions.explorer")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-ksc-box/20 divide-y divide-ksc-box/30">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-ksc-box/30">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-ksc-white">
                            {formatAddress(tx.txHash || "")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-ksc-white">
                            {formatAddress(tx.fromAddress)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-ksc-white">
                            {formatAddress(tx.toAddress)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-ksc-white">
                            {formatBalance(tx.amount.toString())} {tx.tokenType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                tx.txStatus === "confirmed"
                                  ? "bg-success-100 text-success-800"
                                  : tx.txStatus === "pending"
                                  ? "bg-warning-100 text-warning-800"
                                  : "bg-error-100 text-error-800"
                              }`}
                            >
                              {t(
                                `wallet.transactions.status.${
                                  tx.txStatus || "failed"
                                }`
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-ksc-gray">
                            {formatDate(tx.statusUpdatedAt || "")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <a
                              href={getExplorerUrl(tx.txHash || "", chainName!)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ksc-white hover:text-ksc-mint/80"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
