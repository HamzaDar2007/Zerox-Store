import { useState } from 'react';
import {
  useGetFeatureFlagsQuery, useToggleFeatureFlagMutation, useDeleteFeatureFlagMutation,
  useCreateFeatureFlagMutation,
} from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Switch } from '@/common/components/ui/switch';
import { Badge } from '@/common/components/ui/badge';
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
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { FeatureFlag } from '@/common/types';

export default function SAFeatureFlagsPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', rolloutPercentage: 100 });

  const { data, isLoading } = useGetFeatureFlagsQuery();
  const [toggleFlag] = useToggleFeatureFlagMutation();
  const [deleteFlag] = useDeleteFeatureFlagMutation();
  const [createFlag, { isLoading: creating }] = useCreateFeatureFlagMutation();

  const flags: FeatureFlag[] = data?.data ?? [];

  const handleToggle = async (id: string) => {
    try {
      await toggleFlag(id).unwrap();
      toast.success('Feature flag toggled');
    } catch {
      toast.error('Failed to toggle feature flag');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFlag(deleteId).unwrap();
      toast.success('Feature flag deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete feature flag');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Feature Flags" description="Control feature rollouts and A/B tests">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Flag
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        {flags.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="py-8 text-center text-muted-foreground">
              No feature flags configured
            </CardContent>
          </Card>
        ) : (
          flags.map((flag) => (
            <Card key={flag.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{flag.name}</CardTitle>
                  <Switch checked={flag.isEnabled} onCheckedChange={() => handleToggle(flag.id)} />
                </div>
                {flag.description && <CardDescription>{flag.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={flag.isEnabled ? 'default' : 'secondary'}>
                    {flag.isEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  {flag.rolloutPercentage != null && flag.rolloutPercentage < 100 && (
                    <Badge variant="outline">{flag.rolloutPercentage}% rollout</Badge>
                  )}
                  {flag.enabledForRoles && flag.enabledForRoles.length > 0 && (
                    <Badge variant="outline">{flag.enabledForRoles.length} roles</Badge>
                  )}
                  {flag.enabledForUsers && flag.enabledForUsers.length > 0 && (
                    <Badge variant="outline">{flag.enabledForUsers.length} users</Badge>
                  )}
                  <div className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(flag.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Feature Flag"
        description="This will permanently remove the feature flag."
        onConfirm={handleDelete}
      />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Feature Flag</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Flag name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <Input type="number" placeholder="Rollout % (0-100)" value={form.rolloutPercentage} onChange={(e) => setForm((f) => ({ ...f, rolloutPercentage: parseInt(e.target.value) || 0 }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button disabled={creating} onClick={async () => {
              if (!form.name.trim()) { toast.error('Name required'); return; }
              try {
                await createFlag({ name: form.name, description: form.description || undefined, isEnabled: false, rolloutPercentage: form.rolloutPercentage }).unwrap();
                toast.success('Feature flag created');
                setShowCreate(false);
                setForm({ name: '', description: '', rolloutPercentage: 100 });
              } catch { toast.error('Failed to create'); }
            }}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
