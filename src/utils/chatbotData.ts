import { supabase, DbService, DbBarber } from '@/lib/supabase';

// These are fallback data in case the Supabase connection fails
export const services = [
  {
    id: 'service-1',
    name: 'Classic Haircut',
    description: 'Our signature haircut includes a consultation, shampoo, cut, and style.',
    price: 35,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1587909209111-5097ee578ec3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'service-2',
    name: 'Beard Trim',
    description: 'Professional beard shaping and maintenance.',
    price: 20,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'service-3',
    name: 'Hot Towel Shave',
    description: 'Traditional straight razor shave with hot towel treatment.',
    price: 45,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1532710093739-9470acff878f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'service-4',
    name: 'Haircut & Beard Combo',
    description: 'Full haircut service combined with beard shaping and detailing.',
    price: 50,
    duration: 60,
    image: 'https://plus.unsplash.com/premium_photo-1677444491957-ab1e8b9a80fd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'service-5',
    name: 'Kid\'s Haircut',
    description: 'Haircut for children under 12.',
    price: 25,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1704072650662-76df3af134a7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];

export const barbers = [
  {
    id: 'barber-1',
    name: 'James Wilson',
    bio: 'Master barber with over 15 years of experience specializing in classic cuts.',
    specialization: 'Classic Cuts',
    experience: '15+ years',
    image: 'https://images.unsplash.com/photo-1582893561942-d61adcb2e534?q=80&w=1982&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'barber-2',
    name: 'Michael Brown',
    bio: 'Style expert who excels in modern trends and precision fades.',
    specialization: 'Modern Trends & Fades',
    experience: '8 years',
    image: 'https://images.unsplash.com/photo-1741345980697-f3c43eba44a0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'barber-3',
    name: 'David Kim',
    bio: 'Beard specialist with a passion for traditional barbering techniques.',
    specialization: 'Beard Styling',
    experience: '10 years',
    image: 'https://images.unsplash.com/photo-1590571420194-66d9c0cf4475?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'barber-4',
    name: 'Robert Chen',
    bio: 'Expert in hair coloring and contemporary styles.',
    specialization: 'Hair Coloring',
    experience: '12 years',
    image: 'https://images.unsplash.com/photo-1672761431773-a4d77e8ca1d7?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];

// Function to load real data from Supabase
export const loadRealData = async () => {
  try {
    const [servicesData, barbersData, faqsData, promotionsData] = await Promise.all([
      supabase.from('services').select('*'),
      supabase.from('barbers').select('*').eq('is_active', true),
      supabase.from('faqs').select('*'),
      supabase.from('promotions').select('*').gte('valid_until', new Date().toISOString())
    ]);

    if (servicesData.error) throw servicesData.error;
    if (barbersData.error) throw barbersData.error;
    if (faqsData.error) throw faqsData.error;
    if (promotionsData.error) throw promotionsData.error;

    // Map the database data to the format our app expects
    const mappedServices = servicesData.data.map((service: DbService) => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: Number(service.price),
      duration: service.duration_minutes,
      image: `https://images.unsplash.com/photo-1587909209111-5097ee578ec3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60` // Default image
    }));

    const mappedBarbers = barbersData.data.map((barber: DbBarber) => ({
      id: barber.id,
      name: barber.name,
      bio: barber.bio || '',
      // Extract specialization from bio or use a default
      specialization: extractSpecialization(barber.bio) || 'Professional Barber',
      // Extract experience from bio or use a default
      experience: extractExperience(barber.bio) || '5+ years',
      image: barber.image_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80' // Default image
    }));

    if (import.meta.env.DEV) {
      console.log('Supabase data loaded:', {
        services: servicesData.data.length,
        barbers: barbersData.data.length,
        faqs: faqsData?.data?.length || 0,
        promotions: promotionsData?.data?.length || 0
      });
    }

    return {
      services: mappedServices.length > 0 ? mappedServices : services,
      barbers: mappedBarbers.length > 0 ? mappedBarbers : barbers,
      faqs: faqsData?.data || [],
      promotions: promotionsData?.data || []
    };
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    return { 
      services, 
      barbers,
      faqs: [],
      promotions: []
    }; // Return fallback data
  }
};

// Helper functions to extract specialization and experience from barber bio
function extractSpecialization(bio: string | null): string | null {
  if (!bio) return null;
  
  // Check for common specialization indicators
  const specializationMatches = [
    /specializ(es|ing|ed) in ([^\.]+)/i,
    /expert in ([^\.]+)/i,
    /master of ([^\.]+)/i
  ];
  
  for (const pattern of specializationMatches) {
    const match = bio.match(pattern);
    if (match && match[2]) return match[2];
    if (match && match[1]) return match[1];
  }
  
  return null;
}

function extractExperience(bio: string | null): string | null {
  if (!bio) return null;
  
  // Check for experience patterns
  const experienceMatches = [
    /(\d+)[\+]? years? of experience/i,
    /experience of (\d+)[\+]? years/i,
    /(\d+)[\+]? years in/i
  ];
  
  for (const pattern of experienceMatches) {
    const match = bio.match(pattern);
    if (match && match[1]) {
      const years = match[1];
      return `${years}+ years`;
    }
  }
  
  return null;
}

// Create a helper to initialize data for components that need it
let initialized = false;
let cachedServices = [...services];
let cachedBarbers = [...barbers];
let cachedFAQs: any[] = [];
let cachedPromotions: any[] = [];

export const initializeData = async () => {
  if (!initialized) {
    try {
      const { services: loadedServices, barbers: loadedBarbers, faqs, promotions } = await loadRealData();
      cachedServices = loadedServices;
      cachedBarbers = loadedBarbers;
      cachedFAQs = faqs;
      cachedPromotions = promotions;
      initialized = true;
    } catch (error) {
      console.error('Failed to initialize data:', error);
      // Keep using the default data
    }
  }
  
  return {
    services: cachedServices,
    barbers: cachedBarbers,
    faqs: cachedFAQs,
    promotions: cachedPromotions
  };
};

// Export a function to get fresh data when needed
export const getServicesAndBarbers = async () => {
  try {
    const { services: loadedServices, barbers: loadedBarbers, faqs, promotions } = await loadRealData();
    return {
      services: loadedServices,
      barbers: loadedBarbers,
      faqs: faqs,
      promotions: promotions
    };
  } catch (error) {
    console.error('Failed to get fresh data:', error);
    return {
      services: cachedServices,
      barbers: cachedBarbers,
      faqs: cachedFAQs,
      promotions: cachedPromotions
    };
  }
};
