
import { AuthProvider as AuthContextProvider } from '@/hooks/useAuth';

export function AuthProvider({ children }) {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  );
}
