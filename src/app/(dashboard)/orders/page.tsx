'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const { data, isLoading, refetch } = useGetApiV10Order(params);
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

  return (
    <div>
      <Header title="Orders" />
      <main className="container mx-auto p-4 md:p-6">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            <p className="text-muted-foreground">
              Manage customer orders and track fulfillment
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>Customer orders from the website</CardDescription>
                </div>
                <div className="flex gap-2">
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
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No orders found
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-3 px-4 font-medium">Code</th>
                          <th className="text-left py-3 px-4 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 font-medium">Phone</th>
                          <th className="text-left py-3 px-4 font-medium">Total</th>
                          <th className="text-left py-3 px-4 font-medium">Payment</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-muted/30">
                            <td className="py-3 px-4 font-mono font-medium">{order.code}</td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{order.customer_name}</div>
                              <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                            </td>
                            <td className="py-3 px-4">{order.customer_phone}</td>
                            <td className="py-3 px-4 font-medium">${Number(order.total || 0).toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{order.payment_method?.toUpperCase()}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="py-3 px-4">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
                                  View
                                </Button>
                                {order.status === 'pending' && (
                                  <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(order, 'confirmed')}>
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                  </Button>
                                )}
                                {order.status === 'confirmed' && (
                                  <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(order, 'processing')}>
                                    <Clock className="h-4 w-4 text-purple-600" />
                                  </Button>
                                )}
                                {['confirmed', 'processing'].includes(order.status || '') && (
                                  <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(order, 'shipped')}>
                                    <Truck className="h-4 w-4 text-indigo-600" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}>
                        First
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                        Prev
                      </Button>
                      <span className="text-sm px-4">Page {page} of {totalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                        Next
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                        Last
                      </Button>
                    </div>
                  )}
                </>
              )}
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

function StatusBadge({ status }: { status?: string | null }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <Badge className={colors[status || 'pending'] || 'bg-gray-100'}>
      {status || 'pending'}
    </Badge>
  );
}
