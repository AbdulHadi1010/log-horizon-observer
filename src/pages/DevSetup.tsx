
import { TestUserSetup } from '@/components/dev/TestUserSetup';

export default function DevSetup() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Resolvix Dev Setup</h1>
          <p className="text-muted-foreground mt-2">
            Set up test data to explore the platform
          </p>
        </div>
        <TestUserSetup />
      </div>
    </div>
  );
}
