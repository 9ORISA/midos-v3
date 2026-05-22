import { motion } from 'framer-motion';
import { useApi } from '../context/ApiContext';
import logo from '../assets/logo.svg';
import homeIcon from '../assets/icons/home-icon.svg';
import character from '../assets/logo.svg';
import YellowLogo from '../assets/re-Yellow-Logo.svg';
import WhiteLogo from '../assets/re-White-Logo.svg';

interface HeroProps {
  onNavigate: (section: string) => void;
}

export default function HeroSection({ onNavigate }: HeroProps) {
  const { stats } = useApi();

  const visited = stats?.visited || 0;
  const balance = Number(stats?.balance || 0);
  const totalEarned = Number(stats?.totalEarned || 0);

  const videos = stats?.videos || 0;
  const currentLocation = stats?.currentLocation;
  const progress = Math.round((visited / 24) * 100);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-10 overflow-hidden">
      <div className="absolute inset-0 pixel-grid opacity-30" />

      <motion.div
        className="relative mb-6"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <img src={YellowLogo} alt="Midos" className="h-24 md:h-28 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />

      </motion.div>

      <motion.div
        className="text-center mb-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src={homeIcon} alt="" className="w-7 h-7 icon-glow" />
          <h1 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-xl md:text-2xl text-glow">
            MIDOS QUEST
          </h1>
          <img src={homeIcon} alt="" className="w-7 h-7 icon-glow" />
        </div>

        <motion.p
          className="font-[family-name:var(--font-family-vt)] text-pixel-white/50 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Dwira m3a Midos, 24 wileya f jib
        </motion.p>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <StatBox label="Visited" value={`${visited}/24`} color="text-pixel-yellow" />
        <StatBox label="Balance" value={`${balance.toFixed(2)} DT`} color="text-pixel-green" />
        <StatBox label="Earned" value={`${totalEarned.toFixed(2)} DT`} color="text-pixel-blue" />
        <StatBox label="Videos" value={`${videos}`} color="text-pixel-purple" />
      </motion.div>

      <motion.div
        className="w-full max-w-xl mb-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-[family-name:var(--font-family-pixel)] text-[8px] text-pixel-white/60">JOURNEY PROGRESS</span>
          <span className="font-[family-name:var(--font-family-pixel)] text-[10px] text-pixel-yellow">{progress}%</span>
        </div>
        <div className="pixel-border-thin bg-pixel-dark p-1 relative">
          <div className="h-5 bg-pixel-gray relative overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pixel-yellow via-pixel-gold to-pixel-yellow"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 2, delay: 1.4, ease: 'easeOut' }}
            />
          </div>
          <motion.img
            src={character}
            alt=""
            className="absolute top-1/2 -translate-y-1/2 w-8 h-10 drop-shadow-[0_0_10px_rgba(255,213,74,1)]"
            initial={{ left: '0%' }}
            animate={{ left: `calc(${Math.max(progress - 2, 0)}% - 12px)` }}
            transition={{ duration: 2, delay: 1.4, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-sm">Tunis</span>
          <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-sm">Tataouine</span>
        </div>
      </motion.div>

      {currentLocation && (
        <motion.div
          className="pixel-panel px-5 py-2 mb-6 flex items-center gap-3 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="w-2 h-2 rounded-full bg-pixel-green animate-pulse" />
          <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/70 text-base">Currently in:</span>
          <span className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-[10px]">{currentLocation.toUpperCase()}</span>
        </motion.div>
      )}

      <motion.div
        className="flex flex-col sm:flex-row gap-3 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7 }}
      >
        <motion.button
          onClick={() => onNavigate('map')}
          className="retro-btn cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          EXPLORE MAP
        </motion.button>
        <motion.button
          onClick={() => onNavigate('inventory')}
          className="retro-btn cursor-pointer !bg-pixel-gray !text-pixel-yellow !shadow-[0_4px_0_#000,0_6px_10px_rgba(0,0,0,0.3)]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          VIEW INVENTORY
        </motion.button>
      </motion.div>
    </section>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      className="pixel-panel p-3 text-center"
      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255,213,74,0.2)' }}
    >
      <div className={`font-[family-name:var(--font-family-pixel)] text-sm ${color}`}>
        {value}
      </div>
      <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-sm mt-1">{label}</p>
    </motion.div>
  );
}
