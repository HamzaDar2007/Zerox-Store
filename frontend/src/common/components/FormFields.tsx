import { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { Switch } from '@/common/components/ui/switch';
import { cn } from '@/lib/utils';

// ─── FormField (text / number / email / password / tel) ──────────────

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  description?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ name, label, description, className, ...props }, ref) => {
    const {
      register,
      formState: { errors },
    } = useFormContext();
    const error = errors[name];

    return (
      <div className={cn('space-y-2', className)}>
        {label && <Label htmlFor={name}>{label}</Label>}
        <Input id={name} {...register(name)} ref={ref} {...props} />
        {description && !error && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-sm text-destructive">{error.message as string}</p>
        )}
      </div>
    );
  },
);
FormField.displayName = 'FormField';

// ─── FormTextarea ────────────────────────────────────────────────────

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ name, label, className, ...props }, ref) => {
    const {
      register,
      formState: { errors },
    } = useFormContext();
    const error = errors[name];

    return (
      <div className={cn('space-y-2', className)}>
        {label && <Label htmlFor={name}>{label}</Label>}
        <Textarea id={name} {...register(name)} ref={ref} {...props} />
        {error && (
          <p className="text-sm text-destructive">{error.message as string}</p>
        )}
      </div>
    );
  },
);
FormTextarea.displayName = 'FormTextarea';

// ─── FormSelect ─────────────────────────────────────────────────────

interface FormSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: { label: string; value: string }[];
  className?: string;
}

export function FormSelect({
  name,
  label,
  placeholder,
  options,
  className,
}: FormSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name];

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder ?? 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && (
        <p className="text-sm text-destructive">{error.message as string}</p>
      )}
    </div>
  );
}

// ─── FormSwitch ─────────────────────────────────────────────────────

interface FormSwitchProps {
  name: string;
  label: string;
  description?: string;
  className?: string;
}

export function FormSwitch({
  name,
  label,
  description,
  className,
}: FormSwitchProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div
          className={cn(
            'flex items-center justify-between rounded-lg border p-3',
            className,
          )}
        >
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">{label}</Label>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        </div>
      )}
    />
  );
}
