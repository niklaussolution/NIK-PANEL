"use client";

import dynamic from "next/dynamic";

// react-simple-maps computes SVG path `d` values using floating-point math
// that differs between SSR and client rendering, causing a hydration mismatch.
// Wrapping with ssr:false inside a Client Component is the correct App Router fix.
const DashboardPreview = dynamic(() => import("./DashboardPreview"), {
  ssr: false,
  loading: () => (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[520px] rounded-3xl border border-gray-100 bg-gray-50 animate-pulse" />
      </div>
    </section>
  ),
});

export default DashboardPreview;
