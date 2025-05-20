
interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function QuickSuggestions({ onSuggestionClick }: QuickSuggestionsProps) {
  const suggestions = [
    { text: "Services?", query: "What services do you offer?" },
    { text: "Check availability", query: "When is James available tomorrow?" },
    { text: "Book appointment", query: "How do I book an appointment?" }
  ];

  return (
    <div className="px-4 pb-2 flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <button 
          key={index}
          onClick={() => onSuggestionClick(suggestion.query)}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-barber-navy py-1 px-2 rounded-full transition-colors"
        >
          {suggestion.text}
        </button>
      ))}
    </div>
  );
}

export default QuickSuggestions;
