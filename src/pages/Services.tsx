
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/ServiceCard';
import { services } from '@/utils/chatbotData';
import { ChatBot } from '@/components/ui/ChatBot';

const Services = () => {
  return (
    <>
      {/* Page Header */}
      <section 
        className="relative py-32 bg-cover bg-center" 
        style={{ 
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1534297635766-a262cdcb8ee4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
        }}
      >
        <div className="container-custom text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Services</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Premium grooming services tailored to your individual style and needs
          </p>
        </div>
      </section>
      
      {/* Services List */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
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
        </div>
      </section>
      
      {/* Premium Experience */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-barber-dark">The Premium Experience</h2>
              <p className="text-gray-600 mb-6">
                At EliteCuts, every service is delivered with meticulous attention to detail and personalized care. We take the time to understand your preferences, hair type, and lifestyle to provide recommendations that suit you perfectly.
              </p>
              <p className="text-gray-600 mb-6">
                Our services begin with a thorough consultation, followed by a relaxing shampoo experience, precise cutting or styling, and finish with product recommendations to maintain your look at home.
              </p>
              <p className="text-gray-600 mb-6">
                Complimentary hot towels, beverages, and neck shaves are included with most of our services to enhance your experience.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                alt="Premium barbershop experience"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Service Process */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Service Process</h2>
            <p className="section-subtitle">
              Experience our signature four-step approach to exceptional grooming
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center relative">
              <div className="bg-barber-gold text-barber-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-2xl font-bold">1</span>
              </div>
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-barber-gold/30 -z-0"></div>
              <h3 className="text-xl font-bold mb-3 text-barber-navy">Consultation</h3>
              <p className="text-gray-600">
                We start with a thorough discussion about your preferences, lifestyle, and hair goals.
              </p>
            </div>
            
            <div className="text-center relative">
              <div className="bg-barber-gold text-barber-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-2xl font-bold">2</span>
              </div>
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-barber-gold/30 -z-0"></div>
              <h3 className="text-xl font-bold mb-3 text-barber-navy">Cleanse</h3>
              <p className="text-gray-600">
                Enjoy a relaxing shampoo and scalp massage with premium products tailored to your hair type.
              </p>
            </div>
            
            <div className="text-center relative">
              <div className="bg-barber-gold text-barber-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-2xl font-bold">3</span>
              </div>
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-barber-gold/30 -z-0"></div>
              <h3 className="text-xl font-bold mb-3 text-barber-navy">Cut & Style</h3>
              <p className="text-gray-600">
                Our expert barbers apply their craft with precision and skill to create your desired look.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-barber-gold text-barber-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-barber-navy">Finish</h3>
              <p className="text-gray-600">
                We complete your service with styling products and tips to maintain your look at home.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Additional Services */}
      <section className="py-20 bg-barber-navy text-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Additional Services</h2>
            <p className="text-xl max-w-3xl mx-auto">
              Enhance your experience with these premium add-ons
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-3">Hot Towel Treatment</h3>
              <p className="text-gray-300 mb-3">
                A refreshing hot towel infused with essential oils to open pores and refresh the skin.
              </p>
              <p className="text-barber-gold font-bold">$15</p>
            </div>
            
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-3">Facial Scrub</h3>
              <p className="text-gray-300 mb-3">
                A deep cleansing treatment to exfoliate the skin and remove impurities.
              </p>
              <p className="text-barber-gold font-bold">$25</p>
            </div>
            
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-3">Scalp Treatment</h3>
              <p className="text-gray-300 mb-3">
                A nourishing treatment to promote hair health and stimulate growth.
              </p>
              <p className="text-barber-gold font-bold">$30</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Lines */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Premium Products</h2>
            <p className="section-subtitle">
              We use and recommend only the finest grooming products
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-24 flex items-center justify-center mb-4">
                <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center">BP</div>
              </div>
              <h3 className="font-bold">Baxter Professional</h3>
            </div>
            
            <div className="text-center">
              <div className="h-24 flex items-center justify-center mb-4">
                <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center">H&H</div>
              </div>
              <h3 className="font-bold">House & Hound</h3>
            </div>
            
            <div className="text-center">
              <div className="h-24 flex items-center justify-center mb-4">
                <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center">RC</div>
              </div>
              <h3 className="font-bold">Reuzel Collection</h3>
            </div>
            
            <div className="text-center">
              <div className="h-24 flex items-center justify-center mb-4">
                <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center">MB</div>
              </div>
              <h3 className="font-bold">Murdock Barber</h3>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="section-title">Ready to Experience Our Services?</h2>
          <p className="section-subtitle">
            Book your appointment today and enjoy the EliteCuts difference
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

export default Services;
