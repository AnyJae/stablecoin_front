import WalletInterface from '@/components/wallet/wallet-interface';

export default function WalletPage() {
  return (
    <div className="min-h-screen">

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-ksc-white mb-4">
              KSC <span className="text-ksc-white">지갑</span>
            </h1>
            <p className="text-lg text-ksc-gray">
              지갑을 연결하고 KSC를 관리하세요
            </p>
          </div>
          <WalletInterface />
        </div>
      </main>
   
    </div>
  );
} 