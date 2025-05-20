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
    image: 'https://images.unsplash.com/photo-1553454215-77a5e6e8b7ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'service-3',
    name: 'Hot Towel Shave',
    description: 'Traditional straight razor shave with hot towel treatment.',
    price: 45,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1599351431548-4adb7027730c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'service-4',
    name: 'Haircut & Beard Combo',
    description: 'Full haircut service combined with beard shaping and detailing.',
    price: 50,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'service-5',
    name: 'Kid\'s Haircut',
    description: 'Haircut for children under 12.',
    price: 25,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1569345532577-f353325ac560?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
];

export const barbers = [
  {
    id: 'barber-1',
    name: 'James Wilson',
    bio: 'Master barber with over 15 years of experience specializing in classic cuts.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80'
  },
  {
    id: 'barber-2',
    name: 'Michael Rodriguez',
    bio: 'Style expert who excels in modern trends and precision fades.',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80'
  },
  {
    id: 'barber-3',
    name: 'David Thompson',
    bio: 'Beard specialist with a passion for traditional barbering techniques.',
    image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-1.2.1&auto=format&fit=crop&w=344&q=80'
  },
  {
    id: 'barber-4',
    name: 'Robert Jackson',
    bio: 'Expert in hair coloring and contemporary styles.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80'
  }
];

// Function to load real data from Supabase
export const loadRealData = async () => {
  try {
    const [servicesData, barbersData] = await Promise.all([
      supabase.from('services').select('*'),
      supabase.from('barbers').select('*').eq('is_active', true)
    ]);

    if (servicesData.error) throw servicesData.error;
    if (barbersData.error) throw barbersData.error;

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
      image: barber.image_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80' // Default image
    }));

    return {
      services: mappedServices.length > 0 ? mappedServices : services,
      barbers: mappedBarbers.length > 0 ? mappedBarbers : barbers
    };
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    return { services, barbers }; // Return fallback data
  }
};

// Create a helper to initialize data for components that need it
let initialized = false;
let cachedServices = [...services];
let cachedBarbers = [...barbers];

export const initializeData = async () => {
  if (!initialized) {
    try {
      const { services: loadedServices, barbers: loadedBarbers } = await loadRealData();
      cachedServices = loadedServices;
      cachedBarbers = loadedBarbers;
      initialized = true;
    } catch (error) {
      console.error('Failed to initialize data:', error);
      // Keep using the default data
    }
  }
  
  return {
    services: cachedServices,
    barbers: cachedBarbers
  };
};

// Export a function to get fresh data when needed
export const getServicesAndBarbers = async () => {
  try {
    const { services: loadedServices, barbers: loadedBarbers } = await loadRealData();
    return {
      services: loadedServices,
      barbers: loadedBarbers
    };
  } catch (error) {
    console.error('Failed to get fresh data:', error);
    return {
      services: cachedServices,
      barbers: cachedBarbers
    };
  }
};
