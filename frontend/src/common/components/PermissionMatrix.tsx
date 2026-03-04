import { useMemo } from 'react';
import { Checkbox } from '@/common/components/ui/checkbox';
import { Badge } from '@/common/components/ui/badge';
import type { Permission } from '@/common/types';

interface PermissionMatrixProps {
  allPermissions: Permission[];
  activePermissionIds: Set<string>;
  onToggle: (permissionId: string) => void;
  onBulkToggle: (permissionIds: string[], checked: boolean) => void;
  disabled?: boolean;
}

export function PermissionMatrix({
  allPermissions,
  activePermissionIds,
  onToggle,
  onBulkToggle,
  disabled,
}: PermissionMatrixProps) {
  const { byModule, allActions } = useMemo(() => {
    const moduleMap: Record<string, Permission[]> = {};
    const actionSet = new Set<string>();

    for (const p of allPermissions) {
      const mod = p.module || 'General';
      if (!moduleMap[mod]) moduleMap[mod] = [];
      moduleMap[mod].push(p);
      actionSet.add(p.action);
    }

    return { byModule: moduleMap, allActions: Array.from(actionSet).sort() };
  }, [allPermissions]);

  const modules = Object.keys(byModule).sort();

  // Helper: find permission by module + action
  const findPerm = (mod: string, action: string) =>
    byModule[mod]?.find((p) => p.action === action);

  // Module-level: are all perms in this module active?
  const isModuleFullyActive = (mod: string) =>
    byModule[mod]?.every((p) => activePermissionIds.has(p.id)) ?? false;

  const isModulePartiallyActive = (mod: string) =>
    byModule[mod]?.some((p) => activePermissionIds.has(p.id)) ?? false;

  const toggleModule = (mod: string) => {
    const perms = byModule[mod] ?? [];
    const allActive = isModuleFullyActive(mod);
    onBulkToggle(perms.map((p) => p.id), !allActive);
  };

  // Column-level: are all perms with this action active?
  const isActionFullyActive = (action: string) =>
    modules.every((mod) => {
      const perm = findPerm(mod, action);
      return !perm || activePermissionIds.has(perm.id);
    });

  const toggleActionColumn = (action: string) => {
    const allActive = isActionFullyActive(action);
    const ids: string[] = [];
    for (const mod of modules) {
      const p = findPerm(mod, action);
      if (p) ids.push(p.id);
    }
    onBulkToggle(ids, !allActive);
  };

  if (allPermissions.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No permissions defined</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3 font-semibold">Module</th>
            {allActions.map((action) => (
              <th key={action} className="text-center py-2 px-2">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-medium capitalize">{action}</span>
                  <Checkbox
                    checked={isActionFullyActive(action)}
                    onCheckedChange={() => toggleActionColumn(action)}
                    disabled={disabled}
                    title={`Select all ${action}`}
                  />
                </div>
              </th>
            ))}
            <th className="text-center py-2 px-2 text-xs font-medium">All</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((mod) => {
            const activeCount = byModule[mod]!.filter((p) => activePermissionIds.has(p.id)).length;
            const totalCount = byModule[mod]!.length;

            return (
              <tr key={mod} className="border-b hover:bg-muted/50">
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{mod}</span>
                    <Badge variant="outline" className="text-xs">
                      {activeCount}/{totalCount}
                    </Badge>
                  </div>
                </td>
                {allActions.map((action) => {
                  const perm = findPerm(mod, action);
                  return (
                    <td key={action} className="text-center py-2 px-2">
                      {perm ? (
                        <Checkbox
                          checked={activePermissionIds.has(perm.id)}
                          onCheckedChange={() => onToggle(perm.id)}
                          disabled={disabled}
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="text-center py-2 px-2">
                  <Checkbox
                    checked={isModuleFullyActive(mod)}
                    onCheckedChange={() => toggleModule(mod)}
                    disabled={disabled}
                    className={isModulePartiallyActive(mod) && !isModuleFullyActive(mod) ? 'data-[state=unchecked]:bg-primary/20' : ''}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
