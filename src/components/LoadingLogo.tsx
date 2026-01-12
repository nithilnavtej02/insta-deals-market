import { motion } from "framer-motion";

interface LoadingLogoProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const LoadingLogo = ({ size = "md", text }: LoadingLogoProps) => {
  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-20 h-20 text-2xl",
    lg: "w-32 h-32 text-4xl"
  };

  const logoSizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated Logo Container */}
      <motion.div
        className={`${sizeClasses[size]} relative flex items-center justify-center`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Rotating Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary/20"
          style={{ borderTopColor: "hsl(var(--primary))" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Pulsing Inner Ring */}
        <motion.div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/5"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        {/* Logo Text */}
        <motion.div
          className={`${logoSizes[size]} font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent z-10`}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          R
        </motion.div>
      </motion.div>

      {/* Loading Text */}
      {text && (
        <motion.p
          className="text-muted-foreground text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}

      {/* Loading Dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingLogo;
