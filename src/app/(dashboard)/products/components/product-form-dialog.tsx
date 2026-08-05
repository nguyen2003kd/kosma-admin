'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, GripVertical } from 'lucide-react';
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
import { ImagePicker, type ImagePickerFile } from '@/components/shared/image-picker';
import { postApiV10Product, putApiV10ProductId } from '@/api/endpoints/product';
import baseConfig from '@/configs/base';
import type { Product } from '@/types';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

interface SelectedImage {
  file_id: string;
  path: string;
  name: string;
  compress_info?: ImagePickerFile['compress_info'];
  title?: string;
}

function fileToSelected(file: ImagePickerFile): SelectedImage {
  return {
    file_id: file.id,
    path: file.path,
    name: file.name,
    compress_info: file.compress_info,
    title: file.title,
  };
}

function imageSrc(img: SelectedImage): string {
  const p = img.compress_info?.desktop || img.compress_info?.tablet || img.path || '';
  return `${baseConfig.imgEndpointDomain}${p}`;
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

  const [images, setImages] = useState<SelectedImage[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);

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
      // Map existing product_images (from API) to SelectedImage
      const existing = (product.product_images ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((pi) => ({
          file_id: pi.file_id,
          path: pi.file?.path ?? '',
          name: pi.file?.name ?? '',
          compress_info: (pi.file?.compress_info ?? undefined) as SelectedImage['compress_info'],
        }));
      setImages(existing);
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
      setImages([]);
    }
  }, [product, open]);

  const mutation = useMutation({
    mutationFn: async (data: typeof form & { images: { file_id: string; position: number }[] }) => {
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price) : 0,
        original_price: data.original_price ? parseFloat(data.original_price) : undefined,
        stock: parseInt(data.stock) || 0,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        images: data.images,
      };
      if (isEditing && product?.id) {
        return (putApiV10ProductId as any)(product.id, payload);
      }
      return postApiV10Product(payload as any);
    },
    onSuccess: () => {
      toast.success({
        title: isEditing ? 'Updated' : 'Created',
        content: isEditing ? 'Product updated successfully' : 'Product created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onSuccess();
    },
    onError: () => {
      toast.error({
        title: 'Error',
        content: isEditing ? 'Failed to update product' : 'Failed to create product',
      });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddImage = (file: ImagePickerFile) => {
    setImages((prev) => {
      if (prev.some((p) => p.file_id === file.id)) return prev;
      return [...prev, fileToSelected(file)];
    });
    setShowImagePicker(false);
  };

  const handleRemoveImage = (fileId: string) => {
    setImages((prev) => prev.filter((p) => p.file_id !== fileId));
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
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
    const payload = {
      ...form,
      images: images.map((img, idx) => ({ file_id: img.file_id, position: idx })),
    };
    mutation.mutate(payload);
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
          {/* Multi-image picker */}
          <div className="col-span-2">
            <Label>Product Images</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select one or more images from the media library. Drag to reorder — the first image is
              the primary image.
            </p>

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                {images.map((img, idx) => (
                  <div
                    key={img.file_id}
                    className="relative group aspect-square rounded-md overflow-hidden border-2 border-gray-200"
                  >
                    <Image
                      src={imageSrc(img)}
                      alt={img.name || `image-${idx}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold uppercase">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.file_id)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 flex justify-between bg-black/50 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, 'up')}
                        disabled={idx === 0}
                        className="px-1.5 py-0.5 text-white text-xs disabled:opacity-30"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <GripVertical className="w-3 h-3 text-white/70 self-center" />
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, 'down')}
                        disabled={idx === images.length - 1}
                        className="px-1.5 py-0.5 text-white text-xs disabled:opacity-30"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowImagePicker(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {images.length > 0 ? 'Add more images' : 'Select images'}
            </Button>
          </div>

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

      <ImagePicker
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={handleAddImage}
        type="image"
      />
    </Dialog>
  );
}
