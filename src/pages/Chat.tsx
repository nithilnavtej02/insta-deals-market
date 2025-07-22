import { ArrowLeft, Phone, Video, Send, MoreVertical, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import CallDialog from "@/components/CallDialog";

const Chat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callType, setCallType] = useState<"voice" | "video">("voice");

  const chatData: Record<string, { name: string; username: string; isOnline: boolean }> = {
    "1": { name: "iPhone 14 Pro", username: "@techseller_NY", isOnline: true },
    "2": { name: "Vintage Leather Jacket", username: "@vintage_lover", isOnline: false },
    "3": { name: "MacBook Air M2", username: "@apple_reseller", isOnline: true },
    "4": { name: "Gaming Chair", username: "@gamer_hub", isOnline: false }
  };

  const chat = id ? chatData[id] : undefined;
  const messages = [
    { id: 1, text: "Hi! Is this still available?", time: "2:30 PM", sender: "them" },
    { id: 2, text: "Yes, it's still available!", time: "2:32 PM", sender: "me" }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/seller/${chat?.username.slice(1)}`)}>
              <Avatar className="w-10 h-10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat?.username}`} />
                <AvatarFallback>{chat?.username.slice(1, 3).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-sm">{chat?.name}</h2>
                <p className="text-xs text-primary">{chat?.username}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setCallType("voice");
                setShowCallDialog(true);
              }}
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setCallType("video");
                setShowCallDialog(true);
              }}
            >
              <Video className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === "me" ? "bg-primary text-white" : "bg-gray-200"}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white border-t p-4">
        <div className="flex items-center gap-2">
          <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." className="flex-1" />
          <Button onClick={() => setMessage("")}><Send className="h-4 w-4" /></Button>
        </div>
      </div>
      
      {chat && (
        <CallDialog
          isOpen={showCallDialog}
          onClose={() => setShowCallDialog(false)}
          type={callType}
          contact={{
            name: chat.name,
            username: chat.username
          }}
        />
      )}
    </div>
  );
};

export default Chat;