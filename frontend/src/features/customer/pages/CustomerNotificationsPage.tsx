import { useState } from 'react';
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { EmptyState } from '@/common/components/EmptyState';
import { PaginationControls } from '@/common/components/PaginationControls';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Badge } from '@/common/components/ui/badge';
import { Bell, CheckCheck, Mail, MailOpen } from 'lucide-react';
import { formatRelative } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { toast } from 'sonner';

export default function CustomerNotificationsPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const { data, isLoading } = useGetNotificationsQuery({ page, limit });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Notifications" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={total > 0 ? `${total} notification${total > 1 ? 's' : ''}` : undefined}
      >
        {notifications.length > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        )}
      </PageHeader>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-12 w-12" />}
          title="No notifications"
          description="You're all caught up! Notifications will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isRead = notif.readAt !== null;
            return (
              <Card
                key={notif.id}
                className={`cursor-pointer transition-colors ${!isRead ? 'border-primary/30 bg-primary/5' : ''}`}
                onClick={() => !isRead && handleMarkAsRead(notif.id)}
              >
                <CardContent className="flex items-start gap-3 py-4">
                  <div className="mt-0.5">
                    {isRead ? (
                      <MailOpen className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Mail className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${!isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </p>
                      {!isRead && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{notif.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelative(notif.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <PaginationControls
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </div>
      )}
    </div>
  );
}
