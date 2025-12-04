import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUsdRate() {
  const [rate, setRate] = useState<number>(83.5); // Fallback rate
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-usd-rate');
        if (error) throw error;
        if (data?.rate) {
          setRate(data.rate);
        }
      } catch (error) {
        console.error('Error fetching USD rate:', error);
        // Use fallback rate
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  const convertToUsd = (inrAmount: number): number => {
    return Number((inrAmount / rate).toFixed(2));
  };

  const formatPriceWithUsd = (inrAmount: number): string => {
    const usdAmount = convertToUsd(inrAmount);
    return `₹${inrAmount.toLocaleString()} ($${usdAmount.toLocaleString()})`;
  };

  return { rate, loading, convertToUsd, formatPriceWithUsd };
}
