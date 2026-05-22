import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../context/ApiContext';
import mapIcon from '../assets/icons/map-icon.svg';
import tunisiaSvg from '../assets/tunisia.svg';
import character from '../assets/character.png';

interface Governorate {
  id: number;
  name: string;
  name_ar: string;
  x_position: number;
  y_position: number;
  region: string;
  visited: number;
  completed: number;
  visit_day: number | null;
  story: string;
  youtube_url?: string | null;
}

function segLen(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

const STEP_MS = 1100;
const DRAW_MS = 750;

export default function TunisiaMap() {
  const { governorates, stats } = useApi();
  const [selectedGov, setSelectedGov] = useState<Governorate | null>(null);
  const [filter, setFilter] = useState<'all' | 'visited' | 'unvisited'>('all');

  const [isSimulating, setIsSimulating] = useState(false);

  const [simStep, setSimStep] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visited = stats?.visited || 0;
  const completed = stats?.completed || 0;
  const progress = Math.round((visited / 24) * 100);

  const visitedGovsSorted = governorates
    .filter(g => g.visited && g.visit_day !== null)
    .sort((a, b) => (a.visit_day || 0) - (b.visit_day || 0) || a.id - b.id);

  const filtered = governorates.filter(g => {
    if (filter === 'visited') return g.visited;
    if (filter === 'unvisited') return !g.visited;
    return true;
  });

  useEffect(() => {
    if (!isSimulating || simStep < 0) return;
    if (simStep >= visitedGovsSorted.length - 1) {
      timerRef.current = setTimeout(() => {
        setIsSimulating(false);
        setSimStep(-1);
      }, 1800);
      return;
    }
    timerRef.current = setTimeout(() => setSimStep(s => s + 1), STEP_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isSimulating, simStep, visitedGovsSorted.length]);

  const startSim = useCallback(() => {
    if (visitedGovsSorted.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setSimStep(0);
    setIsSimulating(true);
  }, [visitedGovsSorted.length]);

  const stopSim = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSimulating(false);
    setSimStep(-1);
  }, []);

  const charGov = isSimulating && simStep >= 0 ? visitedGovsSorted[simStep] : null;

  const animSeg = isSimulating && simStep > 0
    ? { from: visitedGovsSorted[simStep - 1], to: visitedGovsSorted[simStep] }
    : null;

  const staticLinePoints = isSimulating && simStep > 1
    ? visitedGovsSorted.slice(0, simStep).map(g => `${g.x_position},${g.y_position}`).join(' ')
    : null;

  const fullLinePoints = visitedGovsSorted.length > 1
    ? visitedGovsSorted.map(g => `${g.x_position},${g.y_position}`).join(' ')
    : null;

  return (
    <section id="map" className="py-16 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src={mapIcon} alt="" className="w-8 h-8 icon-glow" />
            <h2 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-lg md:text-xl text-glow">
              TUNISIA MAP
            </h2>
            <img src={mapIcon} alt="" className="w-8 h-8 icon-glow" />
          </div>
          <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/50 text-lg">
            Click on any location to explore
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="pixel-panel px-4 py-2 flex items-center gap-2">
            <span className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-[9px]">{visited}/24</span>
            <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-sm">visited</span>
          </div>
          <div className="pixel-panel px-4 py-2 flex items-center gap-2">
            <span className="font-[family-name:var(--font-family-pixel)] text-pixel-green text-[9px]">{completed}/24</span>
            <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-sm">completed</span>
          </div>
          <div className="pixel-panel px-4 py-2 flex items-center gap-2">
            <span className="font-[family-name:var(--font-family-pixel)] text-pixel-blue text-[9px]">{progress}%</span>
            <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-sm">progress</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {(['all', 'visited', 'unvisited'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-[family-name:var(--font-family-pixel)] text-[8px] px-4 py-2 transition-all cursor-pointer ${filter === f
                  ? 'bg-pixel-yellow text-pixel-dark'
                  : 'bg-pixel-gray text-pixel-white/50 hover:bg-pixel-gray/80'
                }`}
            >
              {f.toUpperCase()}
            </button>
          ))}

          {visitedGovsSorted.length > 1 && (
            <button
              id="simulate-btn"
              onClick={isSimulating ? stopSim : startSim}
              title={isSimulating ? 'Stop simulation' : 'Play journey simulation'}
              className={`relative font-[family-name:var(--font-family-pixel)] text-[8px] px-4 py-2 flex items-center gap-1.5 cursor-pointer overflow-hidden transition-all border ${isSimulating
                  ? 'bg-red-600/80 border-red-400/60 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : 'bg-pixel-dark border-pixel-yellow/60 text-pixel-yellow hover:bg-pixel-yellow/10 hover:shadow-[0_0_10px_rgba(255,213,74,0.4)]'
                }`}
            >
              {isSimulating && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  style={{ animation: 'shimmer 1.2s linear infinite' }} />
              )}
              <span className="text-sm leading-none">{isSimulating ? '■' : '▶'}</span>
              <span>{isSimulating ? 'STOP' : 'SIMULATE'}</span>
            </button>
          )}
        </div>

        <AnimatePresence>
          {charGov && (
            <motion.div
              key={`badge-${charGov.id}`}
              className="flex justify-center mb-3"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <div className="pixel-panel px-5 py-1.5 flex items-center gap-3 border border-pixel-yellow/50 shadow-[0_0_14px_rgba(255,213,74,0.3)]">
                <span className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-[9px]">
                  DAY {charGov.visit_day}
                </span>
                <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/70 text-base">
                  {charGov.name}
                </span>
                <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-base">
                  {charGov.name_ar}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="relative w-full max-w-md mx-auto aspect-[2/3] pixel-panel p-4 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <img src={tunisiaSvg} alt="" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />

          <svg
            className="absolute inset-2 w-full h-full pointer-events-none z-10"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="journeyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD54A" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.85" />
              </linearGradient>
              <filter id="lineShadow">
                <feDropShadow dx="0" dy="0" stdDeviation="0.6"
                  floodColor="#FFD54A" floodOpacity="0.9" />
              </filter>
            </defs>

            {!isSimulating && fullLinePoints && (
              <polyline
                points={fullLinePoints}
                fill="none"
                stroke="url(#journeyGlow)"
                strokeWidth="0.5"
                strokeDasharray="1,2"
                filter="url(#lineShadow)"
              />
            )}

            {isSimulating && staticLinePoints && (
              <polyline
                points={staticLinePoints}
                fill="none"
                stroke="url(#journeyGlow)"
                strokeWidth="0.55"
                strokeDasharray="1,2"
                filter="url(#lineShadow)"
              />
            )}

            {animSeg && (() => {
              const len = segLen(
                animSeg.from.x_position, animSeg.from.y_position,
                animSeg.to.x_position, animSeg.to.y_position
              );
              return (
                <line
                  key={`seg-${animSeg.to.id}`}
                  x1={animSeg.from.x_position}
                  y1={animSeg.from.y_position}
                  x2={animSeg.to.x_position}
                  y2={animSeg.to.y_position}
                  stroke="#FFD54A"
                  strokeWidth="0.7"
                  strokeDasharray={len}
                  strokeDashoffset={len}
                  filter="url(#lineShadow)"
                  style={{
                    animation: `draw-line ${DRAW_MS}ms ease forwards`,
                    '--seg-len': len,
                  } as React.CSSProperties}
                />
              );
            })()}
          </svg>

          {filtered.map((gov, i) => {
            const simIdx = visitedGovsSorted.findIndex(g => g.id === gov.id);
            const isRevealed = isSimulating
              ? simIdx !== -1 && simIdx <= simStep
              : true;
            if (isSimulating && !isRevealed) return null;

            const isCurrentTip = isSimulating && simIdx === simStep;

            return (
              <motion.button
                key={gov.id}
                className="absolute map-dot cursor-pointer group z-20"
                style={{
                  left: `${gov.x_position}%`,
                  top: `${gov.y_position}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: isCurrentTip ? 1.6 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: isSimulating ? 0 : i * 0.02 }}
                onClick={() => setSelectedGov(gov as Governorate)}
                whileHover={{ scale: 1.4 }}
              >
                {!isSimulating && gov.visited === 1 && gov.completed === 0 && (
                  <motion.img
                    src={character}
                    alt="Midos character"
                    className="absolute pointer-events-none z-40"
                    style={{ left: '10%', top: '-100%', transform: 'translate(-50%, -50%)' }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}

                {gov.visited === 1 && (
                  <motion.div
                    className="absolute inset-[-8px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(255,213,74,0.4) 0%, transparent 70%)' }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <div
                  className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 ${gov.completed
                      ? 'bg-pixel-green border-pixel-green shadow-[0_0_8px_rgba(74,222,128,0.6)]'
                      : gov.visited
                        ? 'bg-pixel-yellow border-pixel-yellow shadow-[0_0_8px_rgba(255,213,74,0.6)]'
                        : 'bg-transparent border-pixel-white/30'
                    }`}
                />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-[family-name:var(--font-family-pixel)] text-[6px] text-pixel-white bg-pixel-dark/90 px-1.5 py-0.5 border border-pixel-yellow/30">
                    {gov.name}
                  </span>
                </div>
              </motion.button>
            );
          })}

          <AnimatePresence mode="wait">
            {charGov && (
              <motion.div
                key={`char-${charGov.id}`}
                className="absolute z-50 pointer-events-none"
                style={{
                  left: `${charGov.x_position}%`,
                  top: `${charGov.y_position}%`,
                }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <motion.div
                  style={{
                    position: 'absolute',
                    width: 32, height: 32,
                    borderRadius: '50%',
                    left: '50%', top: '45%',
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(255,213,74,0.7) 0%, transparent 70%)',
                  }}
                  animate={{ scale: [0.8, 2.2, 0.8], opacity: [0.9, 0, 0.9] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                />

                <motion.img
                  src={character}
                  alt="Character"
                  style={{
                    width: 30, height: 30,
                    imageRendering: 'pixelated',
                    filter: 'drop-shadow(0 0 7px rgba(255,213,74,1))',
                    transform: 'translate(-50%, -160%)',
                  }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
                />

                <motion.div
                  style={{
                    position: 'absolute',
                    transform: 'translate(-50%, -330%)',
                    whiteSpace: 'nowrap',
                  }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <span
                    className="font-[family-name:var(--font-family-pixel)] text-[5px] text-pixel-dark bg-pixel-yellow px-1 py-0.5"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(255,213,74,0.9))' }}
                  >
                    DAY {charGov.visit_day}
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-2 left-2 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-pixel-green rounded-full" />
              <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-pixel-yellow rounded-full" />
              <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 border border-pixel-white/30 rounded-full" />
              <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-xs">Locked</span>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-w-4xl mx-auto">
          {governorates.map((gov, i) => (
            <motion.button
              key={gov.id}
              onClick={() => setSelectedGov(gov as Governorate)}
              className={`pixel-panel p-2 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] ${gov.visited ? 'border-pixel-yellow/30' : 'opacity-50'}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: gov.visited ? 1 : 0.5, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.02 }}
            >
              <span className={`w-2 h-2 rounded-full ${gov.completed ? 'bg-pixel-green' : gov.visited ? 'bg-pixel-yellow' : 'bg-pixel-white/20'}`} />
              <span className="font-[family-name:var(--font-family-pixelify)] text-sm text-pixel-white/80 truncate">{gov.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedGov && <GovernorateModal gov={selectedGov} onClose={() => setSelectedGov(null)} />}
      </AnimatePresence>
    </section>
  );
}

