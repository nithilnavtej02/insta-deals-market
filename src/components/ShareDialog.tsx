import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Facebook, MessageCircle, Send, Twitter, Instagram, Share } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  text?: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, title, url, text }) => {
  const shareText = text || `Check out this amazing product: ${title}`;
  
  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      onClick: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`, '_blank');
      }
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      }
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-blue-400 hover:bg-blue-500",
      onClick: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');
      }
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      onClick: () => {
        // Instagram doesn't support direct sharing with pre-filled text, so we copy to clipboard
        navigator.clipboard.writeText(`${shareText} ${url}`);
        toast.success("Link copied! You can now paste it on Instagram");
      }
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`, '_blank');
      }
    },
    {
      name: "Copy Link",
      icon: Copy,
      color: "bg-gray-500 hover:bg-gray-600",
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
            Share Product
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.name}
                variant="outline"
                className={`h-16 flex flex-col gap-2 ${option.color} text-white border-0`}
                onClick={option.onClick}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs">{option.name}</span>
              </Button>
            );
          })}
        </div>

        {/* URL Preview */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{url}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;