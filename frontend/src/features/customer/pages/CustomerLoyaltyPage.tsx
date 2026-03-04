import { useState } from 'react';
import { PageHeader } from '@/common/components/PageHeader';
import { StatCard } from '@/common/components/StatCard';
import { DataTable } from '@/common/components/DataTable';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Badge } from '@/common/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { formatDate, formatNumber } from '@/lib/format';
import { Star, Gift, Trophy, Copy, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import type { LoyaltyTransaction, LoyaltyTier } from '@/common/types';
import {
  useGetMyLoyaltyPointsQuery,
  useGetMyLoyaltyTransactionsQuery,
  useGetLoyaltyTiersQuery,
  useGetMyReferralCodeQuery,
  useApplyReferralMutation,
  useGetMyReferralsQuery,
  useRedeemPointsMutation,
} from '@/store/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';

export default function CustomerLoyaltyPage() {
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState('');
  const [referralInput, setReferralInput] = useState('');

  const { data: pointsData, isLoading } = useGetMyLoyaltyPointsQuery();
  const points = pointsData?.data;

  const { data: txnData } = useGetMyLoyaltyTransactionsQuery({});
  const transactions = txnData?.data?.items ?? [];

  const { data: tiersData } = useGetLoyaltyTiersQuery();
  const tiers = (tiersData?.data ?? []) as LoyaltyTier[];

  const { data: codeData } = useGetMyReferralCodeQuery();
  const referralCode = codeData?.data;

  const { data: _referralsData } = useGetMyReferralsQuery();

  const [redeemPts] = useRedeemPointsMutation();
  const [applyRef] = useApplyReferralMutation();

  const handleRedeem = async () => {
    const pts = parseInt(redeemPoints);
    if (isNaN(pts) || pts <= 0) return;
    await redeemPts({ points: pts });
    setShowRedeem(false);
    setRedeemPoints('');
  };

  const handleApplyReferral = async () => {
    if (!referralInput.trim()) return;
    await applyRef(referralInput);
    setReferralInput('');
    toast.success('Referral code applied!');
  };

  const copyCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      toast.success('Code copied to clipboard');
    }
  };

  const txnColumns: ColumnDef<LoyaltyTransaction, unknown>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => <Badge variant="outline">{getValue() as string}</Badge>,
    },
    {
      accessorKey: 'points',
      header: 'Points',
      cell: ({ getValue }) => {
        const pts = getValue() as number;
        return <span className={pts > 0 ? 'text-green-600' : 'text-red-600'}>{pts > 0 ? '+' : ''}{pts}</span>;
      },
    },
    { accessorKey: 'description', header: 'Description' },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
  ];

  if (isLoading) return <LoadingSpinner label="Loading loyalty program..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Loyalty Program" description="Earn and redeem points">
        <Button onClick={() => setShowRedeem(true)} disabled={!points?.availableBalance}>
          Redeem Points
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Star} title="Available Points" value={formatNumber(points?.availableBalance ?? 0)} />
        <StatCard icon={Trophy} title="Lifetime Points" value={formatNumber(points?.lifetimePoints ?? 0)} />
        <StatCard icon={Gift} title="Redeemed" value={formatNumber(points?.totalRedeemed ?? 0)} />
        <StatCard icon={Users} title="Referrals" value={referralCode?.totalReferrals ?? 0} />
      </div>

      {/* Referral Code Section */}
      {referralCode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <code className="rounded bg-muted px-4 py-2 text-lg font-bold">{referralCode.code}</code>
              <Button variant="outline" size="sm" onClick={copyCode}>
                <Copy className="mr-1 h-4 w-4" /> Copy
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Share your code to earn bonus points. {referralCode.totalReferrals} referrals so far.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Apply Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apply Referral Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter referral code"
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value)}
            />
            <Button onClick={handleApplyReferral}>Apply</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tiers */}
      {tiers.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Loyalty Tiers</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <Card key={tier.id} className={points?.tierId === tier.id ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    {tier.colorHex && (
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: tier.colorHex }} />
                    )}
                    <h3 className="font-semibold">{tier.name}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatNumber(tier.minPoints)} – {tier.maxPoints ? formatNumber(tier.maxPoints) : '∞'} pts
                  </p>
                  <p className="text-sm">Earn {tier.earnMultiplier}x points</p>
                  {points?.tierId === tier.id && (
                    <Badge className="mt-2">Current Tier</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Transaction History</h2>
        {transactions.length === 0 ? (
          <EmptyState
            icon={<Star className="h-10 w-10" />}
            title="No transactions"
            description="Your loyalty point transactions will appear here."
          />
        ) : (
          <DataTable columns={txnColumns} data={transactions} />
        )}
      </div>

      {/* Redeem Dialog */}
      <Dialog open={showRedeem} onOpenChange={setShowRedeem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Points</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Available: {formatNumber(points?.availableBalance ?? 0)} points
          </p>
          <Input
            type="number"
            placeholder="Points to redeem"
            value={redeemPoints}
            onChange={(e) => setRedeemPoints(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRedeem(false)}>Cancel</Button>
            <Button onClick={handleRedeem}>Redeem</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
