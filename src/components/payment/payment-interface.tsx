"use client";

import { useEffect, useState } from "react";
import {
  Send,
  Users,
  Clock,
  History,
  Zap,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/localization/LanguageContext";
import { Transaction } from "ethers";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useWalletData } from "@/hooks/useWalletData";
import { send } from "process";
import { useSendTokens } from "@/hooks/useSendTokens";
import { convertToUTC, formatDate, formatWeiToKsc } from "@/utils/formatters";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { CustomDropdown } from "../common/CustomDropdown";
import { FutureDateTimePicker } from "../common/input/FutureDateTimePicker";
import { AddressDisplay } from "../common/AddressDisplay";
import { ModalShell } from "../common/modal/ModalShell";

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
  const { t, language } = useLanguage();
  const {
    fetchTransactions,
    txHistory,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalTransactions,
    totalPages,
  } = useWalletData();
  const { address, chainName, isConnected, error, isLoading, setIsLoading } =
    useWalletContext();
  const { connectAvalancheWallet, connectXrplEvmWallet } = useWalletConnect();
  const {
    sendInstant,
    sendBatch,
    sendScheduled,
    sendInstantForTest,
    sendBatchForTest,
    sendScheduledForTest,
    sendError,
    setSendError,
  } = useSendTokens();
  const [activeTab, setActiveTab] = useState<string>(t("payment.instant"));

  const [sendLoading, setSendLoading] = useState(false);

  //예약 결제 시간 변경/취소 관련 상태
  const [isChangeModalOpen, setIsChangeModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [changedTime, setChangedTime] = useState<string>("");

  const openModal = () => {
    setIsChangeModalOpen(true);
  };
  const closeModal = () => {
    setChangedTime("");
    setIsChangeModalOpen(false);
  };

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
    setSendLoading(true);

    try {
      const result = await sendInstant(
        chainName, //📍브릿지 기능 완료 후 수정 필요
        instantForm.to,
        instantForm.amount,
        chainName,
        instantForm.description
      );
      if (result == "client-side-validation-fail") return;
      setInstantForm({ to: "", amount: "", description: "" });
    } catch (error) {
      toast.error(t("payment.errors.processing"));
    } finally {
      setSendLoading(false);
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

    setSendLoading(true);

    try {
      const result = await sendBatch(
        batchForm.recipients,
        batchForm.amounts,
        chainName,
        batchForm.description
      );
      if (result == "client-side-validation-fail") return;
      setBatchForm({ recipients: [""], amounts: [""], description: "" });
    } catch (err) {
      toast.error(t("payment.errors.processing"));
    } finally {
      setSendLoading(false);
    }

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
    setSendLoading(true);

    try {
      const result = await sendScheduled(
        scheduledForm.to,
        scheduledForm.amount,
        chainName,
        scheduledForm.scheduledTime,
        scheduledForm.description
      );

      if (result == "client-side-validation-fail") return;

      setScheduledForm({
        to: "",
        amount: "",
        scheduledTime: "",
        description: "",
      });
    } catch (error) {
      toast.error(t("payment.errors.processing"));
    } finally {
      setSendLoading(false);
    }
  };

  // 예약 결제 변경하기 
  const handleChangeScheduledTime = async (time: string, txId: string) => {
    // 예약 시간 체크
    const scheduledTime = new Date(time);
    const currentTime = new Date();
    if (scheduledTime.getTime() < currentTime.getTime()) {
      toast.error(t("payment.errors.invalidTime"));
      return "client-side-validation-fail";
    }

    const convertedTime = convertToUTC(time);
    try {
      console.log("변경 시간", convertToUTC(time));
      const response = await fetch(`/api/transaction/patch-schedule/${txId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "accept-language": language,
        },
        body: JSON.stringify({
          scheduledAt: convertedTime,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(t(`payment.errors.changeScheduledTimeError`));
        console.log("예약 결제 변경 실패", data.data);
        return;
      } else {
        fetchTransactions();
        setIsChangeModalOpen(false);
      }
    } catch (err) {
      toast.error(t(`payment.errors.changeScheduledTimeError`));
      console.error("예약 결제 시간 변경 실패:", err);
    }
  };

  // 예약 결제 취소하기
  const handleCancelScheduledPayment = async (txId: string) => {
    try {
      const response = await fetch(`/api/transaction/patch-tx/${txId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "accept-language": language,
        },
        body: JSON.stringify({
          status: "CANCELED",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(t(`payment.errors.cancelError`));
        console.log("예약 결제 취소 실패", data.data);
        return;
      } else {
        fetchTransactions();
        setIsCancelModalOpen(false);
      }
    } catch (err) {
      console.error("예약 결제 취소 실패:", err);
    }
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
    const initialItemsPerPage = 10;
    setItemsPerPage(initialItemsPerPage);
    fetchTransactions(initialItemsPerPage);
  }, []);

  useEffect(() => {
    if (itemsPerPage > 0) {
      fetchTransactions();
    }
  }, [itemsPerPage]);

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
    <div className="md:max-w-5xl md:mx-auto py-6 md:px-6 lg:px-8 max-w-7xl">
      {/* 탭 네비게이션 */}
      <div className="hidden md:flex space-x-1 bg-ksc-gray-dark rounded-lg p-1">
        <button
          onClick={() => {
            setActiveTab(t("payment.instant"));
            setSendError("");
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors group ${
            activeTab === t("payment.instant")
              ? "bg-ksc-blue text-white"
              : "text-ksc-gray-light hover:text-white"
          }`}
        >
          <Send
            size={20}
            className={`transition-colors ${
              activeTab === t("payment.instant")
                ? "text-ksc-mint"
                : "text-ksc-gray-light group-hover:text-ksc-mint"
            }`}
          />
          <span
            className={`transition-colors ${
              activeTab === t("payment.instant")
                ? "text-ksc-mint"
                : "text-ksc-gray-light group-hover:text-ksc-mint"
            }`}
          >
            {t("payment.instant")}
          </span>
        </button>

        <button
          onClick={() => setActiveTab(t("payment.batch"))}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors group ${
            activeTab === t("payment.batch")
              ? "bg-ksc-blue text-white"
              : "text-ksc-gray-light hover:text-white"
          }`}
        >
          <Users
            size={20}
            className={`transition-colors ${
              activeTab === t("payment.batch")
                ? "text-ksc-mint"
                : "text-ksc-gray-light group-hover:text-ksc-mint"
            }`}
          />
          <span
            className={`transition-colors ${
              activeTab === t("payment.batch")
                ? "text-ksc-mint"
                : "text-ksc-gray-light group-hover:text-ksc-mint"
            }`}
          >
            {t("payment.batch")}
          </span>
        </button>

        <button
          onClick={() => setActiveTab(t("payment.schedule"))}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors group ${
            activeTab === t("payment.schedule")
              ? "bg-ksc-blue text-white"
              : "text-ksc-gray-light hover:text-white"
          }`}
        >
          <Clock
            size={20}
            className={`transition-colors ${
              activeTab === t("payment.schedule")
                ? "text-ksc-mint"
                : "text-ksc-gray-light group-hover:text-ksc-mint"
            }`}
          />
          <span
            className={`transition-colors ${
              activeTab === t("payment.schedule")
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

      {/* 탭 네비게이션 - 모바일 */}
      <div className="md:hidden flex justify-between mb-2">
        <CustomDropdown
          _onChange={(selectedOption: any) => {
            console.log("현재 선택된 탭", selectedOption.value);
            setActiveTab(selectedOption.value);
          }}
          _options={[
            t("payment.instant"),
            t("payment.batch"),
            t("payment.schedule"),
          ]}
          _defaultOption={0}
          _width={110}
          _fontSize={16}
        />

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
      {activeTab === t("payment.instant") && (
        <div className="bg-ksc-gray-dark rounded-lg sm:p-6 p-2">
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
                onChange={(e) => {
                  setInstantForm((prev) => ({ ...prev, to: e.target.value }));
                  setSendError("");
                }}
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
                onChange={(e) => {
                  setInstantForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }));
                  setSendError("");
                }}
                placeholder="0"
                min="0"
                step="0.01"
                className=" w-full px-4 py-3 bg-ksc-gray rounded-lg border border-ksc-gray-light focus:border-2 focus:border-ksc-mint focus:ring-0 focus:outline-none"
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
              disabled={
                sendLoading ||
                !instantForm.amount ||
                !instantForm.to ||
                !!sendError
              }
              onClick={handleInstantPayment}
              className="w-full btn-primary disabled:bg-ksc-gray disabled:cursor-not-allowed"
            >
              {sendLoading
                ? t("common.processing")
                : t("payment.sendForm.send")}
            </button>
          </form>
          {sendError && (
            <div className="p-4 bg-error-100 border border-error-200 rounded-lg flex justify-center mt-5">
              <p className="text-error-600">{sendError}</p>
            </div>
          )}
        </div>
      )}

      {/* 배치 결제 폼 */}
      {activeTab === t("payment.batch") && (
        <div className="bg-ksc-gray-dark rounded-lg sm:p-6 p-2">
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
                    onChange={(e) => {
                      updateRecipient(index, "recipient", e.target.value);
                      setSendError("");
                    }}
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
                    onChange={(e) => {
                      updateRecipient(index, "amount", e.target.value);
                      setSendError("");
                    }}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-ksc-gray rounded-lg border border-ksc-gray-light focus:border-2 focus:border-ksc-mint focus:ring-0 focus:outline-none"
                    required
                  />
                </div>

                {batchForm.recipients.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => removeRecipient(index)}
                      className="hidden md:block mt-8 px-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      {t("common.delete")}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRecipient(index)}
                      className="md:hidden text-white"
                    >
                      <X />
                    </button>
                  </>
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
              disabled={
                sendLoading ||
                batchForm.recipients.some((r) => r === "") ||
                batchForm.amounts.some((a) => a === "") ||
                !!sendError
              }
              onClick={handleBatchPayment}
              className="w-full btn-primary disabled:bg-ksc-gray disabled:cursor-not-allowed"
            >
              {sendLoading ? t("common.processing") : t("payment.batchExecute")}
            </button>
          </form>
          {sendError && (
            <div className="p-4 bg-error-100 border border-error-200 rounded-lg flex justify-center mt-5">
              <p className="text-error-600">{sendError}</p>
            </div>
          )}
        </div>
      )}

      {/* 예약 결제 폼 */}
      {activeTab === t("payment.schedule") && (
        <div className="bg-ksc-gray-dark rounded-lg sm:p-6 p-2">
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
                onChange={(e) => {
                  setScheduledForm((prev) => ({ ...prev, to: e.target.value }));
                  setSendError("");
                }}
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
                onChange={(e) => {
                  setScheduledForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }));
                  setSendError("");
                }}
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
              <FutureDateTimePicker
                _value={scheduledForm.scheduledTime}
                _onChange={(e: any) =>
                  setScheduledForm((prev) => ({
                    ...prev,
                    scheduledTime: e.target.value,
                  }))
                }
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
              disabled={
                sendLoading ||
                !scheduledForm.to ||
                !scheduledForm.amount ||
                !scheduledForm.scheduledTime
              }
              onClick={handleScheduledPayment}
              className="w-full btn-primary disabled:bg-ksc-gray disabled:cursor-not-allowed"
            >
              {sendLoading
                ? t("payment.scheduledForm.registering")
                : t("payment.scheduledForm.register")}
            </button>
          </form>
          {sendError && (
            <div className="p-4 bg-error-100 border border-error-200 rounded-lg flex justify-center mt-5">
              <p className="text-error-600">{sendError}</p>
            </div>
          )}
        </div>
      )}

      {/* 결제 내역 */}
      {activeTab === "history" && (
        <div className="bg-ksc-gray-dark rounded-lg sm:p-6 p-2">
          <div className="w-full flex items-center pb-2 sm:pb-0 justify-end sm:justify-between">
            <h2 className="hidden sm:inline sm:flex sm:text-2xl sm:font-semibold sm:mb-6 sm:lex sm:items-center">
              <History className="mr-2" />
              {t("payment.history")}
            </h2>
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

          {/* 페이지네이션 컨트롤 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CustomDropdown
                _onChange={handleItemsPerPageChange}
                _options={["5", "10", "20"]}
                _defaultOption={1}
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

          {/* 트랜잭션 데이터 */}
          <div className="space-y-4">
            {txHistory.map((payment) => (
              <div key={payment.id} className={`rounded-lg p-4 ${payment.txStatus === "CANCELED"? "bg-ksc-box/40" : "bg-ksc-box"}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className={`flex items-center space-x-2 mb-2`}>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.paymentType === "INSTANT"
                            ? "bg-blue-600"
                            : payment.paymentType === "BATCH"
                            ? "bg-purple-600"
                            : "bg-yellow-500"
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
                            ? "bg-gray-400"
                            : payment.txStatus === "PENDING"
                            ? "bg-green-600"
                            : payment.txStatus === "FAILED"
                            ? "bg-red-500"
                            : payment.txStatus === "CANCELED"
                            ? "bg-gray-600"
                            : "bg-green-500"
                        }`}
                      >
                        {payment.txStatus === "CONFIRMED"
                          ? t("wallet.transactions.status.confirmed")
                          : payment.txStatus === "PENDING"
                          ? t("wallet.transactions.status.pending")
                          : payment.txStatus === "FAILED"
                          ? t("wallet.transactions.status.failed")
                          :payment.txStatus === "CANCELED"
                          ? t("wallet.transactions.status.canceled")
                          : t("wallet.transactions.status.approve")}
                      </span>
                      <p className={`px-1 text-sm text-ksc-gray-light ${payment.txStatus === "CANCELED"? "text-gray-500":""}`}>
                        {payment.memo}
                      </p>

                      <span className="flex-grow px-4 py-4 whitespace-nowrap text-sm flex justify-end gap-2">
                        {payment.txStatus === "APPROVE" &&
                        payment.paymentType === "SCHEDULED" ? (
                          <>
                            <span
                              className="text-ksc-white hover:text-ksc-mint/80 flex justify-end"
                              onClick={() => {
                                setIsChangeModalOpen(true);
                              }}
                            >
                              변경하기
                            </span>

                            <span className="text-ksc-white flex justify-end">
                              {" "}
                              |{" "}
                            </span>
                            <span
                              className="text-ksc-white hover:text-ksc-mint/80 flex justify-end"
                              onClick={() => {
                                setIsCancelModalOpen(true);
                              }}
                            >
                              취소하기
                            </span>

                            {/*예약 결제 시간 변경 모달*/}
                            <ModalShell
                              isOpen={isChangeModalOpen}
                              onClose={() => {
                                setIsChangeModalOpen(false);
                                setChangedTime("");
                              }}
                            >
                              <div className="flex flex-col gap-7 p-2">
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    {t("payment.scheduledForm.time")}
                                  </label>
                                  <FutureDateTimePicker
                                    _value={changedTime}
                                    _onChange={(e: any) =>
                                      setChangedTime(e.target.value)
                                    }
                                  />
                                </div>
                                <button
                                  type="submit"
                                  disabled={!changedTime}
                                  onClick={() => {
                                    handleChangeScheduledTime(
                                      changedTime,
                                      payment.id
                                    );
                                  }}
                                  className="btn-primary disabled:bg-ksc-gray disabled:cursor-not-allowed"
                                >
                                  예약 시간 변경
                                </button>
                              </div>
                            </ModalShell>
                            {/*예약 결제 취소 모달*/}
                            <ModalShell
                              isOpen={isCancelModalOpen}
                              onClose={()=>{setIsCancelModalOpen(false)}}
                            >
                              <div className="flex flex-col gap-7 px-5 py-2">
                                <div className="text-lg">결제를 취소하시겠습니까?</div>
                                <button
                                  type="submit"
                                  onClick={() => {
                                    handleCancelScheduledPayment(payment.id);
                                  }}
                                  className="btn-primary disabled:bg-ksc-gray disabled:cursor-not-allowed"
                                >
                                  예약 결제 취소
                                </button>
                              </div>
                            </ModalShell>
                          </>
                        ) : (
                          <a
                            href={getExplorerUrl(
                              payment.txHash || "",
                              chainName!
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-ksc-white hover:text-ksc-mint/80 flex justify-end ${payment.txStatus === "CANCELED"? "hidden":""}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </span>
                    </div>

                    <p className={`hidden sm:block text-xs text-ksc-gray-light ${payment.txStatus === "CANCELED"? "text-gray-500":""}`}>
                      <AddressDisplay
                        address={payment.fromAddress}
                        full={true}
                      />
                      <span className="px-2">→</span>
                      <AddressDisplay address={payment.toAddress} full={true} />
                    </p>
                    <p className="sm:hidden text-xs text-ksc-gray-light">
                      <AddressDisplay address={payment.fromAddress} />
                      <span className="px-2">→</span>
                      <AddressDisplay address={payment.toAddress} />
                    </p>
                    <p className={`font-semibold mt-3 ${payment.txStatus === "CANCELED"? "text-gray-500":""}`}>
                      {formatWeiToKsc(payment.amount)} KSC
                    </p>
                    <div className="text-right">
                      <p className="text-xs text-ksc-gray-light">
                        {payment.txStatus === "PENDING"
                          ? formatDate(payment.createdAt)
                          : payment.txStatus === "APPROVE"
                          ? formatDate(payment.scheduledAt)
                          : formatDate(payment.statusUpdatedAt || "")}
                      </p>
                    </div>
                  </div>
                  {/* <div className="hidden lg:block text-right">
                    <p className="text-sm text-ksc-gray-light">
                      {payment.txStatus === "PENDING"
                        ? formatDate(payment.createdAt)
                        : formatDate(payment.statusUpdatedAt || "")}
                    </p>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
