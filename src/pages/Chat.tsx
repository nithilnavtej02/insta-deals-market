import { useState } from "react";
import { ArrowLeft, Phone, Video, ArrowUpDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useParams } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");

  const messages = [
    {
      id: 1,
      text: "Hi! Is this item still available?",
      sender: "other",
      time: "2:34 PM",
      isOwn: false
    },
    {
      id: 2,
      text: "Yes, it's still available! Would you like to know more details?",
      sender: "me",
      time: "2:35 PM",
      isOwn: true
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Send message logic
      setMessage("");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate("/messages")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="w-8 h-8">
            <AvatarImage src="/api/placeholder/32/32" />
            <AvatarFallback>TS</AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="font-medium text-sm">@techseller_NY</h2>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm">
            <Phone className="h-5 w-5 text-primary" />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <Video className="h-5 w-5 text-primary" />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <ArrowUpDown className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.isOwn
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.isOwn ? "text-white/70" : "text-muted-foreground"
                }`}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 rounded-full"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            variant="reown"
            size="icon"
            onClick={handleSendMessage}
            className="rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;