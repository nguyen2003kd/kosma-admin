'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/data-table';
import { productColumns } from '@/components/features/products/product-columns';
import { getApiV10Product, getApiV10ProductId, deleteApiV10ProductId } from '@/api/endpoints/product';
import type { Product } from '@/types';
import { Plus, Download, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { toast } from '@/components/ui/toaster';
import { useConfirmModal } from '@/components/ui/confirm-dialog';
import { ProductFormDialog } from './components/product-form-dialog';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const queryClient = useQueryClient();
  const { confirm: confirmModal, ConfirmDialog } = useConfirmModal();

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, pageSize, search, statusFilter, categoryFilter],
    queryFn: async () => {
      const filterParts: string[] = [];
      if (search) filterParts.push(`name~${search}`);
      if (statusFilter) filterParts.push(`status==${statusFilter}`);
      if (categoryFilter) filterParts.push(`category==${categoryFilter}`);
      const res = await getApiV10Product({
        page,
        pageSize,
        ...(filterParts.length ? { filters: filterParts.join(',') } : {}),
      });
      return (res as unknown as { responseData?: { count: number; rows: Product[] } }).responseData;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!id) return Promise.reject(new Error('Product ID is required'));
      return deleteApiV10ProductId(id);
    },
    onSuccess: () => {
      toast.success({ title: 'Đã xóa', content: 'Sản phẩm đã được xóa thành công' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      toast.error({ title: 'Xóa thất bại', content: 'Không thể xóa sản phẩm' });
    },
  });

  const products: Product[] = data?.rows || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    lowStock: products.filter(p => (p.stock || 0) < 10).length,
    outOfStock: products.filter(p => p.status === 'out_of_stock' || (p.stock || 0) === 0).length,
  };

  const handleEdit = async (product: Product) => {
    // Fetch full product detail (with product_images) before opening the form
    try {
      const res = await getApiV10ProductId(product.id);
      const detail = (res as unknown as { responseData?: Product }).responseData;
      setEditingProduct(detail ?? product);
    } catch {
      setEditingProduct(product);
    }
    setIsFormOpen(true);
  };

  const handleDelete = async (product: Product) => {
    const confirmed = await confirmModal({
      title: 'Xóa sản phẩm',
      description: `Bạn có chắc muốn xóa "${product.name}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      variant: 'destructive',
    });
    if (confirmed && product.id) {
      deleteMutation.mutate(product.id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div>
      <Header title="Sản phẩm" />
      <div className="p-6">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Sản phẩm</h2>
              <p className="text-muted-foreground">
                Quản lý kho hàng và danh mục sản phẩm
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Xuất
              </Button>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm sản phẩm
              </Button>
            </div>
          </div>

          {/* Product Stats */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCount}</div>
                <p className="text-xs text-muted-foreground">
                  Tổng sản phẩm trong danh mục
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sản phẩm hoạt động</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-green-600">
                  Đang kinh doanh
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sắp hết hàng</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lowStock}</div>
                <p className="text-xs text-yellow-500">
                  Còn dưới 10 sản phẩm
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hết hàng</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.outOfStock}</div>
                <p className="text-xs text-red-600">
                  Cần nhập thêm hàng
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Tất cả sản phẩm</CardTitle>
                  <CardDescription>
                    Danh sách tất cả sản phẩm trong kho
                  </CardDescription>
                </div>
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm border rounded-md"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Đang kinh doanh</option>
                    <option value="draft">Bản nháp</option>
                    <option value="out_of_stock">Hết hàng</option>
                    <option value="discontinued">Ngừng kinh doanh</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm border rounded-md"
                  >
                    <option value="">Tất cả danh mục</option>
                    <option value="toilets">Bồn cầu</option>
                    <option value="sinks">Bồn rửa</option>
                    <option value="lighting">Đèn chiếu sáng</option>
                    <option value="hardware">Phụ kiện</option>
                    <option value="materials">Vật liệu</option>
                    <option value="furniture">Nội thất</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={productColumns({ onEdit: handleEdit, onDelete: handleDelete })}
                data={products}
                searchPlaceholder="Tìm kiếm sản phẩm..."
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Dialog */}
      {ConfirmDialog}

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        product={editingProduct}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
          handleFormClose();
        }}
      />
    </div>
  );
}
