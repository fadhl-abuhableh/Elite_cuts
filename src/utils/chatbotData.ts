
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  image: string;
}

export interface Barber {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  image: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  code?: string;
  expiryDate?: string;
}

// Mock services data
export const services: Service[] = [
  {
    id: "s1",
    name: "Classic Haircut",
    description: "A traditional haircut service including a consultation, shampoo, cut, and style.",
    price: 35,
    duration: 30,
    image: "https://images.unsplash.com/photo-1521499892833-773a6c6fd0b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "s2",
    name: "Beard Trim",
    description: "A precise beard trim to shape and maintain your facial hair.",
    price: 25,
    duration: 20,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "s3",
    name: "Hot Towel Shave",
    description: "A luxurious hot towel shave with premium products for the smoothest finish.",
    price: 45,
    duration: 45,
    image: "https://images.unsplash.com/photo-1582095128060-e9ca8130cc6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "s4",
    name: "Hair Coloring",
    description: "Professional hair coloring to cover grays or change your look with quality products.",
    price: 60,
    duration: 90,
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "s5",
    name: "Father & Son Package",
    description: "A haircut for both father and son. Bonding time made stylish.",
    price: 50,
    duration: 60,
    image: "https://images.unsplash.com/photo-1494959764136-6be9eb3c261e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "s6",
    name: "Head Massage",
    description: "A relaxing scalp massage to stimulate blood flow and reduce stress.",
    price: 30,
    duration: 25,
    image: "https://images.unsplash.com/photo-1534367186578-05bffb97fb7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  }
];

// Mock barbers data
export const barbers: Barber[] = [
  {
    id: "b1",
    name: "James Wilson",
    specialization: "Classic Cuts & Styling",
    experience: "15 years",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "b2",
    name: "Michael Thompson",
    specialization: "Beard Grooming Expert",
    experience: "8 years",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "b3",
    name: "David Garcia",
    specialization: "Hair Coloring Specialist",
    experience: "12 years",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "b4",
    name: "Robert Johnson",
    specialization: "Modern Styles & Fades",
    experience: "6 years",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  }
];

// Mock availability for next 7 days
export const generateAvailability = (barberId: string, date: Date) => {
  const timeSlots: TimeSlot[] = [];
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Different hours for weekends
  const startHour = isWeekend ? 10 : 9;
  const endHour = isWeekend ? (dayOfWeek === 0 ? 16 : 18) : 19;
  
  // Generate time slots every 30 minutes
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const id = `${barberId}-${date.toISOString().split('T')[0]}-${hour}-${minute}`;
      // Randomly set some slots as unavailable
      const available = Math.random() > 0.3;
      
      timeSlots.push({
        id,
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        available
      });
    }
  }
  
  return timeSlots;
};

// Mock FAQs
export const faqs: FAQ[] = [
  {
    id: "f1",
    question: "What are your operating hours?",
    answer: "We're open Monday-Friday from 9:00 AM to 7:00 PM, Saturday from 10:00 AM to 6:00 PM, and Sunday from 10:00 AM to 4:00 PM."
  },
  {
    id: "f2",
    question: "Do I need to make an appointment?",
    answer: "While we accept walk-ins, we recommend booking an appointment to ensure you get your preferred time slot and barber."
  },
  {
    id: "f3",
    question: "What payment methods do you accept?",
    answer: "We accept cash, all major credit cards, Apple Pay, and Google Pay."
  },
  {
    id: "f4",
    question: "Do you offer gift cards?",
    answer: "Yes, we offer gift cards in any denomination. They can be purchased in-store or through our website."
  },
  {
    id: "f5",
    question: "What is your cancellation policy?",
    answer: "We request at least 24 hours' notice for cancellations. Late cancellations or no-shows may be subject to a fee."
  }
];

// Mock promotions
export const promotions: Promotion[] = [
  {
    id: "p1",
    title: "First-Time Client Special",
    description: "20% off your first haircut with us. Use code WELCOME20.",
    code: "WELCOME20"
  },
  {
    id: "p2",
    title: "Father's Day Special",
    description: "Book a father & son package and get a complimentary beard trim.",
    expiryDate: "2023-06-30"
  },
  {
    id: "p3",
    title: "Loyalty Program",
    description: "Every 10th haircut is free when you join our loyalty program."
  }
];

// Function to find service information
export const findService = (query: string): Service | null => {
  const normalizedQuery = query.toLowerCase();
  
  for (const service of services) {
    if (
      service.name.toLowerCase().includes(normalizedQuery) ||
      service.description.toLowerCase().includes(normalizedQuery)
    ) {
      return service;
    }
  }
  
  return null;
};

// Function to find barber availability
export const findBarberAvailability = (barberName: string, dateString: string): TimeSlot[] | null => {
  const normalizedName = barberName.toLowerCase();
  let barberId = "";
  
  for (const barber of barbers) {
    if (barber.name.toLowerCase().includes(normalizedName)) {
      barberId = barber.id;
      break;
    }
  }
  
  if (!barberId) return null;
  
  const date = dateString ? new Date(dateString) : new Date();
  return generateAvailability(barberId, date);
};

// Function to find FAQ information
export const findFAQ = (query: string): FAQ | null => {
  const normalizedQuery = query.toLowerCase();
  
  for (const faq of faqs) {
    if (
      faq.question.toLowerCase().includes(normalizedQuery) ||
      faq.answer.toLowerCase().includes(normalizedQuery)
    ) {
      return faq;
    }
  }
  
  return null;
};

// Function to find promotion information
export const findPromotion = (query: string): Promotion | null => {
  const normalizedQuery = query.toLowerCase();
  
  for (const promotion of promotions) {
    if (
      promotion.title.toLowerCase().includes(normalizedQuery) ||
      promotion.description.toLowerCase().includes(normalizedQuery) ||
      (promotion.code && promotion.code.toLowerCase().includes(normalizedQuery))
    ) {
      return promotion;
    }
  }
  
  return null;
};
