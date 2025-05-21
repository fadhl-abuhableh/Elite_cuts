
interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function QuickSuggestions({ onSuggestionClick }: QuickSuggestionsProps) {
  const suggestions = [
    { text: "Services & pricing", query: "What services do you offer and what are your prices?" },
    { text: "Barber availability", query: "Is James available tomorrow?" },
    { text: "Hours & location", query: "What are your hours and where are you located?" },
    { text: "Current promotions", query: "Do you have any current promotions?" }
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
