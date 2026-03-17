import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/loading'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Search, TrendingUp, MousePointerClick } from 'lucide-react'
import { searchApi } from '@/services/api'
import type { SearchQuery } from '@/types'
import { formatRelativeTime } from '@/lib/format'
import { Animated, StaggeredList } from '@/components/shared/animated'

export default function SearchAnalyticsPage() {
  const { data: popular, isLoading: loadingPopular } = useQuery({
    queryKey: ['search', 'popular'],
    queryFn: () => searchApi.popular() as unknown as Promise<{ query: string; count: number }[]>,
  })

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ['search', 'history'],
    queryFn: () => searchApi.history() as Promise<SearchQuery[]>,
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Search Analytics"
        description="View search trends, popular queries, and user search behavior"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Popular Searches */}
        <Animated animation="slide-in-up">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Popular Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPopular ? (
                <div className="flex justify-center py-8"><LoadingSpinner /></div>
              ) : !popular?.length ? (
                <EmptyState icon={Search} title="No search data yet" />
              ) : (
                <StaggeredList className="space-y-2" staggerMs={40}>
                  {popular.map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent/50">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium">{item.query}</span>
                      </div>
                      <Badge variant="secondary">{item.count} searches</Badge>
                    </div>
                  ))}
                </StaggeredList>
              )}
            </CardContent>
          </Card>
        </Animated>

        {/* Recent Searches */}
        <Animated animation="slide-in-up" delay={100}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointerClick className="h-5 w-5 text-primary" />
                Recent Search History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex justify-center py-8"><LoadingSpinner /></div>
              ) : !history?.length ? (
                <EmptyState icon={Search} title="No search history" />
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {(Array.isArray(history) ? history : []).slice(0, 50).map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent/50">
                      <div className="flex items-center gap-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{item.query}</p>
                          <p className="text-xs text-muted-foreground">{item.resultCount} results</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(item.searchedAt)}</p>
                        {item.clickedProductId && (
                          <Badge variant="outline" className="text-xs mt-1">Clicked</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Animated>
      </div>
    </div>
  )
}
