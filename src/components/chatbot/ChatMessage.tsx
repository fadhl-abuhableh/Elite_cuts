
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatMessageProps {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export function ChatMessage({ id, sender, text, timestamp }: ChatMessageProps) {
  // Convert newline characters to JSX line breaks
  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div 
      key={id} 
      className={cn(
        "mb-4 max-w-[85%] rounded-lg p-3",
        sender === 'user' 
          ? "bg-barber-navy text-white ml-auto rounded-tr-none" 
          : "bg-gray-100 text-barber-dark rounded-tl-none"
      )}
    >
      {/* Add message header with sender indicator */}
      <div className={cn(
        "text-xs mb-1 font-medium",
        sender === 'user' ? "text-white/80" : "text-barber-navy/80"
      )}>
        {sender === 'user' ? 'You' : 'EliteCuts Assistant'}
      </div>
      
      {/* Message content with proper formatting */}
      <div className="text-sm leading-relaxed">
        {formatMessageText(text)}
      </div>
      
      {/* Timestamp footer */}
      <div className={cn(
        "text-xs mt-2 text-right",
        sender === 'user' ? "text-white/60" : "text-gray-500"
      )}>
        {format(timestamp, 'h:mm a')}
      </div>
    </div>
  );
}

export default ChatMessage;
