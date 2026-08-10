"use client"

import React, { useCallback, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Header } from "@/components/layout/header"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmModal, useConfirmModal } from "@/components/shared/confirm-modal"
import { toast } from "@/components/ui/toaster"
import { extractErrorMessage } from "@/utils/error"

import type { Contact } from "@/api/models/contact"
import type { ContactMutate } from "@/api/models/contactMutate"

import {
  getGetApiV10ContactQueryKey,
  useDeleteApiV10ContactId,
  useGetApiV10Contact,
  usePutApiV10ContactId,
} from "@/api/endpoints/contact"

import { createContactColumns, ContactDetail, ContactEdit } from "./components"

const Page: React.FC = () => {
  const queryClient = useQueryClient()
  const { confirm } = useConfirmModal()

  const { data: contactData, isLoading } = useGetApiV10Contact()

  const updateMutation = usePutApiV10ContactId()
  const deleteMutation = useDeleteApiV10ContactId()

  const [viewing, setViewing] = useState<Contact | null>(null)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const rows: Contact[] = useMemo(() => {
    const r = (contactData as { responseData?: { rows?: Contact[] } } | undefined)?.responseData?.rows
    if (Array.isArray(r)) return r
    return []
  }, [contactData])

  const canEdit = true
  const canDelete = true

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: getGetApiV10ContactQueryKey() })
  }

  const handleView = useCallback((item: Contact) => {
    setViewing(item)
  }, [])

  const handleEdit = useCallback((item: Contact) => {
    setEditing(item)
    setEditOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await confirm({
        title: "Xác nhận xóa",
        description: "Bạn có chắc chắn muốn xóa liên hệ này? Hành động này không thể hoàn tác.",
        confirmText: "Xóa",
        cancelText: "Hủy bỏ",
        variant: "destructive",
      })
      if (!confirmed) return

      setDeletingId(id)
      try {
        await deleteMutation.mutateAsync({ id })
        toast.success({ title: "Thành công", content: "Đã xóa liên hệ thành công" })
        queryClient.invalidateQueries({ queryKey: getGetApiV10ContactQueryKey() })
      } catch (error) {
        const msg = extractErrorMessage(error)
        toast.error({ title: "Xóa thất bại", content: msg })
      } finally {
        setDeletingId(null)
      }
    },
    [confirm, deleteMutation, queryClient]
  )

  const handleUpdate = async (id: string, data: ContactMutate) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      toast.success({ title: "Thành công", content: "Đã cập nhật liên hệ thành công" })
      queryClient.invalidateQueries({ queryKey: getGetApiV10ContactQueryKey() })
    } catch (error) {
      const msg = extractErrorMessage(error)
      toast.error({ title: "Cập nhật thất bại", content: msg })
      throw error
    }
  }

  const columns = useMemo(
    () =>
      createContactColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
        deletingId,
        canDelete,
        canEdit,
      }),
    [handleView, handleEdit, handleDelete, deletingId, canDelete, canEdit]
  )

  return (
    <>
      <Header title="Liên hệ" />
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Liên hệ</h2>
          <p className="text-muted-foreground">Danh sách liên hệ từ khách hàng</p>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          searchPlaceholder="Tìm kiếm liên hệ..."
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
      </div>

      <ContactDetail item={viewing} open={Boolean(viewing)} onClose={() => setViewing(null)} />

      <ContactEdit
        item={editing}
        open={editOpen}
        onClose={() => {
          setEditOpen(false)
          setEditing(null)
        }}
        onSubmit={handleUpdate}
      />

      <ConfirmModal />
    </>
  )
}

export default Page
