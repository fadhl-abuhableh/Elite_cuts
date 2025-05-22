
import { useState } from 'react';

interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function QuickSuggestions({ onSuggestionClick }: QuickSuggestionsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('popular');
  
  const suggestions = {
    popular: [
      { text: "Services & pricing", query: "What services do you offer and what are your prices?" },
      { text: "Book appointment", query: "I'd like to book an appointment" },
      { text: "Hours & location", query: "What are your hours and where are you located?" },
      { text: "Current promotions", query: "Do you have any current promotions?" }
    ],
    services: [
      { text: "Haircut prices", query: "How much is a regular haircut?" },
      { text: "Beard trim", query: "Do you offer beard trimming services?" },
      { text: "Color services", query: "Do you offer hair coloring?" },
      { text: "Specialty cuts", query: "What specialty haircuts do you offer?" }
    ],
    barbers: [
      { text: "Meet the barbers", query: "Tell me about your barbers" },
      { text: "Barber specialties", query: "What are your barbers' specializations?" },
      { text: "Availability", query: "When are your barbers available?" },
      { text: "Experience", query: "How experienced are your barbers?" }
    ]
  };

  const categories = [
    { id: 'popular', name: 'Popular' },
    { id: 'services', name: 'Services' },
    { id: 'barbers', name: 'Barbers' }
  ];

  return (
    <div className="border-t border-gray-200 pt-2">
      {/* Category tabs */}
      <div className="px-4 flex space-x-2 mb-2">
        {categories.map((category) => (
          <button 
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              activeCategory === category.id 
                ? "bg-barber-navy text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-barber-navy"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Suggestions based on active category */}
      <div className="px-4 pb-2 flex flex-wrap gap-2">
        {suggestions[activeCategory as keyof typeof suggestions].map((suggestion, index) => (
          <button 
            key={index}
            onClick={() => onSuggestionClick(suggestion.query)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-barber-navy py-1 px-3 rounded-full transition-colors flex items-center"
          >
            <span>{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickSuggestions;
