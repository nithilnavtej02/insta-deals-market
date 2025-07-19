import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ShareSheet = () => {
  const navigate = useNavigate();

  const shareOptions = [
    { name: "WhatsApp", icon: "💬", color: "bg-green-500", action: () => shareToWhatsApp() },
    { name: "Instagram Story", icon: "📷", color: "bg-gradient-to-r from-purple-500 to-pink-500", action: () => shareToInstagram() },
    { name: "TikTok", icon: "🎵", color: "bg-black", action: () => shareToTikTok() },
    { name: "X (Twitter)", icon: "🐦", color: "bg-black", action: () => shareToX() },
    { name: "LinkedIn", icon: "💼", color: "bg-blue-600", action: () => shareToLinkedIn() },
    { name: "Snapchat", icon: "👻", color: "bg-yellow-400", action: () => shareToSnapchat() },
    { name: "Facebook", icon: "👥", color: "bg-blue-500", action: () => shareToFacebook() },
    { name: "Copy Link", icon: "🔗", color: "bg-gray-500", action: () => copyLink() },
  ];

  const shareToWhatsApp = () => {
    const text = "Check out this amazing product on ReOwn!";
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToInstagram = () => {
    // Note: Instagram doesn't support direct web sharing, this would typically open the app
    alert("Opening Instagram app...");
  };

  const shareToTikTok = () => {
    alert("Opening TikTok app...");
  };

  const shareToX = () => {
    const text = "Check out this amazing product on ReOwn!";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToLinkedIn = () => {
    const text = "Check out this amazing product on ReOwn!";
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToSnapchat = () => {
    alert("Opening Snapchat app...");
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-h-[70vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Share to</h2>
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

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
                <span className="text-xs font-medium text-center">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Actions */}
        <div className="border-t p-4 space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => alert("Report feature coming soon")}
          >
            Report this content
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => alert("Not interested feature coming soon")}
          >
            Not interested
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareSheet;