
import { cn } from '@/lib/utils';

interface TeamMemberProps {
  name: string;
  specialization: string;
  experience: string;
  image: string;
  className?: string;
}

const TeamMember = ({ 
  name,
  specialization,
  experience,
  image,
  className
}: TeamMemberProps) => {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl",
      className
    )}>
      <div 
        className="h-72 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${image})` }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-barber-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <h3 className="text-xl font-semibold mb-1">{name}</h3>
        <p className="text-barber-gold font-medium mb-1">{specialization}</p>
        <p className="text-sm">{experience} experience</p>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-1 text-barber-navy">{name}</h3>
        <p className="text-barber-gold font-medium">{specialization}</p>
      </div>
    </div>
  );
};

export default TeamMember;
