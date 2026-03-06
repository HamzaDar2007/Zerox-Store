import { useState } from 'react';
import {
  useGetPagesQuery, useDeletePageMutation, usePublishPageMutation, useUnpublishPageMutation,
  useGetBannersQuery, useDeleteBannerMutation, useToggleBannerActiveMutation,
  useCreatePageMutation, useCreateBannerMutation,
} from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { PageHeader } from '@/common/components/PageHeader';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { formatRelative } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Textarea } from '@/common/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import { Badge } from '@/common/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';
import { Eye, EyeOff, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import type { Page, Banner } from '@/common/types';

export default function AdminCMSPage() {
  // Pages state
  const [pPage, setPPage] = useState(DEFAULT_PAGE);
  const [pLimit, setPLimit] = useState(DEFAULT_LIMIT);
  const [deletePageTarget, setDeletePageTarget] = useState<string | null>(null);

  // Banners state
  const [bPage, setBPage] = useState(DEFAULT_PAGE);
  const [bLimit, setBLimit] = useState(DEFAULT_LIMIT);
  const [deleteBannerTarget, setDeleteBannerTarget] = useState<string | null>(null);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [showCreateBanner, setShowCreateBanner] = useState(false);
  const [pageForm, setPageForm] = useState({ title: '', slug: '', content: '', excerpt: '' });
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', imageUrl: '', linkUrl: '' });

  // Pages API
  const { data: pagesData, isLoading: pagesLoading } = useGetPagesQuery({ page: pPage, limit: pLimit });
  const [deletePage] = useDeletePageMutation();
  const [publishPage] = usePublishPageMutation();
  const [unpublishPage] = useUnpublishPageMutation();

  // Banners API
  const { data: bannersData, isLoading: bannersLoading } = useGetBannersQuery({ page: bPage, limit: bLimit });
  const [deleteBanner] = useDeleteBannerMutation();
  const [toggleBannerActive] = useToggleBannerActiveMutation();
  const [createPage, { isLoading: creatingPage }] = useCreatePageMutation();
  const [createBanner, { isLoading: creatingBanner }] = useCreateBannerMutation();

  const pages = pagesData?.data?.items ?? [];
  const pagesTotal = pagesData?.data?.total ?? 0;
  const pagesTotalPages = pagesData?.data?.totalPages ?? 1;

  const banners = bannersData?.data?.items ?? [];
  const bannersTotal = bannersData?.data?.total ?? 0;
  const bannersTotalPages = bannersData?.data?.totalPages ?? 1;

  // Page handlers
  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      if (isPublished) {
        await unpublishPage(id).unwrap();
        toast.success('Page unpublished');
      } else {
        await publishPage(id).unwrap();
        toast.success('Page published');
      }
    } catch {
      toast.error('Failed to update page');
    }
  };

  const handleDeletePage = async () => {
    if (!deletePageTarget) return;
    try {
      await deletePage(deletePageTarget).unwrap();
      toast.success('Page deleted');
      setDeletePageTarget(null);
    } catch {
      toast.error('Failed to delete page');
    }
  };

  // Banner handlers
  const handleToggleBanner = async (id: string) => {
    try {
      await toggleBannerActive(id).unwrap();
      toast.success('Banner updated');
    } catch {
      toast.error('Failed to update banner');
    }
  };

  const handleDeleteBanner = async () => {
    if (!deleteBannerTarget) return;
    try {
      await deleteBanner(deleteBannerTarget).unwrap();
      toast.success('Banner deleted');
      setDeleteBannerTarget(null);
    } catch {
      toast.error('Failed to delete banner');
    }
  };

  // Page columns
  const pageColumns: ColumnDef<Page, unknown>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">/{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: 'isPublished',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isPublished ? 'default' : 'secondary'}>
          {row.original.isPublished ? 'Published' : 'Draft'}
        </Badge>
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title={row.original.isPublished ? 'Unpublish' : 'Publish'}
            onClick={() => handleTogglePublish(row.original.id, row.original.isPublished)}
          >
            {row.original.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeletePageTarget(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Banner columns
  const bannerColumns: ColumnDef<Banner, unknown>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.imageUrl && (
            <img
              src={row.original.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-10 w-16 rounded object-cover bg-muted"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div>
            <p className="font-medium">{row.original.title}</p>
            {row.original.subtitle && (
              <p className="text-xs text-muted-foreground">{row.original.subtitle}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'position',
      header: 'Position',
      cell: ({ row }) => <StatusBadge status={row.original.position} />,
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
      accessorKey: 'viewCount',
      header: 'Views',
      cell: ({ row }) => row.original.viewCount?.toLocaleString() ?? '0',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title={row.original.isActive ? 'Deactivate' : 'Activate'}
            onClick={() => handleToggleBanner(row.original.id)}
          >
            {row.original.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleteBannerTarget(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="CMS" description="Manage pages and banners" />

      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setShowCreatePage(true)}><Plus className="mr-2 h-4 w-4" /> New Page</Button>
          </div>
          <DataTable
            columns={pageColumns}
            data={pages}
            isLoading={pagesLoading}
            emptyTitle="No pages"
            pagination={{
              page: pPage, limit: pLimit, total: pagesTotal, totalPages: pagesTotalPages,
              onPageChange: setPPage,
              onLimitChange: setPLimit,
            }}
          />
        </TabsContent>

        <TabsContent value="banners" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setShowCreateBanner(true)}><Plus className="mr-2 h-4 w-4" /> New Banner</Button>
          </div>
          <DataTable
            columns={bannerColumns}
            data={banners}
            isLoading={bannersLoading}
            emptyTitle="No banners"
            pagination={{
              page: bPage, limit: bLimit, total: bannersTotal, totalPages: bannersTotalPages,
              onPageChange: setBPage,
              onLimitChange: setBLimit,
            }}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deletePageTarget}
        onOpenChange={(open) => !open && setDeletePageTarget(null)}
        title="Delete Page"
        description="This will permanently remove the CMS page."
        onConfirm={handleDeletePage}
      />
      <ConfirmDialog
        open={!!deleteBannerTarget}
        onOpenChange={(open) => !open && setDeleteBannerTarget(null)}
        title="Delete Banner"
        description="This will permanently remove the banner."
        onConfirm={handleDeleteBanner}
      />

      {/* Create Page Dialog */}
      <Dialog open={showCreatePage} onOpenChange={setShowCreatePage}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Page</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={pageForm.title} onChange={(e) => setPageForm((f) => ({ ...f, title: e.target.value }))} />
            <Input placeholder="Slug (e.g. about-us)" value={pageForm.slug} onChange={(e) => setPageForm((f) => ({ ...f, slug: e.target.value }))} />
            <Textarea placeholder="Page content" rows={6} value={pageForm.content} onChange={(e) => setPageForm((f) => ({ ...f, content: e.target.value }))} />
            <Input placeholder="Excerpt (optional)" value={pageForm.excerpt} onChange={(e) => setPageForm((f) => ({ ...f, excerpt: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePage(false)}>Cancel</Button>
            <Button disabled={creatingPage} onClick={async () => {
              if (!pageForm.title || !pageForm.slug || !pageForm.content) { toast.error('Title, slug and content required'); return; }
              try {
                await createPage({ title: pageForm.title, slug: pageForm.slug, content: pageForm.content, excerpt: pageForm.excerpt || undefined }).unwrap();
                toast.success('Page created');
                setShowCreatePage(false);
                setPageForm({ title: '', slug: '', content: '', excerpt: '' });
              } catch { toast.error('Failed to create page'); }
            }}>
              {creatingPage ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Banner Dialog */}
      <Dialog open={showCreateBanner} onOpenChange={setShowCreateBanner}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Banner</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={bannerForm.title} onChange={(e) => setBannerForm((f) => ({ ...f, title: e.target.value }))} />
            <Input placeholder="Subtitle (optional)" value={bannerForm.subtitle} onChange={(e) => setBannerForm((f) => ({ ...f, subtitle: e.target.value }))} />
            <Input placeholder="Image URL" value={bannerForm.imageUrl} onChange={(e) => setBannerForm((f) => ({ ...f, imageUrl: e.target.value }))} />
            <Input placeholder="Link URL (optional)" value={bannerForm.linkUrl} onChange={(e) => setBannerForm((f) => ({ ...f, linkUrl: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBanner(false)}>Cancel</Button>
            <Button disabled={creatingBanner} onClick={async () => {
              if (!bannerForm.title || !bannerForm.imageUrl) { toast.error('Title and image URL required'); return; }
              try {
                await createBanner({ title: bannerForm.title, subtitle: bannerForm.subtitle || undefined, imageUrl: bannerForm.imageUrl, linkUrl: bannerForm.linkUrl || undefined }).unwrap();
                toast.success('Banner created');
                setShowCreateBanner(false);
                setBannerForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '' });
              } catch { toast.error('Failed to create banner'); }
            }}>
              {creatingBanner ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
