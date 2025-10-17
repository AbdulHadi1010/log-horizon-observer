import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const { machines } = await req.json();

    console.log(`Saving ${machines.length} machine configurations for user ${user.id}`);

    // Simple encryption (in production, use proper encryption)
    const encryptPassword = (password: string): string => {
      return btoa(password); // Base64 encoding (NOT secure for production!)
    };

    // Save each machine configuration
    const savedMachines = [];
    for (const machine of machines) {
      const { data, error } = await supabase
        .from('machine_configs')
        .insert({
          user_id: user.id,
          ip_address: machine.ipAddress,
          username: machine.username,
          encrypted_password: encryptPassword(machine.password),
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving machine config:', error);
        throw error;
      }

      savedMachines.push(data);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        machines: savedMachines.length,
        message: 'Machine configurations saved successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error saving machine configs:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
