import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Textarea } from '@/common/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';

/* ── Warehouse Form ────────────────────────────────────────────── */

const warehouseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  countryCode: z.string().optional(),
  postalCode: z.string().optional(),
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

interface CreateWarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: WarehouseFormValues) => Promise<void> | void;
}

export function CreateWarehouseDialog({ open, onOpenChange, onSubmit }: CreateWarehouseDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: { name: '', code: '', addressLine1: '', city: '', state: '', countryCode: '', postalCode: '' },
  });

  const submit = async (data: WarehouseFormValues) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Warehouse</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-3">
          <div>
            <Input placeholder="Name *" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Input placeholder="Code *" {...register('code')} />
            {errors.code && <p className="text-xs text-destructive mt-1">{errors.code.message}</p>}
          </div>
          <Input placeholder="Address" {...register('addressLine1')} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="City" {...register('city')} />
            <Input placeholder="State" {...register('state')} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Country Code" {...register('countryCode')} />
            <Input placeholder="Postal Code" {...register('postalCode')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Adjust Stock Form ─────────────────────────────────────────── */

const adjustStockSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  adjustment: z.number({ invalid_type_error: 'Must be a number' }).refine((v) => v !== 0, 'Adjustment cannot be zero'),
  reason: z.string().min(1, 'Reason is required'),
});

type AdjustStockFormValues = z.infer<typeof adjustStockSchema>;

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AdjustStockFormValues) => Promise<void> | void;
}

export function AdjustStockDialog({ open, onOpenChange, onSubmit }: AdjustStockDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdjustStockFormValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: { productId: '', adjustment: 0, reason: '' },
  });

  const submit = async (data: AdjustStockFormValues) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-3">
          <div>
            <Input placeholder="Product ID *" {...register('productId')} />
            {errors.productId && <p className="text-xs text-destructive mt-1">{errors.productId.message}</p>}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Adjustment (+/-) *"
              {...register('adjustment', { valueAsNumber: true })}
            />
            {errors.adjustment && <p className="text-xs text-destructive mt-1">{errors.adjustment.message}</p>}
          </div>
          <div>
            <Textarea placeholder="Reason for adjustment *" {...register('reason')} />
            {errors.reason && <p className="text-xs text-destructive mt-1">{errors.reason.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adjusting...' : 'Adjust'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
