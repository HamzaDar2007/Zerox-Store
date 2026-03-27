/**
 * Order Detail Page
 * Shows order summary, items, shipments, and provides actions:
 * - Create shipments with tracking events
 * - Cancel pending orders
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, shippingApi } from '@/services/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DetailSkeleton } from '@/components/shared/skeletons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ArrowLeft, Truck, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { OrderItem, Shipment } from '@/types'

const shipmentSchema = z.object({
  carrier: z.string().min(1, 'Required'),
  trackingNumber: z.string().optional(),
})
type ShipmentFormData = z.infer<typeof shipmentSchema>

const eventSchema = z.object({
  status: z.string().min(1, 'Required'),
  location: z.string().optional(),
  description: z.string().optional(),
})
type EventFormData = z.infer<typeof eventSchema>

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [shipOpen, setShipOpen] = useState(false)
  const [eventOpen, setEventOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id!),
    enabled: !!id,
  })

  const { data: items = [] } = useQuery({
    queryKey: ['order-items', id],
    queryFn: () => ordersApi.getItems(id!),
    enabled: !!id,
  })

  const { data: shipments = [] } = useQuery({
    queryKey: ['order-shipments', id],
    queryFn: () => shippingApi.getOrderShipments(id!),
    enabled: !!id,
  })

  const cancelM = useMutation({
    mutationFn: () => ordersApi.cancel(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['order', id] }); setCancelOpen(false); toast.success('Order cancelled') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const shipForm = useForm<ShipmentFormData>({ resolver: zodResolver(shipmentSchema) as never })
  const createShipM = useMutation({
    mutationFn: (d: ShipmentFormData) => shippingApi.createShipment({ ...d, orderId: id! }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['order-shipments', id] }); setShipOpen(false); shipForm.reset(); toast.success('Shipment created') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const eventForm = useForm<EventFormData>({ resolver: zodResolver(eventSchema) as never })
  const createEventM = useMutation({
    mutationFn: (d: EventFormData) => shippingApi.createShipmentEvent(selectedShipment!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['order-shipments', id] }); setEventOpen(false); eventForm.reset(); toast.success('Tracking event added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading) return <DetailSkeleton />
  if (!order) return <div className="p-8 text-center text-muted-foreground">Order not found</div>

  const orderItems: OrderItem[] = Array.isArray(items) ? items : []
  const orderShipments: Shipment[] = Array.isArray(shipments) ? shipments : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-xl font-semibold">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={order.status} />
          {order.status === 'pending' && (
            <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}><XCircle className="mr-1 h-4 w-4" />Cancel</Button>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{formatCurrency(Number(order.totalAmount ?? 0))}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Items</p><p className="text-xl font-bold">{orderItems.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Shipments</p><p className="text-xl font-bold">{orderShipments.length}</p></CardContent></Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="mb-3 font-medium">Items</h3>
          {orderItems.length === 0 ? <p className="text-sm text-muted-foreground">No items found</p> : (
            <div className="divide-y">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{item.nameSnapshot ?? item.variantId}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(Number(item.unitPrice ?? 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipments */}
      <Card>
        <CardContent className="pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium">Shipments</h3>
            <Button size="sm" onClick={() => { shipForm.reset({ carrier: '', trackingNumber: '' }); setShipOpen(true) }}>
              <Truck className="mr-1 h-4 w-4" />Create Shipment
            </Button>
          </div>
          {orderShipments.length === 0 ? <p className="text-sm text-muted-foreground">No shipments yet</p> : (
            <div className="space-y-3">
              {orderShipments.map((s) => (
                <div key={s.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{s.carrier}</p>
                      {s.trackingNumber && <p className="text-xs text-muted-foreground">Tracking: {s.trackingNumber}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={s.status ?? 'pending'} />
                      <Button variant="outline" size="sm" onClick={() => { setSelectedShipment(s); eventForm.reset({ status: '', location: '', description: '' }); setEventOpen(true) }}>
                        Add Event
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirm */}
      <ConfirmDialog open={cancelOpen} onOpenChange={setCancelOpen} title="Cancel Order" description="Are you sure you want to cancel this order? This cannot be undone." confirmLabel="Cancel Order" onConfirm={() => cancelM.mutate()} loading={cancelM.isPending} />

      {/* Create Shipment Dialog */}
      <Dialog open={shipOpen} onOpenChange={setShipOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Shipment</DialogTitle><DialogDescription>Enter carrier and tracking details</DialogDescription></DialogHeader>
          <form onSubmit={shipForm.handleSubmit((d) => createShipM.mutate(d))} className="space-y-4">
            <div className="space-y-2"><Label>Carrier</Label><Input {...shipForm.register('carrier')} placeholder="UPS, FedEx, USPS..." />{shipForm.formState.errors.carrier && <p className="text-xs text-destructive">{shipForm.formState.errors.carrier.message}</p>}</div>
            <div className="space-y-2"><Label>Tracking Number</Label><Input {...shipForm.register('trackingNumber')} placeholder="Optional" /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setShipOpen(false)}>Cancel</Button><Button type="submit" disabled={createShipM.isPending}>Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={eventOpen} onOpenChange={setEventOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Tracking Event</DialogTitle><DialogDescription>Update shipment tracking status</DialogDescription></DialogHeader>
          <form onSubmit={eventForm.handleSubmit((d) => createEventM.mutate(d))} className="space-y-4">
            <div className="space-y-2"><Label>Status</Label>
              <Select value={eventForm.watch('status')} onValueChange={(v) => eventForm.setValue('status', v)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="exception">Exception</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Location</Label><Input {...eventForm.register('location')} placeholder="City, State" /></div>
            <div className="space-y-2"><Label>Description</Label><Input {...eventForm.register('description')} placeholder="Optional notes" /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setEventOpen(false)}>Cancel</Button><Button type="submit" disabled={createEventM.isPending}>Add</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
