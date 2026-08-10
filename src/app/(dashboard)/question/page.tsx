"use client"

import React, { useCallback, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Header } from "@/components/layout/header"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmModal, useConfirmModal } from "@/components/shared/confirm-modal"
import { toast } from "@/components/ui/toaster"
import { extractErrorMessage } from "@/utils/error"

import type { Question } from "@/api/models/question"
import type { QuestionMutate } from "@/api/models/questionMutate"

import {
  getGetApiV10QuestionQueryKey,
  useDeleteApiV10QuestionId,
  useGetApiV10Question,
  usePutApiV10QuestionId,
} from "@/api/endpoints/question"

import { createQuestionColumns, QuestionDetail, QuestionEdit } from "./components"

interface QuestionResponseData {
  rows?: Question[]
  count?: number
  page?: number
  pageSize?: number
}

const Page: React.FC = () => {
  const queryClient = useQueryClient()
  const { confirm } = useConfirmModal()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")

  const params = useMemo(
    () => ({
      page,
      pageSize,
      ...(search
        ? {
          filters: `(first_name|last_name|email|phone_number|content)@=${encodeURI(search)}` as string,
        }
        : {}),
      sortField: "created_at" as const,
      sortOrder: "desc" as const,
    }),
    [page, pageSize, search]
  )

  const { data: questionData, isLoading } = useGetApiV10Question(params)

  const updateMutation = usePutApiV10QuestionId()
  const deleteMutation = useDeleteApiV10QuestionId()

  const [viewing, setViewing] = useState<Question | null>(null)
  const [editing, setEditing] = useState<Question | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const responseData = (questionData as { responseData?: QuestionResponseData } | undefined)?.responseData

  const rows: Question[] = useMemo(() => {
    if (Array.isArray(responseData?.rows)) return responseData.rows
    return []
  }, [responseData])

  const count = responseData?.count ?? 0
  const currentPage = responseData?.page ?? page
  const pageCount = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count, pageSize])

  const canEdit = true
  const canDelete = true

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: getGetApiV10QuestionQueryKey() })
  }

  const handleView = useCallback((item: Question) => {
    setViewing(item)
  }, [])

  const handleEdit = useCallback((item: Question) => {
    setEditing(item)
    setEditOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await confirm({
        title: "Xác nhận xóa",
        description: "Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.",
        confirmText: "Xóa",
        cancelText: "Hủy bỏ",
        variant: "destructive",
      })
      if (!confirmed) return

      setDeletingId(id)
      try {
        await deleteMutation.mutateAsync({ id })
        toast.success({ title: "Thành công", content: "Đã xóa câu hỏi thành công" })
        queryClient.invalidateQueries({ queryKey: getGetApiV10QuestionQueryKey() })
      } catch (error) {
        const msg = extractErrorMessage(error)
        toast.error({ title: "Xóa thất bại", content: msg })
      } finally {
        setDeletingId(null)
      }
    },
    [confirm, deleteMutation, queryClient]
  )

  const handleUpdate = async (id: string, data: QuestionMutate) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      toast.success({ title: "Thành công", content: "Đã cập nhật câu hỏi thành công" })
      queryClient.invalidateQueries({ queryKey: getGetApiV10QuestionQueryKey() })
    } catch (error) {
      const msg = extractErrorMessage(error)
      toast.error({ title: "Cập nhật thất bại", content: msg })
      throw error
    }
  }

  const columns = useMemo(
    () =>
      createQuestionColumns({
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
      <Header title="Câu hỏi" />
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Câu hỏi</h2>
          <p className="text-muted-foreground">Danh sách câu hỏi từ người dùng</p>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          searchPlaceholder="Tìm kiếm câu hỏi..."
          isLoading={isLoading}
          onRefresh={handleRefresh}
          manualPagination
          manualFiltering
          pageCount={pageCount}
          pageIndex={currentPage - 1}
          pageSize={pageSize}
          onPageChange={(pageIndex) => setPage(pageIndex + 1)}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
          onSearch={(q) => {
            setSearch(q)
            setPage(1)
          }}
        />
      </div>

      <QuestionDetail item={viewing} open={Boolean(viewing)} onClose={() => setViewing(null)} />

      <QuestionEdit
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
