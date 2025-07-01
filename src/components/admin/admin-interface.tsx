"use client";

import { useAdmin } from "@/hooks/useAdmin";
import { useState } from "react";

export function AdminInterface() {
  const { contractInfo, mintKSC, burnKSC, emergencyPause, emergencyUnpause, isLoading, error } = useAdmin();

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
    <div className="max-w-6xl mx-auto p-6">
      {/* 컨트랙트 정보 */}
      <div className="card bg-ksc-card border-ksc-border p-6 mb-6">
        <h2 className="text-xl font-bold text-ksc-white mb-4">컨트랙트 정보</h2>

        {contractInfo ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-ksc-mint/20 rounded-lg p-4 border border-ksc-mint/30">
              <div className="text-2xl font-bold text-ksc-mint">{formatNumber(contractInfo.totalSupply)}</div>
              <div className="text-sm text-ksc-gray">총 공급량 (KSC)</div>
            </div>

            <div className="bg-ksc-mint/20 rounded-lg p-4 border border-ksc-mint/30">
              <div className="text-2xl font-bold text-ksc-mint">{formatNumber(contractInfo.totalMinted)}</div>
              <div className="text-sm text-ksc-gray">총 발행량 (KSC)</div>
            </div>

            <div className="bg-ksc-mint/20 rounded-lg p-4 border border-ksc-mint/30">
              <div className="text-2xl font-bold text-ksc-mint">{formatNumber(contractInfo.totalBurned)}</div>
              <div className="text-sm text-ksc-gray">총 소각량 (KSC)</div>
            </div>
          </div>
        ) : (
          <p className="text-ksc-gray">컨트랙트 정보를 불러오는 중...</p>
        )}
      </div>

      {/* 관리자 기능 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 발행 기능 */}
        <div className="card bg-ksc-card border-ksc-border p-6">
          <h3 className="text-lg font-semibold text-ksc-white mb-4">KSC 발행</h3>

          <form onSubmit={handleMint} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ksc-gray mb-2">받는 주소</label>
              <input
                type="text"
                value={mintForm.to}
                onChange={(e) => setMintForm((prev) => ({ ...prev, to: e.target.value }))}
                placeholder="0x..."
                className="w-full px-3 py-2 bg-ksc-box border border-ksc-border rounded-lg text-ksc-white placeholder-ksc-gray focus:ring-2 focus:ring-ksc-mint focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ksc-gray mb-2">발행 금액 (KSC)</label>
              <input
                type="number"
                value={mintForm.amount}
                onChange={(e) => setMintForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 bg-ksc-box border border-ksc-border rounded-lg text-ksc-white placeholder-ksc-gray focus:ring-2 focus:ring-ksc-mint focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !mintForm.to || !mintForm.amount}
              className="w-full bg-ksc-mint hover:bg-ksc-mint/80 disabled:bg-ksc-box/50 text-ksc-black font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? "발행 중..." : "KSC 발행"}
            </button>
          </form>
        </div>

        {/* 소각 기능 */}
        <div className="card bg-ksc-card border-ksc-border p-6">
          <h3 className="text-lg font-semibold text-ksc-white mb-4">KSC 소각</h3>

          <form onSubmit={handleBurn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ksc-gray mb-2">소각할 주소</label>
              <input
                type="text"
                value={burnForm.from}
                onChange={(e) => setBurnForm((prev) => ({ ...prev, from: e.target.value }))}
                placeholder="0x..."
                className="w-full px-3 py-2 bg-ksc-box border border-ksc-border rounded-lg text-ksc-white placeholder-ksc-gray focus:ring-2 focus:ring-ksc-mint focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ksc-gray mb-2">소각 금액 (KSC)</label>
              <input
                type="number"
                value={burnForm.amount}
                onChange={(e) => setBurnForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 bg-ksc-box border border-ksc-border rounded-lg text-ksc-white placeholder-ksc-gray focus:ring-2 focus:ring-ksc-mint focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !burnForm.from || !burnForm.amount}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-ksc-box/50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? "소각 중..." : "KSC 소각"}
            </button>
          </form>
        </div>
      </div>

      {/* 긴급 제어 */}
      <div className="card bg-ksc-card border-ksc-border p-6 mt-6">
        <h3 className="text-lg font-semibold text-ksc-white mb-4">긴급 제어</h3>

        <div className="flex space-x-4">
          <button
            onClick={emergencyPause}
            disabled={isLoading}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-ksc-box/50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? "처리 중..." : "일시정지"}
          </button>

          <button
            onClick={emergencyUnpause}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-ksc-box/50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? "처리 중..." : "재개"}
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
