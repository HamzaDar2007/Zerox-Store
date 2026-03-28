import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { shippingApi } from '@/services/api'
import type { ShippingZone, ShippingMethod, Shipment, ShipmentEvent, ShippingZoneCountry } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Eye, Plus, MapPin, Globe, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form'
import { z } from 'zod'

const zoneSchema = z.object({ name: z.string().min(1) })
const methodSchema = z.object({ name: z.string().min(1), zoneId: z.string().min(1), baseRate: z.coerce.number().min(0), perKgRate: z.coerce.number().min(0).default(0), estimatedDaysMin: z.coerce.number().optional(), estimatedDaysMax: z.coerce.number().optional(), carrier: z.string().optional(), freeThreshold: z.coerce.number().optional() })

export default function ShippingPage() {
  const [zoneDialog, setZoneDialog] = useState(false)
  const [methodDialog, setMethodDialog] = useState(false)
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null)
  const [countriesZone, setCountriesZone] = useState<ShippingZone | null>(null)
  const [addCountryCode, setAddCountryCode] = useState('')
  const qc = useQueryClient()

  const { data: zones, isLoading: loadingZones, isError: errorZones, refetch: refetchZones } = useQuery({ queryKey: ['shipping-zones'], queryFn: shippingApi.listZones })
  const { data: methods, isLoading: loadingMethods, isError: errorMethods, refetch: refetchMethods } = useQuery({ queryKey: ['shipping-methods'], queryFn: shippingApi.listMethods })

  const zoneForm = useForm<z.infer<typeof zoneSchema>>({ resolver: formResolver(zoneSchema) })
  const methodForm = useForm<z.infer<typeof methodSchema>>({ resolver: formResolver(methodSchema) })

  const { data: zoneCountries, refetch: refetchCountries } = useQuery({
    queryKey: ['zone-countries', countriesZone?.id],
    queryFn: () => shippingApi.getCountries(countriesZone?.id ?? ''),
    enabled: !!countriesZone,
  })

  const addCountryM = useMutation({
    mutationFn: () => {
      if (!countriesZone) return Promise.reject(new Error('No zone selected'))
      return shippingApi.addCountry(countriesZone.id, { country: addCountryCode })
    },
    onSuccess: () => { refetchCountries(); setAddCountryCode(''); toast.success('Country added') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to add country')),
  })

  const removeCountryM = useMutation({
    mutationFn: ({ zoneId, country }: { zoneId: string; country: string }) =>
      shippingApi.removeCountry(zoneId, country),
    onSuccess: () => { refetchCountries(); toast.success('Country removed') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to remove country')),
  })

  const createZoneM = useMutation({ mutationFn: shippingApi.createZone, onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipping-zones'] }); setZoneDialog(false); setEditingZone(null); zoneForm.reset(); toast.success('Zone created') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })
  const updateZoneM = useMutation({ mutationFn: ({ id, ...d }: { id: string; name: string }) => shippingApi.updateZone(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipping-zones'] }); setZoneDialog(false); setEditingZone(null); zoneForm.reset(); toast.success('Zone updated') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })
  const createMethodM = useMutation({ mutationFn: shippingApi.createMethod, onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipping-methods'] }); setMethodDialog(false); setEditingMethod(null); methodForm.reset(); toast.success('Method created') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })
  const updateMethodM = useMutation({ mutationFn: ({ id, ...d }: { id: string; name: string; zoneId: string; baseRate: number; perKgRate: number; estimatedDaysMin?: number; estimatedDaysMax?: number; carrier?: string; freeThreshold?: number }) => shippingApi.updateMethod(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipping-methods'] }); setMethodDialog(false); setEditingMethod(null); methodForm.reset(); toast.success('Method updated') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })

  const openEditZone = (zone: ShippingZone) => {
    setEditingZone(zone)
    zoneForm.reset({ name: zone.name })
    setZoneDialog(true)
  }

  const openEditMethod = (method: ShippingMethod) => {
    setEditingMethod(method)
    methodForm.reset({ name: method.name, zoneId: method.zoneId, baseRate: method.baseRate, perKgRate: method.perKgRate, estimatedDaysMin: method.estimatedDaysMin, estimatedDaysMax: method.estimatedDaysMax, carrier: method.carrier ?? '', freeThreshold: method.freeThreshold ?? undefined })
    setMethodDialog(true)
  }

  const handleZoneSubmit = (d: z.infer<typeof zoneSchema>) => {
    if (editingZone) updateZoneM.mutate({ ...d, id: editingZone.id })
    else createZoneM.mutate(d)
  }

  const handleMethodSubmit = (d: z.infer<typeof methodSchema>) => {
    if (editingMethod) updateMethodM.mutate({ ...d, id: editingMethod.id })
    else createMethodM.mutate(d)
  }

  const zoneColumns: ColumnDef<ShippingZone>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Zone Name</SortHeader> },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditZone(row.original)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCountriesZone(row.original)}><Globe className="mr-2 h-4 w-4" />Countries</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const methodColumns: ColumnDef<ShippingMethod>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Method</SortHeader> },
    { accessorKey: 'baseRate', header: ({ column }) => <SortHeader column={column}>Base Rate</SortHeader>, cell: ({ row }) => formatCurrency(row.original.baseRate) },
    { accessorKey: 'carrier', header: 'Carrier', cell: ({ row }) => row.original.carrier ?? '—' },
    { accessorKey: 'estimatedDaysMin', header: 'Min Days', cell: ({ row }) => row.original.estimatedDaysMin ?? '—' },
    { accessorKey: 'estimatedDaysMax', header: 'Max Days', cell: ({ row }) => row.original.estimatedDaysMax ?? '—' },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditMethod(row.original)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Shipping" description="Manage shipping zones and methods" />

      <Tabs defaultValue="zones">
        <TabsList>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="methods">Methods</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
        </TabsList>
        <TabsContent value="zones">
          <div className="mb-4"><Button onClick={() => { setEditingZone(null); zoneForm.reset({ name: '' }); setZoneDialog(true) }}>Add Zone</Button></div>
          <DataTable columns={zoneColumns} data={zones ?? []} isLoading={loadingZones} isError={errorZones} onRetry={refetchZones} searchColumn="name"
            enableRowSelection
            exportFilename="shipping-zones"
            getExportRow={(r) => ({ Name: r.name, Active: r.isActive })}
          />
        </TabsContent>
        <TabsContent value="methods">
          <div className="mb-4"><Button onClick={() => { setEditingMethod(null); methodForm.reset({ name: '', zoneId: '', baseRate: 0, perKgRate: 0 }); setMethodDialog(true) }}>Add Method</Button></div>
          <DataTable columns={methodColumns} data={methods ?? []} isLoading={loadingMethods} isError={errorMethods} onRetry={refetchMethods} searchColumn="name"
            enableRowSelection
            exportFilename="shipping-methods"
            getExportRow={(r) => ({ Name: r.name, BaseRate: r.baseRate, Carrier: r.carrier ?? '', MinDays: r.estimatedDaysMin ?? '', MaxDays: r.estimatedDaysMax ?? '', Active: r.isActive })}
          />
        </TabsContent>
        <TabsContent value="shipments">
          <ShipmentsTab />
        </TabsContent>
      </Tabs>

      <Dialog open={zoneDialog} onOpenChange={setZoneDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingZone ? 'Edit' : 'Create'} Shipping Zone</DialogTitle><DialogDescription>{editingZone ? 'Update zone details' : 'Add a new shipping zone'}</DialogDescription></DialogHeader>
          <form onSubmit={zoneForm.handleSubmit(handleZoneSubmit)} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input {...zoneForm.register('name')} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setZoneDialog(false)}>Cancel</Button><Button type="submit" disabled={createZoneM.isPending || updateZoneM.isPending}>{editingZone ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Zone Countries Dialog */}
      <Dialog open={!!countriesZone} onOpenChange={() => setCountriesZone(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Zone Countries</DialogTitle><DialogDescription>Manage countries for zone "{countriesZone?.name}"</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Country code (e.g. US, GB)" value={addCountryCode} onChange={(e) => setAddCountryCode(e.target.value.toUpperCase())} maxLength={2} className="flex-1" />
              <Button onClick={() => addCountryM.mutate()} disabled={addCountryCode.length !== 2 || addCountryM.isPending}>Add</Button>
            </div>
            {(zoneCountries as ShippingZoneCountry[] | undefined)?.length ? (
              <div className="flex flex-wrap gap-2">
                {(zoneCountries as ShippingZoneCountry[]).map((c) => (
                  <Badge key={`${c.zoneId}-${c.country}`} variant="outline" className="gap-1 pr-1">
                    {c.country}
                    <button onClick={() => { if (countriesZone) removeCountryM.mutate({ zoneId: countriesZone.id, country: c.country }) }} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No countries added yet.</p>}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={methodDialog} onOpenChange={setMethodDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingMethod ? 'Edit' : 'Create'} Shipping Method</DialogTitle><DialogDescription>{editingMethod ? 'Update method details' : 'Add a new shipping method'}</DialogDescription></DialogHeader>
          <form onSubmit={methodForm.handleSubmit(handleMethodSubmit)} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input {...methodForm.register('name')} /></div>
            <div className="space-y-2"><Label>Zone ID</Label><Input {...methodForm.register('zoneId')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Base Rate</Label><Input type="number" step="0.01" {...methodForm.register('baseRate')} /></div>
              <div className="space-y-2"><Label>Per-Kg Rate</Label><Input type="number" step="0.01" {...methodForm.register('perKgRate')} /></div>
            </div>
            <div className="space-y-2"><Label>Carrier</Label><Input {...methodForm.register('carrier')} placeholder="e.g. UPS, FedEx" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Est. Min Days</Label><Input type="number" {...methodForm.register('estimatedDaysMin')} /></div>
              <div className="space-y-2"><Label>Est. Max Days</Label><Input type="number" {...methodForm.register('estimatedDaysMax')} /></div>
            </div>
            <div className="space-y-2"><Label>Free Threshold</Label><Input type="number" step="0.01" {...methodForm.register('freeThreshold')} placeholder="Order amount for free shipping" /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setMethodDialog(false)}>Cancel</Button><Button type="submit" disabled={createMethodM.isPending || updateMethodM.isPending}>{editingMethod ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ── Shipments Tab ── */
const shipmentSchema = z.object({
  orderId: z.string().min(1, 'Order ID required'),
  warehouseId: z.string().optional(),
  shippingMethodId: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
})

const eventSchema = z.object({
  status: z.string().min(1, 'Status required'),
  location: z.string().optional(),
  description: z.string().optional(),
})

function ShipmentsTab() {
  const [orderId, setOrderId] = useState('')
  const [queriedOrderId, setQueriedOrderId] = useState('')
  const [createDialog, setCreateDialog] = useState(false)
  const [detailShipment, setDetailShipment] = useState<Shipment | null>(null)
  const [eventDialog, setEventDialog] = useState(false)
  const qc = useQueryClient()

  const { data: shipments, isLoading } = useQuery({
    queryKey: ['shipments', queriedOrderId],
    queryFn: () => shippingApi.getOrderShipments(queriedOrderId),
    enabled: !!queriedOrderId,
  })

  const { data: events } = useQuery({
    queryKey: ['shipment-events', detailShipment?.id],
    queryFn: () => shippingApi.getShipmentEvents(detailShipment?.id ?? ''),
    enabled: !!detailShipment,
  })

  const createForm = useForm<z.infer<typeof shipmentSchema>>({ resolver: formResolver(shipmentSchema) })
  const eventForm = useForm<z.infer<typeof eventSchema>>({ resolver: formResolver(eventSchema) })

  const createM = useMutation({
    mutationFn: shippingApi.createShipment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipments'] }); setCreateDialog(false); createForm.reset(); toast.success('Shipment created') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to create shipment')),
  })

  const addEventM = useMutation({
    mutationFn: (data: z.infer<typeof eventSchema>) => {
      if (!detailShipment) return Promise.reject(new Error('No shipment selected'))
      return shippingApi.createShipmentEvent(detailShipment.id, data)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipment-events'] }); setEventDialog(false); eventForm.reset(); toast.success('Event added') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to add event')),
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label>Lookup by Order ID</Label>
          <Input placeholder="Enter order ID..." value={orderId} onChange={(e) => setOrderId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setQueriedOrderId(orderId.trim())} />
        </div>
        <Button onClick={() => setQueriedOrderId(orderId.trim())} disabled={!orderId.trim()}>Search</Button>
        <Button variant="outline" onClick={() => { createForm.reset({ orderId: '', warehouseId: '', shippingMethodId: '', trackingNumber: '', carrier: '' }); setCreateDialog(true) }}>
          <Plus className="mr-2 h-4 w-4" />Create Shipment
        </Button>
      </div>

      {queriedOrderId && (
        <div className="space-y-3 animate-fade-in">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading shipments...</p>
          ) : !shipments?.length ? (
            <p className="text-sm text-muted-foreground">No shipments found for this order.</p>
          ) : (
            shipments.map((s: Shipment) => (
              <Card key={s.id} className="transition-shadow hover:shadow-md cursor-pointer" onClick={() => setDetailShipment(s)}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">#{s.id.slice(0, 8)}</span>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.carrier && `${s.carrier} • `}
                      {s.trackingNumber && `Tracking: ${s.trackingNumber} • `}
                      Created: {formatDateTime(s.createdAt)}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create Shipment Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Shipment</DialogTitle><DialogDescription>Create a new shipment for an order</DialogDescription></DialogHeader>
          <form onSubmit={createForm.handleSubmit((d) => createM.mutate(d))} className="space-y-4">
            <div className="space-y-2"><Label>Order ID</Label><Input {...createForm.register('orderId')} />{createForm.formState.errors.orderId && <p className="text-xs text-destructive">{createForm.formState.errors.orderId.message}</p>}</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Warehouse ID</Label><Input {...createForm.register('warehouseId')} /></div>
              <div className="space-y-2"><Label>Shipping Method ID</Label><Input {...createForm.register('shippingMethodId')} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Carrier</Label><Input {...createForm.register('carrier')} placeholder="e.g., UPS, FedEx" /></div>
              <div className="space-y-2"><Label>Tracking Number</Label><Input {...createForm.register('trackingNumber')} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button><Button type="submit" loading={createM.isPending}>Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Shipment Detail Dialog with Events Timeline */}
      <Dialog open={!!detailShipment} onOpenChange={() => setDetailShipment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Shipment #{detailShipment?.id.slice(0, 8)}</DialogTitle>
            <DialogDescription>Shipment details and tracking events</DialogDescription>
          </DialogHeader>
          {detailShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={detailShipment.status} /></div>
                <div><span className="text-muted-foreground">Carrier:</span> {detailShipment.carrier || '—'}</div>
                <div><span className="text-muted-foreground">Tracking:</span> {detailShipment.trackingNumber || '—'}</div>
                <div><span className="text-muted-foreground">Created:</span> {formatDateTime(detailShipment.createdAt)}</div>
                {detailShipment.shippedAt && <div><span className="text-muted-foreground">Shipped:</span> {formatDateTime(detailShipment.shippedAt)}</div>}
                {detailShipment.deliveredAt && <div><span className="text-muted-foreground">Delivered:</span> {formatDateTime(detailShipment.deliveredAt)}</div>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">Tracking Events</h4>
                  <Button size="sm" variant="outline" onClick={() => { eventForm.reset({ status: '', location: '', description: '' }); setEventDialog(true) }}>
                    <Plus className="mr-1 h-3 w-3" />Add Event
                  </Button>
                </div>
                {(events ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tracking events yet.</p>
                ) : (
                  <div className="space-y-3 border-l-2 border-primary/20 pl-4">
                    {(events ?? []).map((e: ShipmentEvent) => (
                      <div key={e.id} className="relative animate-fade-in">
                        <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary" />
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={e.status} />
                            {e.location && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</span>}
                          </div>
                          {e.description && <p className="text-muted-foreground mt-0.5">{e.description}</p>}
                          <p className="text-xs text-muted-foreground">{formatDateTime(e.occurredAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Shipment Event Dialog */}
      <Dialog open={eventDialog} onOpenChange={setEventDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Tracking Event</DialogTitle><DialogDescription>Record a new shipment tracking event</DialogDescription></DialogHeader>
          <form onSubmit={eventForm.handleSubmit((d) => addEventM.mutate(d))} className="space-y-4">
            <div className="space-y-2"><Label>Status</Label><Input {...eventForm.register('status')} placeholder="e.g., in_transit, delivered" /></div>
            <div className="space-y-2"><Label>Location</Label><Input {...eventForm.register('location')} placeholder="e.g., New York, NY" /></div>
            <div className="space-y-2"><Label>Description</Label><Input {...eventForm.register('description')} placeholder="Package arrived at sorting facility" /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setEventDialog(false)}>Cancel</Button><Button type="submit" loading={addEventM.isPending}>Add Event</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
