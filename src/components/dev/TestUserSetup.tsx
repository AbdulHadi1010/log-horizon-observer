
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function TestUserSetup() {
  const [isCreating, setIsCreating] = useState(false);
  const [testUser, setTestUser] = useState<any>(null);
  const { toast } = useToast();

  const createTestUser = async () => {
    setIsCreating(true);
    try {
      // Create the test user through Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'admin@resolvix.com',
        password: 'ResolvixAdmin2024!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Test Admin User'
        }
      });

      if (error) {
        throw error;
      }

      // Update the profile to admin role
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        setTestUser(data.user);
        toast({
          title: "Test user created successfully!",
          description: "You can now log in with the test credentials.",
        });
      }
    } catch (error: any) {
      console.error('Error creating test user:', error);
      toast({
        title: "Error creating test user",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createSampleData = async () => {
    if (!testUser) {
      toast({
        title: "No test user found",
        description: "Please create a test user first",
        variant: "destructive"
      });
      return;
    }

    try {
      // Insert sample logs
      const { error: logsError } = await supabase
        .from('logs')
        .insert([
          {
            level: 'error',
            source: 'auth-service',
            message: 'Database connection timeout after 30 seconds',
            metadata: { requestId: 'req_123', userId: 'user_456' },
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            level: 'error',
            source: 'payment-service',
            message: 'Payment processing failed: Invalid credit card',
            metadata: { orderId: 'order_789', amount: 99.99 },
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
          },
          {
            level: 'warning',
            source: 'api-gateway',
            message: 'Rate limit approaching for client 192.168.1.100',
            metadata: { clientIP: '192.168.1.100', requestCount: 950 },
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          },
          {
            level: 'info',
            source: 'user-service',
            message: 'New user registration completed',
            metadata: { userId: 'user_999', email: 'newuser@example.com' },
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
          }
        ]);

      if (logsError) throw logsError;

      // Insert sample tickets with correct type casting
      const { data: ticketData, error: ticketsError } = await supabase
        .from('tickets')
        .insert([
          {
            title: 'API Performance Issue',
            description: 'Users reporting slow response times on the search API endpoint',
            status: 'open' as const,
            priority: 'high' as const,
            created_by: testUser.id as string,
            tags: ['performance', 'api', 'manual']
          },
          {
            title: 'Security Review Required',
            description: 'Quarterly security audit for user authentication system',
            status: 'in-progress' as const,
            priority: 'medium' as const,
            created_by: testUser.id as string,
            tags: ['security', 'audit']
          }
        ])
        .select();

      if (ticketsError) throw ticketsError;

      // Insert sample chat messages
      if (ticketData && ticketData.length > 0) {
        const { error: chatError } = await supabase
          .from('chat_messages')
          .insert([
            {
              ticket_id: ticketData[0].id,
              user_id: testUser.id,
              message: "I've started investigating this issue. Initial findings suggest it might be related to database connection pooling."
            },
            {
              ticket_id: ticketData[0].id,
              user_id: testUser.id,
              message: "Update: Found the root cause. The connection pool was exhausted due to long-running queries. Implementing query optimization."
            }
          ]);

        if (chatError) throw chatError;
      }

      toast({
        title: "Sample data created!",
        description: "Logs, tickets, and chat messages have been added.",
      });
    } catch (error: any) {
      console.error('Error creating sample data:', error);
      toast({
        title: "Error creating sample data",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Development Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!testUser ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create a test admin user to explore all features of Resolvix.
            </p>
            <Button 
              onClick={createTestUser} 
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? 'Creating...' : 'Create Test User'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">Test User Created!</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Email:</strong> admin@resolvix.com</p>
                <p><strong>Password:</strong> ResolvixAdmin2024!</p>
                <Badge variant="default">Admin Role</Badge>
              </div>
            </div>
            <Button 
              onClick={createSampleData}
              variant="outline"
              className="w-full"
            >
              Add Sample Data
            </Button>
            <p className="text-xs text-muted-foreground">
              Click "Add Sample Data" to populate the system with example logs, tickets, and chat messages.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
