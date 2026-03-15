import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { shippingApi } from '@/services/api'
import type { ShippingZone, ShippingMethod } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const zoneSchema = z.object({ name: z.string().min(1) })
const methodSchema = z.object({ name: z.string().min(1), zoneId: z.string().min(1), price: z.coerce.number().min(0), minDeliveryDays: z.coerce.number().optional(), maxDeliveryDays: z.coerce.number().optional() })

export default function ShippingPage() {
  const [zoneDialog, setZoneDialog] = useState(false)
  const [methodDialog, setMethodDialog] = useState(false)
  const qc = useQueryClient()

  const { data: zones, isLoading: loadingZones } = useQuery({ queryKey: ['shipping-zones'], queryFn: shippingApi.listZones })
  const { data: methods, isLoading: loadingMethods } = useQuery({ queryKey: ['shipping-methods'], queryFn: shippingApi.listMethods })

  const zoneForm = useForm<z.infer<typeof zoneSchema>>({ resolver: zodResolver(zoneSchema) })
  const methodForm = useForm<z.infer<typeof methodSchema>>({ resolver: zodResolver(methodSchema) })

  const createZoneM = useMutation({ mutationFn: shippingApi.createZone, onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipping-zones'] }); setZoneDialog(false); zoneForm.reset(); toast.success('Zone created') }, onError: () => toast.error('Failed') })
  const createMethodM = useMutation({ mutationFn: shippingApi.createMethod, onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipping-methods'] }); setMethodDialog(false); methodForm.reset(); toast.success('Method created') }, onError: () => toast.error('Failed') })

  const zoneColumns: ColumnDef<ShippingZone>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Zone Name</SortHeader> },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    {
      id: 'actions', cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const methodColumns: ColumnDef<ShippingMethod>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Method</SortHeader> },
    { accessorKey: 'price', header: ({ column }) => <SortHeader column={column}>Price</SortHeader>, cell: ({ row }) => formatCurrency(row.original.price) },
    { accessorKey: 'minDeliveryDays', header: 'Min Days', cell: ({ row }) => row.original.minDeliveryDays ?? '—' },
    { accessorKey: 'maxDeliveryDays', header: 'Max Days', cell: ({ row }) => row.original.maxDeliveryDays ?? '—' },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Shipping" description="Manage shipping zones and methods" />

      <Tabs defaultValue="zones">
        <TabsList>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="methods">Methods</TabsTrigger>
        </TabsList>
        <TabsContent value="zones">
          <div className="mb-4"><Button onClick={() => { zoneForm.reset({ name: '' }); setZoneDialog(true) }}>Add Zone</Button></div>
          <DataTable columns={zoneColumns} data={zones ?? []} isLoading={loadingZones} searchColumn="name"
            enableRowSelection
            exportFilename="shipping-zones"
            getExportRow={(r) => ({ Name: r.name, Active: r.isActive })}
          />
        </TabsContent>
        <TabsContent value="methods">
          <div className="mb-4"><Button onClick={() => { methodForm.reset({ name: '', zoneId: '', price: 0 }); setMethodDialog(true) }}>Add Method</Button></div>
          <DataTable columns={methodColumns} data={methods ?? []} isLoading={loadingMethods} searchColumn="name"
            enableRowSelection
            exportFilename="shipping-methods"
            getExportRow={(r) => ({ Name: r.name, Price: r.price, MinDays: r.minDeliveryDays ?? '', MaxDays: r.maxDeliveryDays ?? '', Active: r.isActive })}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={zoneDialog} onOpenChange={setZoneDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Shipping Zone</DialogTitle><DialogDescription>Add a new shipping zone</DialogDescription></DialogHeader>
          <form onSubmit={zoneForm.handleSubmit((d) => createZoneM.mutate(d))} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input {...zoneForm.register('name')} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setZoneDialog(false)}>Cancel</Button><Button type="submit" disabled={createZoneM.isPending}>Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={methodDialog} onOpenChange={setMethodDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Shipping Method</DialogTitle><DialogDescription>Add a new shipping method</DialogDescription></DialogHeader>
          <form onSubmit={methodForm.handleSubmit((d) => createMethodM.mutate(d))} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input {...methodForm.register('name')} /></div>
            <div className="space-y-2"><Label>Zone ID</Label><Input {...methodForm.register('zoneId')} /></div>
            <div className="space-y-2"><Label>Price</Label><Input type="number" step="0.01" {...methodForm.register('price')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Min Days</Label><Input type="number" {...methodForm.register('minDeliveryDays')} /></div>
              <div className="space-y-2"><Label>Max Days</Label><Input type="number" {...methodForm.register('maxDeliveryDays')} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setMethodDialog(false)}>Cancel</Button><Button type="submit" disabled={createMethodM.isPending}>Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
