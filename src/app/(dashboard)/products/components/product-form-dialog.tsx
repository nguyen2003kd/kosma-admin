'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import { postApiV10Product, putApiV10ProductId } from '@/api/endpoints/product';
import type { Product } from '@/types';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export function ProductFormDialog({ open, onClose, product, onSuccess }: ProductFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const [form, setForm] = useState<{
    name: string;
    sku: string;
    slug: string;
    description: string;
    price: string;
    original_price: string;
    stock: string;
    category: string;
    product_type: 'furniture' | 'material';
    brand: string;
    status: 'active' | 'draft' | 'out_of_stock' | 'discontinued';
  }>({
    name: '',
    sku: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    stock: '',
    category: '',
    product_type: 'material',
    brand: '',
    status: 'active',
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        original_price: product.original_price?.toString() || '',
        stock: product.stock?.toString() || '0',
        category: product.category || '',
        product_type: product.product_type || 'material',
        brand: product.brand || '',
        status: product.status || 'active',
      });
    } else {
      setForm({
        name: '',
        sku: '',
        slug: '',
        description: '',
        price: '',
        original_price: '',
        stock: '0',
        category: '',
        product_type: 'material',
        brand: '',
        status: 'active',
      });
    }
  }, [product, open]);

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price) : 0,
        original_price: data.original_price ? parseFloat(data.original_price) : undefined,
        stock: parseInt(data.stock) || 0,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      };
      if (isEditing && product?.id) {
        return (putApiV10ProductId as any)(product.id, payload);
      }
      return postApiV10Product(payload as any);
    },
    onSuccess: () => {
      toast.success({ title: isEditing ? 'Updated' : 'Created', content: isEditing ? 'Product updated successfully' : 'Product created successfully' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onSuccess();
    },
    onError: () => {
      toast.error({ title: 'Error', content: isEditing ? 'Failed to update product' : 'Failed to create product' });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error({ title: 'Validation', content: 'Product name is required' });
      return;
    }
    if (!form.sku.trim()) {
      toast.error({ title: 'Validation', content: 'SKU is required' });
      return;
    }
    mutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update product information below.' : 'Fill in the product details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="One-Piece Elongated Toilet"
                required
              />
            </div>

            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="TOL-001"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Select category</option>
                <option value="toilets">Toilets</option>
                <option value="sinks">Sinks</option>
                <option value="lighting">Lighting</option>
                <option value="hardware">Hardware</option>
                <option value="materials">Materials</option>
                <option value="furniture">Furniture</option>
              </select>
            </div>

            <div>
              <Label htmlFor="product_type">Product Type</Label>
              <select
                id="product_type"
                name="product_type"
                value={form.product_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="material">Material</option>
                <option value="furniture">Furniture</option>
              </select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="289.00"
              />
            </div>

            <div>
              <Label htmlFor="original_price">Original Price ($)</Label>
              <Input
                id="original_price"
                name="original_price"
                type="number"
                step="0.01"
                value={form.original_price}
                onChange={handleChange}
                placeholder="349.00"
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                placeholder="25"
              />
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Kosmo Bath"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="Product description..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
