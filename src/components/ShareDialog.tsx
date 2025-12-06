import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  text?: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, title, url, text }) => {
  const appName = "ReOWN";
  const shareText = `Check out "${title}" on ${appName}! 🛍️\n\n${text || `Amazing product at great price`}\n\n`;

  const shareOptions = [
    { 
      name: "WhatsApp", 
      icon: "💬", 
      color: "bg-green-500", 
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + url)}`, '_blank');
      }
    },
    { 
      name: "Instagram", 
      icon: "📷", 
      color: "bg-gradient-to-r from-purple-500 to-pink-500", 
      action: () => {
        navigator.clipboard.writeText(shareText + url);
        toast.success("Link copied! Share it on Instagram");
      }
    },
    { 
      name: "TikTok", 
      icon: "🎵", 
      color: "bg-black", 
      action: () => {
        navigator.clipboard.writeText(shareText + url);
        toast.success("Link copied! Share it on TikTok");
      }
    },
    { 
      name: "X (Twitter)", 
      icon: "🐦", 
      color: "bg-black", 
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');
      }
    },
    { 
      name: "LinkedIn", 
      icon: "💼", 
      color: "bg-blue-600", 
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
      }
    },
    { 
      name: "Snapchat", 
      icon: "👻", 
      color: "bg-yellow-400", 
      action: () => {
        window.open(`https://www.snapchat.com/share?url=${encodeURIComponent(url)}`, '_blank');
      }
    },
    { 
      name: "Facebook", 
      icon: "👥", 
      color: "bg-blue-500", 
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`, '_blank');
      }
    },
    { 
      name: "Copy Link", 
      icon: "🔗", 
      color: "bg-gray-500", 
      action: () => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        onClose();
      }
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold">Share to</DialogTitle>
        </DialogHeader>
        
        {/* Share Options */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className="flex flex-col items-center gap-2 p-3 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <div className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center text-white text-xl`}>
                  {option.icon}
                </div>
                <span className="text-xs font-medium text-center text-foreground">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Actions */}
        <div className="border-t border-border p-4 space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              toast.info("Report feature coming soon");
              onClose();
            }}
          >
            Report this content
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              toast.info("Not interested feature coming soon");
              onClose();
            }}
          >
            Not interested
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
