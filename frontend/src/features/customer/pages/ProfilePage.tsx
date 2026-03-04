import { useAuth } from '@/common/hooks/useAuth';
import { UserAvatar } from '@/common/components/UserAvatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import { formatDate } from '@/lib/format';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const fields = [
    { label: 'Name', value: user.name },
    { label: 'Email', value: user.email },
    { label: 'Phone', value: user.phone ?? '—' },
    { label: 'Role', value: user.role },
    {
      label: 'Email Verified',
      value: user.isEmailVerified ? 'Yes' : 'No',
    },
    { label: 'Date of Birth', value: user.dateOfBirth ? formatDate(user.dateOfBirth) : '—' },
    { label: 'Gender', value: user.gender ?? '—' },
    { label: 'Member Since', value: formatDate(user.createdAt) },
    { label: 'Last Login', value: user.lastLoginAt ? formatDate(user.lastLoginAt) : '—' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <UserAvatar name={user.name} image={user.profileImage} size="lg" />
          <div>
            <CardTitle>{user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className="mt-1 capitalize">
              {user.role.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label}>
                <dt className="text-sm font-medium text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="mt-0.5 text-sm capitalize">{field.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
