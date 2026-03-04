import { useState } from 'react';
import {
  useGetSettingsQuery, useBulkUpdateSettingsMutation,
  useGetSettingsByGroupQuery,
} from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import { Save, Shield } from 'lucide-react';
import { toast } from 'sonner';
import type { SystemSetting } from '@/common/types';

export default function SASystemSettingsPage() {
  const { data: settingsData, isLoading } = useGetSettingsQuery({});
  const { data: securityData } = useGetSettingsByGroupQuery('security');
  const [bulkUpdate] = useBulkUpdateSettingsMutation();

  const allSettings: SystemSetting[] = settingsData?.data ?? [];
  const securitySettings: SystemSetting[] = securityData?.data ?? [];

  // Group settings
  const settingsByGroup = allSettings.reduce<Record<string, SystemSetting[]>>((acc, s) => {
    const group = s.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(s);
    return acc;
  }, {});

  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    const updates = Object.entries(editedValues).map(([key, value]) => ({ key, value }));
    if (updates.length === 0) {
      toast.info('No changes to save');
      return;
    }
    try {
      await bulkUpdate(updates).unwrap();
      toast.success(`${updates.length} settings saved`);
      setEditedValues({});
    } catch {
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" description="Configure all platform system settings">
        {Object.keys(editedValues).length > 0 && (
          <Button onClick={handleSaveAll}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes ({Object.keys(editedValues).length})
          </Button>
        )}
      </PageHeader>

      {/* Security overview */}
      {securitySettings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-amber-600" />
              Security Settings
            </CardTitle>
            <CardDescription>These settings affect platform security. Change with care.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securitySettings.map((setting) => (
              <div key={setting.id} className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`sec-${setting.key}`}>
                    {setting.displayName || setting.key}
                    {setting.isEncrypted && <Badge variant="destructive" className="ml-2">Encrypted</Badge>}
                  </Label>
                  {setting.description && (
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  )}
                  <Input
                    id={`sec-${setting.key}`}
                    type={setting.isEncrypted ? 'password' : 'text'}
                    value={editedValues[setting.key] ?? setting.value}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    disabled={setting.isEncrypted}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All other groups */}
      {Object.entries(settingsByGroup)
        .filter(([group]) => group !== 'security')
        .map(([group, groupSettings]) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle className="text-base capitalize">{group.replace(/_/g, ' ')}</CardTitle>
              <CardDescription>{groupSettings.length} settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupSettings.map((setting) => (
                <div key={setting.id} className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={setting.key}>
                      {setting.displayName || setting.key}
                      {setting.isPublic && <Badge variant="outline" className="ml-2">Public</Badge>}
                      {setting.isEncrypted && <Badge variant="destructive" className="ml-2">Encrypted</Badge>}
                    </Label>
                    {setting.description && (
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    )}
                    <Input
                      id={setting.key}
                      type={setting.isEncrypted ? 'password' : 'text'}
                      value={editedValues[setting.key] ?? setting.value}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      disabled={setting.isEncrypted}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

      {allSettings.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No system settings configured
          </CardContent>
        </Card>
      )}
    </div>
  );
}
