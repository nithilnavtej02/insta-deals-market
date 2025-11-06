import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Facebook, MessageCircle, Send, Twitter, Instagram, Share } from "lucide-react";
import { FaTiktok, FaThreads } from "react-icons/fa6";
import { toast } from "sonner";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  text?: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, title, url, text }) => {
  const appName = "ReOWN Marketplace";
  const shareText = `Check out "${title}" on ${appName}! 🛍️\n\n${text || `Amazing product at great price`}\n\n`;
  
  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366]",
      onClick: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + url)}`, '_blank');
      }
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-[#1877F2]",
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`, '_blank');
      }
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-[#1DA1F2]",
      onClick: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');
      }
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
      onClick: () => {
        navigator.clipboard.writeText(shareText + url);
        toast.success("Link copied! Share it on Instagram");
      }
    },
    {
      name: "TikTok",
      icon: FaTiktok,
      color: "bg-black",
      onClick: () => {
        navigator.clipboard.writeText(shareText + url);
        toast.success("Link copied! Share it on TikTok");
      }
    },
    {
      name: "Threads",
      icon: FaThreads,
      color: "bg-black",
      onClick: () => {
        navigator.clipboard.writeText(shareText + url);
        toast.success("Link copied! Share it on Threads");
      }
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-[#0088CC]",
      onClick: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`, '_blank');
      }
    },
    {
      name: "Copy Link",
      icon: Copy,
      color: "bg-gray-600",
      onClick: () => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        onClose();
      }
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share on
          </DialogTitle>
        </DialogHeader>
        
        {/* Share Message */}
        <div className="mt-2 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">{appName}</p>
          <p className="text-xs text-muted-foreground whitespace-pre-line">{shareText}</p>
          <p className="text-xs text-primary mt-2 truncate">{url}</p>
        </div>

        {/* Share Options as Circles */}
        <div className="grid grid-cols-4 gap-6 mt-6">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.name}
                className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={option.onClick}
              >
                <div className={`w-16 h-16 rounded-full ${option.color} flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform`}>
                  <Icon className="h-7 w-7" />
                </div>
                <span className="text-xs text-center text-muted-foreground font-medium">{option.name}</span>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;