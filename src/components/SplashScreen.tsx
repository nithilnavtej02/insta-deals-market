import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const SplashScreen = ({ onComplete, duration = 2500 }: SplashScreenProps) => {
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState<"logo" | "text" | "complete">("logo");

  useEffect(() => {
    // Phase transitions
    const logoTimer = setTimeout(() => setPhase("text"), 800);
    const completeTimer = setTimeout(() => {
      setPhase("complete");
    }, duration - 500);
    const hideTimer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(completeTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onComplete]);

  // Particle configuration
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2
  }));

  // Orbital rings configuration
  const rings = [
    { size: 140, duration: 8, delay: 0, direction: 1 },
    { size: 180, duration: 12, delay: 0.5, direction: -1 },
    { size: 220, duration: 16, delay: 1, direction: 1 }
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Animated gradient background */}
          <motion.div 
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 50%, hsl(var(--primary)/0.6) 100%)"
            }}
            animate={{
              background: [
                "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 50%, hsl(var(--primary)/0.6) 100%)",
                "linear-gradient(225deg, hsl(var(--primary)/0.8) 0%, hsl(var(--primary)) 50%, hsl(var(--primary)/0.7) 100%)",
                "linear-gradient(315deg, hsl(var(--primary)/0.9) 0%, hsl(var(--primary)/0.7) 50%, hsl(var(--primary)) 100%)",
                "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 50%, hsl(var(--primary)/0.6) 100%)"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full bg-white/20"
                style={{
                  width: particle.size,
                  height: particle.size,
                  left: `${particle.x}%`,
                  top: `${particle.y}%`
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Geometric shapes */}
          <motion.div
            className="absolute top-1/4 -left-20 w-40 h-40 rounded-3xl bg-white/5 backdrop-blur-sm"
            initial={{ rotate: 0, x: -100 }}
            animate={{ rotate: 45, x: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-16 w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm"
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-sm"
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 15 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          {/* Main content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center">
            {/* Logo container with orbital rings */}
            <div className="relative">
              {/* Orbital rings */}
              {rings.map((ring, i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 rounded-full border border-white/10"
                  style={{
                    width: ring.size,
                    height: ring.size,
                    marginLeft: -ring.size / 2,
                    marginTop: -ring.size / 2
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 0.5, 0.3],
                    scale: 1,
                    rotate: ring.direction * 360
                  }}
                  transition={{
                    opacity: { duration: 1, delay: ring.delay },
                    scale: { duration: 0.8, delay: ring.delay },
                    rotate: { duration: ring.duration, repeat: Infinity, ease: "linear" }
                  }}
                >
                  {/* Orbital dot */}
                  <motion.div
                    className="absolute w-2 h-2 rounded-full bg-white/60"
                    style={{ top: -4, left: "50%", marginLeft: -4 }}
                  />
                </motion.div>
              ))}

              {/* Main logo circle */}
              <motion.div
                className="relative w-28 h-28"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.1
                }}
              >
                {/* Outer glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
                    boxShadow: "0 0 60px rgba(255,255,255,0.3)"
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 40px rgba(255,255,255,0.2)",
                      "0 0 80px rgba(255,255,255,0.4)",
                      "0 0 40px rgba(255,255,255,0.2)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Spinning border */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "conic-gradient(from 0deg, transparent, white, transparent)",
                    maskImage: "radial-gradient(circle, transparent 60%, black 61%, black 100%)",
                    WebkitMaskImage: "radial-gradient(circle, transparent 60%, black 61%, black 100%)"
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner circle with logo */}
                <motion.div
                  className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {/* Letter R with gradient */}
                  <motion.span
                    className="text-5xl font-black"
                    style={{
                      background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textShadow: "0 2px 20px rgba(255,255,255,0.3)"
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    R
                  </motion.span>
                </motion.div>
              </motion.div>
            </div>

            {/* App name with staggered reveal */}
            <motion.div
              className="mt-10 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: phase !== "logo" ? 1 : 0, y: phase !== "logo" ? 0 : 30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight flex items-center justify-center gap-1">
                {"ReOwn".split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.08, duration: 0.4 }}
                    className={letter === "O" ? "opacity-80" : ""}
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Tagline with typing effect */}
              <motion.div
                className="mt-3 overflow-hidden h-6"
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <motion.p
                  className="text-white/60 text-sm md:text-base tracking-[0.3em] uppercase whitespace-nowrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                >
                  Marketplace
                </motion.p>
              </motion.div>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* Progress bar */}
              <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-white/50 via-white to-white/50 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: duration / 1000 - 0.3, ease: "easeInOut" }}
                />
              </div>

              {/* Loading dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/60"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Exit animation overlay */}
          <motion.div
            className="absolute inset-0 bg-background"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: phase === "complete" ? 1 : 0 }}
            style={{ originY: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
