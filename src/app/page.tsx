import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import VPSPlans from "@/components/home/VPSPlans";
import Features from "@/components/home/Features";
import DashboardPreview from "@/components/home/DashboardPreviewWrapper";
import Testimonials from "@/components/home/Testimonials";
import Commands from "@/components/home/Commands";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <VPSPlans />
        <Features />
        <DashboardPreview />
        <Testimonials />
        <Commands />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
