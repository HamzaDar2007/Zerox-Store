import { Badge } from '@/common/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';

const ROLE_OPTIONS = [
  { value: 'customer', label: 'Customer', color: 'bg-gray-100 text-gray-700' },
  { value: 'seller', label: 'Seller', color: 'bg-green-100 text-green-700' },
  { value: 'admin', label: 'Admin', color: 'bg-blue-100 text-blue-700' },
  { value: 'super_admin', label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
] as const;

interface RoleSelectProps {
  value?: string;
  onChange: (value: string) => void;
  allowedRoles?: string[];
  disabled?: boolean;
  placeholder?: string;
}

export function RoleSelect({
  value,
  onChange,
  allowedRoles,
  disabled,
  placeholder = 'Select role',
}: RoleSelectProps) {
  const options = allowedRoles
    ? ROLE_OPTIONS.filter((r) => allowedRoles.includes(r.value))
    : ROLE_OPTIONS;

  return (
    <Select value={value ?? ''} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            <span className="flex items-center gap-2">
              <Badge variant="secondary" className={r.color}>
                {r.label}
              </Badge>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const opt = ROLE_OPTIONS.find((r) => r.value === role);
  return (
    <Badge variant="secondary" className={opt?.color ?? 'bg-gray-100 text-gray-700'}>
      {opt?.label ?? role}
    </Badge>
  );
}
