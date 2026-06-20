"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Reveal from "@/components/animations/Reveal";

const extensions = [
  { tld: ".com", price: "₹799/yr", popular: true },
  { tld: ".in", price: "₹499/yr", popular: false },
  { tld: ".io", price: "₹2,499/yr", popular: true },
  { tld: ".dev", price: "₹999/yr", popular: false },
  { tld: ".net", price: "₹899/yr", popular: false },
  { tld: ".store", price: "₹299/yr", popular: false },
];

export default function DomainSearch() {
  const [query, setQuery] = useState("");

  return (
    <section id="domains" className="py-20 lg:py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Find your perfect domain
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Search 400+ domain extensions and register in seconds. Free WHOIS
            privacy included with every domain.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl border border-gray-200 shadow-card"
          >
            <div className="flex items-center gap-3 flex-1 px-4">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for your domain name…"
                className="w-full py-3.5 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
                aria-label="Domain search"
              />
            </div>
            <Button size="lg" type="submit" className="gap-2">
              Search Domain
            </Button>
          </form>
        </Reveal>

        <Reveal delay={0.15} className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {extensions.map((ext) => (
            <div
              key={ext.tld}
              className="relative p-4 bg-white rounded-xl border border-gray-100 text-center hover:border-orange-200 hover:shadow-card transition-all duration-300"
            >
              {ext.popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white bg-[#FF6B00] px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              <p className="text-lg font-bold text-gray-900">{ext.tld}</p>
              <p className="mt-1 text-xs font-medium text-[#0066FF]">{ext.price}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
