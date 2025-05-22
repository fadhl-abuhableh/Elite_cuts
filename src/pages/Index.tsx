import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChatBot } from '@/components/ui/ChatBot';
import ServiceCard from '@/components/ServiceCard';
import TeamMember from '@/components/TeamMember';
import { services, barbers } from '@/utils/chatbotData';

const Index = () => {
  // Featured services - show only first 3
  const featuredServices = services.slice(0, 3);
  
  return (
    <>
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center py-32" 
        style={{ 
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('https://images.unsplash.com/photo-1546665291-dbef6ab58991?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
        }}
      >
        <div className="container-custom text-center text-white">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 animate-fade-in">
            <span>Elite</span>
            <span className="text-barber-gold">Cuts</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            Premium grooming experience for the modern gentleman
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-barber-gold hover:bg-amber-500 text-barber-dark">
              <Link to="/booking">Book Appointment</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <Link to="/services">Our Services</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Services Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">
              Experience the finest grooming services tailored to your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map(service => (
              <ServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                description={service.description}
                price={service.price}
                duration={service.duration}
                image={service.image}
              />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild className="bg-barber-navy hover:bg-barber-dark">
              <Link to="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* About Preview */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">A Cut Above the Rest</h2>
              <p className="text-gray-600 mb-6">
                At EliteCuts, we've been mastering the art of men's grooming for over 15 years. Our expert barbers combine traditional techniques with modern styles to create a look that's uniquely yours.
              </p>
              <p className="text-gray-600 mb-6">
                Step into our shop and experience the perfect blend of relaxation and style. From classic cuts to trendy fades, hot towel shaves to beard sculpting, we ensure every client leaves looking and feeling their best.
              </p>
              <Button asChild className="bg-barber-navy hover:bg-barber-dark">
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg overflow-hidden h-64">
                <img 
                  src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="Barbershop Interior"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden h-64 mt-8">
                <img 
                  src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="Barber working"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden h-64">
                <img 
                  src="https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="Hair styling"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden h-64 mt-8">
                <img 
                  src="https://images.unsplash.com/photo-1512690459411-b9245aed614b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="Barber tools"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Meet Our Experts</h2>
            <p className="section-subtitle">
              Our team of skilled barbers is dedicated to giving you the perfect look
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {barbers.map(barber => (
              <TeamMember
                key={barber.id}
                name={barber.name}
                specialization={barber.specialization}
                experience={barber.experience}
                image={barber.image}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-barber-navy text-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title text-white">What Our Clients Say</h2>
            <p className="section-subtitle text-gray-300">
              Don't just take our word for it – hear what our customers have to say
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 bg-barber-gold rounded-full flex items-center justify-center font-bold text-barber-dark">JD</div>
                </div>
                <div>
                  <h4 className="font-bold text-lg">John Doe</h4>
                  <div className="flex text-barber-gold">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="italic">
                "The best haircut I've ever had. James really took the time to understand what I wanted and delivered perfectly!"
              </p>
            </div>
            
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 bg-barber-gold rounded-full flex items-center justify-center font-bold text-barber-dark">TS</div>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Tom Smith</h4>
                  <div className="flex text-barber-gold">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="italic">
                "The hot towel shave was an amazing experience. I felt like royalty and walked out looking sharp!"
              </p>
            </div>
            
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 bg-barber-gold rounded-full flex items-center justify-center font-bold text-barber-dark">RL</div>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Robert Lee</h4>
                  <div className="flex text-barber-gold">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="italic">
                "As a first-time client, I was blown away by the attention to detail and friendly atmosphere. I found my new regular barbershop!"
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="container-custom text-center">
          <h2 className="section-title">Ready for Your Next Look?</h2>
          <p className="section-subtitle">
            Book your appointment today and experience the EliteCuts difference
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-barber-gold hover:bg-amber-500 text-barber-dark">
              <Link to="/booking">Book Now</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Chatbot */}
      <ChatBot />
    </>
  );
};

export default Index;
