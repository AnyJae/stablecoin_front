import { AdminInterface } from "@/components/admin/admin-interface";

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              KSC <span className="text-gradient">관리자</span>
            </h1>
            <p className="text-lg text-gray-600">KSC 토큰 발행, 소각 및 시스템 모니터링</p>
          </div>
          <AdminInterface />
        </div>
      </main>
    </div>
  );
}
