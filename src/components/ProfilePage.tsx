import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../context/ApiContext';
import tunisiaSvg from '../assets/tunisia.svg';
import character from '../assets/logo.svg';
import mapIcon from '../assets/icons/map-icon.svg';
import inventoryIcon from '../assets/icons/inventory-icon.svg';
import logo from '../assets/logo.svg';

interface InventoryItem {
  id: number;
  name: string;
  image: string | null;
  quantity: number;
  price: number;
  description: string;
}

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

export default function ProfilePage() {
  const { stats, governorates, inventory } = useApi();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(inventory[0] || null);
  const [selectedGov, setSelectedGov] = useState<Governorate | null>(null);

  const visitedCount = stats?.visited || 0;
  const completedCount = stats?.completed || 0;
  const progressPercent = Math.round((visitedCount / 24) * 100);

  const getRpgTitle = (count: number) => {
    if (count === 0) return 'Novice Nomad';
    if (count <= 4) return 'Desert Walker';
    if (count <= 8) return 'Oasis Seeker';
    if (count <= 12) return 'Tunisian Explorer';
    if (count <= 18) return 'Carthaginian Pathfinder';
    if (count <= 23) return 'Atlas Ranger';
    return 'Legendary Pioneer';
  };

  const visitedGovsSorted = governorates
    .filter(g => g.visited && g.visit_day !== null)
    .sort((a, b) => (a.visit_day || 0) - (b.visit_day || 0) || a.id - b.id);

  const linePoints = visitedGovsSorted
    .map(g => `${g.x_position},${g.y_position}`)
    .join(' ');

  const slots = Array.from({ length: 18 }, (_, i) => inventory[i] || null);

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full px-22 py-3 flex flex-col overflow-hidden bg-pixel-dark select-none my-14">
      <div className="flex justify-between items-center mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-pixel-yellow animate-pulse rotate-45" />
          <h1 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-[10px] md:text-xs text-glow tracking-wider">
            ADVENTURER PROFILE
          </h1>
        </div>
        <div className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-lg">
          Quest progress: <span className="text-pixel-yellow">{progressPercent}%</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 pb-2">

        <div className="pixel-panel p-4 flex flex-col min-h-0 border-pixel-yellow/30">
          <div className="flex items-center gap-2 border-b border-pixel-white/10 pb-2 mb-3">
            <span className="text-sm">👤</span>
            <h2 className="font-[family-name:var(--font-family-pixel)] text-pixel-white text-[9px] tracking-wider">
              CHARACTER INFO
            </h2>
          </div>

          <div className="flex-1 flex flex-col items-center justify-around min-h-0">
            <div className="relative group flex items-center justify-center p-4 w-32 h-32 bg-pixel-gray/40 border-2 border-pixel-white/10 rounded overflow-hidden">
              <motion.img
                src={character}
                alt="Midos sprite"
                className="w-20 h-auto object-contain image-render-pixel"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pixel-yellow/5 to-transparent pointer-events-none" />
            </div>

            <div className="text-center w-full px-2 my-2 flex justify-center">
              {stats?.youtubeSubs ? (
                <a 
                  href="https://www.youtube.com/@midosajmi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center gap-2 bg-[#ff0000] hover:bg-[#cc0000] text-white px-3 py-1.5 rounded-sm border-b-4 border-[#990000] active:border-b-0 active:translate-y-1 transition-all"
                >
                  <span className="text-white text-sm leading-none drop-shadow-md">▶</span>
                  <span className="font-[family-name:var(--font-family-vt)] text-base font-bold tracking-wider drop-shadow-md">
                    SUBSCRIBE
                  </span>
                  <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px] font-bold font-[family-name:var(--font-family-pixel)] shadow-inner">
                    {Number(stats.youtubeSubs).toLocaleString()}
                  </span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm pointer-events-none" />
                </a>
              ) : (
                <h3 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-sm tracking-wide mb-1">
                  MIDOS
                </h3>
              )}
            </div>

            <div className="w-full px-2 mt-1">
              <div className="flex justify-between font-[family-name:var(--font-family-pixel)] text-[7px] text-pixel-white/50 mb-1">
                <span>QUEST EXP</span>
                <span className="text-pixel-green">{visitedCount} / 24 GOVS</span>
              </div>
              <div className="w-full h-3.5 bg-pixel-gray border border-pixel-white/20 p-0.5 rounded-sm overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pixel-green/80 to-pixel-green shadow-[0_0_8px_rgba(74,222,128,0.4)] rounded-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${(visitedCount / 24) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 text-xs font-[family-name:var(--font-family-vt)] bg-pixel-gray/30 p-2 border border-pixel-white/5 rounded">
              <div className="flex flex-col">
                <span className="text-pixel-white/40 text-sm">Visited</span>
                <span className="text-pixel-yellow text-base font-semibold">{visitedCount}/24</span>
              </div>
              <div className="flex flex-col">
                <span className="text-pixel-white/40 text-sm">Completed</span>
                <span className="text-pixel-green text-base font-semibold">{completedCount}/24</span>
              </div>
              <div className="flex flex-col">
                <span className="text-pixel-white/40 text-sm">Gold (Balance)</span>
                <span className="text-pixel-yellow text-base font-semibold">{stats?.balance || 0} DT</span>
              </div>
              <div className="flex flex-col">
                <span className="text-pixel-white/40 text-sm">Travel Videos</span>
                <span className="text-pixel-blue text-base font-semibold">{stats?.videos || 0}</span>
              </div>
            </div>

            <div className="w-full text-center px-1">
              <div className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-sm truncate">
                📍 Currently: <span className="text-pixel-white/80">{stats?.currentLocation || "Adventure Bound"}</span>
              </div>
            </div>

          </div>
        </div>

        <div className="pixel-panel p-4 flex flex-col min-h-0 border-pixel-yellow/30">
          <div className="flex items-center gap-2 border-b border-pixel-white/10 pb-2 mb-3 justify-between">
            <div className="flex items-center gap-2">
              <img src={inventoryIcon} alt="" className="w-4 h-4 icon-glow" />
              <h2 className="font-[family-name:var(--font-family-pixel)] text-pixel-white text-[9px] tracking-wider">
                BACKPACK INVENTORY
              </h2>
            </div>
            <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-base">
              {inventory.length} / 18 slots
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2 p-1 bg-pixel-gray/20 rounded border border-pixel-white/5">
            {slots.map((item, i) => {
              const isSelected = selectedItem?.id === item?.id;
              return (
                <button
                  key={item?.id || `empty-slot-${i}`}
                  onClick={() => item && setSelectedItem(item)}
                  className={`aspect-square flex items-center justify-center p-1 rounded relative cursor-pointer transition-all border-2 ${item
                    ? isSelected
                      ? 'bg-pixel-yellow/10 border-pixel-yellow shadow-[0_0_10px_rgba(255,213,74,0.3)] scale-[1.02]'
                      : 'bg-pixel-gray border-pixel-white/10 hover:border-pixel-yellow/50 hover:scale-[1.02]'
                    : 'bg-pixel-gray/40 border-pixel-white/5 text-pixel-white/5'
                    }`}
                >
                  {item ? (
                    <>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                      {item.quantity > 1 && (
                        <span className="absolute bottom-0.5 right-0.5 font-[family-name:var(--font-family-pixel)] text-[6px] px-1 bg-pixel-yellow/20 text-pixel-yellow rounded-sm scale-90">
                          x{item.quantity}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-lg opacity-20 font-[family-name:var(--font-family-vt)]">+</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 mt-3 p-3 bg-pixel-gray/30 border border-pixel-white/5 rounded flex flex-col justify-center min-h-0">
            {selectedItem ? (
              <div className="flex flex-col h-full justify-between min-h-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pixel-gray/60 border border-pixel-white/10 rounded flex items-center justify-center p-1">
                    {selectedItem.image ? (
                      <img src={selectedItem.image} alt="" className="w-10 h-10 object-contain" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-[9px] tracking-wide truncate">
                      {selectedItem.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40 text-sm">Qty: {selectedItem.quantity}</span>
                      {selectedItem.price > 0 && (
                        <span className="font-[family-name:var(--font-family-pixel)] text-pixel-green text-[7px] scale-90">
                          💰 {selectedItem.price} DT
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 mt-2 overflow-y-auto max-h-[80px] pr-1">
                  <p className="font-[family-name:var(--font-family-pixelify)] text-pixel-white/70 text-xs leading-relaxed">
                    {selectedItem.description || "A mysterious object collected along Midos' path."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-2xl block opacity-20 mb-2">🎒</span>
                <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-sm">
                  Select an item to view details
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pixel-panel p-4 flex flex-col min-h-0 border-pixel-yellow/30">
          <div className="flex items-center gap-2 border-b border-pixel-white/10 pb-2 mb-3">
            <img src={mapIcon} alt="" className="w-4 h-4 icon-glow" />
            <h2 className="font-[family-name:var(--font-family-pixel)] text-pixel-white text-[9px] tracking-wider">
              JOURNEY MAP
            </h2>
          </div>

          <div className="flex-1 relative w-full aspect-[2/3] mx-auto bg-pixel-gray/20 rounded border border-pixel-white/5 overflow-hidden">
            <img src={tunisiaSvg} alt="Tunisia outline" className="absolute inset-0 w-full h-full object-contain pointer-events-none p-2 opacity-90" />

            {visitedGovsSorted.length > 1 && (
              <svg
                className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] pointer-events-none z-10"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#FFD54A"
                  strokeWidth="0.6"
                  strokeDasharray="1,2"
                  style={{
                    filter: 'drop-shadow(0 0 3px rgba(255, 213, 74, 0.8))'
                  }}
                />
              </svg>
            )}

            {governorates.map((gov) => {
              const isSelected = selectedGov?.id === gov.id;
              return (
                <button
                  key={gov.id}
                  onClick={() => setSelectedGov(gov as Governorate)}
                  className="absolute cursor-pointer z-20 group"
                  style={{
                    left: `${gov.x_position}%`,
                    top: `${gov.y_position}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {gov.visited === 1 && gov.completed === 0 && (
                    <motion.img
                      src={character}
                      alt=""
                      className="absolute w-4 h-auto pointer-events-none z-30"
                      style={{ left: '10%', top: '-85%', transform: 'translate(-50%, -50%)' }}
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}

                  {gov.visited === 1 && (
                    <motion.div
                      className="absolute inset-[-4px] rounded-full"
                      style={{ background: 'radial-gradient(circle, rgba(255,213,74,0.3) 0%, transparent 70%)' }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                  )}

                  <div
                    className={`w-2 h-2 rounded-full border transition-all ${gov.completed
                      ? 'bg-pixel-green border-pixel-green shadow-[0_0_6px_rgba(74,222,128,0.6)]'
                      : gov.visited
                        ? 'bg-pixel-yellow border-pixel-yellow shadow-[0_0_6px_rgba(255,213,74,0.6)]'
                        : 'bg-transparent border-pixel-white/20'
                      } ${isSelected ? 'scale-125 border-pixel-white shadow-[0_0_8px_#FFF]' : 'group-hover:scale-125'}`}
                  />

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-40 whitespace-nowrap">
                    <span className="font-[family-name:var(--font-family-pixel)] text-[5px] text-pixel-white bg-pixel-dark/95 px-1 py-0.5 border border-pixel-yellow/30 rounded shadow-md">
                      {gov.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <AnimatePresence>
        {selectedGov && (
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGov(null)}
          >
            <motion.div
              className="pixel-panel max-w-sm w-full p-4 border-pixel-yellow"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-pixel-white/10 pb-2 mb-3">
                <div>
                  <h3 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-[10px]">
                    {selectedGov.name}
                  </h3>
                  <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-base">{selectedGov.name_ar}</span>
                </div>
                <button
                  onClick={() => setSelectedGov(null)}
                  className="text-pixel-white/40 hover:text-pixel-white text-xl font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>

              {selectedGov.visited ? (
                <div className="space-y-3 font-[family-name:var(--font-family-pixelify)]">
                  {selectedGov.visit_day && (
                    <div className="font-[family-name:var(--font-family-pixel)] text-pixel-green text-[6px] tracking-wider">
                      VISITED ON DAY {selectedGov.visit_day}
                    </div>
                  )}
                  {selectedGov.story && (
                    <p className="text-pixel-white/80 text-xs leading-relaxed max-h-[100px] overflow-y-auto pr-1">
                      {selectedGov.story}
                    </p>
                  )}

                  {(() => {
                    const getYouTubeEmbedUrl = (url: string) => {
                      if (!url) return null;
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                      const match = url.match(regExp);
                      return (match && match[2].length === 11)
                        ? `https://www.youtube.com/embed/${match[2]}`
                        : null;
                    };
                    const embedUrl = getYouTubeEmbedUrl(selectedGov.youtube_url || '');
                    if (!embedUrl) return null;
                    return (
                      <div className="mt-2">
                        <div className="aspect-video w-full border border-pixel-yellow/30 bg-black overflow-hidden relative rounded">
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

                  <div className="flex gap-2 justify-end pt-1">
                    <span className={`px-2 py-0.5 text-[8px] font-[family-name:var(--font-family-pixel)] rounded ${selectedGov.completed
                      ? 'bg-pixel-green/20 text-pixel-green border border-pixel-green/30'
                      : 'bg-pixel-yellow/20 text-pixel-yellow border border-pixel-yellow/30'
                      }`}>
                      {selectedGov.completed ? 'COMPLETED' : 'VISITED'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 font-[family-name:var(--font-family-vt)]">
                  <span className="text-3xl block mb-2">🔒</span>
                  <p className="text-pixel-white/30 text-base">This governorate has not been explored yet.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
