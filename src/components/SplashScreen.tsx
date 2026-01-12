import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const SplashScreen = ({ onComplete, duration = 2000 }: SplashScreenProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] bg-gradient-to-br from-primary via-primary to-primary-dark flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full"
              initial={{ x: 100, y: -100, scale: 0 }}
              animate={{ x: 0, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full"
              initial={{ x: -100, y: 100, scale: 0 }}
              animate={{ x: 0, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center">
            {/* Animated Logo */}
            <motion.div
              className="relative w-28 h-28 mx-auto mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                delay: 0.1 
              }}
            >
              {/* Outer rotating ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white/30"
                style={{ borderTopColor: "white" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Inner circle */}
              <motion.div
                className="absolute inset-3 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-5xl font-bold text-white">R</span>
              </motion.div>
            </motion.div>

            {/* App Name */}
            <motion.h1
              className="text-4xl font-bold text-white mb-2 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Re<span className="opacity-90">O</span>wn
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-white/70 text-lg font-light tracking-widest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              MARKETPLACE
            </motion.p>

            {/* Loading dots */}
            <motion.div
              className="flex justify-center gap-2 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-white/80"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Bottom bar */}
          <motion.div
            className="absolute bottom-8 left-0 right-0 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="w-32 h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: duration / 1000 - 0.5, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
