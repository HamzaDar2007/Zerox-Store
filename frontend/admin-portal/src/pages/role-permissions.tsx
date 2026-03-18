import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rolesApi, permissionsApi, rolePermissionsApi } from '@/services/api'
import type { Role, Permission, RolePermission } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { Shield, Save } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { cn } from '@/lib/utils'

export default function RolePermissionsPage() {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [pendingIds, setPendingIds] = useState<Set<string> | null>(null)
  const qc = useQueryClient()

  const { data: roles, isLoading: loadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list(),
  })

  const { data: allPermissions, isLoading: loadingPerms } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsApi.list(),
  })

  const { data: rolePerms, isLoading: loadingRolePerms } = useQuery({
    queryKey: ['role-permissions', selectedRoleId],
    queryFn: () => rolePermissionsApi.get(selectedRoleId),
    enabled: !!selectedRoleId,
  })

  const assignM = useMutation({
    mutationFn: (permissionIds: string[]) =>
      rolePermissionsApi.assign(selectedRoleId, permissionIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['role-permissions', selectedRoleId] })
      toast.success('Permissions updated')
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to update permissions')),
  })

  const removeM = useMutation({
    mutationFn: (permissionId: string) =>
      rolePermissionsApi.remove(selectedRoleId, permissionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['role-permissions', selectedRoleId] })
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to remove permission')),
  })

  // Initialize pending set from server data
  const assignedIds = new Set(
    (rolePerms as RolePermission[] | undefined)?.map((rp) => rp.permissionId) ?? [],
  )

  // When a role is selected, sync the pending set  
  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId)
    setPendingIds(null)
  }

  const effectiveIds = pendingIds !== null ? pendingIds : assignedIds

  const togglePermission = (permId: string) => {
    const base = pendingIds !== null ? new Set(pendingIds) : new Set(assignedIds)
    if (base.has(permId)) {
      base.delete(permId)
    } else {
      base.add(permId)
    }
    setPendingIds(base)
  }

  const handleSave = () => {
    const toAdd = [...effectiveIds].filter((id) => !assignedIds.has(id))
    const toRemove = [...assignedIds].filter((id) => !effectiveIds.has(id))

    const promises: Promise<unknown>[] = []
    if (toAdd.length > 0) promises.push(assignM.mutateAsync(toAdd))
    for (const id of toRemove) promises.push(removeM.mutateAsync(id))

    Promise.all(promises).then(() => {
      setPendingIds(null)
      toast.success('Permissions saved')
    })
  }

  const hasChanges = pendingIds !== null

  // Group permissions by module
  const permsByModule: Record<string, Permission[]> = {}
  const perms = Array.isArray(allPermissions) ? allPermissions : (allPermissions as unknown as { data?: Permission[] })?.data ?? []
  for (const p of perms as Permission[]) {
    const mod = p.module || 'general'
    if (!permsByModule[mod]) permsByModule[mod] = []
    permsByModule[mod].push(p)
  }

  const rolesList = Array.isArray(roles) ? roles : (roles as unknown as { data?: Role[] })?.data ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Role Permissions" description="Assign permissions to roles" />

      <div className="flex items-center gap-4">
        <Select value={selectedRoleId} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {(rolesList as Role[]).map((role) => (
              <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasChanges && (
          <Button onClick={handleSave} disabled={assignM.isPending || removeM.isPending}>
            <Save className="mr-1 h-4 w-4" />Save Changes
          </Button>
        )}
      </div>

      {loadingRoles || loadingPerms ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : !selectedRoleId ? (
        <EmptyState icon={Shield} title="Select a role" description="Choose a role above to manage its permissions" />
      ) : loadingRolePerms ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(permsByModule).map(([mod, modulePerms]) => (
            <Card key={mod} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold capitalize flex items-center gap-2">
                  <Badge variant="outline">{mod}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {modulePerms.filter((p) => effectiveIds.has(p.id)).length}/{modulePerms.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {modulePerms.map((perm) => {
                  const checked = effectiveIds.has(perm.id)
                  return (
                    <label
                      key={perm.id}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors text-sm',
                        checked ? 'bg-primary/5' : 'hover:bg-muted',
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => togglePermission(perm.id)}
                      />
                      <span>{perm.code}</span>
                      {perm.description && (
                        <span className="text-xs text-muted-foreground ml-auto truncate max-w-32">{perm.description}</span>
                      )}
                    </label>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
