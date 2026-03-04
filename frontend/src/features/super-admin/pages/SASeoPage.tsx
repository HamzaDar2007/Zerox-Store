import { useState } from 'react';
import {
  useGetSeoMetadataQuery, useDeleteSeoMetadataMutation,
  useGetUrlRedirectsQuery, useDeleteUrlRedirectMutation, useToggleUrlRedirectActiveMutation,
  useCreateSeoMetadataMutation, useCreateUrlRedirectMutation,
} from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { PageHeader } from '@/common/components/PageHeader';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { formatRelative } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { Input } from '@/common/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import type { SeoMetadata, UrlRedirect } from '@/common/types';

export default function SASeoPage() {
  // SEO metadata state
  const [sPage, setSPage] = useState(DEFAULT_PAGE);
  const [sLimit, setSLimit] = useState(DEFAULT_LIMIT);
  const [deleteSeoId, setDeleteSeoId] = useState<string | null>(null);

  // Redirects state
  const [rPage, setRPage] = useState(DEFAULT_PAGE);
  const [rLimit, setRLimit] = useState(DEFAULT_LIMIT);
  const [deleteRedirectId, setDeleteRedirectId] = useState<string | null>(null);
  const [showCreateSeo, setShowCreateSeo] = useState(false);
  const [showCreateRedirect, setShowCreateRedirect] = useState(false);
  const [seoForm, setSeoForm] = useState({ entityType: '', entityId: '', metaTitle: '', metaDescription: '' });
  const [redirectForm, setRedirectForm] = useState({ sourceUrl: '', targetUrl: '', redirectType: '301' });

  const { data: seoData, isLoading: seoLoading } = useGetSeoMetadataQuery({ page: sPage, limit: sLimit });
  const [deleteSeo] = useDeleteSeoMetadataMutation();

  const { data: redirectsData, isLoading: redirectsLoading } = useGetUrlRedirectsQuery({ page: rPage, limit: rLimit });
  const [deleteRedirect] = useDeleteUrlRedirectMutation();
  const [toggleActive] = useToggleUrlRedirectActiveMutation();
  const [createSeo, { isLoading: creatingSeo }] = useCreateSeoMetadataMutation();
  const [createRedirect, { isLoading: creatingRedirect }] = useCreateUrlRedirectMutation();

  const seoItems = seoData?.data?.items ?? [];
  const seoTotal = seoData?.data?.total ?? 0;
  const seoTotalPages = seoData?.data?.totalPages ?? 1;

  const redirectItems = redirectsData?.data?.items ?? [];
  const redirectTotal = redirectsData?.data?.total ?? 0;
  const redirectTotalPages = redirectsData?.data?.totalPages ?? 1;

  const handleDeleteSeo = async () => {
    if (!deleteSeoId) return;
    try {
      await deleteSeo(deleteSeoId).unwrap();
      toast.success('SEO metadata deleted');
      setDeleteSeoId(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggleRedirect = async (id: string) => {
    try {
      await toggleActive(id).unwrap();
      toast.success('Redirect updated');
    } catch {
      toast.error('Failed to toggle redirect');
    }
  };

  const handleDeleteRedirect = async () => {
    if (!deleteRedirectId) return;
    try {
      await deleteRedirect(deleteRedirectId).unwrap();
      toast.success('Redirect deleted');
      setDeleteRedirectId(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const seoColumns: ColumnDef<SeoMetadata, unknown>[] = [
    {
      accessorKey: 'entityType',
      header: 'Entity',
      cell: ({ row }) => (
        <div>
          <Badge variant="outline">{row.original.entityType}</Badge>
        </div>
      ),
    },
    {
      accessorKey: 'metaTitle',
      header: 'Meta Title',
      cell: ({ row }) => (
        <span className="line-clamp-1">{row.original.metaTitle || '—'}</span>
      ),
    },
    {
      accessorKey: 'metaDescription',
      header: 'Meta Description',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {row.original.metaDescription || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ row }) => formatRelative(row.original.updatedAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => setDeleteSeoId(row.original.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const redirectColumns: ColumnDef<UrlRedirect, unknown>[] = [
    {
      accessorKey: 'sourceUrl',
      header: 'Source',
      cell: ({ row }) => <code className="text-sm">{row.original.sourceUrl}</code>,
    },
    {
      accessorKey: 'targetUrl',
      header: 'Target',
      cell: ({ row }) => <code className="text-sm">{row.original.targetUrl}</code>,
    },
    {
      accessorKey: 'redirectType',
      header: 'Type',
      cell: ({ row }) => <StatusBadge status={row.original.redirectType} />,
    },
    {
      accessorKey: 'isActive',
      header: 'Active',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'hitCount',
      header: 'Hits',
      cell: ({ row }) => row.original.hitCount?.toLocaleString() ?? '0',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleToggleRedirect(row.original.id)}>
            {row.original.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteRedirectId(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="SEO Management" description="Manage SEO metadata and URL redirects" />

      <Tabs defaultValue="metadata">
        <TabsList>
          <TabsTrigger value="metadata">SEO Metadata</TabsTrigger>
          <TabsTrigger value="redirects">URL Redirects</TabsTrigger>
        </TabsList>

        <TabsContent value="metadata" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setShowCreateSeo(true)}><Plus className="mr-2 h-4 w-4" /> Add SEO Entry</Button>
          </div>
          <DataTable
            columns={seoColumns}
            data={seoItems}
            isLoading={seoLoading}
            emptyTitle="No SEO metadata"
            pagination={{
              page: sPage, limit: sLimit, total: seoTotal, totalPages: seoTotalPages,
              onPageChange: setSPage, onLimitChange: setSLimit,
            }}
          />
        </TabsContent>

        <TabsContent value="redirects" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setShowCreateRedirect(true)}><Plus className="mr-2 h-4 w-4" /> Add Redirect</Button>
          </div>
          <DataTable
            columns={redirectColumns}
            data={redirectItems}
            isLoading={redirectsLoading}
            emptyTitle="No redirects"
            pagination={{
              page: rPage, limit: rLimit, total: redirectTotal, totalPages: redirectTotalPages,
              onPageChange: setRPage, onLimitChange: setRLimit,
            }}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteSeoId}
        onOpenChange={(open) => !open && setDeleteSeoId(null)}
        title="Delete SEO Metadata"
        description="This will permanently remove the SEO metadata."
        onConfirm={handleDeleteSeo}
      />
      <ConfirmDialog
        open={!!deleteRedirectId}
        onOpenChange={(open) => !open && setDeleteRedirectId(null)}
        title="Delete Redirect"
        description="This will permanently remove the URL redirect."
        onConfirm={handleDeleteRedirect}
      />

      {/* Create SEO Dialog */}
      <Dialog open={showCreateSeo} onOpenChange={setShowCreateSeo}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add SEO Metadata</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Entity type (e.g. product, category)" value={seoForm.entityType} onChange={(e) => setSeoForm((f) => ({ ...f, entityType: e.target.value }))} />
            <Input placeholder="Entity ID" value={seoForm.entityId} onChange={(e) => setSeoForm((f) => ({ ...f, entityId: e.target.value }))} />
            <Input placeholder="Meta title" value={seoForm.metaTitle} onChange={(e) => setSeoForm((f) => ({ ...f, metaTitle: e.target.value }))} />
            <Input placeholder="Meta description" value={seoForm.metaDescription} onChange={(e) => setSeoForm((f) => ({ ...f, metaDescription: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSeo(false)}>Cancel</Button>
            <Button disabled={creatingSeo} onClick={async () => {
              if (!seoForm.entityType || !seoForm.entityId) { toast.error('Entity type and ID required'); return; }
              try {
                await createSeo({ entityType: seoForm.entityType, entityId: seoForm.entityId, metaTitle: seoForm.metaTitle || undefined, metaDescription: seoForm.metaDescription || undefined }).unwrap();
                toast.success('SEO metadata created');
                setShowCreateSeo(false);
                setSeoForm({ entityType: '', entityId: '', metaTitle: '', metaDescription: '' });
              } catch { toast.error('Failed to create'); }
            }}>
              {creatingSeo ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Redirect Dialog */}
      <Dialog open={showCreateRedirect} onOpenChange={setShowCreateRedirect}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add URL Redirect</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Source URL (e.g. /old-page)" value={redirectForm.sourceUrl} onChange={(e) => setRedirectForm((f) => ({ ...f, sourceUrl: e.target.value }))} />
            <Input placeholder="Target URL (e.g. /new-page)" value={redirectForm.targetUrl} onChange={(e) => setRedirectForm((f) => ({ ...f, targetUrl: e.target.value }))} />
            <Select value={redirectForm.redirectType} onValueChange={(v) => setRedirectForm((f) => ({ ...f, redirectType: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="301">301 (Permanent)</SelectItem>
                <SelectItem value="302">302 (Temporary)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRedirect(false)}>Cancel</Button>
            <Button disabled={creatingRedirect} onClick={async () => {
              if (!redirectForm.sourceUrl || !redirectForm.targetUrl) { toast.error('Source and target URLs required'); return; }
              try {
                await createRedirect({ sourceUrl: redirectForm.sourceUrl, targetUrl: redirectForm.targetUrl }).unwrap();
                toast.success('Redirect created');
                setShowCreateRedirect(false);
                setRedirectForm({ sourceUrl: '', targetUrl: '', redirectType: '301' });
              } catch { toast.error('Failed to create redirect'); }
            }}>
              {creatingRedirect ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
