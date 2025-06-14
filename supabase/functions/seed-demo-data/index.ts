
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestUser {
  name: string;
  email: string;
  role: 'admin' | 'engineer' | 'viewer';
  password: string;
}

const testUsers: TestUser[] = [
  {
    name: "Alice Admin",
    email: "alice.admin@example.com",
    role: "admin",
    password: "Test@1234"
  },
  {
    name: "Eddie Engineer", 
    email: "eddie.engineer@example.com",
    role: "engineer",
    password: "Test@1234"
  },
  {
    name: "Vera Viewer",
    email: "vera.viewer@example.com", 
    role: "viewer",
    password: "Test@1234"
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting demo data seeding...');

    // Step 1: Clear existing demo data
    await clearExistingDemoData(supabase);

    // Step 2: Create test users
    const createdUsers = await createTestUsers(supabase);
    
    // Step 3: Create sample logs
    const sampleLogs = await createSampleLogs(supabase);
    
    // Step 4: Create tickets with associations
    await createTicketsAndAssociations(supabase, createdUsers, sampleLogs);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo data seeded successfully',
        users: testUsers.map(u => ({ name: u.name, email: u.email, role: u.role }))
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error seeding demo data:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function clearExistingDemoData(supabase: any) {
  console.log('Clearing existing demo data...');
  
  // Get demo user IDs
  const demoEmails = testUsers.map(u => u.email);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .in('email', demoEmails);

  if (profiles && profiles.length > 0) {
    const userIds = profiles.map((p: any) => p.id);
    
    // Delete in order to respect foreign key constraints
    await supabase.from('recommendations').delete().in('ticket_id', 
      await supabase.from('tickets').select('id').in('created_by', userIds).then((r: any) => 
        r.data ? r.data.map((t: any) => t.id) : []
      )
    );
    
    await supabase.from('chat_messages').delete().in('user_id', userIds);
    await supabase.from('tickets').delete().in('created_by', userIds);
    await supabase.from('logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Clear sample logs
  }

  // Delete auth users (this will cascade to profiles due to foreign key)
  for (const user of testUsers) {
    try {
      const { data: authUser } = await supabase.auth.admin.listUsers();
      const existingUser = authUser?.users?.find((u: any) => u.email === user.email);
      if (existingUser) {
        await supabase.auth.admin.deleteUser(existingUser.id);
      }
    } catch (error) {
      console.log(`User ${user.email} not found or already deleted`);
    }
  }
}

async function createTestUsers(supabase: any) {
  console.log('Creating test users...');
  const createdUsers = [];

  for (const user of testUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.name
        }
      });

      if (authError) throw authError;

      // Update profile with role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: user.role,
          full_name: user.name 
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      createdUsers.push({
        id: authData.user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });

      console.log(`Created user: ${user.name} (${user.email})`);
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }

  return createdUsers;
}

async function createSampleLogs(supabase: any) {
  console.log('Creating sample logs...');
  
  const sampleLogs = [
    {
      level: 'error',
      source: 'payment-service',
      message: 'Payment processing failed: Credit card declined for transaction #TX-98765',
      metadata: {
        transactionId: 'TX-98765',
        cardLast4: '4532',
        errorCode: 'CARD_DECLINED',
        amount: 129.99
      }
    },
    {
      level: 'error', 
      source: 'auth-service',
      message: 'Database connection timeout during user authentication',
      metadata: {
        userId: 'user_456',
        timeout: 30000,
        retryAttempts: 3
      }
    },
    {
      level: 'warning',
      source: 'api-gateway',
      message: 'Rate limit threshold reached for API endpoint /api/users',
      metadata: {
        endpoint: '/api/users',
        requestCount: 980,
        timeWindow: '1hour'
      }
    },
    {
      level: 'info',
      source: 'user-service', 
      message: 'User profile updated successfully',
      metadata: {
        userId: 'user_789',
        updatedFields: ['email', 'preferences']
      }
    }
  ];

  const { data, error } = await supabase
    .from('logs')
    .insert(sampleLogs)
    .select();

  if (error) throw error;
  return data;
}

