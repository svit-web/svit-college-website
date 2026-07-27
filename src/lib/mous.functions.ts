import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface MOU {
  id: string;
  partner_organization: string;
  purpose: string | null;
  signed_date: string | null;
  expiry_date: string | null;
  status: string;
  metadata: {
    activities?: string[];
    department?: string;
    location?: string;
  };
}

export const getAllMOUs = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('mous')
      .select('*')
      .eq('status', 'published')
      .order('signed_date', { ascending: false });

    if (error) throw error;
    return data as unknown as MOU[];
  });
