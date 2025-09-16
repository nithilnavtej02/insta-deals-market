import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Reels from "./pages/Reels";
import Sell from "./pages/Sell";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import CreateAccount from "./pages/CreateAccount";
import Categories from "./pages/Categories";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import ReelComments from "./pages/ReelComments";
import ShareSheet from "./pages/ShareSheet";
import ProductDetail from "./pages/ProductDetail";
import Search from "./pages/Search";
import SellerProfile from "./pages/SellerProfile";
import PublicProfile from "./pages/PublicProfile";
import MyListings from "./pages/MyListings";
import Favorites from "./pages/Favorites";
import Reviews from "./pages/Reviews";
import PrivacySecurity from "./pages/PrivacySecurity";
import Location from "./pages/Location";
import CategoryProducts from "./pages/CategoryProducts";
import AdminReels from "./pages/AdminReels";
import NotFound from "./pages/NotFound";
import Saved from "./pages/Saved";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Routes */}
        <Route path="/home" element={user ? <Home /> : <Navigate to="/auth" />} />
        <Route path="/search" element={user ? <Search /> : <Navigate to="/auth" />} />
        <Route path="/categories" element={user ? <Categories /> : <Navigate to="/auth" />} />
        <Route path="/categories/:categoryId" element={user ? <CategoryProducts /> : <Navigate to="/auth" />} />
        <Route path="/product/:id" element={user ? <ProductDetail /> : <Navigate to="/auth" />} />
        <Route path="/cart" element={user ? <Cart /> : <Navigate to="/auth" />} />
        <Route path="/sell" element={user ? <Sell /> : <Navigate to="/auth" />} />
        <Route path="/reels" element={user ? <Reels /> : <Navigate to="/auth" />} />
        <Route path="/reel/:id/comments" element={user ? <ReelComments /> : <Navigate to="/auth" />} />
         <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
         <Route path="/profile/:profileId" element={user ? <PublicProfile /> : <Navigate to="/auth" />} />
         <Route path="/seller/:username" element={user ? <SellerProfile /> : <Navigate to="/auth" />} />
         <Route path="/u/:username" element={user ? <PublicProfile /> : <Navigate to="/auth" />} />
        <Route path="/my-listings" element={user ? <MyListings /> : <Navigate to="/auth" />} />
        <Route path="/favorites" element={user ? <Favorites /> : <Navigate to="/auth" />} />
        <Route path="/saved" element={user ? <Saved /> : <Navigate to="/auth" />} />
        <Route path="/messages" element={user ? <Messages /> : <Navigate to="/auth" />} />
        <Route path="/chat/:id" element={user ? <Chat /> : <Navigate to="/auth" />} />
        <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/auth" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/auth" />} />
        <Route path="/privacy-security" element={user ? <PrivacySecurity /> : <Navigate to="/auth" />} />
        <Route path="/location" element={user ? <Location /> : <Navigate to="/auth" />} />
        <Route path="/reviews" element={user ? <Reviews /> : <Navigate to="/auth" />} />
        <Route path="/admin/reels" element={user ? <AdminReels /> : <Navigate to="/auth" />} />
        <Route path="/cart" element={user ? <Cart /> : <Navigate to="/auth" />} />
        <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/auth" />} />
        <Route path="/share" element={user ? <ShareSheet /> : <Navigate to="/auth" />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;