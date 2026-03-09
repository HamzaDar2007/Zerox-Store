import { useGetWarehousesQuery, useCreateWarehouseMutation, useDeleteWarehouseMutation } from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Badge } from '@/common/components/ui/badge';
import { Warehouse, Plus, MapPin, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminWarehousesPage() {
  const { data, isLoading, refetch } = useGetWarehousesQuery({});
  const [createWarehouse, { isLoading: creating }] = useCreateWarehouseMutation();
  const [deleteWarehouse] = useDeleteWarehouseMutation();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', address: '', city: '', country: '' });

  const warehouses = data?.data ?? [];

  const handleCreate = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Name and code are required');
      return;
    }
    try {
      await createWarehouse(form).unwrap();
      toast.success('Warehouse created');
      setForm({ name: '', code: '', address: '', city: '', country: '' });
      setShowForm(false);
      refetch();
    } catch {
      toast.error('Failed to create warehouse');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWarehouse(id).unwrap();
      toast.success('Warehouse deleted');
      refetch();
    } catch {
      toast.error('Failed to delete warehouse');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Warehouses" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Warehouses" />
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> Add Warehouse
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Warehouse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g., WH-01" />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm(p => ({ ...p, country: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : 'Create Warehouse'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {warehouses.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Warehouse className="mx-auto h-12 w-12 mb-3" />
              <p>No warehouses configured yet</p>
            </CardContent>
          </Card>
        ) : (
          warehouses.map((wh: any) => (
            <Card key={wh.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5 text-brand-500" />
                    <h3 className="font-medium">{wh.name}</h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(wh.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <Badge variant="outline" className="font-mono">{wh.code}</Badge>
                {(wh.address || wh.city) && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {[wh.address, wh.city, wh.country].filter(Boolean).join(', ')}
                  </p>
                )}
                <div className="text-xs text-muted-foreground">
                  Status: <Badge variant={wh.isActive !== false ? 'default' : 'secondary'}>
                    {wh.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
