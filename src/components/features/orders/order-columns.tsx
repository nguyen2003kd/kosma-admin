'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash } from 'lucide-react';
import type { Order } from '@/types';

export interface OrderColumnsProps {
  onView?: (order: Order) => void;
  onUpdateStatus?: (order: Order, status: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const orderColumns = ({ onView, onUpdateStatus }: OrderColumnsProps = {}): ColumnDef<Order>[] => [
  {
    accessorKey: 'code',
    header: 'Mã đơn hàng',
    cell: ({ row }) => (
      <span className="font-mono font-medium">{row.original.code}</span>
    ),
  },
  {
    accessorKey: 'customer_name',
    header: 'Khách hàng',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.customer_name}</div>
        <div className="text-xs text-muted-foreground">{row.original.customer_email || '-'}</div>
      </div>
    ),
  },
  {
    accessorKey: 'customer_phone',
    header: 'Điện thoại',
    cell: ({ row }) => row.original.customer_phone || '-',
  },
  {
    accessorKey: 'total',
    header: 'Tổng tiền',
    cell: ({ row }) => {
      const total = row.original.total;
      return <span className="font-medium">${Number(total || 0).toFixed(2)}</span>;
    },
  },
  {
    accessorKey: 'payment_method',
    header: 'Thanh toán',
    cell: ({ row }) => {
      const method = row.original.payment_method;
      const labels: Record<string, string> = { cod: 'COD', bank_transfer: 'Ngân hàng', card: 'Thẻ' };
      return <Badge variant="outline">{labels[method || ''] || method || '-'}</Badge>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const status = row.original.status || 'pending';
      const statusLabels: Record<string, string> = {
        pending: 'Chờ xử lý',
        confirmed: 'Đã xác nhận',
        processing: 'Đang xử lý',
        shipped: 'Đã giao hàng',
        delivered: 'Đã giao',
        cancelled: 'Đã hủy',
      };
      return (
        <Badge className={STATUS_COLORS[status] || 'bg-gray-100'}>
          {statusLabels[status] || status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Ngày',
    cell: ({ row }) => {
      const date = row.original.created_at;
      return date ? new Date(date).toLocaleDateString() : '-';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id || '')}>
              Sao chép ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onView && (
              <DropdownMenuItem onClick={() => onView(order)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
            )}
            {onUpdateStatus && (
              <>
                {order.status === 'confirmed' && (
                  <DropdownMenuItem onClick={() => onUpdateStatus(order, 'processing')}>
                    <Edit className="mr-2 h-4 w-4" />
                    Chuyển sang đang xử lý
                  </DropdownMenuItem>
                )}
                {!['cancelled', 'delivered'].includes(order.status || '') && (
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onUpdateStatus(order, 'cancelled')}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Hủy đơn hàng
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
