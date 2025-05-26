import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { fetchServices, fetchBarbers, createAppointment, checkBarberWorkingDay } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DbService, DbBarber } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, { 
    message: "Please enter a valid phone number (e.g., +90 555 123 4567)" 
  }),
  service: z.string().min(1, { message: "Please select a service." }),
  barber: z.string().min(1, { message: "Please select a barber." }),
  date: z.string().min(1, { message: "Please select a date." }),
  time: z.string().min(1, { message: "Please select a time." }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const BookingForm = () => {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('service');
  const { toast } = useToast();
  const [services, setServices] = useState<DbService[]>([]);
  const [barbers, setBarbers] = useState<DbBarber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<Array<{value: string, label: string}>>([]);
  const [selectedServiceDuration, setSelectedServiceDuration] = useState<number>(0);
  const [existingAppointments, setExistingAppointments] = useState<Array<{
    barber_id: string;
    appointment_time: string;
    duration_minutes: number;
  }>>([]);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [servicesData, barbersData] = await Promise.all([
          fetchServices(),
          fetchBarbers()
        ]);
        
        if (servicesData) setServices(servicesData);
        if (barbersData) setBarbers(barbersData);
        
        if (import.meta.env.DEV) {
          console.log('Booking form data loaded:', {
            services: servicesData?.length || 0,
            barbers: barbersData?.length || 0
          });
        }
      } catch (error) {
        console.error('Error loading booking form data:', error);
        toast({
          title: "Failed to load data",
          description: "We're experiencing technical difficulties. Some options may be limited.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  // Generate available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  });

  // Generate time slots
  const [selectedDate, setSelectedDate] = useState('');
  const generateTimeSlots = () => {
    const slots = [];
    const date = new Date(selectedDate);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    const startHour = isWeekend ? 10 : 9;
    const endHour = isWeekend ? (date.getDay() === 0 ? 16 : 18) : 19;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          value: timeString,
          label: timeString
        });
      }
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  // Form handling
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      service: initialService || '',
      barber: '',
      date: '',
      time: '',
      notes: '',
    },
  });
  
  // Fetch existing appointments when date or barber changes
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedDate || !form.getValues('barber')) return;

      try {
        // First check if the barber is working on this day
        const barberSchedule = await checkBarberWorkingDay(form.getValues('barber'), selectedDate);
        if (!barberSchedule.isWorking) {
          toast({
            title: "Barber Not Available",
            description: `The selected barber is not available on ${barberSchedule.dayName}s. Please choose another day or select a different barber.`,
            variant: "destructive"
          });
          form.setValue('time', ''); // Clear the time selection
          setExistingAppointments([]);
          setAvailableTimeSlots([]);
          return;
        }

        const { data, error } = await supabase
          .from('appointments')
          .select('barber_id, appointment_time, duration_minutes')
          .eq('date', selectedDate)
          .eq('barber_id', form.getValues('barber'));

        if (error) throw error;
        setExistingAppointments(data || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Error",
          description: "Failed to fetch available time slots. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchAppointments();
  }, [selectedDate, form.watch('barber')]);

  // Update service duration when service changes
  useEffect(() => {
    const serviceId = form.getValues('service');
    if (serviceId) {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        setSelectedServiceDuration(service.duration_minutes);
      }
    }
  }, [form.watch('service'), services]);

  // Generate available time slots considering existing appointments
  const generateAvailableTimeSlots = () => {
    if (!selectedDate || !selectedServiceDuration) return [];

    const slots: Array<{value: string, label: string}> = [];
    const date = new Date(selectedDate);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    const startHour = isWeekend ? 10 : 9;
    const endHour = isWeekend ? (date.getDay() === 0 ? 16 : 18) : 19;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotStart = new Date(`${selectedDate}T${timeString}`);
        const slotEnd = new Date(slotStart.getTime() + selectedServiceDuration * 60000);

        // Check if this slot overlaps with any existing appointments
        const isSlotAvailable = !existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.appointment_time);
          const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration_minutes * 60000);
          
          return (
            (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
            (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
            (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
          );
        });

        if (isSlotAvailable) {
          slots.push({
            value: timeString,
            label: `${timeString} (${selectedServiceDuration} min)`
          });
        }
      }
    }
    
    return slots;
  };

  // Update available time slots when dependencies change
  useEffect(() => {
    const slots = generateAvailableTimeSlots();
    setAvailableTimeSlots(slots);
    
    // Reset time selection if current selection is no longer available
    const currentTime = form.getValues('time');
    if (currentTime && !slots.find(slot => slot.value === currentTime)) {
      form.setValue('time', '');
    }
  }, [selectedDate, selectedServiceDuration, existingAppointments]);
  
  const onSubmit = async (data: FormValues) => {
    if (import.meta.env.DEV) {
      console.log('Raw form data:', data);
    }
    
    try {
      // Create a date object from the selected date and time
      const appointmentDate = new Date(`${data.date}T${data.time}`);
      
      // Get the selected service to get its duration
      const selectedService = services.find(s => s.id === data.service);
      if (!selectedService) {
        throw new Error('Selected service not found');
      }
      
      // Format the appointment data
      const appointmentData = {
        customer_name: data.name,
        customer_email: data.email,
        service_id: data.service,
        barber_id: data.barber,
        appointment_time: appointmentDate.toISOString(),
        date: data.date,
        start_time: data.time,
        duration_minutes: selectedService.duration_minutes,
        notes: data.notes || '',
      };

      if (import.meta.env.DEV) {
        console.log('Formatted appointment data:', {
          ...appointmentData,
          appointment_time_parsed: new Date(appointmentData.appointment_time).toLocaleString(),
          date_parsed: new Date(appointmentData.date).toLocaleDateString()
        });
      }
      
      const result = await createAppointment(appointmentData);
      
      if (result.success) {
        toast({
          title: "Appointment Booked!",
          description: `Your appointment has been scheduled for ${data.date} at ${data.time}.`,
        });
        
        form.reset();
      } else {
        console.error('Appointment creation failed:', {
          error: result.error,
          data: appointmentData
        });
        toast({
          title: "Booking Failed",
          description: result.error?.message || "There was an error booking your appointment. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting appointment:', {
        error,
        formData: data
      });
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "There was an error booking your appointment. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-3/4"></div>
          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-14 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+90 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Services</SelectLabel>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} (${service.price})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="barber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barber</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a barber" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Barbers</SelectLabel>
                        {barbers.map((barber) => (
                          <SelectItem key={barber.id} value={barber.id}>
                            {barber.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedDate(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a date" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Available Dates</SelectLabel>
                        {availableDates.map((date) => (
                          <SelectItem key={date.value} value={date.value}>
                            {date.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!selectedDate || !selectedServiceDuration}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedDate ? "First select a date" :
                          !selectedServiceDuration ? "First select a service" :
                          availableTimeSlots.length === 0 ? "No available slots" :
                          "Select a time"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Available Times</SelectLabel>
                        {availableTimeSlots.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No available slots for this date
                          </SelectItem>
                        ) : (
                          availableTimeSlots.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Requests (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any special requests or notes for your appointment..." 
                    className="resize-none" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-barber-gold hover:bg-amber-500 text-barber-dark font-bold py-3"
            >
              Book Appointment
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BookingForm;
