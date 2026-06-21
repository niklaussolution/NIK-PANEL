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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="bg-white rounded-[16px] border border-gray-100 shadow-card mt-6"
    >
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
        <Terminal className="w-4 h-4 text-[#FF6B00]" />
        <h2 className="text-sm font-semibold text-gray-900">Quick Commands</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {commands.map((cmd, i) => (
          <motion.div
            key={cmd.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold text-[#FF6B00] uppercase tracking-wide">{cmd.label}</span>
              <code className="block text-sm text-gray-700 font-mono truncate mt-0.5">{cmd.command}</code>
              {cmd.description && (
                <p className="text-xs text-gray-400 mt-0.5">{cmd.description}</p>
              )}
            </div>
            <button
              onClick={() => copy(cmd.id, cmd.command)}
              className="flex-shrink-0 w-7 h-7 rounded-[7px] bg-gray-100 hover:bg-orange-50 flex items-center justify-center text-gray-400 hover:text-[#FF6B00] transition-all opacity-0 group-hover:opacity-100"
              title="Copy"
            >
              {copied === cmd.id ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
