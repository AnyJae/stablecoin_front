import { Features } from "@/components/features";
import { Hero } from "@/components/hero";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ksc-background text-ksc-white">
      <main>
        <Hero />
        <Features />
      </main>
    </div>
  );
}
