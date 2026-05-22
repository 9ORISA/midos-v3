import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../context/ApiContext';
import logo from '../assets/logo.svg';
import homeIcon from '../assets/icons/home-icon.svg';
import mapIcon from '../assets/icons/map-icon.svg';
import inventoryIcon from '../assets/icons/inventory-icon.svg';
import logsIcon from '../assets/icons/logs-icon.svg';
import guessIcon from '../assets/icons/guess-icon.svg';

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const navItems = [
  { id: 'home', label: 'HOME', icon: homeIcon },
  { id: 'map', label: 'MAP', icon: mapIcon },
  { id: 'govguess', label: 'GOV GUESS', icon: guessIcon },
  { id: 'inventory', label: 'INVENTORY', icon: inventoryIcon },
  { id: 'logs', label: 'LOGS', icon: logsIcon },
];

export default function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { stats, polls } = useApi();

  const hasActivePoll = polls && polls.some(p => {
    if (!p.end_time) return p.next_gov_id === null;
    const endTime = new Date(p.end_time).getTime();
    const now = Date.now();
    if (now < endTime) return true;
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    return now < endTime + twelveHoursMs;
  });

  const visibleNavItems = navItems.filter(item => {
    if (item.id === 'govguess') return hasActivePoll;
    return true;
  });

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-pixel-dark/95 backdrop-blur-sm border-b-2 border-pixel-yellow/30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <motion.button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src={logo} alt="Midos" className="h-8 w-auto object-contain" />
          </motion.button>

          <div className="hidden md:flex items-center gap-1">
            {visibleNavItems.map(item => (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 font-[family-name:var(--font-family-pixel)] text-[8px] tracking-wider transition-all cursor-pointer flex items-center gap-2 ${activeSection === item.id
                  ? 'text-pixel-yellow text-glow'
                  : 'text-pixel-white/50 hover:text-pixel-white'
                  }`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 1 }}
              >
                <img src={item.icon} alt="" className={`w-4 h-4 ${activeSection === item.id ? 'icon-glow' : 'opacity-50'}`} />
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-pixel-yellow"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => onNavigate('profile')}
              className={`pixel-panel px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-all ${activeSection === 'profile'
                ? 'border-pixel-yellow glow-yellow scale-[1.02]'
                : 'hover:border-pixel-yellow hover:scale-[1.02]'
                }`}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-pixel-yellow text-sm">💰</span>
              <span className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-[10px]">
                {stats?.balance || 0} DT
              </span>
            </motion.button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-pixel-white p-2 cursor-pointer"
          >
            <div className="space-y-1.5">
              <motion.div animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 8 : 0 }} className="w-6 h-0.5 bg-pixel-yellow" />
              <motion.div animate={{ opacity: mobileOpen ? 0 : 1 }} className="w-6 h-0.5 bg-pixel-yellow" />
              <motion.div animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -8 : 0 }} className="w-6 h-0.5 bg-pixel-yellow" />
            </div>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-0 right-0 z-40 bg-pixel-dark/98 backdrop-blur-md border-b-2 border-pixel-yellow/30 md:hidden"
          >
            <div className="p-4 space-y-1">
              {visibleNavItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-full text-left px-4 py-3 font-[family-name:var(--font-family-pixel)] text-[9px] flex items-center gap-3 rounded transition-colors cursor-pointer ${activeSection === item.id
                    ? 'text-pixel-yellow bg-pixel-yellow/10'
                    : 'text-pixel-white/60 hover:text-pixel-white hover:bg-pixel-white/5'
                    }`}
                >
                  <img src={item.icon} alt="" className="w-5 h-5" />
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
