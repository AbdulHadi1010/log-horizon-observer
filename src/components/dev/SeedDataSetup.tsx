import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, Database, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TestUser {
  name: string;
  email: string;
  role: string;
}

export function SeedDataSetup() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    success: boolean;
    users?: TestUser[];
    message?: string;
  } | null>(null);
  const { toast } = useToast();

  const seedDemoData = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    
    try {
      console.log('Calling seed-demo-data function...');
      
      const { data, error } = await supabase.functions.invoke('seed-demo-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to call seed function');
      }
      
      console.log('Function response:', data);
      
      if (data?.success) {
        setSeedResult(data);
        toast({
          title: "Demo data seeded successfully!",
          description: "Test users and sample data have been created.",
        });
      } else {
        throw new Error(data?.error || 'Failed to seed demo data');
      }
    } catch (error: any) {
      console.error('Error seeding demo data:', error);
      toast({
        title: "Error seeding demo data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const testUsers = [
    {
      name: "Alice Admin",
      email: "alice.admin@example.com",
      role: "admin",
      password: "Test@1234",
      description: "Admin user with full system access"
    },
    {
      name: "Eddie Engineer", 
      email: "eddie.engineer@example.com",
      role: "engineer",
      password: "Test@1234",
      description: "Engineer with ticket management capabilities"
    },
    {
      name: "Vera Viewer",
      email: "vera.viewer@example.com", 
      role: "viewer",
      password: "Test@1234",
      description: "Read-only access to system data"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Demo Data Seeding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create test users with pre-populated tickets, logs, and chat history for demo and testing purposes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testUsers.map((user) => (
              <Card key={user.email} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{user.name}</h4>
                    <Badge variant={
                      user.role === 'admin' ? 'default' : 
                      user.role === 'engineer' ? 'secondary' : 'outline'
                    }>
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs">{user.description}</p>
                  <div className="text-xs bg-muted p-2 rounded">
                    <strong>Password:</strong> {user.password}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">What will be created:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 3 test users with different roles</li>
              <li>• 4 sample tickets (1 open, 2 closed, 1 in-progress)</li>
              <li>• Sample error and info logs</li>
              <li>• Chat history between users</li>
              <li>• AI recommendations for tickets</li>
            </ul>
          </div>

          <Button 
            onClick={seedDemoData} 
            disabled={isSeeding}
            className="w-full"
          >
            {isSeeding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Seeding Demo Data...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Seed Demo Data
              </>
            )}
          </Button>

          {seedResult && seedResult.success && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Demo Data Created Successfully!</span>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  You can now log in with any of the test user credentials above.
                </p>
                <Button 
                  onClick={() => window.location.href = '/login'}
                  size="sm"
                  className="w-full"
                >
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="text-xs text-muted-foreground">
            <strong>Note:</strong> This operation will clear any existing demo data and recreate it. 
            It's safe to run multiple times.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
