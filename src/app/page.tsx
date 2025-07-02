import Link from "next/link";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
// Testing

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
