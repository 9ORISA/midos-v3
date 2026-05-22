import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../context/ApiContext';
import logsIcon from '../assets/icons/logs-icon.svg';

export default function LogSystem() {
  const { logs, stats } = useApi();
  const [filterDay, setFilterDay] = useState<number | 'all'>('all');

  const days = [...new Set(logs.map(l => l.day_number))].sort((a, b) => b - a);

  const filtered = filterDay === 'all'
    ? logs
    : logs.filter(l => l.day_number === filterDay);

  return (
    <section id="logs" className="py-16 px-4 relative">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src={logsIcon} alt="" className="w-8 h-8 icon-glow" />
            <h2 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-lg md:text-xl text-glow">
              TRAVEL LOGS
            </h2>
            <img src={logsIcon} alt="" className="w-8 h-8 icon-glow" />
          </div>
          <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/50 text-lg">
            Journey diary & balance history
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 mb-6">
          <div className="pixel-panel px-4 py-2 text-center">
            <span className="font-[family-name:var(--font-family-pixel)] text-pixel-green text-sm">+{Number(stats?.totalEarned || 0).toFixed(2)}</span>
            <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-xs">Earned</p>
          </div>
          <div className="pixel-panel px-4 py-2 text-center">
            <span className="font-[family-name:var(--font-family-pixel)] text-pixel-red text-sm">-{Number(stats?.totalSpent || 0).toFixed(2)}</span>
            <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-xs">Spent</p>
          </div>
          <div className="pixel-panel px-4 py-2 text-center">
            <span className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-sm">{Number(stats?.balance || 0).toFixed(2)} DT</span>
            <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-xs">Balance</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setFilterDay('all')}
            className={`font-[family-name:var(--font-family-pixel)] text-[8px] px-3 py-1.5 cursor-pointer transition-all ${filterDay === 'all' ? 'bg-pixel-yellow text-pixel-dark' : 'bg-pixel-gray text-pixel-white/40'
              }`}
          >
            ALL
          </button>
          {days.map(d => (
            <button
              key={d}
              onClick={() => setFilterDay(d)}
              className={`font-[family-name:var(--font-family-pixel)] text-[8px] px-3 py-1.5 cursor-pointer transition-all ${filterDay === d ? 'bg-pixel-yellow text-pixel-dark' : 'bg-pixel-gray text-pixel-white/40'
                }`}
            >
              DAY {d}
            </button>
          ))}
        </div>

        <motion.div
          className="pixel-panel p-4 max-h-[400px] overflow-y-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {filtered.length === 0 ? (
            <p className="text-center font-[family-name:var(--font-family-vt)] text-pixel-white/30 py-8">
              No logs yet
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((log, i) => (
                <motion.div
                  key={log.id}
                  className="flex items-center gap-3 py-2 border-b border-pixel-white/5 last:border-0"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <span className="font-[family-name:var(--font-family-pixel)] text-[7px] bg-pixel-yellow/10 text-pixel-yellow px-2 py-1 rounded flex-shrink-0">
                    D{log.day_number}
                  </span>
                  <span className={`font-[family-name:var(--font-family-pixel)] text-[8px] px-2 py-0.5 rounded flex-shrink-0 ${log.type === 'earned' ? 'bg-pixel-green/20 text-pixel-green' : 'bg-pixel-red/20 text-pixel-red'
                    }`}>
                    {log.type === 'earned' ? '+' : '-'}{Number(log.amount).toFixed(2)}
                  </span>
                  <span className="font-[family-name:var(--font-family-pixelify)] text-pixel-white/70 text-sm flex-1">
                    {log.description}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
