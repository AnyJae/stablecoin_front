"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { ExternalLink, RefreshCw, Copy, Check, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function WalletInterface() {
  const {
    walletInfo,
    transactions,
    isLoading,
    error,
    connectXRPLWallet,
    connectAvalancheWallet,
    connectMockWallet,
    sendKSC,
    disconnectWallet,
    fetchBalance,
  } = useWallet();

  const [sendForm, setSendForm] = useState({
    to: "",
    amount: "",
    chain: "xrpl" as "xrpl" | "avalanche",
  });

  const [activeTab, setActiveTab] = useState<"overview" | "send" | "transactions">("overview");
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendForm.to || !sendForm.amount) return;

    await sendKSC(sendForm.to, sendForm.amount, sendForm.chain);
    setSendForm({ to: "", amount: "", chain: "xrpl" });
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("ko-KR");
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletInfo.address);
      setCopiedAddress(true);
      toast.success("주소가 복사되었습니다.");
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      toast.error("주소 복사에 실패했습니다.");
    }
  };

  const getExplorerUrl = (hash: string, chain: "xrpl" | "avalanche") => {
    if (chain === "xrpl") {
      return `https://devnet.xrpl.org/transactions/${hash}`;
    } else {
      return `https://testnet.snowtrace.io/tx/${hash}`;
    }
  };

  if (!walletInfo.isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card">
          <h2 className="text-2xl font-bold text-ksc-white mb-6 text-center">지갑 연결</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* XRPL 지갑 연결 */}
            <div className="bg-ksc-box rounded-lg p-6 border border-ksc-mint/20 hover:shadow-md hover:shadow-ksc-mint/10 transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-ksc-mint rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-ksc-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ksc-white">XRPL 지갑</h3>
                  <p className="text-sm text-ksc-gray">XRP Ledger 기반</p>
                </div>
              </div>

              <p className="text-ksc-gray mb-4">XRP Ledger에서 KSC를 거래하고 관리하세요.</p>

              <button onClick={connectXRPLWallet} disabled={isLoading} className="w-full btn-primary">
                {isLoading ? "연결 중..." : "XRPL 지갑 연결"}
              </button>
            </div>

            {/* Avalanche 지갑 연결 */}
            <div className="bg-ksc-box rounded-lg p-6 border border-ksc-mint/20 hover:shadow-md hover:shadow-ksc-mint/10 transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-ksc-mint rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-ksc-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ksc-white">Avalanche 지갑</h3>
                  <p className="text-sm text-ksc-gray">MetaMask 지원</p>
                </div>
              </div>

              <p className="text-ksc-gray mb-4">Avalanche C-Chain에서 KSC를 거래하고 관리하세요.</p>

              <button onClick={connectAvalancheWallet} disabled={isLoading} className="w-full btn-primary">
                {isLoading ? "연결 중..." : "Avalanche 지갑 연결"}
              </button>
            </div>

            {/* Mock Wallet 연결 */}
            <div className="bg-ksc-box rounded-lg p-6 border border-ksc-mint/20 hover:shadow-md hover:shadow-ksc-mint/10 transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-ksc-mint rounded-lg flex items-center justify-center mr-4">
                  <Zap className="w-6 h-6 text-ksc-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ksc-white">Mock 지갑</h3>
                  <p className="text-sm text-ksc-gray">개발/테스트용</p>
                </div>
              </div>

              <p className="text-ksc-gray mb-4">실제 지갑 없이도 기능을 테스트할 수 있습니다.</p>

              <div className="space-y-2">
                <button
                  onClick={() => connectMockWallet("xrpl")}
                  disabled={isLoading}
                  className="w-full btn-secondary text-sm"
                >
                  {isLoading ? "연결 중..." : "XRPL Mock"}
                </button>
                <button
                  onClick={() => connectMockWallet("avalanche")}
                  disabled={isLoading}
                  className="w-full btn-secondary text-sm"
                >
                  {isLoading ? "연결 중..." : "Avalanche Mock"}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-error-100 border border-error-200 rounded-lg">
              <p className="text-error-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Mock Wallet 연결 시 강조 배지 및 안내 */}
      {walletInfo.isMock && (
        <div className="mb-6 p-4 bg-ksc-mint/10 border border-ksc-mint rounded-lg flex items-center space-x-4">
          <span className="badge-mock">MOCK WALLET 연결됨</span>
          <span className="text-ksc-mint font-semibold">이 화면은 테스트용 Mock Wallet 환경입니다.</span>
          <span className="text-ksc-gray text-sm">(실제 블록체인과 연결되지 않음)</span>
        </div>
      )}
      {/* 지갑 정보 헤더 */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                walletInfo.isMock ? "bg-ksc-mint" : "bg-ksc-mint"
              }`}
            >
              {walletInfo.isMock ? (
                <Zap className="w-6 h-6 text-ksc-black" />
              ) : (
                <svg className="w-6 h-6 text-ksc-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  {walletInfo.chain === "xrpl" ? "XRPL" : "Avalanche"} 지갑
                </h2>
                {walletInfo.isMock && <span className="badge-mock">MOCK</span>}
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-ksc-gray">{formatAddress(walletInfo.address)}</p>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-ksc-box/50 rounded transition-colors"
                  title="주소 복사"
                >
                  {copiedAddress ? (
                    <Check className="w-4 h-4 text-ksc-mint" />
                  ) : (
                    <Copy className="w-4 h-4 text-ksc-gray" />
                  )}
                </button>
              </div>
              {walletInfo.networkName && <p className="text-sm text-ksc-gray">{walletInfo.networkName}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchBalance(walletInfo.address, walletInfo.chain!)}
              disabled={isLoading}
              className="p-2 hover:bg-ksc-box/50 rounded-lg transition-colors"
              title="잔액 새로고침"
            >
              <RefreshCw className={`w-4 h-4 text-ksc-gray ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={disconnectWallet} className="btn-secondary">
              연결 해제
            </button>
          </div>
        </div>

        {/* Mock Wallet 연결 시 mock data 예시 */}
        {walletInfo.isMock && (
          <div className="mb-6 p-4 bg-ksc-box/80 border border-ksc-mint/30 rounded-lg">
            <div className="text-ksc-mint font-bold mb-2">Mock Data 예시</div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-ksc-gray text-sm mb-1">Mock 주소</div>
                <div className="font-mono text-ksc-white break-all">{walletInfo.address}</div>
              </div>
              <div>
                <div className="text-ksc-gray text-sm mb-1">Mock KSC 잔액</div>
                <div className="font-mono text-ksc-mint">{walletInfo.balance.ksc} KSC</div>
              </div>
              <div>
                <div className="text-ksc-gray text-sm mb-1">Mock 최근 거래</div>
                <ul className="text-xs text-ksc-white space-y-1">
                  {transactions.slice(0, 2).map((tx) => (
                    <li key={tx.hash} className="flex items-center space-x-2">
                      <span className="font-mono">{tx.hash.slice(0, 8)}...</span>
                      <span className="text-ksc-mint">
                        {tx.amount} {tx.currency}
                      </span>
                      <span className="badge-mock">{tx.status === "confirmed" ? "완료" : "처리중"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 잔액 정보 */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
            <div className="flex items-center justify-between">
              <span className="text-ksc-gray">XRP 잔액</span>
              <span className="font-semibold text-ksc-mint">{formatBalance(walletInfo.balance.xrp)} XRP</span>
            </div>
          </div>
          <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
            <div className="flex items-center justify-between">
              <span className="text-ksc-gray">KSC 잔액</span>
              <span className="font-semibold text-ksc-mint">{formatBalance(walletInfo.balance.ksc)} KSC</span>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="card mb-6">
        <div className="border-b border-ksc-box/50">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "개요", icon: "📊" },
              { id: "send", label: "전송", icon: "💸" },
              { id: "transactions", label: "거래내역", icon: "📋" },
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
              <h3 className="text-lg font-semibold text-ksc-white">지갑 개요</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
                  <div className="text-2xl font-bold text-ksc-mint">{formatBalance(walletInfo.balance.ksc)}</div>
                  <div className="text-sm text-ksc-gray">총 KSC 보유량</div>
                </div>

                <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
                  <div className="text-2xl font-bold text-ksc-mint">{transactions.length}</div>
                  <div className="text-sm text-ksc-gray">총 거래 수</div>
                </div>

                <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
                  <div className="text-2xl font-bold text-ksc-mint">{walletInfo.chain?.toUpperCase()}</div>
                  <div className="text-sm text-ksc-gray">연결된 체인</div>
                </div>
              </div>

              <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-mint/20">
                <h4 className="font-semibold text-ksc-mint mb-2">최근 거래</h4>
                {transactions.slice(0, 3).length > 0 ? (
                  <div className="space-y-2">
                    {transactions.slice(0, 3).map((tx) => (
                      <div key={tx.hash} className="flex items-center justify-between text-sm">
                        <span className="text-ksc-gray">
                          {tx.amount} {tx.currency}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              tx.status === "confirmed"
                                ? "bg-success-100 text-success-800"
                                : tx.status === "pending"
                                ? "bg-warning-100 text-warning-800"
                                : "bg-error-100 text-error-800"
                            }`}
                          >
                            {tx.status === "confirmed" ? "완료" : tx.status === "pending" ? "처리중" : "실패"}
                          </span>
                          {tx.explorerUrl && (
                            <a
                              href={tx.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ksc-mint hover:text-ksc-mint/80"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-ksc-gray">거래 내역이 없습니다.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "send" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-ksc-white">KSC 전송</h3>

              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="label">받는 주소</label>
                  <input
                    type="text"
                    value={sendForm.to}
                    onChange={(e) => setSendForm((prev) => ({ ...prev, to: e.target.value }))}
                    placeholder="받는 주소를 입력하세요"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">전송 금액 (KSC)</label>
                  <input
                    type="number"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">체인 선택</label>
                  <select
                    value={sendForm.chain}
                    onChange={(e) =>
                      setSendForm((prev) => ({ ...prev, chain: e.target.value as "xrpl" | "avalanche" }))
                    }
                    className="input-field"
                  >
                    <option value="xrpl">XRPL</option>
                    <option value="avalanche">Avalanche</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !sendForm.to || !sendForm.amount}
                  className="w-full btn-primary disabled:bg-ksc-gray disabled:cursor-not-allowed"
                >
                  {isLoading ? "전송 중..." : "전송하기"}
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
                <h3 className="text-lg font-semibold text-ksc-white">거래 내역</h3>
                <button
                  onClick={() => fetchBalance(walletInfo.address, walletInfo.chain!)}
                  disabled={isLoading}
                  className="flex items-center space-x-2 text-ksc-mint hover:text-ksc-mint/80 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  <span>새로고침</span>
                </button>
              </div>

              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-ksc-box/50">
                    <thead className="bg-ksc-box/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          해시
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          보낸 주소
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          받는 주소
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          금액
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          시간
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ksc-gray uppercase tracking-wider">
                          탐색기
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-ksc-box/20 divide-y divide-ksc-box/30">
                      {transactions.map((tx) => (
                        <tr key={tx.hash} className="hover:bg-ksc-box/30">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-ksc-white">
                            {formatAddress(tx.hash)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-ksc-white">
                            {formatAddress(tx.from)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-ksc-white">{formatAddress(tx.to)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-ksc-white">
                            {formatBalance(tx.amount)} {tx.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                tx.status === "confirmed"
                                  ? "bg-success-100 text-success-800"
                                  : tx.status === "pending"
                                  ? "bg-warning-100 text-warning-800"
                                  : "bg-error-100 text-error-800"
                              }`}
                            >
                              {tx.status === "confirmed" ? "완료" : tx.status === "pending" ? "처리중" : "실패"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-ksc-gray">
                            {formatDate(tx.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <a
                              href={getExplorerUrl(tx.hash, walletInfo.chain!)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ksc-mint hover:text-ksc-mint/80"
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
                  <p className="text-ksc-gray">거래 내역이 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
