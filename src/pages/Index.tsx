
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Activity, MessageSquare, Brain } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
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
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
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

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Ready to streamline your incident management?
          </p>
          <Button onClick={() => navigate('/login')} size="lg" className="px-8">
            Sign In to Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
