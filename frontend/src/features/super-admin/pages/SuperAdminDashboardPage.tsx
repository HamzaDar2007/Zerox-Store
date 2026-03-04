import { useGetAuditLogsQuery, useGetUsersQuery, useGetFeatureFlagsQuery } from '@/store/api';
import { StatCard } from '@/common/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { StatusBadge } from '@/common/components/StatusBadge';
import { formatRelative } from '@/lib/format';
import { Shield, Users, Flag, Activity } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const { data: auditData } = useGetAuditLogsQuery({ page: 1, limit: 10 });
  const { data: usersData } = useGetUsersQuery({ page: 1, limit: 1 });
  const { data: flagsData } = useGetFeatureFlagsQuery();

  const auditLogs = auditData?.data?.items ?? [];
  const totalUsers = usersData?.data?.total ?? 0;
  const flags = flagsData?.data ?? [];
  const enabledFlags = flags.filter((f) => f.isEnabled).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Full platform control: system health, audit trail, and configuration.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="System Status" value="Healthy" icon={Shield} />
        <StatCard title="Total Users" value={totalUsers} icon={Users} />
        <StatCard title="Feature Flags" value={`${enabledFlags}/${flags.length}`} icon={Flag} />
        <StatCard title="Audit Events" value={auditData?.data?.total ?? 0} icon={Activity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No audit logs</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.entityType} · {log.entityId?.slice(0, 8)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatRelative(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feature Flags</CardTitle>
          </CardHeader>
          <CardContent>
            {flags.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No flags configured</p>
            ) : (
              <div className="space-y-3">
                {flags.slice(0, 8).map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between rounded-md border p-3">
                    <p className="font-medium text-sm">{flag.name}</p>
                    <StatusBadge status={flag.isEnabled ? 'active' : 'inactive'} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
