"use client";

import { Copy, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  network: "XRPL" | "Avalanche";
  timestamp: string;
  status: "confirmed" | "pending" | "failed";
  fee: string;
  blockNumber?: string;
  confirmations?: number;
}

interface NetworkStats {
  network: "XRPL" | "Avalanche";
  totalTransactions: number;
  totalVolume: string;
  averageFee: string;
  lastBlock: string;
  activeAddresses: number;
}

export function ScannerInterface() {
  const [selectedNetwork, setSelectedNetwork] = useState<"all" | "XRPL" | "Avalanche">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Mock data for transactions
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      from: "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      to: "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      amount: "1,000,000",
      token: "KSC",
      network: "XRPL",
      timestamp: "2024-01-15T10:30:00Z",
      status: "confirmed",
      fee: "0.000012",
      blockNumber: "12345678",
      confirmations: 15,
    },
    {
      id: "2",
      hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      from: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      to: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      amount: "500,000",
      token: "KSC",
      network: "Avalanche",
      timestamp: "2024-01-15T10:25:00Z",
      status: "confirmed",
      fee: "0.000023",
      blockNumber: "98765432",
      confirmations: 8,
    },
    {
      id: "3",
      hash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      from: "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      to: "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      amount: "2,500,000",
      token: "KSC",
      network: "XRPL",
      timestamp: "2024-01-15T10:20:00Z",
      status: "pending",
      fee: "0.000012",
    },
    {
      id: "4",
      hash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
      from: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      to: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      amount: "750,000",
      token: "KSC",
      network: "Avalanche",
      timestamp: "2024-01-15T10:15:00Z",
      status: "confirmed",
      fee: "0.000023",
      blockNumber: "98765431",
      confirmations: 12,
    },
    {
      id: "5",
      hash: "0x5555555555555555555555555555555555555555555555555555555555555555",
      from: "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      to: "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      amount: "3,000,000",
      token: "KSC",
      network: "XRPL",
      timestamp: "2024-01-15T10:10:00Z",
      status: "failed",
      fee: "0.000012",
    },
  ];

  // Mock data for network stats
  const mockNetworkStats: NetworkStats[] = [
    {
      network: "XRPL",
      totalTransactions: 15420,
      totalVolume: "₩45,678,900,000",
      averageFee: "₩0.000012",
      lastBlock: "12345678",
      activeAddresses: 1250,
    },
    {
      network: "Avalanche",
      totalTransactions: 8920,
      totalVolume: "₩23,456,700,000",
      averageFee: "₩0.000023",
      lastBlock: "98765432",
      activeAddresses: 890,
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTransactions(mockTransactions);
    setNetworkStats(mockNetworkStats);
    setIsLoading(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(text);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-500 bg-green-500/10";
      case "pending":
        return "text-yellow-500 bg-yellow-500/10";
      case "failed":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getNetworkColor = (network: string) => {
    switch (network) {
      case "XRPL":
        return "text-blue-500 bg-blue-500/10";
      case "Avalanche":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesNetwork = selectedNetwork === "all" || tx.network === selectedNetwork;
    const matchesSearch =
      searchQuery === "" ||
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNetwork && matchesSearch;
  });

  const formatAddress = (address: string) => {
    if (address.startsWith("r")) {
      // XRPL address
      return `${address.slice(0, 8)}...${address.slice(-8)}`;
    } else {
      // Ethereum/Avalanche address
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {networkStats.map((stat) => (
          <div key={stat.network} className="card bg-ksc-card border-ksc-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-ksc-white">{stat.network} 네트워크</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNetworkColor(stat.network)}`}>
                {stat.network}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-ksc-gray text-sm">총 트랜잭션</p>
                <p className="text-2xl font-bold text-ksc-mint">{stat.totalTransactions.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-ksc-gray text-sm">총 거래량</p>
                <p className="text-2xl font-bold text-ksc-mint">{stat.totalVolume}</p>
              </div>
              <div>
                <p className="text-ksc-gray text-sm">평균 수수료</p>
                <p className="text-lg font-semibold text-ksc-mint">{stat.averageFee}</p>
              </div>
              <div>
                <p className="text-ksc-gray text-sm">활성 주소</p>
                <p className="text-lg font-semibold text-ksc-mint">{stat.activeAddresses.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="card bg-ksc-card border-ksc-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ksc-gray w-5 h-5" />
            <input
              type="text"
              placeholder="트랜잭션 해시, 주소 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-ksc-box border border-ksc-border rounded-lg text-ksc-white placeholder-ksc-gray focus:outline-none focus:ring-2 focus:ring-ksc-mint"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value as "all" | "XRPL" | "Avalanche")}
              className="px-4 py-3 bg-ksc-box border border-ksc-border rounded-lg text-ksc-white focus:outline-none focus:ring-2 focus:ring-ksc-mint"
            >
              <option value="all">모든 네트워크</option>
              <option value="XRPL">XRPL</option>
              <option value="Avalanche">Avalanche</option>
            </select>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-4 py-3 bg-ksc-mint text-ksc-black rounded-lg hover:bg-ksc-mint/80 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card bg-ksc-card border-ksc-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ksc-box/50">
              <tr>
                <th className="px-6 py-4 text-left text-ksc-gray font-semibold">트랜잭션</th>
                <th className="px-6 py-4 text-left text-ksc-gray font-semibold">네트워크</th>
                <th className="px-6 py-4 text-left text-ksc-gray font-semibold">보낸 주소</th>
                <th className="px-6 py-4 text-left text-ksc-gray font-semibold">받은 주소</th>
                <th className="px-6 py-4 text-left text-ksc-gray font-semibold">금액</th>
                <th className="px-6 py-4 text-left text-ksc-gray font-semibold">상태</th>
                <th className="px-6 py-4 text-left text-ksc-gray font-semibold">시간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ksc-border">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-ksc-box/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-ksc-white font-mono text-sm">{formatHash(tx.hash)}</span>
                      <button
                        onClick={() => copyToClipboard(tx.hash)}
                        className="text-ksc-gray hover:text-ksc-mint transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {copiedHash === tx.hash && <span className="text-ksc-mint text-xs">복사됨!</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkColor(tx.network)}`}>
                      {tx.network}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-ksc-white font-mono text-sm">{formatAddress(tx.from)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-ksc-white font-mono text-sm">{formatAddress(tx.to)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-ksc-mint font-semibold">
                        {tx.amount} {tx.token}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {tx.status === "confirmed" ? "확인됨" : tx.status === "pending" ? "대기중" : "실패"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-ksc-gray text-sm">{new Date(tx.timestamp).toLocaleString("ko-KR")}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-ksc-gray">트랜잭션을 찾을 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
