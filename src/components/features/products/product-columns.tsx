'use client';

import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
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
import { MoreHorizontal, ArrowUpDown, Edit, Trash } from 'lucide-react';
import type { Product } from '@/types';

export interface ProductColumnsProps {
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

function getProductThumbSrc(product: Product): string | null {
  const first = (product.product_images ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)[0];
  if (first?.file) {
    if (first.file.path) return first.file.path;
  }
  if (product.thumbnail_path) {
    return product.thumbnail_path;
  }
  return null;
}

export const productColumns = ({ onEdit, onDelete }: ProductColumnsProps = {}): ColumnDef<Product>[] => [
  {
    id: 'image',
    header: 'Ảnh',
    cell: ({ row }) => {
      const src = getProductThumbSrc(row.original);
      if (!src) {
        return (
          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
            Không ảnh
          </div>
        );
      }
      return (
        <div className="relative h-10 w-10 rounded-md overflow-hidden border">
          <Image
            src={src}
            alt={row.original.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Tên sản phẩm
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'sku',
    header: 'Mã SKU',
  },
  {
    accessorKey: 'category',
    header: 'Danh mục',
    cell: ({ row }) => {
      const category = row.original.category;
      return <Badge variant="outline">{category || '-'}</Badge>;
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Giá
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = row.original.price;
      if (!price) return '-';
      return (
        <div className="font-medium">
          ${typeof price === 'number' ? price.toFixed(2) : price}
        </div>
      );
    },
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Tồn kho
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const stock = row.original.stock ?? 0;
      const isLowStock = stock < 10;
      const isOutOfStock = stock === 0;
      return (
        <div className={isOutOfStock ? 'text-red-600 font-medium' : isLowStock ? 'text-yellow-600 font-medium' : ''}>
          {stock}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const status = row.original.status || 'active';
      const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-800',
        draft: 'bg-gray-100 text-gray-800',
        out_of_stock: 'bg-red-100 text-red-800',
        discontinued: 'bg-red-100 text-red-800',
      };
      const statusLabels: Record<string, string> = {
        active: 'Đang kinh doanh',
        draft: 'Bản nháp',
        out_of_stock: 'Hết hàng',
        discontinued: 'Ngừng kinh doanh',
      };
      return (
        <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
          {statusLabels[status] || status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Ngày tạo',
    cell: ({ row }) => {
      const date = row.original.created_at;
      if (!date) return '-';
      return <div>{new Date(date).toLocaleDateString()}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => product.id && navigator.clipboard.writeText(product.id)}>
              Sao chép ID sản phẩm
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa sản phẩm
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(product)}>
                <Trash className="mr-2 h-4 w-4" />
                Xóa sản phẩm
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
