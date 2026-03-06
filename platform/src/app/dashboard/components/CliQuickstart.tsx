'use client';

import { motion } from 'framer-motion';

export function CliQuickstart() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      <h3 className="font-semibold text-lg text-white mb-2">
        Run your first analysis
      </h3>
      <p className="text-slate-400 text-sm mb-4">
        Generate a report JSON and upload it to see your AI readiness scores.
      </p>
      <div className="font-mono text-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">$</span>
          <span className="text-cyan-400">
            npx @aiready/cli scan . --output json{' > '}report.json
          </span>
        </div>
        <div className="text-slate-500 text-xs">
          # then upload report.json via the button on your repo card
        </div>
      </div>
    </motion.section>
  );
}
