import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import MyListings from "./pages/MyListings";
import Favorites from "./pages/Favorites";
import Reviews from "./pages/Reviews";
import PrivacySecurity from "./pages/PrivacySecurity";
import Location from "./pages/Location";
import CategoryProducts from "./pages/CategoryProducts";
import AdminReels from "./pages/AdminReels";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/home" element={<Home />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reel/:id/comments" element={<ReelComments />} />
          <Route path="/share" element={<ShareSheet />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile/:username" element={<SellerProfile />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/privacy-security" element={<PrivacySecurity />} />
          <Route path="/location" element={<Location />} />
          <Route path="/category/:category" element={<CategoryProducts />} />
          <Route path="/admin/reels" element={<AdminReels />} />
          <Route path="/seller/:username" element={<SellerProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
