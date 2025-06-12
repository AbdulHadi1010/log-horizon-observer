
import { useState } from 'react';
import { TestUserSetup } from '@/components/dev/TestUserSetup';
import { IntegrationTests } from '@/components/dev/IntegrationTests';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

export default function DevSetup() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('setup');

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Resolvix Development Center</h1>
          <p className="text-muted-foreground mt-2">
            Set up test data and run comprehensive tests
          </p>
          {user && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <p className="text-sm">
                Signed in as: <strong>{user.email}</strong>
              </p>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Test Data Setup</TabsTrigger>
            <TabsTrigger value="tests">Integration Tests</TabsTrigger>
            <TabsTrigger value="dashboard">Go to Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Test User & Data Setup</CardTitle>
                <CardDescription>
                  Create test users and populate the system with sample data for development and testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TestUserSetup />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <IntegrationTests />
          </TabsContent>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>Access Dashboard</CardTitle>
                <CardDescription>
                  Navigate to the main application dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <div className="space-y-4">
                    <p>You're signed in and ready to access the dashboard.</p>
                    <Button 
                      onClick={() => window.location.href = '/dashboard'} 
                      className="w-full"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p>Please sign in first to access the dashboard.</p>
                    <Button 
                      onClick={() => window.location.href = '/login'} 
                      className="w-full"
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
