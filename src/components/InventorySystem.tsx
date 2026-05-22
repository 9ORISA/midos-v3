import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../context/ApiContext';
import inventoryIcon from '../assets/icons/inventory-icon.svg';

interface InventoryItem {
  id: number;
  name: string;
  image: string | null;
  quantity: number;
  price: number;
  description: string;
}

export default function InventorySystem() {
  const { inventory } = useApi();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const slots = Array.from({ length: 18 }, (_, i) => inventory[i] || null);

  return (
    <section id="inventory" className="py-16 px-4 relative">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src={inventoryIcon} alt="" className="w-8 h-8 icon-glow" />
            <h2 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-lg md:text-xl text-glow">
              INVENTORY
            </h2>
            <img src={inventoryIcon} alt="" className="w-8 h-8 icon-glow" />
          </div>
          <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/50 text-lg">
            {inventory.length} items in bag
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-h-[350px] overflow-y-auto p-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {slots.map((item, i) => (
            <motion.button
              key={item?.id || `empty-${i}`}
              onClick={() => item && setSelectedItem(item as InventoryItem)}
              className="inventory-slot aspect-square flex flex-col items-center justify-center p-2 rounded relative cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              whileHover={item ? { scale: 1.05 } : {}}
            >
              {item ? (
                <>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-contain mb-1" />
                  ) : (
                    <div className="w-10 h-10 bg-pixel-gray rounded flex items-center justify-center mb-1 text-xl">
                      #
                    </div>
                  )}
                  {item.quantity > 1 && (
                    <span className="absolute top-1 right-1 font-[family-name:var(--font-family-pixel)] text-[7px] px-1 rounded bg-pixel-yellow/20 text-pixel-yellow">
                      x{item.quantity}
                    </span>
                  )}
                  <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/60 text-xs text-center truncate w-full">
                    {item.name}
                  </span>
                </>
              ) : (
                <span className="text-pixel-white/10 text-xl">+</span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {inventory.length > 18 && (
          <p className="text-center font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-sm mt-2">
            Scroll to see more items
          </p>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      </AnimatePresence>
    </section>
  );
}

function ItemModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="pixel-panel pixel-border w-full max-w-xs"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 text-center">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-16 h-16 object-contain mx-auto mb-3" />
          ) : (
            <div className="w-16 h-16 bg-pixel-gray rounded flex items-center justify-center mx-auto mb-3 text-3xl">
              📦
            </div>
          )}

          <h3 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-sm mb-2">
            {item.name}
          </h3>

          {item.description && (
            <p className="font-[family-name:var(--font-family-pixelify)] text-pixel-white/70 text-sm mb-3">{item.description}</p>
          )}

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40">Quantity</span>
              <span className="font-[family-name:var(--font-family-pixel)] text-pixel-white/70 text-[9px]">x{item.quantity}</span>
            </div>
            {item.price > 0 && (
              <div className="flex justify-between">
                <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/40">Price</span>
                <span className="font-[family-name:var(--font-family-pixel)] text-pixel-green text-[9px]">{item.price} DT</span>
              </div>
            )}
          </div>

          <button onClick={onClose} className="mt-4 w-full admin-btn admin-btn-primary">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
