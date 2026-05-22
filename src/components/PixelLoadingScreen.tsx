import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoWhite from '../assets/logo.svg';

export default function PixelLoadingScreen({ onComplete, isApiLoading = false }: { onComplete: () => void, isApiLoading?: boolean }) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Booting up...');
  const isApiLoadingRef = useRef(isApiLoading);

  useEffect(() => {
    isApiLoadingRef.current = isApiLoading;
  }, [isApiLoading]);

  const loadingSteps = [
    'Booting up...',
    'Loading assets...',
    'Preparing map...',
    'Loading inventory...',
    'Almost ready...',
    'Let\'s go!',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        let next = prev + Math.random() * 15 + 5;
        
        if (isApiLoadingRef.current && next >= 90) {
          next = 90 + Math.random() * 5;
        }

        if (!isApiLoadingRef.current && next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        
        const stepIndex = Math.min(Math.floor((next / 100) * loadingSteps.length), loadingSteps.length - 1);
        setLoadingText(loadingSteps[stepIndex]);
        return next;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-pixel-dark flex flex-col items-center justify-center pixel-grid"
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src={logoWhite}
          alt="Midos"
          className="w-20 h-&0 mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        <motion.h1
          className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-lg md:text-xl mb-2 text-center text-glow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          MIDOS QUEST
        </motion.h1>
        <motion.p
          className="font-[family-name:var(--font-family-vt)] text-pixel-white/60 text-lg mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          24 Governorates Challenge
        </motion.p>

        <div className="w-64 md:w-72 mb-4">
          <div className="pixel-border-thin bg-pixel-dark p-1">
            <div className="h-3 bg-pixel-gray relative overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pixel-yellow to-pixel-gold"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        </div>

        <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/50 text-base">
          {loadingText}
          <span className="animate-blink">_</span>
        </p>

        <p className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-[10px] mt-3">
          {Math.floor(progress)}%
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
