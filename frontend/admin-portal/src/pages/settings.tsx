import { useAuthStore } from '@/store/auth.store'
import { useThemeStore } from '@/store/theme.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account settings" />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><Label className="text-muted-foreground">Name</Label><p>{user?.firstName} {user?.lastName}</p></div>
              <div><Label className="text-muted-foreground">Email</Label><p>{user?.email}</p></div>
              <div><Label className="text-muted-foreground">Role</Label><p><Badge variant="outline">{user?.role || 'N/A'}</Badge></p></div>
              <div><Label className="text-muted-foreground">Status</Label><p><Badge variant={user?.isActive ? 'success' : 'destructive'}>{user?.isActive ? 'Active' : 'Inactive'}</Badge></p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Irreversible actions</p>
            <Button variant="destructive" onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login' }}>
              Log Out of All Devices
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
