"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";

const GEO_URL = "/world-110m.json";

// Real datacenter locations — [longitude, latitude]
const SERVERS: {
  id: string;
  label: string;
  coordinates: [number, number];
  active: boolean;
}[] = [
  { id: "newyork",   label: "New York",  coordinates: [-74.0,  40.71], active: true  },
  { id: "saopaulo",  label: "São Paulo", coordinates: [-46.63, -23.55], active: false },
  { id: "london",    label: "London",    coordinates: [-0.12,  51.5],  active: true  },
  { id: "frankfurt", label: "Frankfurt", coordinates: [8.68,   50.11], active: true  },
  { id: "mumbai",    label: "Mumbai",    coordinates: [72.87,  19.07], active: true  },
  { id: "singapore", label: "Singapore", coordinates: [103.8,  1.35],  active: true  },
  { id: "tokyo",     label: "Tokyo",     coordinates: [139.7,  35.68], active: false },
  { id: "sydney",    label: "Sydney",    coordinates: [151.21, -33.87], active: true  },
];

const CONNECTIONS: [string, string][] = [
  ["newyork", "london"],
  ["london", "frankfurt"],
  ["frankfurt", "mumbai"],
  ["mumbai", "singapore"],
  ["singapore", "tokyo"],
  ["singapore", "sydney"],
  ["newyork", "saopaulo"],
  ["frankfurt", "newyork"],
];

function getServer(id: string) {
  return SERVERS.find((s) => s.id === id)!;
}

export default function WorldMap() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold text-[#FF6B00] tracking-wide uppercase">
            Global Infrastructure
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Deploy closer to your users
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Strategically located datacenters across 8 regions deliver low-latency VPS hosting wherever your audience is.
          </p>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative bg-gray-50 border border-gray-100 rounded-[20px] overflow-hidden shadow-card"
        >
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 130, center: [10, 18] }}
            width={980}
            height={460}
            style={{ width: "100%", height: "auto" }}
          >
            {/* Real country geography */}
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#E5E7EB"
                    stroke="#F9FAFB"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#D1D5DB", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Connection arcs */}
            {CONNECTIONS.map(([from, to], i) => (
              <Line
                key={`${from}-${to}`}
                from={getServer(from).coordinates}
                to={getServer(to).coordinates}
                stroke="#FF6B00"
                strokeWidth={1}
                strokeOpacity={0.35}
                strokeLinecap="round"
                strokeDasharray="4 4"
                style={{
                  animation: `dash 1.4s linear ${0.4 + i * 0.1}s both`,
                }}
              />
            ))}

            {/* Server markers */}
            {SERVERS.map((server, i) => (
              <Marker key={server.id} coordinates={server.coordinates}>
                {/* Pulse ring for active nodes */}
                {server.active && (
                  <circle
                    r={5}
                    fill="none"
                    stroke="#FF6B00"
                    strokeWidth={1.5}
                    opacity={0.5}
                  >
                    <animate
                      attributeName="r"
                      from="5"
                      to="16"
                      dur="2.2s"
                      begin={`${i * 0.25}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.6"
                      to="0"
                      dur="2.2s"
                      begin={`${i * 0.25}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Node dot */}
                <circle
                  r={server.active ? 4.5 : 3.5}
                  fill={server.active ? "#FF6B00" : "#9CA3AF"}
                  stroke="#FFFFFF"
                  strokeWidth={1.8}
                />
                {/* Label */}
                <text
                  textAnchor="middle"
                  y={-11}
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    fill: server.active ? "#374151" : "#9CA3AF",
                  }}
                >
                  {server.label}
                </text>
              </Marker>
            ))}
          </ComposableMap>

          {/* Live badge */}
          <div className="absolute top-5 right-5 flex items-center gap-2 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-gray-700">All regions online</span>
          </div>

          {/* Legend */}
          <div className="absolute bottom-5 left-5 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-[#FF6B00] rounded-full" />
              <span className="text-xs text-gray-500 font-medium">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
              <span className="text-xs text-gray-500 font-medium">Coming soon</span>
            </div>
          </div>
        </motion.div>

        {/* Region stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Regions", value: "8" },
            { label: "Network Uptime", value: "99.99%" },
            { label: "Avg. Latency", value: "< 5ms" },
            { label: "Bandwidth", value: "10 Gbps" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
              className="bg-gray-50 border border-gray-100 rounded-[14px] p-4 text-center"
            >
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
