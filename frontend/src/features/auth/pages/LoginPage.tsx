import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/common/hooks/useAuth';
import { loginSchema, type LoginFormValues } from '@/common/schemas/auth.schema';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/common/components/ui/card';
import { Separator } from '@/common/components/ui/separator';
import { APP_NAME } from '@/lib/constants';

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    await login(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/60 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <ShoppingBag className="h-8 w-8 text-[hsl(var(--amazon-orange))]" />
            <span>{APP_NAME}</span>
          </Link>
        </div>

        {/* Sign-In Card */}
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <h1 className="text-xl font-semibold">Sign in</h1>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={isLoggingIn}
                  className="focus-visible:ring-[hsl(var(--amazon-orange))]"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline hover:text-[hsl(var(--amazon-orange-hover))]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoggingIn}
                    className="focus-visible:ring-[hsl(var(--amazon-orange))]"
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[hsl(var(--amazon-orange))] hover:bg-[hsl(var(--amazon-orange-hover))] text-[hsl(var(--navy))] font-bold shadow-sm"
                disabled={isLoggingIn}
              >
                {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col pt-2 pb-6 px-6">
              <p className="text-xs text-muted-foreground text-center">
                By signing in, you agree to {APP_NAME}'s Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Divider */}
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
            New to {APP_NAME}?
          </span>
        </div>

        {/* Create Account Button */}
        <Link to="/register" className="block">
          <Button variant="outline" className="w-full font-medium">
            Create your {APP_NAME} account
          </Button>
        </Link>
      </div>
    </div>
  );
}
