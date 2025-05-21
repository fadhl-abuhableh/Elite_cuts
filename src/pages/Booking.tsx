
import { useState, useEffect } from 'react';
import { ChatBot } from '@/components/ui/ChatBot';
import BookingForm from '@/components/BookingForm';
import { fetchFAQs, fetchLocations, fetchWorkingHours } from '@/lib/supabase';
import { Map } from '@/components/Map';

const Booking = () => {
  const [showFAQ, setShowFAQ] = useState<string>('');
  const [faqs, setFaqs] = useState<{id: string, question: string, answer: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<{
    address: string;
    city: string;
    state: string;
    phone: string;
    email: string;
  } | null>(null);
  const [hours, setHours] = useState<{
    day_of_week: string;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch FAQs, location and hours data
        const [dbFaqs, locationsData, hoursData] = await Promise.all([
          fetchFAQs(),
          fetchLocations(),
          fetchWorkingHours()
        ]);
        
        // Handle FAQs
        if (dbFaqs && dbFaqs.length > 0) {
          setFaqs(dbFaqs.map(faq => ({
            id: faq.id,
            question: faq.question,
            answer: faq.answer
          })));
        } else {
          // Fallback to default FAQs
          setFaqs([
            {
              id: 'faq1',
              question: 'What happens if I need to cancel my appointment?',
              answer: 'We understand plans change. We request at least 24 hours notice for cancellations. Late cancellations or no-shows may be subject to a fee for the reserved time.'
            },
            {
              id: 'faq2',
              question: 'How early should I arrive for my appointment?',
              answer: 'We recommend arriving 5-10 minutes before your scheduled appointment time to ensure a smooth check-in process.'
            },
            {
              id: 'faq3',
              question: 'What forms of payment do you accept?',
              answer: 'We accept all major credit cards, cash, Apple Pay, and Google Pay.'
            },
            {
              id: 'faq4',
              question: 'Can I request a specific barber for my service?',
              answer: 'Absolutely! You can select your preferred barber when booking your appointment.'
            },
            {
              id: 'faq5',
              question: 'Do you take walk-in appointments?',
              answer: 'While we welcome walk-ins, availability is subject to our schedule. We recommend booking in advance to ensure you get your preferred time and barber.'
            }
          ]);
        }
        
        // Handle location data
        if (locationsData && locationsData.length > 0) {
          const mainLocation = locationsData[0];
          setLocation({
            address: mainLocation.address,
            city: mainLocation.city,
            state: mainLocation.state,
            phone: mainLocation.phone,
            email: mainLocation.email
          });
        }
        
        // Handle hours data
        if (hoursData && hoursData.length > 0) {
          setHours(hoursData.map(hour => ({
            day_of_week: hour.day_of_week,
            open_time: hour.open_time,
            close_time: hour.close_time,
            is_closed: hour.is_closed
          })));
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  
  const toggleFAQ = (id: string) => {
    setShowFAQ(prev => prev === id ? '' : id);
  };

  // Format hours for display
  const formatHours = () => {
    if (!hours || hours.length === 0) {
      return "Mon-Fri: 9:00 AM - 7:00 PM\nSaturday: 10:00 AM - 6:00 PM\nSunday: 10:00 AM - 4:00 PM";
    }
    
    return hours.map(hour => {
      if (hour.is_closed) {
        return `${hour.day_of_week}: Closed`;
      }
      return `${hour.day_of_week}: ${hour.open_time} - ${hour.close_time}`;
    }).join('\n');
  };

  return (
    <>
      {/* Page Header */}
      <section 
        className="relative py-32 bg-cover bg-center" 
        style={{ 
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
        }}
      >
        <div className="container-custom text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Book an Appointment</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Schedule your visit with our expert barbers
          </p>
        </div>
      </section>
      
      {/* Booking Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-barber-navy">Reserve Your Spot</h2>
              <p className="text-gray-600 mb-6">
                Fill out the form below to book your appointment with one of our skilled barbers. Please provide all required information to ensure we can accommodate your preferences.
              </p>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-barber-navy">Available Barbers</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Barber images are now loaded from BookingForm component which uses real data */}
                  <p className="col-span-full text-sm text-gray-500">Choose your preferred barber when booking</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-barber-navy">Booking FAQs</h3>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {faqs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-md overflow-hidden">
                        <button 
                          className="w-full text-left p-4 flex justify-between items-center bg-white hover:bg-gray-50"
                          onClick={() => toggleFAQ(faq.id)}
                        >
                          <span className="font-medium">{faq.question}</span>
                          <span>{showFAQ === faq.id ? '−' : '+'}</span>
                        </button>
                        {showFAQ === faq.id && (
                          <div className="p-4 bg-gray-50 border-t border-gray-200">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <BookingForm />
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Information */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-barber-navy rounded-full text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-barber-navy">Contact</h3>
              <p className="text-gray-600">
                Phone: {location?.phone || '+90 (216) 555-7890'}<br />
                Email: {location?.email || 'info@elitecuts.com'}
              </p>
            </div>
            
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-barber-navy rounded-full text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-barber-navy">Hours</h3>
              <p className="text-gray-600 whitespace-pre-line">
                {formatHours()}
              </p>
            </div>
            
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-barber-navy rounded-full text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-barber-navy">Location</h3>
              <p className="text-gray-600">
                {location?.address || 'Bağdat Cad. No:105/B'}<br />
                {location?.city || 'Kadıköy'}, {location?.state || 'Istanbul'}<br />
                Turkey
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="h-96 bg-gray-200">
        <Map />
      </section>
      
      {/* Chatbot */}
      <ChatBot />
    </>
  );
};

export default Booking;
