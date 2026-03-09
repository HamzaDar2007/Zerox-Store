import { useState } from 'react';
import { useGetProductsQuery, useGetStockMovementsQuery } from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Badge } from '@/common/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft, RotateCcw, Clock, Package } from 'lucide-react';

const typeIcons: Record<string, any> = {
  inbound: ArrowDownLeft,
  outbound: ArrowUpRight,
  adjustment: RotateCcw,
};

const typeColors: Record<string, string> = {
  inbound: 'bg-green-100 text-green-700',
  outbound: 'bg-red-100 text-red-700',
  adjustment: 'bg-blue-100 text-blue-700',
};

export default function SellerStockMovementsPage() {
  const [selectedProductId, setSelectedProductId] = useState('');
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({ limit: 100 });
  const products = productsData?.data?.items ?? [];

  const { data, isLoading } = useGetStockMovementsQuery(
    { productId: selectedProductId, limit: 100 },
    { skip: !selectedProductId },
  );
  const movements = data?.data?.items ?? [];

  if (productsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Stock Movements" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Movements" />

      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-medium mr-3">Select Product:</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">-- Choose a product --</option>
            {products.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {!selectedProductId ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Package className="mx-auto h-10 w-10 mb-2" />
            <p>Select a product above to view its stock movements</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Movement History</CardTitle>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No stock movements recorded</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Quantity</th>
                      <th className="pb-2 font-medium">Reference</th>
                      <th className="pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {movements.map((m: any) => {
                      const mType = m.type ?? m.movementType ?? 'adjustment';
                      const Icon = typeIcons[mType] ?? RotateCcw;
                      return (
                        <tr key={m.id}>
                          <td className="py-2">
                            <Badge className={typeColors[mType] ?? 'bg-gray-100 text-gray-700'}>
                              <Icon className="mr-1 h-3 w-3" />
                              {mType}
                            </Badge>
                          </td>
                          <td className="py-2 font-mono">{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</td>
                          <td className="py-2 text-muted-foreground">{m.reference ?? m.reason ?? '-'}</td>
                          <td className="py-2 text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(m.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
