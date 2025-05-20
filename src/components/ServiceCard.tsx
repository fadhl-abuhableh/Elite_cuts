
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  className?: string;
}

const ServiceCard = ({ 
  id,
  name,
  description,
  price,
  duration,
  image,
  className
}: ServiceCardProps) => {
  return (
    <div className={cn(
      "bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl",
      className
    )}>
      <div 
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold text-barber-navy">{name}</h3>
          <div className="text-barber-gold font-bold">${price}</div>
        </div>
        <div className="text-sm text-gray-500 mb-1">{duration} minutes</div>
        <p className="text-gray-600 mb-5">{description}</p>
        <Button asChild className="bg-barber-navy hover:bg-barber-dark w-full">
          <Link to={`/booking?service=${id}`}>Book Now</Link>
        </Button>
      </div>
    </div>
  );
};

export default ServiceCard;
