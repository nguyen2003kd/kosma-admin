'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/data-table';
import { orderColumns } from '@/components/features/orders/order-columns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Header } from '@/components/layout/header';
import { toast } from '@/components/ui/toaster';
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
  Package,
  Download,
} from 'lucide-react';
import { useGetApiV10Order, usePutApiV10OrderId } from '@/api/endpoints/order';
import type { GetApiV10OrderParams } from '@/api/models';
import type { PutApiV10OrderIdBodyStatus } from '@/api/models/putApiV10OrderIdBodyStatus';
import type { Order } from '@/types';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const params: GetApiV10OrderParams = {
    page,
    pageSize,
  };
  if (statusFilter) params.filters = `status==${statusFilter}`;

  const { data, isLoading } = useGetApiV10Order(params);
  const updateStatusMutation = usePutApiV10OrderId();

  // The generated client types this endpoint's response as `void`, so we
  // cast to the actual paginated shape returned by the backend.
  const responseData = (data as unknown as {
    responseData?: { count: number; rows: Order[] };
  })?.responseData;
  const orders: Order[] = responseData?.rows || [];
  const totalCount = responseData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const stats = {
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => ['confirmed', 'processing'].includes(o.status || '')).length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  const handleUpdateStatus = async (order: Order, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: order.id!,
        data: { status: status as PutApiV10OrderIdBodyStatus },
      });
      toast.success({ title: 'Order updated', content: `Order ${order.code} updated to ${status}` });
      queryClient.invalidateQueries({ queryKey: ['/api/v1.0/order'] });
    } catch {
      toast.error({ title: 'Update failed', content: 'Failed to update order status' });
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
  };

  return (
    <div>
      <Header title="Orders" />
      <main className="container mx-auto p-4 md:p-6">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
              <p className="text-muted-foreground">
                Manage customer orders and track fulfillment
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Order Stats */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCount}</div>
                <p className="text-xs text-muted-foreground">
                  Total orders from customers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-yellow-500">
                  Awaiting confirmation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.processing}</div>
                <p className="text-xs text-blue-600">
                  Confirmed &amp; in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.delivered}</div>
                <p className="text-xs text-green-600">
                  Successfully fulfilled
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>
                    A list of all customer orders from the website
                  </CardDescription>
                </div>
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm border rounded-md"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={orderColumns({ onView: handleView, onUpdateStatus: handleUpdateStatus })}
                data={orders}
                searchPlaceholder="Search orders..."
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.code}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment</p>
                  <Badge variant="outline">{selectedOrder.payment_method?.toUpperCase()}</Badge>
                </div>
              </div>

              {selectedOrder.shipping_address && (
                <div>
                  <p className="text-sm font-medium">Shipping Address</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shipping_address}
                    {selectedOrder.shipping_city && `, ${selectedOrder.shipping_city}`}
                    {selectedOrder.shipping_state && `, ${selectedOrder.shipping_state}`}
                    {selectedOrder.shipping_zip && ` ${selectedOrder.shipping_zip}`}
                  </p>
                </div>
              )}

              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Items</p>
                  <div className="border rounded-md divide-y">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between py-2 px-3">
                        <span>{item.product_name} x{item.quantity}</span>
                        <span className="font-medium">${Number(item.total_price || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${Number(selectedOrder.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${Number(selectedOrder.shipping_fee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${Number(selectedOrder.total || 0).toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Status Actions */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === 'pending' && (
                    <Button size="sm" onClick={() => { handleUpdateStatus(selectedOrder, 'confirmed'); setSelectedOrder(null); }}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Confirm
                    </Button>
                  )}
                  {['confirmed', 'processing'].includes(selectedOrder.status || '') && (
                    <Button size="sm" onClick={() => { handleUpdateStatus(selectedOrder, 'shipped'); setSelectedOrder(null); }}>
                      <Truck className="h-4 w-4 mr-1" /> Mark Shipped
                    </Button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <Button size="sm" onClick={() => { handleUpdateStatus(selectedOrder, 'delivered'); setSelectedOrder(null); }}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Mark Delivered
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
