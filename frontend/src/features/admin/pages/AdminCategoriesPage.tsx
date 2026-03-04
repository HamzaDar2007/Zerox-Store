import { useState } from 'react';
import { useGetCategoriesQuery, useDeleteCategoryMutation, useCreateCategoryMutation, useUpdateCategoryMutation } from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Input } from '@/common/components/ui/input';
import { Textarea } from '@/common/components/ui/textarea';
import { Switch } from '@/common/components/ui/switch';
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
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/common/types';

export default function AdminCategoriesPage() {
  const { data, isLoading } = useGetCategoriesQuery();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const emptyForm = { name: '', description: '', parentId: '', isActive: true, isFeatured: false, sortOrder: 0 };
  const [form, setForm] = useState(emptyForm);

  const categories: Category[] = data?.data ?? [];
  const rootCategories = categories.filter((c) => !c.parentId);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId).unwrap();
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setDeleteId(null);
    }
  };

  const getChildren = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  const openCreate = (parentId?: string) => {
    setForm({ ...emptyForm, parentId: parentId ?? '' });
    setShowCreate(true);
  };

  const openEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      description: cat.description ?? '',
      parentId: cat.parentId ?? '',
      isActive: cat.isActive,
      isFeatured: cat.isFeatured,
      sortOrder: cat.sortOrder ?? 0,
    });
    setEditCat(cat);
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      await createCategory({
        name: form.name,
        description: form.description || undefined,
        parentId: form.parentId || undefined,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        sortOrder: form.sortOrder,
      }).unwrap();
      toast.success('Category created');
      setShowCreate(false);
    } catch {
      toast.error('Failed to create category');
    }
  };

  const handleUpdate = async () => {
    if (!editCat || !form.name.trim()) return;
    try {
      await updateCategory({
        id: editCat.id,
        data: {
          name: form.name,
          description: form.description || undefined,
          parentId: form.parentId || undefined,
          isActive: form.isActive,
          isFeatured: form.isFeatured,
          sortOrder: form.sortOrder,
        },
      }).unwrap();
      toast.success('Category updated');
      setEditCat(null);
    } catch {
      toast.error('Failed to update category');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Categories" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  const renderCategory = (cat: Category, depth = 0) => {
    const children = getChildren(cat.id);
    return (
      <div key={cat.id}>
        <Card className="mb-2">
          <CardContent className="flex items-center gap-3 py-3" style={{ paddingLeft: `${depth * 24 + 16}px` }}>
            <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium">{cat.name}</p>
                {cat.isFeatured && <Badge variant="secondary">Featured</Badge>}
                {!cat.isActive && <Badge variant="outline">Inactive</Badge>}
              </div>
              {cat.description && (
                <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{children.length} children</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(cat)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteId(cat.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        {children.map((child) => renderCategory(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Manage product categories">
        <Button onClick={() => openCreate()}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </PageHeader>

      {rootCategories.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No categories found</p>
      ) : (
        <div>{rootCategories.map((cat) => renderCategory(cat))}</div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Category"
        description="This will delete the category and may affect products. Continue?"
        onConfirm={handleDelete}
        destructive
      />

      {/* Create / Edit Dialog */}
      <Dialog open={showCreate || !!editCat} onOpenChange={(o) => { if (!o) { setShowCreate(false); setEditCat(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editCat ? 'Edit Category' : 'Create Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Category name" />
            </div>
            <div>
              <label className="text-sm font-medium">Parent Category</label>
              <Select value={form.parentId} onValueChange={(v) => setForm((f) => ({ ...f, parentId: v === '__none__' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="None (root)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (root)</SelectItem>
                  {categories.filter((c) => c.id !== editCat?.id).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </div>
            <div>
              <label className="text-sm font-medium">Sort Order</label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} /> Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))} /> Featured
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditCat(null); }}>Cancel</Button>
            <Button onClick={editCat ? handleUpdate : handleCreate} disabled={creating || updating}>
              {(creating || updating) ? 'Saving...' : editCat ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
