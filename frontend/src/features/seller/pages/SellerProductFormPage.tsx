import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import { Switch } from '@/common/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { Skeleton } from '@/common/components/ui/skeleton';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ProductStatus } from '@/common/types/enums';
import type { CreateProductDto } from '@/common/types';

const defaultForm: CreateProductDto = {
  categoryId: '',
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  price: 0,
  compareAtPrice: undefined,
  costPrice: undefined,
  sku: '',
  barcode: '',
  weight: undefined,
  isFeatured: false,
  isDigital: false,
  requiresShipping: true,
  isTaxable: true,
  tags: [],
  metaTitle: '',
  metaDescription: '',
};

export default function SellerProductFormPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const isEdit = !!productId;

  const { data: productData, isLoading: loading } = useGetProductByIdQuery(productId!, {
    skip: !isEdit,
  });

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const [form, setForm] = useState<CreateProductDto>(() => {
    if (productData?.data) {
      const p = productData.data;
      return {
        categoryId: p.categoryId ?? '',
        name: p.name,
        slug: p.slug,
        description: p.description ?? '',
        shortDescription: p.shortDescription ?? '',
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? undefined,
        costPrice: p.costPrice ?? undefined,
        sku: p.sku ?? '',
        barcode: p.barcode ?? '',
        weight: p.weight ?? undefined,
        isFeatured: p.isFeatured,
        isDigital: p.isDigital,
        requiresShipping: p.requiresShipping,
        isTaxable: p.isTaxable,
        tags: p.tags ?? [],
        metaTitle: p.metaTitle ?? '',
        metaDescription: p.metaDescription ?? '',
      };
    }
    return defaultForm;
  });

  const [status, setStatus] = useState<ProductStatus>(
    productData?.data?.status ?? ProductStatus.DRAFT,
  );

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (form.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    try {
      if (isEdit) {
        await updateProduct({ id: productId!, data: form }).unwrap();
        toast.success('Product updated');
      } else {
        await createProduct(form).unwrap();
        toast.success('Product created');
      }
      navigate('/seller/products');
    } catch {
      toast.error(isEdit ? 'Failed to update product' : 'Failed to create product');
    }
  };

  const updateField = <K extends keyof CreateProductDto>(key: K, value: CreateProductDto[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (isEdit && loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/seller/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={isEdit ? 'Edit Product' : 'New Product'}
          description={isEdit ? 'Update product details' : 'Add a new product to your catalog'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Product name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="product-url-slug"
                />
              </div>
              <div className="grid gap-2">
                <Label>Short Description</Label>
                <Textarea
                  value={form.shortDescription ?? ''}
                  onChange={(e) => updateField('shortDescription', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description ?? ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label>Price *</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Compare at Price</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.compareAtPrice ?? ''}
                  onChange={(e) =>
                    updateField(
                      'compareAtPrice',
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Cost Price</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.costPrice ?? ''}
                  onChange={(e) =>
                    updateField(
                      'costPrice',
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory & Shipping</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>SKU</Label>
                <Input
                  value={form.sku ?? ''}
                  onChange={(e) => updateField('sku', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Barcode</Label>
                <Input
                  value={form.barcode ?? ''}
                  onChange={(e) => updateField('barcode', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.weight ?? ''}
                  onChange={(e) =>
                    updateField('weight', e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Meta Title</Label>
                <Input
                  value={form.metaTitle ?? ''}
                  onChange={(e) => updateField('metaTitle', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={form.metaDescription ?? ''}
                  onChange={(e) => updateField('metaDescription', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProductStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={ProductStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={ProductStatus.INACTIVE}>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Featured</Label>
                <Switch
                  checked={form.isFeatured ?? false}
                  onCheckedChange={(v) => updateField('isFeatured', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Digital Product</Label>
                <Switch
                  checked={form.isDigital ?? false}
                  onCheckedChange={(v) => updateField('isDigital', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Requires Shipping</Label>
                <Switch
                  checked={form.requiresShipping ?? true}
                  onCheckedChange={(v) => updateField('requiresShipping', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Taxable</Label>
                <Switch
                  checked={form.isTaxable ?? true}
                  onCheckedChange={(v) => updateField('isTaxable', v)}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={creating || updating}
            className="w-full"
            size="lg"
          >
            <Save className="mr-2 h-4 w-4" />
            {creating || updating
              ? 'Saving...'
              : isEdit
                ? 'Update Product'
                : 'Create Product'}
          </Button>
        </div>
      </div>
    </div>
  );
}
