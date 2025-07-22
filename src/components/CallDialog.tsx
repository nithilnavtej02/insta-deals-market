import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

interface CallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: "voice" | "video";
  contact: {
    name: string;
    username: string;
  };
}

const CallDialog = ({ isOpen, onClose, type, contact }: CallDialogProps) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(type === "video");
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">("connecting");

  useEffect(() => {
    if (isOpen) {
      // Simulate call connection
      const connectTimer = setTimeout(() => {
        setCallStatus("connected");
      }, 3000);

      return () => clearTimeout(connectTimer);
    } else {
      setCallDuration(0);
      setCallStatus("connecting");
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black text-white border-0 p-0">
        <div className="flex flex-col items-center justify-between h-[600px] p-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <Avatar className="w-32 h-32 mx-auto">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.username}`} />
              <AvatarFallback className="text-2xl">{contact.username.slice(1, 3).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{contact.name}</h2>
              <p className="text-gray-400">{contact.username}</p>
            </div>
          </div>

          {/* Call Status */}
          <div className="text-center">
            {callStatus === "connecting" && (
              <p className="text-lg text-gray-400">Connecting...</p>
            )}
            {callStatus === "connected" && (
              <p className="text-lg text-green-400">{formatDuration(callDuration)}</p>
            )}
            {callStatus === "ended" && (
              <p className="text-lg text-red-400">Call Ended</p>
            )}
          </div>

          {/* Video Feed (for video calls) */}
          {type === "video" && isVideoOn && callStatus === "connected" && (
            <div className="w-full h-40 bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Video Feed</p>
            </div>
          )}

          {/* Call Controls */}
          <div className="flex items-center gap-4">
            {type === "video" && (
              <Button
                variant="ghost"
                size="icon"
                className={`w-12 h-12 rounded-full ${isVideoOn ? 'bg-gray-700' : 'bg-red-600'}`}
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className={`w-12 h-12 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-700'}`}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700"
              onClick={handleEndCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallDialog;