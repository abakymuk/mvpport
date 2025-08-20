import { AuthForm } from '@/components/auth/auth-form';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">MVP Port</h1>
            <p className="text-muted-foreground">
              Создайте новую учетную запись
            </p>
          </div>
          <ThemeToggle />
        </div>
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
