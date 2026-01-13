import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, ShoppingBag, Users, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-foreground/20 flex flex-col items-center justify-center text-white px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/3 rounded-full blur-3xl" />
        
        {/* Floating elements */}
        <motion.div 
          className="absolute top-32 right-20 w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-40 left-16 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm"
          animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/4 w-12 h-12 bg-white/5 rounded-xl backdrop-blur-sm"
          animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 relative z-10"
      >
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl mb-6 shadow-2xl border border-white/20">
            <ShoppingBag className="h-12 w-12 text-white" />
          </div>
        </motion.div>
        
        <motion.h1 
          className="text-6xl md:text-7xl font-bold mb-4 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Re<span className="text-white/80">O</span>wn
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <p className="text-xl font-light tracking-[0.3em] mb-3 text-white/80">MARKETPLACE</p>
          <p className="text-lg font-medium text-white/90">Buy, Sell, Connect</p>
        </motion.div>
        
        {/* Features */}
        <motion.div 
          className="flex items-center justify-center gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <span>Pre-owned Items</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <span>Trusted Sellers</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>Great Deals</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="w-full max-w-sm space-y-4 relative z-10"
      >
        <Button 
          size="lg" 
          className="w-full text-lg h-14 bg-white text-primary hover:bg-white/90 rounded-2xl font-semibold shadow-xl shadow-black/10 group"
          onClick={() => navigate("/create-account")}
        >
          Get Started
          <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => navigate("/auth")} 
          className="w-full text-lg h-14 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white rounded-2xl font-semibold backdrop-blur-sm"
        >
          Sign In
        </Button>
        
        <motion.p 
          className="text-center text-sm text-white/60 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          Join thousands of users buying and selling pre-owned items
        </motion.p>
      </motion.div>

      {/* Bottom indicator */}
      <motion.div 
        className="absolute bottom-6 w-full flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        <div className="w-32 h-1 bg-white/30 rounded-full" />
      </motion.div>
    </div>
  );
};

export default Index;
