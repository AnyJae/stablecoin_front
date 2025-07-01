import { Footer } from "@/components/footer";
import { DocsInterface } from "@/components/docs/docs-interface";

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              KSC <span className="text-gradient">문서</span>
            </h1>
            <p className="text-lg text-gray-600">KSC 스테이블코인 프로젝트 기술 문서 및 가이드</p>
          </div>
          <DocsInterface />
        </div>
      </main>
      <Footer />
    </div>
  );
}
