import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { productsApi } from '@/services/api'
import type { Product, ProductVariant, AttributeValue, ProductCategory } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Eye, Plus, X, Image as ImageIcon, Layers, Tag, List, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileUploader } from '@/components/shared/file-uploader'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0),
  storeId: z.string().min(1, 'Required'),
})
type FormData = z.infer<typeof schema>

const variantSchema = z.object({
  sku: z.string().min(1),
  name: z.string().optional(),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().optional(),
})
type VariantFormData = z.infer<typeof variantSchema>

const attrKeySchema = z.object({ name: z.string().min(1), inputType: z.string().min(1) })
type AttrKeyFormData = z.infer<typeof attrKeySchema>

const attrValueSchema = z.object({ value: z.string().min(1) })
type AttrValueFormData = z.infer<typeof attrValueSchema>

/* ── Variants sub-panel ── */
function VariantsPanel({ productId }: { productId: string }) {
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ProductVariant | null>(null)
  const { data: variants = [], isLoading } = useQuery({ queryKey: ['product-variants', productId], queryFn: () => productsApi.getVariants(productId) })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<VariantFormData>({ resolver: zodResolver(variantSchema) as any })
  const createM = useMutation({ mutationFn: (d: VariantFormData) => productsApi.createVariant({ ...d, productId }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['product-variants', productId] }); setDialogOpen(false); reset(); toast.success('Variant created') }, onError: () => toast.error('Failed') })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: VariantFormData & { id: string }) => productsApi.updateVariant(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['product-variants', productId] }); setDialogOpen(false); setEditing(null); toast.success('Updated') }, onError: () => toast.error('Failed') })
  const deleteM = useMutation({ mutationFn: (id: string) => productsApi.deleteVariant(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['product-variants', productId] }); toast.success('Deleted') }, onError: () => toast.error('Failed') })

  const openCreate = () => { setEditing(null); reset({ sku: '', name: '', price: 0 }); setDialogOpen(true) }
  const openEdit = (v: ProductVariant) => { setEditing(v); reset({ sku: v.sku, name: v.name ?? '', price: v.price, compareAtPrice: v.compareAtPrice ?? undefined }); setDialogOpen(true) }
  const onSubmit = (d: VariantFormData) => editing ? updateM.mutate({ ...d, id: editing.id }) : createM.mutate(d)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Variants</h3>
        <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-3 w-3" />Add Variant</Button>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !variants.length ? <p className="text-sm text-muted-foreground">No variants yet.</p> : (
        <div className="space-y-2">
          {(Array.isArray(variants) ? variants : []).map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{v.name || v.sku}</p>
                <p className="text-xs text-muted-foreground">SKU: {v.sku} · {formatCurrency(v.price)}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Pencil className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteM.mutate(v.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Variant' : 'Add Variant'}</DialogTitle><DialogDescription>Manage product variant</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>SKU</Label><Input {...register('sku')} />{errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}</div>
              <div className="space-y-2"><Label>Name</Label><Input {...register('name')} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Price</Label><Input type="number" step="0.01" {...register('price')} /></div>
              <div className="space-y-2"><Label>Compare At Price</Label><Input type="number" step="0.01" {...register('compareAtPrice')} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">{editing ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ── Images sub-panel ── */
function ImagesPanel({ productId }: { productId: string }) {
  const qc = useQueryClient()
  const { data: images = [], isLoading } = useQuery({ queryKey: ['product-images', productId], queryFn: () => productsApi.getImages(productId) })
  const uploadM = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('productId', productId)
      return productsApi.uploadImage(fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['product-images', productId] }); toast.success('Image uploaded') },
    onError: () => toast.error('Upload failed'),
  })
  const deleteM = useMutation({ mutationFn: (id: string) => productsApi.deleteImage(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['product-images', productId] }); toast.success('Deleted') }, onError: () => toast.error('Failed') })

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Images</h3>
      <FileUploader
        accept="image/*"
        maxSizeMB={5}
        onUpload={(files) => { if (files[0]) uploadM.mutate(files[0]) }}
      />
      {uploadM.isPending && <Progress value={undefined} className="h-1" />}
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !images.length ? <p className="text-sm text-muted-foreground">No images yet.</p> : (
        <div className="grid grid-cols-3 gap-3">
          {(Array.isArray(images) ? images : []).map((img) => (
            <div key={img.id} className="group relative rounded-lg border overflow-hidden">
              <img src={img.url} alt={img.altText ?? ''} className="h-24 w-full object-cover" />
              <Button variant="destructive" size="icon" className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteM.mutate(img.id)}><X className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Attribute Keys panel (global) with expandable values ── */
function AttributeKeysPanel() {
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [addValueOpen, setAddValueOpen] = useState(false)
  const { data: keys = [], isLoading } = useQuery({ queryKey: ['attribute-keys'], queryFn: productsApi.getAttributeKeys })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AttrKeyFormData>({ resolver: zodResolver(attrKeySchema) })
  const valueForm = useForm<AttrValueFormData>({ resolver: zodResolver(attrValueSchema) })
  const createM = useMutation({ mutationFn: productsApi.createAttributeKey, onSuccess: () => { qc.invalidateQueries({ queryKey: ['attribute-keys'] }); setDialogOpen(false); reset(); toast.success('Created') }, onError: () => toast.error('Failed') })
  const deleteM = useMutation({ mutationFn: (id: string) => productsApi.deleteAttributeKey(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['attribute-keys'] }); toast.success('Deleted') }, onError: () => toast.error('Failed') })

  const { data: values = [] } = useQuery({
    queryKey: ['attribute-values', expandedKey],
    queryFn: () => productsApi.getAttributeValues(expandedKey!),
    enabled: !!expandedKey,
  })

  const createValueM = useMutation({
    mutationFn: (d: AttrValueFormData) => productsApi.createAttributeValue(expandedKey!, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attribute-values', expandedKey] }); setAddValueOpen(false); valueForm.reset(); toast.success('Value added') },
    onError: () => toast.error('Failed'),
  })
  const deleteValueM = useMutation({
    mutationFn: (id: string) => productsApi.deleteAttributeValue(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attribute-values', expandedKey] }); toast.success('Deleted') },
    onError: () => toast.error('Failed'),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Attribute Keys</h3>
        <Button size="sm" onClick={() => { reset({ name: '', inputType: 'text' }); setDialogOpen(true) }}><Plus className="mr-1 h-3 w-3" />Add Key</Button>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !(Array.isArray(keys) ? keys : []).length ? <p className="text-sm text-muted-foreground">No attribute keys.</p> : (
        <div className="space-y-2">
          {(Array.isArray(keys) ? keys : []).map((k) => (
            <div key={k.id} className="rounded-lg border">
              <div className="flex items-center justify-between p-3">
                <button className="flex items-center gap-2 text-sm font-medium" onClick={() => setExpandedKey(expandedKey === k.id ? null : k.id)}>
                  {k.name} <span className="text-muted-foreground">({k.inputType})</span>
                </button>
                <button onClick={() => deleteM.mutate(k.id)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
              </div>
              {expandedKey === k.id && (
                <div className="border-t px-3 pb-3 pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Values</span>
                    <Button size="sm" variant="ghost" onClick={() => { valueForm.reset({ value: '' }); setAddValueOpen(true) }}><Plus className="mr-1 h-3 w-3" />Add Value</Button>
                  </div>
                  {(Array.isArray(values) ? values : []).length ? (
                    <div className="flex flex-wrap gap-1">
                      {(values as AttributeValue[]).map((v) => (
                        <Badge key={v.id} variant="secondary" className="gap-1 pr-1">
                          {v.value}
                          <button onClick={() => deleteValueM.mutate(v.id)} className="ml-1 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                        </Badge>
                      ))}
                    </div>
                  ) : <p className="text-xs text-muted-foreground">No values yet.</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Attribute Key</DialogTitle><DialogDescription>Create a new product attribute key</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Input Type</Label><Input {...register('inputType')} placeholder="text, number, select…" /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Add Attribute Value Dialog */}
      <Dialog open={addValueOpen} onOpenChange={setAddValueOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Attribute Value</DialogTitle><DialogDescription>Add a new value for this attribute key</DialogDescription></DialogHeader>
          <form onSubmit={valueForm.handleSubmit((d) => createValueM.mutate(d))} className="space-y-4">
            <div className="space-y-2"><Label>Value</Label><Input {...valueForm.register('value')} />{valueForm.formState.errors.value && <p className="text-xs text-destructive">{valueForm.formState.errors.value.message}</p>}</div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setAddValueOpen(false)}>Cancel</Button><Button type="submit">Add</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ── Product Categories panel ── */
function CategoriesPanel({ productId }: { productId: string }) {
  const qc = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [categoryId, setCategoryId] = useState('')

  const { data: productCategories = [], isLoading } = useQuery({
    queryKey: ['product-categories', productId],
    queryFn: () => productsApi.getProductCategories(productId),
  })

  const addM = useMutation({
    mutationFn: () => productsApi.addProductCategory(productId, categoryId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['product-categories', productId] }); setAddOpen(false); setCategoryId(''); toast.success('Category assigned') },
    onError: () => toast.error('Failed to assign category'),
  })

  const removeM = useMutation({
    mutationFn: (pcId: string) => productsApi.removeProductCategory(productId, pcId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['product-categories', productId] }); toast.success('Category removed') },
    onError: () => toast.error('Failed to remove category'),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Categories</h3>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-3 w-3" />Assign Category</Button>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !(productCategories as ProductCategory[]).length ? <p className="text-sm text-muted-foreground">No categories assigned.</p> : (
        <div className="space-y-2">
          {(productCategories as ProductCategory[]).map((pc) => (
            <div key={pc.id} className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">{pc.category?.name ?? pc.categoryId}</span>
              <Button variant="ghost" size="icon" onClick={() => removeM.mutate(pc.categoryId)}><X className="h-3 w-3 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Category</DialogTitle><DialogDescription>Add a category to this product</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Category ID</Label><Input value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder="Enter category ID" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={() => addM.mutate()} disabled={!categoryId || addM.isPending}>Assign</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const [detailTab, setDetailTab] = useState<'info' | 'variants' | 'images' | 'attributes' | 'categories'>('info')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, limit: 10, search }],
    queryFn: () => productsApi.list({ page, limit: 10, search: search || undefined }),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) as any })

  const createM = useMutation({ mutationFn: productsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDialogOpen(false); reset(); toast.success('Product created') }, onError: () => toast.error('Failed') })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: FormData & { id: string }) => productsApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDialogOpen(false); setEditing(null); toast.success('Updated') }, onError: () => toast.error('Failed') })
  const deleteM = useMutation({ mutationFn: (id: string) => productsApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDeleteTarget(null); toast.success('Deleted') }, onError: () => toast.error('Failed') })

  const openCreate = () => { setEditing(null); reset({ name: '', slug: '', description: '', basePrice: 0, storeId: '' }); setDialogOpen(true) }
  const openEdit = (p: Product) => { setEditing(p); reset({ name: p.name, slug: p.slug, description: p.description ?? '', basePrice: p.basePrice, storeId: p.storeId }); setDialogOpen(true) }
  const onSubmit = (d: FormData) => editing ? updateM.mutate({ ...d, id: editing.id }) : createM.mutate(d)

  const columns: ColumnDef<Product>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Name</SortHeader> },
    { accessorKey: 'basePrice', header: ({ column }) => <SortHeader column={column}>Price</SortHeader>, cell: ({ row }) => formatCurrency(row.original.basePrice) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'isActive', header: 'Active', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Created</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setDetailProduct(row.original); setDetailTab('info') }}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteTarget(row.original)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage products" action={{ label: 'Add Product', onClick: openCreate }} />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        manualPagination
        page={page}
        pageCount={data?.totalPages ?? 1}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search products..."
        enableRowSelection
        onBulkDelete={(rows) => {
          Promise.all(rows.map((r) => productsApi.delete(r.id))).then(() => {
            qc.invalidateQueries({ queryKey: ['products'] }); toast.success(`${rows.length} product(s) deleted`)
          }).catch(() => toast.error('Failed'))
        }}
        exportFilename="products"
        getExportRow={(p) => ({ Name: p.name, Price: p.basePrice, Status: p.status, Active: p.isActive ? 'Yes' : 'No', Created: p.createdAt })}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Create Product'}</DialogTitle><DialogDescription>{editing ? 'Update product' : 'Add new product'}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
              <div className="space-y-2"><Label>Slug</Label><Input {...register('slug')} />{errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}</div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea {...register('description')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Base Price</Label><Input type="number" step="0.01" {...register('basePrice')} />{errors.basePrice && <p className="text-xs text-destructive">{errors.basePrice.message}</p>}</div>
              <div className="space-y-2"><Label>Store ID</Label><Input {...register('storeId')} />{errors.storeId && <p className="text-xs text-destructive">{errors.storeId.message}</p>}</div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={createM.isPending || updateM.isPending}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Product" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />

      {/* Product Detail Sheet */}
      <Sheet open={!!detailProduct} onOpenChange={() => setDetailProduct(null)}>
        <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detailProduct?.name}</SheetTitle>
            <SheetDescription>Product details, variants, images &amp; attributes</SheetDescription>
          </SheetHeader>

          {/* Tab nav */}
          <div className="flex gap-1 border-b mt-4">
            {([['info', 'Info', Tag], ['variants', 'Variants', Layers], ['images', 'Images', ImageIcon], ['attributes', 'Attributes', Settings], ['categories', 'Categories', List]] as const).map(([key, label, Icon]) => (
              <button key={key} onClick={() => setDetailTab(key)} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${detailTab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>

          <div className="mt-4">
          {detailProduct && detailTab === 'info' && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div><span className="text-muted-foreground">Slug:</span> {detailProduct.slug}</div>
                  <div><span className="text-muted-foreground">Price:</span> {formatCurrency(detailProduct.basePrice)}</div>
                  <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={detailProduct.status} /></div>
                  <div><span className="text-muted-foreground">Active:</span> <StatusBadge status={detailProduct.isActive ? 'active' : 'inactive'} /></div>
                  <div><span className="text-muted-foreground">Store:</span> {detailProduct.storeId}</div>
                  <div><span className="text-muted-foreground">Created:</span> {formatDate(detailProduct.createdAt)}</div>
                </div>
                {detailProduct.description && <p className="text-sm text-muted-foreground mt-2">{detailProduct.description}</p>}
              </CardContent>
            </Card>
          )}
          {detailProduct && detailTab === 'variants' && <VariantsPanel productId={detailProduct.id} />}
          {detailProduct && detailTab === 'images' && <ImagesPanel productId={detailProduct.id} />}
          {detailProduct && detailTab === 'attributes' && <AttributeKeysPanel />}
          {detailProduct && detailTab === 'categories' && <CategoriesPanel productId={detailProduct.id} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
