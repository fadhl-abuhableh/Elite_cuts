
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function ChatInput({ value, onChange, onSend }: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className="border-t p-3 flex items-center">
      <Input
        type="text"
        placeholder="Type your message..."
        className="flex-1 mr-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <Button 
        onClick={onSend} 
        size="icon" 
        className="bg-barber-gold hover:bg-amber-500 text-barber-dark"
      >
        <Send size={18} />
      </Button>
    </div>
  );
}

export default ChatInput;
