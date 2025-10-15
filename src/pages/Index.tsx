import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Activity, MessageSquare, Brain } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!loading && user && !hasRedirected) {
      console.log('User authenticated, redirecting to dashboard...');
      setHasRedirected(true);
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate, hasRedirected]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show loading while redirect happens
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">R</span>
            </div>
            <h1 className="text-4xl font-bold">Resolvix</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Production-ready incident management platform with real-time collaboration, 
            intelligent log analysis, and AI-powered assistance.
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate('/login')} size="lg">
              Sign Up Free
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')} size="lg">
              Sign In
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Choose your role: Admin, Engineer, or Support during signup
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Real-time Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Ingest and analyze logs in real-time with automatic error detection and alerting.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Smart Ticketing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatic ticket creation from error logs with intelligent routing and prioritization.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Team Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time collaboration with team chat integrated directly into ticket workflows.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get intelligent suggestions and analysis for faster incident resolution.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center bg-card rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to streamline your incident management?</h2>
          <p className="text-muted-foreground mb-6">
            Join teams using Resolvix to resolve issues faster and more efficiently.
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate('/login')} size="lg" className="px-8">
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
