
import { useEffect, useState } from 'react';
import { initializeData } from '@/utils/chatbotData';

export function SupabaseInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeData();
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing Supabase data:', err);
        setError('Failed to load data from Supabase');
      }
    };

    loadData();
  }, []);

  // This component doesn't render anything visible
  return null;
}

export default SupabaseInitializer;
