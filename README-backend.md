
# Resolvix Backend Implementation

This document describes the complete backend implementation for the Resolvix Logs Explorer and Ticketing System using Supabase.

## Architecture Overview

The Resolvix backend is built on Supabase and includes:

- **PostgreSQL Database** with custom schemas and Row Level Security (RLS)
- **Authentication** with role-based access control (admin, engineer, viewer)
- **Realtime** subscriptions for live updates
- **Edge Functions** for business logic and API endpoints
- **Database Triggers** for automatic ticket generation

## Database Schema

### Tables

1. **profiles** - Extends auth.users with role information
2. **teams** - Team management
3. **logs** - System log entries with automatic error detection
4. **tickets** - Incident tickets with auto-generation from error logs
5. **chat_messages** - Real-time chat for ticket collaboration
6. **recommendations** - AI-generated recommendations for tickets

### User Roles

- **admin**: Full access to all resources
- **engineer**: Can view logs, manage tickets, participate in chat
- **viewer**: Read-only access to tickets and chat

## Edge Functions

### 1. Log Ingestion (`/functions/log-ingestion`)

**Endpoint**: `POST /functions/v1/log-ingestion`

Ingests log entries and automatically creates tickets for error logs.

```typescript
// Example usage
const response = await fetch(`${SUPABASE_URL}/functions/v1/log-ingestion`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    level: 'error',
    source: 'auth-service',
    message: 'Database connection timeout',
    metadata: { requestId: 'req_123' }
  })
});
```

### 2. Tickets API (`/functions/tickets-api`)

**Endpoints**:
- `GET /functions/v1/tickets-api` - List tickets with filters
- `GET /functions/v1/tickets-api/{id}` - Get single ticket
- `POST /functions/v1/tickets-api` - Create ticket
- `PATCH /functions/v1/tickets-api/{id}` - Update ticket

```typescript
// Get tickets with filters
const response = await fetch(`${SUPABASE_URL}/functions/v1/tickets-api?status=open&priority=high`);

// Update ticket
const response = await fetch(`${SUPABASE_URL}/functions/v1/tickets-api/${ticketId}`, {
  method: 'PATCH',
  body: JSON.stringify({ status: 'in-progress', assignee: userId })
});
```

### 3. Chat API (`/functions/chat-api`)

**Endpoints**:
- `GET /functions/v1/chat-api/{ticketId}/chat` - Get messages
- `POST /functions/v1/chat-api/{ticketId}/chat` - Send message

```typescript
// Send chat message
const response = await fetch(`${SUPABASE_URL}/functions/v1/chat-api/${ticketId}/chat`, {
  method: 'POST',
  body: JSON.stringify({
    message: 'Investigating the issue',
    user_id: userId
  })
});
```

### 4. AI Recommendations (`/functions/ai-recommendations`)

**Endpoints**:
- `GET /functions/v1/ai-recommendations/{ticketId}` - Get recommendations
- `POST /functions/v1/ai-recommendations/{ticketId}` - Generate new recommendations

## Client Integration

### ResolvixService

Use the `ResolvixService` class for all backend operations:

```typescript
import { ResolvixService } from '@/services/resolvixService';

// Ingest a log
await ResolvixService.ingestLog({
  level: 'error',
  source: 'payment-service',
  message: 'Payment processing failed'
});

// Get tickets
const tickets = await ResolvixService.getTickets({ status: 'open' });

// Subscribe to real-time updates
const subscription = ResolvixService.subscribeToTickets((payload) => {
  console.log('Ticket updated:', payload);
});
```

### Authentication

Use the `useAuth` hook for authentication and role-based access:

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, profile, isAdmin, isEngineer } = useAuth();

  if (!user) return <LoginForm />;
  
  return (
    <div>
      <h1>Welcome, {profile?.full_name}</h1>
      {isAdmin && <AdminPanel />}
      {isEngineer && <EngineerTools />}
    </div>
  );
}
```

### Protected Routes

Wrap routes with `ProtectedRoute` to enforce authentication and role requirements:

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

<Routes>
  <Route path="/login" element={<Login />} />
  <Route 
    path="/admin" 
    element={
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    } 
  />
</Routes>
```

## Realtime Features

### Ticket Updates

Subscribe to ticket changes:

```typescript
useEffect(() => {
  const subscription = ResolvixService.subscribeToTickets((payload) => {
    if (payload.eventType === 'INSERT') {
      // New ticket created
      setTickets(prev => [payload.new, ...prev]);
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

### Chat Messages

Subscribe to chat updates:

```typescript
useEffect(() => {
  const subscription = ResolvixService.subscribeToChat(ticketId, (payload) => {
    setMessages(prev => [...prev, payload.new]);
  });

  return () => subscription.unsubscribe();
}, [ticketId]);
```

## Setup Instructions

1. **Environment Variables**
   - Set up Supabase project URL and anon key
   - Configure authentication providers if needed

2. **Database Migration**
   - Run the provided SQL migration to create tables and policies

3. **Deploy Edge Functions**
   - Functions are automatically deployed with the code

4. **Authentication Setup**
   - Enable email/password authentication in Supabase
   - Configure redirect URLs for your application

5. **Test the System**
   - Use the provided cURL examples to test API endpoints
   - Verify real-time functionality in the UI

## Security

- All database access is protected by Row Level Security (RLS)
- Edge Functions validate user permissions
- JWT tokens are automatically handled by Supabase client
- Role-based access control enforced at database and application level

## Testing

Example cURL commands for testing:

```bash
# Ingest a log
curl -X POST "${SUPABASE_URL}/functions/v1/log-ingestion" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -d '{"level":"error","source":"test","message":"Test error"}'

# Get tickets
curl "${SUPABASE_URL}/functions/v1/tickets-api" \
  -H "Authorization: Bearer ${USER_JWT}"
```

The backend is now fully implemented and ready for frontend integration!
