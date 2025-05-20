
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export function ChatMessage({ id, sender, text, timestamp }: ChatMessageProps) {
  return (
    <div 
      key={id} 
      className={cn(
        "mb-4 max-w-[80%] rounded-lg p-3",
        sender === 'user' 
          ? "bg-barber-navy text-white ml-auto" 
          : "bg-gray-100 text-barber-dark"
      )}
    >
      {text}
      <div className={cn(
        "text-xs mt-1",
        sender === 'user' ? "text-white/70" : "text-gray-500"
      )}>
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}

export default ChatMessage;
