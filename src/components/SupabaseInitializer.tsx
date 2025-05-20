
import { useEffect, useState } from 'react';
import { initializeData } from '@/utils/chatbotData';
import { toast } from 'sonner';

export function SupabaseInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeData();
        setIsInitialized(true);
        // Only show success toast in development
        if (import.meta.env.DEV) {
          toast.success('Supabase data loaded successfully');
        }
      } catch (err) {
        console.error('Error initializing Supabase data:', err);
        setError('Failed to load data from Supabase');
        toast.error('Failed to load data from Supabase. Using fallback data.');
      }
    };

    loadData();
  }, []);

  // This component doesn't render anything visible
  return null;
}

export default SupabaseInitializer;
