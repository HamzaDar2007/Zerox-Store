import { useGetSellerWalletQuery, useGetSellerWalletTransactionsQuery } from '@/store/api';
import { useAppSelector } from '@/store';
import { PageHeader } from '@/common/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';

import { formatCurrency } from '@/lib/format';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

export default function SellerWalletPage() {
  const sellerId = useAppSelector((s) => s.auth.user?.id) ?? '';
  const { data: walletData, isLoading: walletLoading } = useGetSellerWalletQuery(sellerId, { skip: !sellerId });
  const { data: txData, isLoading: txLoading } = useGetSellerWalletTransactionsQuery(sellerId, { skip: !sellerId });

  const wallet = walletData?.data;
  const transactions = txData?.data ?? [];

  if (walletLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Wallet" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Wallet" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <Wallet className="mx-auto h-8 w-8 text-brand-500 mb-2" />
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(wallet?.balance ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <ArrowUpRight className="mx-auto h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm text-muted-foreground">Total Earned</p>
            <p className="text-2xl font-bold">{formatCurrency(wallet?.totalEarned ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <ArrowDownLeft className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm text-muted-foreground">Total Withdrawn</p>
            <p className="text-2xl font-bold">{formatCurrency(wallet?.totalWithdrawn ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <Skeleton className="h-32" />
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="divide-y">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-3 py-3">
                  <div className={`rounded-full p-2 ${Number(tx.amount) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {Number(tx.amount) >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{tx.description ?? tx.type}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-medium ${Number(tx.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(tx.amount) >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
