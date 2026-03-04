import { useSearchParams, Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { EmptyState } from '@/common/components/EmptyState';
import { Card, CardContent } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Input } from '@/common/components/ui/input';
import { FolderOpen, Search, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Category } from '@/common/types';

export default function CategoriesPage() {
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get('parent') ?? undefined;
  const [search, setSearch] = useState('');

  const { data, isLoading } = useGetCategoriesQuery();

  const allCategories: Category[] = data?.data ?? [];

  // Filter to show children of current parent (or root categories)
  const categories = useMemo(() => {
    let filtered = allCategories.filter((c) =>
      parentId ? c.parentId === parentId : !c.parentId
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = allCategories.filter((c) => c.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [allCategories, parentId, search]);

  const parentCategory = parentId ? allCategories.find((c) => c.id === parentId) : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Categories" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      {parentCategory && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/categories" className="hover:text-foreground">
            All Categories
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{parentCategory.name}</span>
        </div>
      )}

      <PageHeader
        title={parentCategory?.name ?? 'Categories'}
        description={parentCategory?.description ?? 'Browse all product categories'}
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-12 w-12" />}
          title="No categories found"
          description={search ? 'Try a different search term.' : 'No categories available.'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => {
            const childCount = allCategories.filter((c) => c.parentId === cat.id).length;
            return (
              <Link
                key={cat.id}
                to={childCount > 0 ? `/categories?parent=${cat.id}` : `/products?category=${cat.id}`}
              >
                <Card className="hover:border-primary/30 transition-colors h-full">
                  <CardContent className="flex items-center gap-4 py-6">
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <FolderOpen className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                      {childCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {childCount} subcategor{childCount === 1 ? 'y' : 'ies'}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
