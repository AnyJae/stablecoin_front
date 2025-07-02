import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { DashboardInterface } from '@/components/dashboard/dashboard-interface';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-ksc-background text-ksc-white">

      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <DashboardInterface />
        </div>
      </main>

    </div>
  );
} 