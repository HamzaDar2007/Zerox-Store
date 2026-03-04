import { useState } from 'react';
import {
  useGetSettingsQuery, useUpdateSettingByKeyMutation, useBulkUpdateSettingsMutation,
  useGetFeatureFlagsQuery, useToggleFeatureFlagMutation,
} from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import { Switch } from '@/common/components/ui/switch';
import { Badge } from '@/common/components/ui/badge';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import type { SystemSetting, FeatureFlag } from '@/common/types';

export default function AdminSettingsPage() {
  const { data: settingsData, isLoading: settingsLoading } = useGetSettingsQuery({});
  const { data: flagsData, isLoading: flagsLoading } = useGetFeatureFlagsQuery();
  const [updateByKey] = useUpdateSettingByKeyMutation();
  const [bulkUpdate] = useBulkUpdateSettingsMutation();
  const [toggleFlag] = useToggleFeatureFlagMutation();

  const settings: SystemSetting[] = settingsData?.data ?? [];
  const featureFlags: FeatureFlag[] = flagsData?.data ?? [];

  // Group settings by group
  const settingsByGroup = settings.reduce<Record<string, SystemSetting[]>>((acc, s) => {
    const group = s.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(s);
    return acc;
  }, {});

  // Local state for editing
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  const handleSettingChange = (key: string, value: string) => {
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
      toast.success(`${updates.length} settings updated`);
      setEditedValues({});
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const handleSaveSingle = async (key: string) => {
    const value = editedValues[key];
    if (value === undefined) return;
    try {
      await updateByKey({ key, value }).unwrap();
      toast.success('Setting updated');
      setEditedValues((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch {
      toast.error('Failed to update setting');
    }
  };

  const handleToggleFlag = async (id: string) => {
    try {
      await toggleFlag(id).unwrap();
      toast.success('Feature flag toggled');
    } catch {
      toast.error('Failed to toggle feature flag');
    }
  };

  if (settingsLoading || flagsLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure platform settings and feature flags">
        {Object.keys(editedValues).length > 0 && (
          <Button onClick={handleSaveAll}>
            <Save className="mr-2 h-4 w-4" />
            Save All Changes ({Object.keys(editedValues).length})
          </Button>
        )}
      </PageHeader>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-4 space-y-4">
          {Object.entries(settingsByGroup).map(([group, groupSettings]) => (
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
                        {setting.isPublic && (
                          <Badge variant="outline" className="ml-2">
                            Public
                          </Badge>
                        )}
                      </Label>
                      {setting.description && (
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      )}
                      <Input
                        id={setting.key}
                        value={editedValues[setting.key] ?? setting.value}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        disabled={setting.isEncrypted}
                      />
                    </div>
                    {editedValues[setting.key] !== undefined && (
                      <Button size="sm" variant="outline" onClick={() => handleSaveSingle(setting.key)}>
                        Save
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {settings.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No settings configured
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="features" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feature Flags</CardTitle>
              <CardDescription>Enable or disable features across the platform</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {featureFlags.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No feature flags configured</p>
              ) : (
                featureFlags.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{flag.name}</p>
                        {flag.rolloutPercentage != null && flag.rolloutPercentage < 100 && (
                          <Badge variant="outline">{flag.rolloutPercentage}% rollout</Badge>
                        )}
                      </div>
                      {flag.description && (
                        <p className="text-sm text-muted-foreground">{flag.description}</p>
                      )}
                    </div>
                    <Switch
                      checked={flag.isEnabled}
                      onCheckedChange={() => handleToggleFlag(flag.id)}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
