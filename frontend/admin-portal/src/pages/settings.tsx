import { useAuthStore } from '@/store/auth.store'
import { useThemeStore, type ThemeColor } from '@/store/theme.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { authApi } from '@/services/api'
import { cn } from '@/lib/utils'

const THEME_COLORS: { name: ThemeColor; label: string; swatch: string }[] = [
  { name: 'blue', label: 'Blue', swatch: 'bg-blue-500' },
  { name: 'emerald', label: 'Emerald', swatch: 'bg-emerald-500' },
  { name: 'rose', label: 'Rose', swatch: 'bg-rose-500' },
  { name: 'orange', label: 'Orange', swatch: 'bg-orange-500' },
  { name: 'violet', label: 'Violet', swatch: 'bg-violet-500' },
]

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { theme, color, toggleTheme, setColor } = useThemeStore()

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Settings" description="Manage your account settings and preferences" />

      <div className="grid gap-6 max-w-2xl">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><Label className="text-muted-foreground">Name</Label><p className="font-medium">{user?.firstName} {user?.lastName}</p></div>
              <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{user?.email}</p></div>
              <div><Label className="text-muted-foreground">Role</Label><p><Badge variant="outline">{user?.role || 'N/A'}</Badge></p></div>
              <div><Label className="text-muted-foreground">Status</Label><p><Badge variant={user?.isActive ? 'success' : 'destructive'}>{user?.isActive ? 'Active' : 'Inactive'}</Badge></p></div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>

            <div>
              <Label>Theme Color</Label>
              <p className="text-sm text-muted-foreground mb-3">Choose your accent color</p>
              <div className="flex gap-3">
                {THEME_COLORS.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setColor(t.name)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-all hover:scale-105',
                      color === t.name ? 'border-primary shadow-sm' : 'border-transparent',
                    )}
                  >
                    <div className={cn('h-8 w-8 rounded-full', t.swatch)} />
                    <span className="text-xs">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Irreversible actions</p>
            <Button variant="destructive" onClick={handleLogout}>
              Log Out of All Devices
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
