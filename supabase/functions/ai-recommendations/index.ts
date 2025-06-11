
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const ticketId = url.pathname.split('/').pop();

    if (req.method === 'GET') {
      // Get existing recommendations for a ticket
      const { data, error } = await supabaseClient
        .from('recommendations')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      // Generate new AI recommendations
      // First, get ticket and log context
      const { data: ticket, error: ticketError } = await supabaseClient
        .from('tickets')
        .select(`
          *,
          log:logs(*)
        `)
        .eq('id', ticketId)
        .single();

      if (ticketError || !ticket) {
        return new Response(
          JSON.stringify({ error: 'Ticket not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mock AI recommendations (replace with actual AI service call)
      const mockRecommendations = [
        {
          title: `Check ${ticket.log?.source || 'service'} configuration`,
          description: `Review configuration files for ${ticket.log?.source || 'the affected service'} to ensure all parameters are correctly set.`,
          url: `https://docs.example.com/${ticket.log?.source || 'service'}-config`
        },
        {
          title: 'Monitor system resources',
          description: 'Check CPU, memory, and disk usage to identify potential resource constraints.',
          url: 'https://docs.example.com/monitoring'
        },
        {
          title: 'Review recent deployments',
          description: 'Check if any recent deployments or changes could be related to this issue.',
          url: 'https://docs.example.com/deployment-history'
        }
      ];

      // Insert recommendations into database
      const recommendationsToInsert = mockRecommendations.map(rec => ({
        ticket_id: ticketId,
        ...rec
      }));

      const { data, error } = await supabaseClient
        .from('recommendations')
        .insert(recommendationsToInsert)
        .select();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('AI recommendations generated for ticket:', ticketId);

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-recommendations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
