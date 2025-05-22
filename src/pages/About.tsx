import { ChatBot } from '@/components/ui/ChatBot';
import TeamMember from '@/components/TeamMember';
import { barbers } from '@/utils/chatbotData';

const About = () => {
  return (
    <>
      {/* Page Header */}
      <section 
        className="relative py-32 bg-cover bg-center" 
        style={{ 
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1587909209111-5097ee578ec3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
        }}
      >
        <div className="container-custom text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About EliteCuts</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Where tradition meets modern style
          </p>
        </div>
      </section>
      
      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-barber-dark">Our Story</h2>
              <p className="text-gray-600 mb-6">
                Founded in 2008 by master barber James Wilson, EliteCuts began as a small, traditional barbershop with a vision to provide exceptional grooming services for the modern gentleman.
              </p>
              <p className="text-gray-600 mb-6">
                What started as a two-chair operation has grown into one of the city's premier barbershops, known for our attention to detail, skilled barbers, and relaxing atmosphere where clients can unwind while getting transformed.
              </p>
              <p className="text-gray-600 mb-6">
                Despite our growth, we've stayed true to our founding principles: personalized service, technical excellence, and an unwavering commitment to client satisfaction.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1592647420148-bfcc177e2117?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmFyYmVyc2hvcHxlbnwwfHwwfHx8MA%3D%3D" 
                alt="Barbershop story"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Mission */}
      <section className="py-20 bg-barber-navy text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl max-w-3xl mx-auto mb-10">
            To provide exceptional grooming services that help our clients look and feel their best, delivered in a welcoming environment by skilled professionals who are passionate about their craft.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
              <div className="bg-barber-gold text-barber-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Quality</h3>
              <p>
                We use premium products and proven techniques to deliver results that exceed expectations.
              </p>
            </div>
            
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
              <div className="bg-barber-gold text-barber-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p>
                We continuously learn and adapt to provide the latest styles and techniques to our clients.
              </p>
            </div>
            
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
              <div className="bg-barber-gold text-barber-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Community</h3>
              <p>
                We strive to create a welcoming environment where clients become friends and part of the EliteCuts family.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Team */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Meet Our Expert Team</h2>
            <p className="section-subtitle">
              Our skilled barbers bring years of experience and passion to every service
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
      
      {/* Our Space */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Space</h2>
            <p className="section-subtitle">
              Step into a space designed for comfort, style, and the perfect grooming experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-lg overflow-hidden h-72">
              <img 
                src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="Barbershop Interior"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="rounded-lg overflow-hidden h-72">
              <img 
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="Barber Station"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="rounded-lg overflow-hidden h-72">
              <img 
                src="https://images.unsplash.com/photo-1521499892833-773a6c6fd0b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="Barber Tools"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="rounded-lg overflow-hidden h-72">
              <img 
                src="https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="Barber Chair"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="rounded-lg overflow-hidden h-72">
              <img 
                src="https://images.unsplash.com/photo-1512690459411-b9245aed614b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="Products Display"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="rounded-lg overflow-hidden h-72">
              <img 
                src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="Waiting Area"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle">
              The principles that guide everything we do at EliteCuts
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md flex">
              <div className="mr-5 text-barber-gold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-barber-navy">Excellence</h3>
                <p className="text-gray-600">
                  We strive for excellence in every haircut, every shave, and every interaction with our clients.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md flex">
              <div className="mr-5 text-barber-gold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-barber-navy">Respect</h3>
                <p className="text-gray-600">
                  We respect our clients' time, preferences, and individuality, tailoring our services to their unique needs.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md flex">
              <div className="mr-5 text-barber-gold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-barber-navy">Integrity</h3>
                <p className="text-gray-600">
                  We operate with honesty and transparency in all aspects of our business, from pricing to service recommendations.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md flex">
              <div className="mr-5 text-barber-gold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-barber-navy">Growth</h3>
                <p className="text-gray-600">
                  We continuously invest in our barbers' education and skills development to stay at the forefront of the industry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chatbot */}
      <ChatBot />
    </>
  );
};

export default About;
