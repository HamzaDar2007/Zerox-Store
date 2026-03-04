import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/common/hooks/useAuth';
import { registerSchema, type RegisterFormValues } from '@/common/schemas/auth.schema';
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

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    const { confirmPassword: _, ...dto } = data;
    await registerUser({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
    });
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

        {/* Register Card */}
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <h1 className="text-xl font-semibold">Create account</h1>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Your name</Label>
                <Input
                  id="name"
                  placeholder="First and last name"
                  autoComplete="name"
                  disabled={isRegistering}
                  className="focus-visible:ring-[hsl(var(--amazon-orange))]"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={isRegistering}
                  className="focus-visible:ring-[hsl(var(--amazon-orange))]"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">Mobile number <span className="font-normal text-muted-foreground">(Optional)</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+92XXXXXXXXXX"
                  autoComplete="tel"
                  disabled={isRegistering}
                  className="focus-visible:ring-[hsl(var(--amazon-orange))]"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    disabled={isRegistering}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">Re-enter password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    disabled={isRegistering}
                    className="focus-visible:ring-[hsl(var(--amazon-orange))]"
                    {...register('confirmPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[hsl(var(--amazon-orange))] hover:bg-[hsl(var(--amazon-orange-hover))] text-[hsl(var(--navy))] font-bold shadow-sm"
                disabled={isRegistering}
              >
                {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create your {APP_NAME} account
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col pt-2 pb-6 px-6">
              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to {APP_NAME}'s Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Divider */}
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
            Already have an account?
          </span>
        </div>

        {/* Sign In Button */}
        <Link to="/login" className="block">
          <Button variant="outline" className="w-full font-medium">
            Sign in
          </Button>
        </Link>
      </div>
    </div>
  );
}
