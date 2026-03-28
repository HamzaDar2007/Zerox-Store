import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { Order } from '@/types'

interface InvoiceButtonProps {
  order: Order
}

export function InvoiceButton({ order }: InvoiceButtonProps) {
  const handleDownload = () => {
    // Generate a basic printable invoice in a new window
    const w = window.open('', '_blank')
    if (!w) return

    const itemsHtml = (order.items ?? []).map((item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #E2E8F0">${item.nameSnapshot}</td>
        <td style="padding:8px;border-bottom:1px solid #E2E8F0;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #E2E8F0;text-align:right">Rs. ${Number(item.unitPrice).toLocaleString()}</td>
        <td style="padding:8px;border-bottom:1px solid #E2E8F0;text-align:right">Rs. ${Number(item.totalAmount).toLocaleString()}</td>
      </tr>
    `).join('')

    w.document.write(`<!DOCTYPE html><html><head><title>Invoice #${order.id.slice(-8).toUpperCase()}</title></head><body style="font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto">
      <h1 style="color:#6366F1;margin-bottom:4px">ShopVerse</h1>
      <h2>Invoice</h2>
      <p><strong>Order:</strong> #${order.id.slice(-8).toUpperCase()}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
      <p><strong>Ship to:</strong> ${order.shippingLine1 ?? ''}, ${order.shippingCity ?? ''} ${order.shippingState ?? ''} ${order.shippingPostalCode ?? ''}, ${order.shippingCountry ?? ''}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:20px">
        <thead><tr style="background:#F1F5F9">
          <th style="padding:8px;text-align:left">Item</th>
          <th style="padding:8px;text-align:center">Qty</th>
          <th style="padding:8px;text-align:right">Unit Price</th>
          <th style="padding:8px;text-align:right">Total</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="margin-top:20px;text-align:right">
        <p>Subtotal: Rs. ${Number(order.subtotal).toLocaleString()}</p>
        ${order.discountAmount > 0 ? `<p>Discount: -Rs. ${Number(order.discountAmount).toLocaleString()}</p>` : ''}
        <p>Shipping: Rs. ${Number(order.shippingAmount).toLocaleString()}</p>
        ${order.taxAmount > 0 ? `<p>Tax: Rs. ${Number(order.taxAmount).toLocaleString()}</p>` : ''}
        <p style="font-size:18px;font-weight:bold;color:#EF4444">Total: Rs. ${Number(order.totalAmount).toLocaleString()}</p>
      </div>
      <script>window.print()</script>
    </body></html>`)
    w.document.close()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      <Download className="h-4 w-4 mr-1" /> Invoice
    </Button>
  )
}
