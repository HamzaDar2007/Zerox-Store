import { useState } from 'react';
import { PageHeader } from '@/common/components/PageHeader';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { Card, CardContent } from '@/common/components/ui/card';
import { CreditCard, Star, Trash2 } from 'lucide-react';
import type { SavedPaymentMethod } from '@/common/types';
import {
  useGetSavedPaymentMethodsQuery,
  useDeleteSavedPaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
} from '@/store/api';

export default function CustomerPaymentMethodsPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGetSavedPaymentMethodsQuery();
  const methods = (data?.data ?? []) as SavedPaymentMethod[];

  const [deleteMethod] = useDeleteSavedPaymentMethodMutation();
  const [setDefault] = useSetDefaultPaymentMethodMutation();

  if (isLoading) return <LoadingSpinner label="Loading payment methods..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Methods" description="Manage your saved payment methods" />

      {methods.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-10 w-10" />}
          title="No payment methods"
          description="You haven't saved any payment methods yet."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map((m) => (
            <Card key={m.id} className={m.isDefault ? 'border-primary' : ''}>
              <CardContent className="flex items-start gap-4 p-4">
                <CreditCard className="mt-1 h-8 w-8 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{m.cardBrand || m.paymentMethod}</p>
                    {m.isDefault && <Badge>Default</Badge>}
                  </div>
                  {m.cardLastFour && (
                    <p className="text-sm text-muted-foreground">
                      •••• {m.cardLastFour}
                      {m.cardExpiryMonth && m.cardExpiryYear && (
                        <> · Exp {String(m.cardExpiryMonth).padStart(2, '0')}/{m.cardExpiryYear}</>
                      )}
                    </p>
                  )}
                  {m.nickname && (
                    <p className="text-sm text-muted-foreground">{m.nickname}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    {!m.isDefault && (
                      <Button variant="outline" size="sm" onClick={() => setDefault(m.id)}>
                        <Star className="mr-1 h-3 w-3" /> Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteId(m.id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" /> Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remove Payment Method"
        description="Are you sure you want to remove this payment method?"
        onConfirm={async () => {
          if (deleteId) await deleteMethod(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
