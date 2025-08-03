import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gradient-purple flex flex-col items-center justify-center text-white px-6">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold mb-4 tracking-tight">
          Re<span className="text-white/90">O</span>wn
        </h1>
        <p className="text-xl font-light tracking-widest mb-2">MARKETPLACE</p>
        <p className="text-lg font-medium opacity-90">Buy, Sell, Connect</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Button variant="reown-white" size="lg" className="w-full text-lg" onClick={() => navigate("/create-account")}>
          Get Started
        </Button>
        
        <Button variant="reown-outline" size="lg" onClick={() => navigate("/auth")} className="w-full text-lg text-slate-50">
          Sign In
        </Button>
      </div>

      <div className="absolute bottom-2 w-full">
        <div className="w-32 h-1 bg-white/30 rounded-full mx-auto"></div>
      </div>
    </div>;
};
export default Index;