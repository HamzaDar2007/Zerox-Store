import {
  useGetNotificationTemplatesQuery,
  useUpdateNotificationTemplateMutation,
  useGetNotificationPreferencesQuery,
} from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Textarea } from '@/common/components/ui/textarea';
import { Label } from '@/common/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/common/components/ui/dialog';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import type { NotificationTemplate, NotificationPreference } from '@/common/types';

export default function AdminNotificationsPage() {
  const { data: templatesData, isLoading: templatesLoading } = useGetNotificationTemplatesQuery();
  const { data: prefsData, isLoading: prefsLoading } = useGetNotificationPreferencesQuery();
  const [updateTemplate] = useUpdateNotificationTemplateMutation();

  const templates: NotificationTemplate[] = templatesData?.data ?? [];
  const preferences: NotificationPreference[] = prefsData?.data ?? [];

  const [editTemplate, setEditTemplate] = useState<NotificationTemplate | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  const handleEditTemplate = (t: NotificationTemplate) => {
    setEditTemplate(t);
    setEditSubject(t.subject || '');
    setEditBody(t.body || '');
  };

  const handleSaveTemplate = async () => {
    if (!editTemplate) return;
    try {
      await updateTemplate({
        id: editTemplate.id,
        data: { subject: editSubject, body: editBody },
      }).unwrap();
      toast.success('Template updated');
      setEditTemplate(null);
    } catch {
      toast.error('Failed to update template');
    }
  };

  if (templatesLoading || prefsLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Manage notification templates and preferences" />

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {templates.length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No notification templates configured
                </CardContent>
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    {template.subject && (
                      <CardDescription>{template.subject}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {template.body}
                    </p>
                    {template.variables && template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.variables.map((v) => (
                          <Badge key={v} variant="secondary" className="text-xs">
                            {`{{${v}}}`}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)}>
                      Edit Template
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Default Preferences</CardTitle>
              <CardDescription>View system notification preference defaults</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {preferences.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No notification preferences configured
                </p>
              ) : (
                preferences.map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-sm">{pref.type || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{pref.channel}</p>
                    </div>
                    <Badge variant={pref.isEnabled ? 'default' : 'secondary'}>
                      {pref.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Template Dialog */}
      <Dialog open={!!editTemplate} onOpenChange={(open) => !open && setEditTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template: {editTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={6}
              />
            </div>
            {editTemplate?.variables && editTemplate.variables.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Available variables:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {editTemplate.variables.map((v) => (
                    <Badge key={v} variant="secondary" className="text-xs">
                      {`{{${v}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={handleSaveTemplate}>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