function GovernorateModal({ gov, onClose }: { gov: Governorate; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="pixel-panel pixel-border w-full max-w-sm max-h-[80vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-pixel-yellow/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-sm">{gov.name}</h3>
              <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-lg">{gov.name_ar}</p>
            </div>
            <button onClick={onClose} className="text-pixel-white/40 hover:text-pixel-white text-xl cursor-pointer">×</button>
          </div>
          {gov.visit_day && (
            <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-sm mt-1">Day {gov.visit_day}</p>
          )}
        </div>

        <div className="p-5">
          {gov.visited ? (
            <div className="space-y-4">
              {gov.story && (
                <div>
                  <h4 className="font-[family-name:var(--font-family-pixel)] text-[8px] text-pixel-white/60 mb-1">STORY</h4>
                  <p className="font-[family-name:var(--font-family-pixelify)] text-pixel-white/80 text-base">{gov.story}</p>
                </div>
              )}
              {(() => {
                const getEmbed = (url: string) => {
                  if (!url) return null;
                  const m = url.match(/^.*(youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
                  return m && m[2].length === 11 ? `https://www.youtube.com/embed/${m[2]}` : null;
                };
                const embedUrl = getEmbed(gov.youtube_url || '');
                if (!embedUrl) return null;
                return (
                  <div>
                    <h4 className="font-[family-name:var(--font-family-pixel)] text-[8px] text-pixel-white/60 mb-2">TRAVEL VIDEO</h4>
                    <div className="aspect-video w-full border border-pixel-yellow/30 bg-black overflow-hidden relative rounded shadow-[0_0_8px_rgba(255,213,74,0.2)]">
                      <iframe
                        src={embedUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  </div>
                );
              })()}
              <div className="flex gap-2">
                <span className={`px-2 py-1 text-xs font-[family-name:var(--font-family-pixel)] ${gov.completed ? 'bg-pixel-green/20 text-pixel-green' : 'bg-pixel-yellow/20 text-pixel-yellow'}`}>
                  {gov.completed ? 'COMPLETED' : 'VISITED'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-3 opacity-30">🔒</span>
              <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-base">Not visited yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
