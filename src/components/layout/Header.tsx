
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'About', path: '/about' },
    { title: 'Services', path: '/services' },
    { title: 'Booking', path: '/booking' },
  ];

  return (
    <header 
      className={cn(
        'fixed w-full z-50 transition-all duration-300',
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-6'
      )}
    >
      <div className="container-custom flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <h1 className={cn(
            "font-serif text-2xl font-bold transition-colors duration-300",
            isScrolled ? "text-barber-dark" : "text-white"
          )}>
            <span>Elite</span>
            <span className="text-barber-gold">Cuts</span>
          </h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'font-medium text-sm uppercase tracking-wide transition-colors',
                isScrolled 
                  ? (isActive(link.path) ? 'text-barber-gold' : 'text-barber-navy hover:text-barber-gold') 
                  : (isActive(link.path) ? 'text-barber-gold' : 'text-white hover:text-barber-gold')
              )}
            >
              {link.title}
            </Link>
          ))}
          <Button asChild className="bg-barber-gold hover:bg-amber-500 text-barber-dark">
            <Link to="/booking">Book Now</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn(
            "md:hidden p-2 rounded-md",
            isScrolled ? "text-barber-navy" : "text-white"
          )}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-white absolute top-full left-0 right-0 shadow-lg animate-fade-in py-4">
          <div className="container-custom flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'py-2 font-medium border-b border-gray-100',
                  isActive(link.path) ? 'text-barber-gold' : 'text-barber-navy hover:text-barber-gold'
                )}
              >
                {link.title}
              </Link>
            ))}
            <Button asChild className="bg-barber-gold hover:bg-amber-500 text-barber-dark w-full">
              <Link to="/booking" onClick={() => setIsMobileMenuOpen(false)}>Book Now</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
