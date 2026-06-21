"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Terminal, Copy, Check } from "lucide-react";

interface Command {
  id: string;
  label: string;
  command: string;
  description: string;
  order: number;
}

export default function Commands() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "commands"), orderBy("order", "asc"));
    return onSnapshot(q, (snap) => {
      setCommands(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Command)));
    });
  }, []);

  const copy = (id: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (commands.length === 0) return null;

  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] text-xs font-semibold uppercase tracking-wider mb-4">
            <Terminal className="w-3.5 h-3.5" />
            Quick Commands
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Manage your VPS in seconds
          </h2>
          <p className="mt-3 text-gray-400 max-w-xl mx-auto text-sm">
            Copy and run these commands directly on your server to get things done fast.
          </p>
        </motion.div>

        <div className="space-y-3">
          {commands.map((cmd, i) => (
            <motion.div
              key={cmd.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group bg-gray-900 border border-gray-800 rounded-[14px] px-5 py-4 flex items-center gap-4 hover:border-gray-700 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#FF6B00] uppercase tracking-wide">{cmd.label}</span>
                </div>
                <code className="text-sm text-green-400 font-mono break-all">{cmd.command}</code>
                {cmd.description && (
                  <p className="text-xs text-gray-500 mt-1">{cmd.description}</p>
                )}
              </div>
              <button
                onClick={() => copy(cmd.id, cmd.command)}
                className="flex-shrink-0 w-8 h-8 rounded-[8px] bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                title="Copy command"
              >
                {copied === cmd.id ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
