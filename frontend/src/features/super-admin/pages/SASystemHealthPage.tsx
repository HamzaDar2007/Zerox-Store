import { useState, useEffect } from 'react';
import { PageHeader } from '@/common/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Badge } from '@/common/components/ui/badge';
import {
  Activity,
  Database,
  Server,
  HardDrive,
  MemoryStick,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  services: Record<string, { status: string }>;
}

export default function SASystemHealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/system/health`);
      const json = await res.json();
      setHealth(json.data ?? json);
      setLastRefresh(new Date());
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  if (loading && !health) {
    return (
      <div className="space-y-6">
        <PageHeader title="System Health" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="System Health" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {!health ? (
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive mb-3" />
            <h3 className="font-medium">Unable to reach backend</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The health check endpoint is not responding. Ensure the backend is running.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="mx-auto h-8 w-8 mb-2 text-brand-500" />
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={health.status === 'ok' ? 'default' : 'destructive'} className="mt-1">
                  {health.status === 'ok' ? (
                    <><CheckCircle2 className="mr-1 h-3 w-3" /> Healthy</>
                  ) : (
                    <><XCircle className="mr-1 h-3 w-3" /> {health.status}</>
                  )}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Server className="mx-auto h-8 w-8 mb-2 text-blue-500" />
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-lg font-bold">{formatUptime(health.uptime)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MemoryStick className="mx-auto h-8 w-8 mb-2 text-purple-500" />
                <p className="text-sm text-muted-foreground">Heap Used</p>
                <p className="text-lg font-bold">{formatBytes(health.memoryUsage?.heapUsed ?? 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <HardDrive className="mx-auto h-8 w-8 mb-2 text-orange-500" />
                <p className="text-sm text-muted-foreground">RSS Memory</p>
                <p className="text-lg font-bold">{formatBytes(health.memoryUsage?.rss ?? 0)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" /> Service Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {Object.entries(health.services ?? {}).map(([name, info]) => (
                  <div key={name} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium capitalize">{name}</span>
                    </div>
                    <Badge variant={info.status === 'up' ? 'default' : 'destructive'}>
                      {info.status === 'up' ? (
                        <><CheckCircle2 className="mr-1 h-3 w-3" /> Up</>
                      ) : (
                        <><XCircle className="mr-1 h-3 w-3" /> Down</>
                      )}
                    </Badge>
                  </div>
                ))}
                {Object.keys(health.services ?? {}).length === 0 && (
                  <p className="text-sm text-muted-foreground py-3">No service checks configured</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Memory Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Heap Total</p>
                  <p className="text-lg font-medium">{formatBytes(health.memoryUsage?.heapTotal ?? 0)}</p>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${((health.memoryUsage?.heapUsed ?? 0) / (health.memoryUsage?.heapTotal || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Heap Used</p>
                  <p className="text-lg font-medium">{formatBytes(health.memoryUsage?.heapUsed ?? 0)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">RSS</p>
                  <p className="text-lg font-medium">{formatBytes(health.memoryUsage?.rss ?? 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