async function createTicketsAndAssociations(supabase: any, users: any[], logs: any[]) {
  console.log('Creating tickets and associations...');
  
  const eddie = users.find(u => u.role === 'engineer');
  const alice = users.find(u => u.role === 'admin');
  
  if (!eddie || !alice) {
    console.error('Could not find required users');
    return;
  }

  // Eddie's open ticket linked to error log
  const errorLog = logs.find(l => l.level === 'error' && l.source === 'payment-service');
  const eddieTicket = {
    title: 'Payment Processing Failures',
    description: 'Multiple payment processing failures detected. Credit cards are being declined even for valid transactions. This is affecting customer checkout experience and revenue.',
    status: 'open',
    priority: 'high',
    created_by: eddie.id,
    assignee: eddie.id,
    log_id: errorLog?.id,
    tags: ['auto', 'error', 'payment', 'critical']
  };

  // Alice's tickets
  const aliceTickets = [
    {
      title: 'Database Performance Optimization',
      description: 'Completed optimization of database queries for user authentication service. Response times improved by 40%.',
      status: 'closed',
      priority: 'medium', 
      created_by: alice.id,
      assignee: alice.id,
      tags: ['performance', 'database', 'completed']
    },
    {
      title: 'Security Audit Findings',
      description: 'Addressed all critical security vulnerabilities identified in Q4 security audit. All patches applied and tested.',
      status: 'closed',
      priority: 'high',
      created_by: alice.id,
      assignee: alice.id, 
      tags: ['security', 'audit', 'completed']
    },
    {
      title: 'API Rate Limiting Implementation',
      description: 'Currently implementing enhanced rate limiting for public API endpoints to prevent abuse and improve service stability.',
      status: 'in-progress',
      priority: 'medium',
      created_by: alice.id,
      assignee: alice.id,
      tags: ['api', 'rate-limiting', 'in-progress']
    }
  ];

  // Insert all tickets
  const allTickets = [eddieTicket, ...aliceTickets];
  const { data: createdTickets, error: ticketError } = await supabase
    .from('tickets')
    .insert(allTickets)
    .select();

  if (ticketError) throw ticketError;

  // Create chat messages for each ticket
  for (let i = 0; i < createdTickets.length; i++) {
    const ticket = createdTickets[i];
    const isEddieTicket = i === 0;
    
    const chatMessages = isEddieTicket ? [
      {
        ticket_id: ticket.id,
        user_id: eddie.id,
        message: "I've identified the root cause. The payment gateway is returning false declines due to a configuration issue."
      },
      {
        ticket_id: ticket.id,
        user_id: alice.id, 
        message: "Good work on the analysis. Do you need any additional resources to fix this?"
      },
      {
        ticket_id: ticket.id,
        user_id: eddie.id,
        message: "I'll need to coordinate with the payment team to update the gateway settings. Should have this resolved within 2 hours."
      },
      {
        ticket_id: ticket.id,
        user_id: alice.id,
        message: "Perfect. I'll notify the business team about the timeline. Keep me posted on progress."
      }
    ] : [
      {
        ticket_id: ticket.id,
        user_id: alice.id,
        message: "Starting work on this item. Will provide updates as progress is made."
      },
      {
        ticket_id: ticket.id, 
        user_id: eddie.id,
        message: "Let me know if you need any technical assistance with implementation."
      },
      {
        ticket_id: ticket.id,
        user_id: alice.id,
        message: "Thanks! I'll reach out if I hit any blockers."
      }
    ];

    await supabase.from('chat_messages').insert(chatMessages);

    // Create AI recommendations
    const recommendations = isEddieTicket ? [
      {
        ticket_id: ticket.id,
        title: 'Check Payment Gateway Configuration',
        description: 'Review the payment gateway settings for declined transaction thresholds and fraud detection rules.',
        url: 'https://docs.paymentgateway.com/fraud-detection'
      },
      {
        ticket_id: ticket.id, 
        title: 'Implement Retry Logic',
        description: 'Add exponential backoff retry logic for temporarily declined transactions to improve success rates.',
        url: 'https://stripe.com/docs/error-handling'
      }
    ] : [
      {
        ticket_id: ticket.id,
        title: 'Performance Monitoring',
        description: 'Set up continuous monitoring to track the improvements and catch any regressions early.',
        url: 'https://docs.monitoring.com/performance'
      }
    ];

    await supabase.from('recommendations').insert(recommendations);
  }

  console.log(`Created ${createdTickets.length} tickets with chat history and recommendations`);
}
