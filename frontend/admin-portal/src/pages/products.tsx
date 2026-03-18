import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { productsApi, storesApi, categoriesApi, brandsApi } from '@/services/api'
import type { Product, ProductVariant, AttributeValue, Store, Category, Brand } from '@/types'
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
import { MoreHorizontal, Pencil, Trash2, Eye, Plus, X, Image as ImageIcon, Layers, Tag, Settings, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileUploader } from '@/components/shared/file-uploader'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'

import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  shortDesc: z.string().optional(),
  fullDesc: z.string().optional(),
  basePrice: z.coerce.number().min(0),
  currency: z.string().length(3).default('USD'),
  storeId: z.string().min(1, 'Required'),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  isActive: z.boolean().default(true),
  isDigital: z.boolean().optional(),
  taxClass: z.string().optional(),
  status: z.string().default('draft'),
})
type FormData = z.infer<typeof schema>

const variantSchema = z.object({
  sku: z.string().min(1),
  price: z.coerce.number().min(0),
  weightGrams: z.coerce.number().int().optional(),
  isActive: z.boolean().default(true),
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
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<VariantFormData>({ resolver: zodResolver(variantSchema) as any })
  const createM = useMutation({ mutationFn: (d: VariantFormData) => productsApi.createVariant({ ...d, productId }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['product-variants', productId] }); setDialogOpen(false); reset(); toast.success('Variant created') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: VariantFormData & { id: string }) => productsApi.updateVariant(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['product-variants', productId] }); setDialogOpen(false); setEditing(null); toast.success('Updated') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })
  const deleteM = useMutation({ mutationFn: (id: string) => productsApi.deleteVariant(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['product-variants', productId] }); toast.success('Deleted') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })

  const openCreate = () => { setEditing(null); reset({ sku: '', price: 0 }); setDialogOpen(true) }
  const openEdit = (v: ProductVariant) => { setEditing(v); reset({ sku: v.sku, price: v.price, weightGrams: v.weightGrams ?? undefined, isActive: v.isActive }); setDialogOpen(true) }
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
                <p className="text-sm font-medium">{v.sku}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(v.price)}{v.weightGrams ? ` · ${v.weightGrams}g` : ''}</p>
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
              <div className="space-y-2"><Label>Price</Label><Input type="number" step="0.01" {...register('price')} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Weight (grams)</Label><Input type="number" {...register('weightGrams')} /></div>
              <div className="flex items-center gap-2 pt-4"><Controller name="isActive" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} /><Label>Active</Label></div>
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
    onError: (e) => toast.error(getErrorMessage(e, 'Upload failed')),
  })
  const deleteM = useMutation({ mutationFn: (id: string) => productsApi.deleteImage(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['product-images', productId] }); toast.success('Deleted') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })

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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AttrKeyFormData>({ resolver: zodResolver(attrKeySchema) as any })
  const valueForm = useForm<AttrValueFormData>({ resolver: zodResolver(attrValueSchema) as any })
  const createM = useMutation({ mutationFn: (d: AttrKeyFormData) => productsApi.createAttributeKey({ ...d, slug: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['attribute-keys'] }); setDialogOpen(false); reset(); toast.success('Created') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })
  const deleteM = useMutation({ mutationFn: (id: string) => productsApi.deleteAttributeKey(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['attribute-keys'] }); toast.success('Deleted') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })

  const { data: values = [] } = useQuery({
    queryKey: ['attribute-values', expandedKey],
    queryFn: () => productsApi.getAttributeValues(expandedKey!),
    enabled: !!expandedKey,
  })

  const createValueM = useMutation({
    mutationFn: (d: AttrValueFormData) => productsApi.createAttributeValue(expandedKey!, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attribute-values', expandedKey] }); setAddValueOpen(false); valueForm.reset(); toast.success('Value added') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed')),
  })
  const deleteValueM = useMutation({
    mutationFn: (id: string) => productsApi.deleteAttributeValue(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attribute-values', expandedKey] }); toast.success('Deleted') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed')),
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

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editMode, setEditMode] = useState<'list' | 'form'>('list')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'variants' | 'images' | 'attributes'>('details')
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', { page, limit: 10, search }],
    queryFn: () => productsApi.list({ page, limit: 10, search: search || undefined }),
  })

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) as any })

  const { data: storesForDropdown } = useQuery({ queryKey: ['stores'], queryFn: storesApi.list })
  const { data: categoriesForDropdown } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list })
  const { data: brandsForDropdown } = useQuery({ queryKey: ['brands'], queryFn: brandsApi.list })

  const isExistingProduct = !!editingProduct

  const createM = useMutation({
    mutationFn: productsApi.create,
    onSuccess: (newProduct) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      setEditingProduct(newProduct)
      setActiveTab('variants')
      toast.success('Product created — now add variants, images & attributes')
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed')),
  })
  const updateM = useMutation({
    mutationFn: ({ id, ...d }: FormData & { id: string }) => productsApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Updated') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed')),
  })
  const deleteM = useMutation({ mutationFn: (id: string) => productsApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDeleteTarget(null); toast.success('Deleted') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })

  const openCreate = () => {
    setEditingProduct(null)
    setActiveTab('details')
    reset({ name: '', slug: '', shortDesc: '', fullDesc: '', basePrice: 0, currency: 'USD', storeId: '', categoryId: '', brandId: '', isActive: true, isDigital: false, taxClass: '', status: 'draft' })
    setEditMode('form')
  }
  const openEdit = (p: Product) => {
    setEditingProduct(p)
    setActiveTab('details')
    reset({ name: p.name, slug: p.slug, shortDesc: p.shortDesc ?? '', fullDesc: p.fullDesc ?? '', basePrice: p.basePrice, currency: p.currency ?? 'USD', storeId: p.storeId, categoryId: p.categoryId ?? '', brandId: p.brandId ?? '', isActive: p.isActive, isDigital: p.isDigital ?? false, taxClass: p.taxClass ?? '', status: p.status })
    setEditMode('form')
  }
  const onSubmit = (d: FormData) => editingProduct ? updateM.mutate({ ...d, id: editingProduct.id }) : createM.mutate(d)
  const goBack = () => { setEditMode('list'); setEditingProduct(null) }

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
            <DropdownMenuItem onClick={() => { setDetailProduct(row.original) }}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteTarget(row.original)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  /* ── Full-page form view ── */
  if (editMode === 'form') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-xl font-semibold">{isExistingProduct ? `Edit: ${editingProduct.name}` : 'Create Product'}</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {([
            ['details', 'Details', Tag, true],
            ['variants', 'Variants', Layers, isExistingProduct],
            ['images', 'Images', ImageIcon, isExistingProduct],
            ['attributes', 'Attributes', Settings, true],
          ] as const).map(([key, label, Icon, enabled]) => (
            <button
              key={key}
              onClick={() => enabled && setActiveTab(key)}
              disabled={!enabled}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-primary text-primary' : enabled ? 'border-transparent text-muted-foreground hover:text-foreground' : 'border-transparent text-muted-foreground/40 cursor-not-allowed'}`}
            >
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>

        {/* Details tab */}
        {activeTab === 'details' && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
                  <div className="space-y-2"><Label>Slug</Label><Input {...register('slug')} />{errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}</div>
                </div>
                <div className="space-y-2"><Label>Short Description</Label><Textarea {...register('shortDesc')} /></div>
                <div className="space-y-2"><Label>Full Description</Label><Textarea {...register('fullDesc')} /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Base Price</Label><Input type="number" step="0.01" {...register('basePrice')} />{errors.basePrice && <p className="text-xs text-destructive">{errors.basePrice.message}</p>}</div>
                  <div className="space-y-2"><Label>Currency</Label><Input {...register('currency')} maxLength={3} placeholder="USD" /></div>
                  <div className="space-y-2"><Label>Tax Class</Label><Input {...register('taxClass')} placeholder="standard" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Store</Label>
                    <Controller name="storeId" control={control} render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                        <SelectContent>{(storesForDropdown ?? []).map((s: Store) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    )} />
                    {errors.storeId && <p className="text-xs text-destructive">{errors.storeId.message}</p>}
                  </div>
                  <div className="space-y-2"><Label>Category</Label>
                    <Controller name="categoryId" control={control} render={({ field }) => (
                      <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || undefined)}>
                        <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                        <SelectContent>{(categoriesForDropdown ?? []).map((c: Category) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    )} />
                  </div>
                  <div className="space-y-2"><Label>Brand</Label>
                    <Controller name="brandId" control={control} render={({ field }) => (
                      <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || undefined)}>
                        <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                        <SelectContent>{(brandsForDropdown ?? []).map((b: Brand) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                      </Select>
                    )} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Status</Label>
                    <Controller name="status" control={control} render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select>
                    )} />
                  </div>
                  <div className="flex items-center gap-4 pt-6">
                    <div className="flex items-center gap-2"><Controller name="isActive" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} /><Label>Active</Label></div>
                    <div className="flex items-center gap-2"><Controller name="isDigital" control={control} render={({ field }) => <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />} /><Label>Digital</Label></div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={goBack}>Cancel</Button>
                  <Button type="submit" disabled={createM.isPending || updateM.isPending}>{isExistingProduct ? 'Update' : 'Create'}</Button>
                </div>
                {!isExistingProduct && <p className="text-xs text-muted-foreground text-center">Save the product first to unlock Variants &amp; Images tabs</p>}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Variants tab */}
        {activeTab === 'variants' && isExistingProduct && <VariantsPanel productId={editingProduct.id} />}

        {/* Images tab */}
        {activeTab === 'images' && isExistingProduct && <ImagesPanel productId={editingProduct.id} />}

        {/* Attributes tab */}
        {activeTab === 'attributes' && <AttributeKeysPanel />}
      </div>
    )
  }

  /* ── List view ── */
  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage products" action={{ label: 'Add Product', onClick: openCreate }} />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        manualPagination
        page={page}
        pageCount={data?.totalPages ?? 1}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search products..."
        enableRowSelection
        onBulkDelete={(rows) => {
          Promise.allSettled(rows.map((r) => productsApi.delete(r.id))).then((results) => {
            qc.invalidateQueries({ queryKey: ['products'] })
            const failed = results.filter((r) => r.status === 'rejected').length
            if (failed) toast.error(`${failed} of ${rows.length} failed to delete`)
            else toast.success(`${rows.length} product(s) deleted`)
          })
        }}
        exportFilename="products"
        getExportRow={(p) => ({ Name: p.name, Price: p.basePrice, Status: p.status, Active: p.isActive ? 'Yes' : 'No', Created: p.createdAt })}
      />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Product" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />

      {/* Product Detail Sheet (view only) */}
      <Sheet open={!!detailProduct} onOpenChange={() => setDetailProduct(null)}>
        <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detailProduct?.name}</SheetTitle>
            <SheetDescription>Product details</SheetDescription>
          </SheetHeader>
          {detailProduct && (
            <Card className="mt-4">
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div><span className="text-muted-foreground">Slug:</span> {detailProduct.slug}</div>
                  <div><span className="text-muted-foreground">Price:</span> {formatCurrency(detailProduct.basePrice)} {detailProduct.currency}</div>
                  <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={detailProduct.status} /></div>
                  <div><span className="text-muted-foreground">Active:</span> <StatusBadge status={detailProduct.isActive ? 'active' : 'inactive'} /></div>
                  <div><span className="text-muted-foreground">Store:</span> {detailProduct.storeId}</div>
                  <div><span className="text-muted-foreground">Created:</span> {formatDate(detailProduct.createdAt)}</div>
                  {detailProduct.taxClass && <div><span className="text-muted-foreground">Tax Class:</span> {detailProduct.taxClass}</div>}
                  {detailProduct.isDigital && <div><span className="text-muted-foreground">Digital:</span> Yes</div>}
                </div>
                {detailProduct.shortDesc && <p className="text-sm text-muted-foreground mt-2">{detailProduct.shortDesc}</p>}
              </CardContent>
            </Card>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
