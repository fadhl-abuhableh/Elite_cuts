
import { useEffect, useState } from 'react';
import { initializeData } from '@/utils/chatbotData';
import { toast } from 'sonner';

// Hard-coded Supabase credentials as fallback
const SUPABASE_URL = "https://zkdglqmguhyyxcmqvwhr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZGdscW1ndWh5eXhjbXF2d2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3Nzk3MDIsImV4cCI6MjA2MzM1NTcwMn0.9mzbiLC2zOcN5gSLl_4WC1Fh8kCftAF4Eg0f1PbqvbM";

export function SupabaseInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if environment variables are set
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      setError('Supabase configuration is missing');
      toast.error('Supabase environment variables are missing. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
      return;
    }
    
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
