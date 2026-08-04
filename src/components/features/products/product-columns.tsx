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
import { MoreHorizontal, ArrowUpDown, Edit, Trash } from 'lucide-react';
import type { Product } from '@/types';

export interface ProductColumnsProps {
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export const productColumns = ({ onEdit, onDelete }: ProductColumnsProps = {}): ColumnDef<Product>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Product Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'category',
    header: 'Category',
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
        Price
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
        Stock
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
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status || 'active';
      const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-800',
        draft: 'bg-gray-100 text-gray-800',
        out_of_stock: 'bg-red-100 text-red-800',
        discontinued: 'bg-red-100 text-red-800',
      };
      return (
        <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
          {(status || 'active').replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
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
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => product.id && navigator.clipboard.writeText(product.id)}>
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit product
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(product)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete product
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
