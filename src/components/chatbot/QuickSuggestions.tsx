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
      { text: "Beard trim", query: "Tell me about your beard trimming service" },
      { text: "Hair coloring", query: "What hair coloring services do you offer?" },
      { text: "Kids haircut", query: "Tell me about your kids haircut service" },
      { text: "Hot towel shave", query: "What's included in your hot towel shave service?" }
    ],
    styles: [
      { text: "Classic Cut", query: "Tell me about your Classic Cut style" },
      { text: "Modern Fade", query: "Tell me about your Modern Fade style" },
      { text: "Textured Crop", query: "Tell me about your Textured Crop style" },
      { text: "Pompadour", query: "Tell me about your Pompadour style" }
    ],
    barbers: [
      { text: "Meet our barbers", query: "Tell me about your barbers" },
      { text: "Barber specializations", query: "What are your barbers' specializations?" },
      { text: "Expert recommendations", query: "Can you recommend a barber for me?" },
      { text: "Book with specific barber", query: "I want to book with a specific barber" }
    ]
  };

  const categories = [
    { id: 'popular', name: 'Popular', activeColor: 'bg-barber-gold text-barber-dark', hoverColor: 'hover:bg-barber-gold/80' },
    { id: 'services', name: 'Services', activeColor: 'bg-barber-navy text-white', hoverColor: 'hover:bg-barber-navy/80' },
    { id: 'styles', name: 'Styles', activeColor: 'bg-emerald-600 text-white', hoverColor: 'hover:bg-emerald-500' },
    { id: 'barbers', name: 'Barbers', activeColor: 'bg-purple-600 text-white', hoverColor: 'hover:bg-purple-500' }
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
                ? category.activeColor
                : `bg-gray-100 ${category.hoverColor} text-gray-700`
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
            className={`text-xs bg-gray-100 py-1 px-3 rounded-full transition-colors flex items-center ${
              activeCategory === 'popular' ? 'hover:bg-barber-gold/20 text-barber-dark' :
              activeCategory === 'services' ? 'hover:bg-barber-navy/20 text-barber-navy' :
              activeCategory === 'styles' ? 'hover:bg-emerald-600/20 text-emerald-700' :
              'hover:bg-purple-600/20 text-purple-700'
            }`}
          >
            <span>{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickSuggestions;
