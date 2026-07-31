"use client"

import React, { FC, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconPicker } from "@/components/shared/lucide-icon-picker"
import { Plus } from 'lucide-react'
import {
  usePostApiV10Category,
  usePutApiV10CategoryId,
  useGetApiV10CategoryId,
  getGetApiV10CategoryQueryKey,
  getGetApiV10CategoryIdQueryKey,
} from '@/api/endpoints/category'
import type { CategoryFormProps } from '@/types/category'
import type { Category } from '@/types/category'
import type { CategoryMutate } from '@/api/models'
import { toast } from '@/components/ui/toaster'
import { extractErrorMessage } from '@/utils/error'
import { generateCategoryLink } from '@/utils/slug'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CategoryMutateLanguage } from '@/api/models'

type Mode = 'create' | 'edit'

interface CategoryMutateDialogProps {
  mode: Mode
  // Create mode props
  parentId?: string
  onOpenChange?: (open: boolean) => void
  // Edit mode props
  category?: Category
  onDone?: () => void
}

const emptyValues: CategoryFormProps['values'] = {
  name: '',
  code: '',
  language: CategoryMutateLanguage.vi,
  description: '',
  position: '',
  parent_category_id: '',
  link: '',
  is_service: false,
  icon_url: '',
}

export const CategoryMutateDialog: FC<CategoryMutateDialogProps> = ({
  mode,
  parentId,
  onOpenChange,
  category,
  onDone,
}) => {
  const isCreate = mode === 'create'
  const isEdit = mode === 'edit'

  const queryClient = useQueryClient()
  const postMutation = usePostApiV10Category()
  const putMutation = usePutApiV10CategoryId()

  const [open, setOpen] = useState(isEdit ? true : !!parentId)
  const [values, setValues] = useState<CategoryFormProps['values']>(
    isCreate
      ? { ...emptyValues, parent_category_id: parentId ?? '' }
      : emptyValues
  )

  // --- Create mode: auto-open when parentId is provided ---
  useEffect(() => {
    if (isCreate && parentId) {
      setOpen(true)
      setValues((v) => ({ ...v, parent_category_id: parentId }))
    }
  }, [parentId, isCreate])

  // --- Edit mode: fetch detailed category data ---
  const { data: categoryDetailResp, isLoading: isLoadingDetail } = useGetApiV10CategoryId(
    category?.id ?? '',
    {
      query: {
        enabled: isEdit && !!category?.id,
      },
    }
  )

  const getCategoryFromResp = (resp: unknown): Category | null => {
    if (!resp || typeof resp !== 'object') return null
    const r = resp as { responseData?: unknown }
    return (r.responseData as Category) || null
  }

  const categoryDetail = isEdit ? getCategoryFromResp(categoryDetailResp) : null

  // Update form values when detailed data is loaded (edit mode)
  useEffect(() => {
    if (!isEdit || !category) return
    const sourceCategory = categoryDetail || category
    setValues({
      name: sourceCategory.name || '',
      code: sourceCategory.code || '',
      language: (sourceCategory as { language?: string }).language || CategoryMutateLanguage.vi,
      description: sourceCategory.description || '',
      position: sourceCategory.position != null ? String(sourceCategory.position) : '',
      parent_category_id: sourceCategory.parent_category_id || '',
      link: sourceCategory.link || '',
      is_service: Boolean(sourceCategory.is_service),
      icon_url: sourceCategory.icon_url || '',
    })
  }, [categoryDetail, category, isEdit])

  const saving = isCreate ? postMutation.isPending : putMutation.isPending || isLoadingDetail

  const handleChange = (
    field: keyof CategoryFormProps['values'],
    value: string,
  ) => {
    if (field === 'name') {
      const autoLink = generateCategoryLink(value)
      setValues((prev) => ({ ...prev, name: value, link: autoLink }))
    } else {
      setValues((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSave = async () => {
    if (!values.name.trim()) return
    const payload: Partial<CategoryMutate> & { name: string; language: CategoryMutateLanguage } = {
      name: values.name,
      language: (values.language as CategoryMutateLanguage) || CategoryMutateLanguage.vi,
    }
    if (values.code?.trim()) payload.code = values.code
    if (values.description?.trim()) payload.description = values.description
    if (values.position?.trim()) payload.position = Number(values.position)
    if (values.parent_category_id?.trim()) payload.parent_category_id = values.parent_category_id
    if (values.link?.trim()) payload.link = values.link
    if (values.is_service != null) payload.is_service = values.is_service
    if (values.icon_url?.trim()) payload.icon_url = values.icon_url

    try {
      if (isCreate) {
        await postMutation.mutateAsync({ data: payload as CategoryMutate })
        setValues({ ...emptyValues })
        await queryClient.invalidateQueries({ queryKey: getGetApiV10CategoryQueryKey() })
        toast.success({ title: 'Tạo danh mục thành công', content: 'Danh mục mới đã được tạo.' })
        setOpen(false)
        onOpenChange?.(false)
      } else {
        if (!category) return
        await putMutation.mutateAsync({ id: category.id, data: payload as CategoryMutate })
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getGetApiV10CategoryQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getGetApiV10CategoryIdQueryKey(category.id) }),
        ])
        toast.success({ title: 'Cập nhật danh mục thành công', content: 'Danh mục đã được cập nhật.' })
        onDone?.()
      }
    } catch (e) {
      console.error(e)
      const msg = extractErrorMessage(e)
      toast.error({
        title: isCreate ? 'Tạo danh mục thất bại' : 'Cập nhật danh mục thất bại',
        content: msg,
      })
    }
  }

  const handleCancel = () => {
    if (isCreate) {
      setOpen(false)
      onOpenChange?.(false)
      setValues({ ...emptyValues })
    } else {
      setOpen(false)
      onDone?.()
    }
  }

  const dialogTitle = isCreate ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'
  const dialogDescription = isCreate
    ? 'Tạo danh mục mới cho hệ thống. Các trường có dấu * là bắt buộc.'
    : 'Cập nhật thông tin danh mục. Các trường có dấu * là bắt buộc.'

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          if (isCreate) onOpenChange?.(false)
          else onDone?.()
        }
      }}
    >
      {isCreate && (
        <DialogTrigger asChild>
          <Button className="bg-[#19426D] text-white">
            <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {dialogDescription && <DialogDescription>{dialogDescription}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="text-sm font-medium block mb-1">Icon</label>
              <IconPicker
                value={values.icon_url}
                onChange={(iconName) =>
                  setValues((prev) => ({ ...prev, icon_url: iconName }))
                }
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-1">
                Tên danh mục *
              </label>
              <Input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên danh mục"
                value={values.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Liên kết</label>
              <Input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com hoặc /path"
                value={values.link}
                onChange={(e) => handleChange("link", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Vị trí sắp xếp
              </label>
              <Input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1, 2, 3..."
                type="number"
                min="0"
                value={values.position}
                onChange={(e) => handleChange("position", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">
                Ngôn ngữ *
              </label>
              <Select
                value={values.language}
                onValueChange={(val) => handleChange("language", val)}
              >
                <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Chọn ngôn ngữ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CategoryMutateLanguage.vi}>Tiếng Việt</SelectItem>
                  <SelectItem value={CategoryMutateLanguage.en}>English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-sm font-medium block mb-1">Mô tả</label>
              <Textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả chi tiết về danh mục"
                rows={7}
                value={values.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              className={
                isEdit
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
              }
              onClick={handleSave}
              disabled={saving || !values.name.trim()}
            >
              {saving
                ? "Đang lưu..."
                : isEdit
                  ? "Cập nhật danh mục"
                  : "Lưu danh mục"}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Hủy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  )
}
