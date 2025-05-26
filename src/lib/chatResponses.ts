import { DbBarber, DbService } from './supabase';

interface RecommendationResult {
  barber: DbBarber;
  message: string;
}

export function getBarberRecommendation(
  barbers: DbBarber[],
  serviceType?: string
): RecommendationResult | null {
  // Find expert barber based on service type
  const expertBarber = barbers.find(b => {
    const bio = b.bio.toLowerCase();
    if (serviceType?.toLowerCase().includes('beard')) {
      return bio.includes('beard') || bio.includes('grooming');
    }
    if (serviceType?.toLowerCase().includes('color')) {
      return bio.includes('color');
    }
    if (serviceType?.toLowerCase().includes('cut')) {
      return bio.includes('cut') || bio.includes('style');
    }
    return false;
  });

  if (!expertBarber) return null;

  return {
    barber: expertBarber,
    message: `I recommend **${expertBarber.name}** - ${expertBarber.bio}`
  };
}

export function formatBookingResponse(
  step: string,
  data: {
    service?: DbService;
    barber?: DbBarber;
    date?: string;
    time?: string;
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
  }
): string {
  switch (step) {
    case 'service_selected':
      return `Great! You've selected ${data.service?.name}. Which barber would you prefer?`;
    
    case 'barber_selected':
      return 'Perfect! When would you like to book your appointment?';
    
    case 'invalid_barber':
      return 'Please select a barber from the list above.';
    
    case 'confirm_booking':
      return `Please confirm your appointment details:\n\n` +
             `Service: ${data.service?.name}\n` +
             `Barber: ${data.barber?.name}\n` +
             `Date: ${data.date}\n` +
             `Time: ${data.time}\n` +
             `Name: ${data.name}\n` +
             `Email: ${data.email}\n` +
             `Phone: ${data.phone}\n` +
             `Notes: ${data.notes || 'None'}\n\n` +
             `Is this correct? (Type 'yes' to confirm or 'no' to start over)`;
    
    default:
      return '';
  }
} 