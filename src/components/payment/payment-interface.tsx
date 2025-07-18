"use client";

import { useState } from "react";
import { Send, Users, Clock, History, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/localization/LanguageContext";
import { Transaction } from "ethers";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useWalletData } from "@/hooks/useWalletData";
import { send } from "process";
import { useSendTokens } from "@/hooks/useSendTokens";
import { formatDate } from "@/utils/formatters";
import { useWalletConnect } from "@/hooks/useWalletConnect";

interface PaymentForm {
  to: string;
  amount: string;
  description: string;
}

interface BatchPaymentForm {
  recipients: string[];
  amounts: string[];
  description: string;
}

interface ScheduledPaymentForm {
  to: string;
  amount: string;
  scheduledTime: string;
  description: string;
}

export function PaymentInterface() {
  const { t } = useLanguage();
  const { fetchTransactions } = useWalletData();
  const { address, transactions, chainName, isConnected, error } =
    useWalletContext();
  const { connectAvalancheWallet, connectXrplEvmWallet } = useWalletConnect();
  const { sendInstantForTest, sendBatchForTest, sendScheduledForTest } = useSendTokens();
  const [activeTab, setActiveTab] = useState<
    "instant" | "batch" | "scheduled" | "history"
  >("instant");
  const [isLoading, setIsLoading] = useState(false);

  const [scheduledAt, setScheduledAt] = useState<string | null>(null);

  // 즉시 결제 폼
  const [instantForm, setInstantForm] = useState<PaymentForm>({
    to: "",
    amount: "",
    description: "",
  });

  // 배치 결제 폼
  const [batchForm, setBatchForm] = useState<BatchPaymentForm>({
    recipients: [""],
    amounts: [""],
    description: "",
  });

  // 예약 결제 폼
  const [scheduledForm, setScheduledForm] = useState<ScheduledPaymentForm>({
    to: "",
    amount: "",
    scheduledTime: "",
    description: "",
  });

  // 즉시 결제 처리
  const handleInstantPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendInstantForTest(
        instantForm.to,
        instantForm.amount,
        chainName,
        "INSTANT",
        instantForm.description
      );
      toast.success(t("payment.messages.success"));
      setInstantForm({ to: "", amount: "", description: "" });
    } catch (error) {
      toast.error(t("payment.errors.processing"));
    } finally {
      setIsLoading(false);
    }

    // try {
    //   // API 호출 시뮬레이션
    //   await new Promise((resolve) => setTimeout(resolve, 2000));
    //   toast.success("모의 결제 시뮬레이션");
    //   toast.success(t("payment.messages.success"));
    //   setInstantForm({ to: "", amount: "", description: "" });
    // } catch (error) {
    //   toast.error(t("payment.errors.processing"));
    // } finally {
    //   setIsLoading(false);
    // }
  };

  // 배치 결제 처리
  const handleBatchPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      await sendBatchForTest(
        batchForm.recipients,
        batchForm.amounts,
        chainName,
        batchForm.description
      );
    } catch (err) {
      toast.error(t("payment.errors.processing"));
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    toast.success(t("payment.messages.success"));
    setBatchForm({ recipients: [""], amounts: [""], description: "" });

    //API 호출 시뮬레이션
    // try {
    //   await new Promise((resolve) => setTimeout(resolve, 3000));
    //   toast.success(t("payment.messages.batchSuccess"));
    //   setBatchForm({ recipients: [""], amounts: [""], description: "" });
    // } catch (error) {
    //   toast.error(t("payment.errors.batchProcessing"));
    // } finally {
    //   setIsLoading(false);
    // }
  };

  // 예약 결제 처리
  const handleScheduledPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendScheduledForTest(
        scheduledForm.to,
        scheduledForm.amount,
        chainName,
        scheduledForm.scheduledTime,
        scheduledForm.description
      );
      toast.success(t("payment.messages.success"));
      setScheduledForm({
        to: "",
        amount: "",
        scheduledTime: "",
        description: "",
      });
    } catch (error) {
      toast.error(t("payment.errors.processing"));
    } finally {
      setIsLoading(false);
    }

    //API 호출 시뮬레이션
    // try {
    //   await new Promise((resolve) => setTimeout(resolve, 1500));
    //   toast.success(t("payment.messages.scheduledSuccess"));
    //   setScheduledForm({
    //     to: "",
    //     amount: "",
    //     scheduledTime: "",
    //     description: "",
    //   });
    // } catch (error) {
    //   toast.error(t("payment.errors.scheduledProcessing"));
    // } finally {
    //   setIsLoading(false);
    // }
  };

  // 배치 결제 수신자 추가
  const addRecipient = () => {
    setBatchForm((prev) => ({
      ...prev,
      recipients: [...prev.recipients, ""],
      amounts: [...prev.amounts, ""],
    }));
  };

  // 배치 결제 수신자 제거
  const removeRecipient = (index: number) => {
    if (batchForm.recipients.length > 1) {
      setBatchForm((prev) => ({
        ...prev,
        recipients: prev.recipients.filter((_, i) => i !== index),
        amounts: prev.amounts.filter((_, i) => i !== index),
      }));
    }
  };

  // 배치 결제 수신자 정보 업데이트
  const updateRecipient = (
    index: number,
    field: "recipient" | "amount",
    value: string
  ) => {
    setBatchForm((prev) => ({
      ...prev,
      [field === "recipient" ? "recipients" : "amounts"]: prev[
        field === "recipient" ? "recipients" : "amounts"
      ].map((item, i) => (i === index ? value : item)),
    }));
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
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
    <div className="max-w-5xl mx-auto p-6">
      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 bg-ksc-gray-dark rounded-lg p-1">
        <button
          onClick={() => setActiveTab("instant")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors group ${
            activeTab === "instant"
              ? "bg-ksc-blue text-white"
              : "text-ksc-gray-light hover:text-white"
          }`}
        >
          <Send
            size={20}
            className={`transition-colors ${
              activeTab === "instant"
                ? "text-ksc-mint"
                : "text-ksc-gray-light group-hover:text-ksc-mint"
            }`}
          />
          <span
            className={`transition-colors ${
              activeTab === "instant"
                ? "text-ksc-mint"
                : "text-ksc-gray-light group-hover:text-ksc-mint"
            }`}
          >
            {t("payment.instant")}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("batch")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors group ${
            activeTab === "batch"
              ? "bg-ksc-blue text-white"
              : "text-ksc-gray-light hover:text-white"
          }`}
        >
          <Users
            size={20}
            className={`transition-colors ${
              activeTab === "batch"
                ? "text-ksc-mint"
                : "text-ksc-gray-light group-hover:text-ksc-mint"
            }`}
          />
          <span
            className={`transition-colors ${
              activeTab === "batch"
                ? "text-ksc-mint"
                : "text-ksc-gray-light group-hover:text-ksc-mint"
            }`}
          >
            {t("payment.batch")}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("scheduled")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors group ${
            activeTab === "scheduled"
              ? "bg-ksc-blue text-white"
              : "text-ksc-gray-light hover:text-white"
          }`}
        >
          <Clock
            size={20}
            className={`transition-colors ${
              activeTab === "scheduled"
                ? "text-ksc-mint"
                : "text-ksc-gray-light group-hover:text-ksc-mint"
            }`}
          />
          <span
            className={`transition-colors ${
              activeTab === "scheduled"
                ? "text-ksc-mint"
                : "text-ksc-gray-light group-hover:text-ksc-mint"
            }`}
          >
            {t("payment.schedule")}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("history");
            fetchTransactions();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors group ${
            activeTab === "history"
              ? "bg-ksc-blue text-white"
              : "text-ksc-gray-light hover:text-white"
          }`}
        >
          <History
            size={20}
            className={`transition-colors ${
              activeTab === "history"
                ? "text-ksc-mint"
                : "text-ksc-gray-light group-hover:text-ksc-mint"
            }`}
          />
          <span
            className={`transition-colors ${
              activeTab === "history"
                ? "text-ksc-mint"
                : "text-ksc-gray-light group-hover:text-ksc-mint"
            }`}
          >
            {t("payment.history")}
          </span>
        </button>
      </div>

      {/* 즉시 결제 폼 */}
      {activeTab === "instant" && (
        <div className="bg-ksc-gray-dark rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Send className="mr-2" />
            {t("payment.instant")}
          </h2>

          <form onSubmit={handleInstantPayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("payment.sendForm.recipient")}
              </label>
              <input
                type="text"
                value={instantForm.to}
                onChange={(e) =>
                  setInstantForm((prev) => ({ ...prev, to: e.target.value }))
                }
                placeholder="0x..."
                className="w-full px-4 py-3 bg-ksc-gray rounded-lg border border-ksc-gray-light focus:border-2 focus:border-ksc-mint focus:ring-0 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("payment.sendForm.amount")}
              </label>
              <input
                type="number"
                value={instantForm.amount}
                onChange={(e) =>
                  setInstantForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-ksc-gray rounded-lg border border-ksc-gray-light focus:border-2 focus:border-ksc-mint focus:ring-0 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("payment.sendForm.description")}
              </label>
              <textarea
                value={instantForm.description}
                onChange={(e) =>
                  setInstantForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={t("payment.sendForm.descriptionPlaceholder")}
                rows={3}
                className="w-full px-4 py-3 bg-ksc-gray rounded-lg border border-ksc-gray-light focus:border-2 focus:border-ksc-mint focus:ring-0 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onClick={handleInstantPayment}
              className="w-full bg-ksc-blue hover:text-ksc-mint disabled:bg-ksc-blue text-lg text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? t("common.processing") : t("payment.sendForm.send")}
            </button>
          </form>
        </div>
      )}

      {/* 배치 결제 폼 */}
      {activeTab === "batch" && (
        <div className="bg-ksc-gray-dark rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Users className="mr-2" />
            {t("payment.batch")}
          </h2>

          <form onSubmit={handleBatchPayment} className="space-y-6">
            {batchForm.recipients.map((recipient, index) => (
              <div key={index} className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    {t("payment.batchForm.recipient")} {index + 1}
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) =>
                      updateRecipient(index, "recipient", e.target.value)
                    }
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-ksc-gray rounded-lg border border-ksc-gray-light focus:border-2 focus:border-ksc-mint focus:ring-0 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    {t("payment.sendForm.amount")}
                  </label>
                  <input
                    type="number"
                    value={batchForm.amounts[index]}
                    onChange={(e) =>
                      updateRecipient(index, "amount", e.target.value)
                    }
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-ksc-gray rounded-lg border border-ksc-gray-light focus:border-2 focus:border-ksc-mint focus:ring-0 focus:outline-none"
                    required
                  />
                </div>

                {batchForm.recipients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRecipient(index)}
                    className="mt-8 px-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    {t("common.delete")}
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addRecipient}
              className="w-full py-2 border-2 border-dashed border-ksc-gray-light text-ksc-gray-light hover:border-ksc-mint hover:text-ksc-mint rounded-lg transition-colors"
            >
              + {t("payment.batchForm.addRecipient")}
            </button>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("payment.batchForm.description")}
              </label>
              <textarea
                value={batchForm.description}
                onChange={(e) =>
                  setBatchForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={t("payment.sendForm.descriptionPlaceholder")}
                rows={3}
                className="w-full px-4 py-3 bg-ksc-gray rounded-lg border border-ksc-gray-light focus:border-2 focus:border-ksc-mint focus:ring-0 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onClick={handleBatchPayment}
              className="w-full bg-ksc-blue hover:text-ksc-mint disabled:bg-ksc-gray text-lg text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? t("common.processing") : t("payment.batchExecute")}
            </button>
          </form>
        </div>
      )}

      {/* 예약 결제 폼 */}
      {activeTab === "scheduled" && (
        <div className="bg-ksc-gray-dark rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Clock className="mr-2" />
            {t("payment.schedule")}
          </h2>

          <form onSubmit={handleScheduledPayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("payment.sendForm.recipient")}
              </label>
              <input
                type="text"
                value={scheduledForm.to}
                onChange={(e) =>
                  setScheduledForm((prev) => ({ ...prev, to: e.target.value }))
                }
                placeholder="0x..."
                className="w-full px-4 py-3 bg-ksc-gray rounded-lg border border-ksc-gray-light focus:border-2 focus:border-ksc-mint focus:ring-0 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("payment.sendForm.amount")}
              </label>
              <input
                type="number"
                value={scheduledForm.amount}
                onChange={(e) =>
                  setScheduledForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-ksc-gray rounded-lg border border-ksc-gray-light focus:border-2 focus:border-ksc-mint focus:ring-0 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("payment.scheduledForm.time")}
              </label>
              <input
                type="datetime-local"
                value={scheduledForm.scheduledTime}
                onChange={(e) =>
                  setScheduledForm((prev) => ({
                    ...prev,
                    scheduledTime: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-ksc-gray rounded-lg border border-ksc-gray-light focus:border-2 focus:border-ksc-mint focus:ring-0 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("payment.sendForm.description")}
              </label>
              <textarea
                value={scheduledForm.description}
                onChange={(e) =>
                  setScheduledForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={t("payment.sendForm.descriptionPlaceholder")}
                rows={3}
                className="w-full px-4 py-3 bg-ksc-gray rounded-lg border border-ksc-gray-light focus:border-2 focus:border-ksc-mint focus:ring-0 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onClick={handleScheduledPayment}
              className="w-full bg-ksc-blue hover:text-ksc-mint disabled:bg-ksc-gray text-lg text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading
                ? t("payment.scheduledForm.registering")
                : t("payment.scheduledForm.register")}
            </button>
          </form>
        </div>
      )}

      {/* 결제 내역 */}
      {activeTab === "history" && (
        <div className="bg-ksc-gray-dark rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <History className="mr-2" />
            {t("payment.history")}
          </h2>

          <div className="space-y-4">
            {/* 모의 결제 이력 데이터 */}
            {transactions.map((payment) => (
              <div key={payment.id} className="bg-ksc-gray rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.paymentType === "INSTANT"
                            ? "bg-blue-600"
                            : payment.paymentType === "BATCH"
                            ? "bg-green-600"
                            : "bg-yellow-600"
                        }`}
                      >
                        {payment.paymentType === "INSTANT"
                          ? t("wallet.transactions.type.instant")
                          : payment.paymentType === "BATCH"
                          ? t("wallet.transactions.type.batch")
                          : t("wallet.transactions.type.scheduled")}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.txStatus === "CONFIRMED"
                            ? "bg-green-600"
                            : payment.txStatus === "PENDING"
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        }`}
                      >
                        {payment.txStatus === "CONFIRMED"
                          ? t("wallet.transactions.status.confirmed")
                          : payment.txStatus === "PENDING"
                          ? t("wallet.transactions.status.pending")
                          : t("wallet.transactions.status.failed")}
                      </span>
                    </div>
                    <p className="text-sm text-ksc-gray-light">
                      {payment.fromAddress} → {payment.toAddress}
                    </p>
                    <p className="font-semibold">{payment.amount} KSC</p>
                    <p className="text-sm text-ksc-gray-light">
                      {payment.memo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-ksc-gray-light">
                      {formatDate(payment.statusUpdatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
